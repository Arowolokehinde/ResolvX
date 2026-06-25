;; =============================================================================
;; ResolvX Cross-Asset Router -- v0
;; Clarity 5 (Stacks Nakamoto, epoch 3.x -- SIP-033/SIP-039)
;;
;; Clarity 4+ built-ins used (SIP-033, activated Nov 2025):
;;   current-contract  -- replaces (as-contract tx-sender) from Clarity 1-3
;;   as-contract?      -- replaces as-contract; requires explicit asset allowances
;;
;; Atomic single-transaction swap of any SIP-010 token for any other SIP-010
;; token. Either fully succeeds or fully reverts -- no escrow, no relayer,
;; no partial fills.
;;
;; AMM model
;; ---------
;; Constant-product formula (x * y = k). Fee is deducted from gross output
;; (fee-on-output model), allowing fees to be tracked and withdrawn separately
;; from pool reserves.
;;
;;   gross-out = reserve-out * amount-in / (reserve-in + amount-in)
;;   fee       = gross-out * FEE-BPS / 10000
;;   net-out   = gross-out - fee            (what recipient receives)
;;
;;   After swap:
;;     reserve-in  += amount-in
;;     reserve-out -= gross-out             (fee stays in contract balance)
;;
;; Invariant:
;;   contract.balance[t] = SUM_all_pools(reserve[t]) + protocol-fees[t]
;;
;; Oracle
;; ------
;; Both tokens must have a fresh oracle price before a swap is permitted.
;; ORACLE-STALENESS-THRESHOLD = 144 blocks (approximately 24 hours at
;; 10-minute Stacks block times). In production, replace set-oracle-price
;; with a Pyth / Redstone push-oracle integration.
;;
;; Pool key ordering
;; -----------------
;; Pool keys are { token-a, token-b } in the order supplied to create-pool.
;; The canonical convention (enforced off-chain) is alphabetical by contract
;; principal. swap and add-liquidity callers must use the same ordering or
;; they will receive ERR-POOL-NOT-FOUND.
;; =============================================================================

;; ---------------------------------------------------------------------------
;; TRAIT
;; SIP-010 compatible interface, aliased ft-trait to avoid a Clarity 5
;; cross-contract name collision with the wallet contract's sip-010-trait.
;; Clarity's structural typing means any real SIP-010 token satisfies
;; <ft-trait> at the call site without changes.
;; ---------------------------------------------------------------------------
(define-trait ft-trait
  (
    (transfer         (uint principal principal (optional (buff 34))) (response bool uint))
    (get-balance      (principal)                                     (response uint uint))
    (get-decimals     ()                                              (response uint uint))
    (get-name         ()                                              (response (string-ascii 32) uint))
    (get-symbol       ()                                              (response (string-ascii 32) uint))
    (get-token-uri    ()                                              (response (optional (string-utf8 256)) uint))
    (get-total-supply ()                                              (response uint uint))
  )
)

;; ---------------------------------------------------------------------------
;; ERROR CODES
;;
;; u1xx = pool errors
;; u2xx = oracle errors
;; u3xx = swap validation
;; u4xx = liquidity errors
;; u5xx = authorization
;; ---------------------------------------------------------------------------
(define-constant ERR-POOL-NOT-FOUND          (err u100))
(define-constant ERR-POOL-INACTIVE           (err u101))
(define-constant ERR-POOL-EXISTS             (err u102))
(define-constant ERR-STALE-ORACLE            (err u200))
(define-constant ERR-ZERO-AMOUNT             (err u300))
(define-constant ERR-SLIPPAGE-EXCEEDED       (err u301))
(define-constant ERR-INSUFFICIENT-LIQUIDITY  (err u302))
(define-constant ERR-RATIO-MISMATCH          (err u400))
(define-constant ERR-ZERO-LIQUIDITY          (err u401))
(define-constant ERR-NOT-OWNER               (err u500))

;; ---------------------------------------------------------------------------
;; CONSTANTS
;; ---------------------------------------------------------------------------

;; Maximum slippage a caller may accept in a swap call. Enforced by comparing
;; net-out against min-amount-out; the caller controls that bound.
(define-constant MAX-SLIPPAGE-BPS           u200)   ;; 2% -- informational

;; Protocol fee deducted from gross swap output. Accumulates in protocol-fees
;; map and is claimable by CONTRACT-OWNER via collect-fees.
(define-constant FEE-BPS                    u30)    ;; 0.3%

;; Number of Stacks blocks after which an oracle price is considered stale.
;; At ~10-minute block times this is approximately 24 hours.
(define-constant ORACLE-STALENESS-THRESHOLD u144)

;; Contract deployer captured at deploy time. Cannot be changed post-deploy.
;; Admin-only functions (create-pool, set-oracle-price, collect-fees) are
;; restricted to this principal.
(define-constant CONTRACT-OWNER tx-sender)

;; ---------------------------------------------------------------------------
;; DATA MAPS
;; ---------------------------------------------------------------------------

;; Primary AMM state. Key ordered by (token-a, token-b).
;; fee-bps stored per-pool for future configurability; always FEE-BPS for now.
(define-map liquidity-pools
  { token-a: principal, token-b: principal }
  {
    reserve-a: uint,   ;; units of token-a held by contract for this pool
    reserve-b: uint,   ;; units of token-b held by contract for this pool
    fee-bps:   uint,   ;; per-pool fee rate (basis points)
    active:    bool    ;; false => swaps and liquidity additions are paused
  }
)

;; Oracle price feed. Updated by CONTRACT-OWNER (or oracle integration).
;; price-usd is denominated in 10^decimals units.
(define-map oracle-prices principal
  {
    price-usd:    uint,   ;; price in USD scaled by 10^decimals
    decimals:     uint,   ;; scale factor for price-usd
    last-updated: uint    ;; stacks-block-height of last update
  }
)

;; Accumulated protocol fees per token, claimable by CONTRACT-OWNER.
;; Reset to 0 after each collect-fees call.
(define-map protocol-fees principal uint)

;; ---------------------------------------------------------------------------
;; READ-ONLY
;; ---------------------------------------------------------------------------

;; Returns pool state for the given pair, or none if no pool exists.
(define-read-only (get-pool (token-a principal) (token-b principal))
  (map-get? liquidity-pools { token-a: token-a, token-b: token-b })
)

;; Returns the oracle price record for a token, or none if not set.
(define-read-only (get-oracle-price (token principal))
  (map-get? oracle-prices token)
)

;; Returns true iff an oracle price exists and is within the staleness window.
(define-read-only (is-oracle-fresh (token principal))
  (match (map-get? oracle-prices token)
    price (<= (- stacks-block-height (get last-updated price)) ORACLE-STALENESS-THRESHOLD)
    false
  )
)

;; Returns the expected net output for a given input amount, after protocol fee.
;;
;; Uses the same fee-on-output formula as swap:
;;   gross = reserve-out * amount-in / (reserve-in + amount-in)
;;   fee   = gross * FEE-BPS / 10000
;;   net   = gross - fee
;;
;; @param token-in   Pool's token-a principal
;; @param token-out  Pool's token-b principal
;; @param amount-in  Token-in amount to quote
;; @returns (ok uint) expected net-out, or error
;; @errors  ERR-POOL-NOT-FOUND, ERR-ZERO-AMOUNT, ERR-INSUFFICIENT-LIQUIDITY
(define-read-only (get-quote
  (token-in  principal)
  (token-out principal)
  (amount-in uint)
)
  (let (
    (pool      (unwrap! (map-get? liquidity-pools { token-a: token-in, token-b: token-out })
                        ERR-POOL-NOT-FOUND))
    (reserve-a (get reserve-a pool))
    (reserve-b (get reserve-b pool))
  )
    (asserts! (> amount-in u0) ERR-ZERO-AMOUNT)
    (asserts! (> reserve-b u0) ERR-INSUFFICIENT-LIQUIDITY)
    (ok (compute-net-out amount-in reserve-a reserve-b))
  )
)

;; ---------------------------------------------------------------------------
;; PRIVATE HELPERS
;; ---------------------------------------------------------------------------

;; Constant-product gross output: dy = y * dx / (x + dx). O(1).
;; Precondition: (reserve-in + amount-in) > 0; callers must ensure this.
;; No overflow for amounts/reserves up to ~10^18: numerator ~10^36 < 2^128.
(define-private (compute-gross-out
  (amount-in   uint)
  (reserve-in  uint)
  (reserve-out uint)
)
  (/ (* reserve-out amount-in) (+ reserve-in amount-in))
)

;; Protocol fee deducted from gross output. Rounded down (favours protocol).
(define-private (compute-fee (gross uint))
  (/ (* gross FEE-BPS) u10000)
)

;; Net output after fee deduction. What the recipient receives.
(define-private (compute-net-out
  (amount-in   uint)
  (reserve-in  uint)
  (reserve-out uint)
)
  (let ((gross (compute-gross-out amount-in reserve-in reserve-out)))
    (- gross (compute-fee gross))
  )
)

;; ---------------------------------------------------------------------------
;; PUBLIC FUNCTIONS
;; ---------------------------------------------------------------------------

;; Swap token-in for token-out atomically.
;;
;; Validates pool activity and oracle freshness, computes constant-product
;; output, deducts protocol fee, transfers tokens, and updates reserves --
;; all within a single Clarity transaction. Any failure causes full revert.
;;
;; Token flow:
;;   1. Pull token-in from tx-sender to current-contract (user authorises via SIP-010)
;;   2. Push token-out from current-contract to recipient (as-contract? with-all-assets-unsafe)
;;
;; Oracle gate: both tokens must have a fresh price (within
;; ORACLE-STALENESS-THRESHOLD blocks). Prevents swaps against stale rates.
;;
;; @param token-in       SIP-010 token the caller provides
;; @param token-out      SIP-010 token the recipient receives
;; @param amount-in      Units of token-in to swap (> 0)
;; @param min-amount-out Minimum acceptable net-out; reverts if not met
;; @param recipient      Principal that receives token-out
;; @returns (ok uint)    Net amount of token-out sent to recipient
;; @errors  ERR-POOL-NOT-FOUND, ERR-POOL-INACTIVE, ERR-STALE-ORACLE,
;;          ERR-ZERO-AMOUNT, ERR-INSUFFICIENT-LIQUIDITY, ERR-SLIPPAGE-EXCEEDED
(define-public (swap
  (token-in       <ft-trait>)
  (token-out      <ft-trait>)
  (amount-in      uint)
  (min-amount-out uint)
  (recipient      principal)
)
  (let (
    (in-principal  (contract-of token-in))
    (out-principal (contract-of token-out))
    (pool-key      { token-a: in-principal, token-b: out-principal })
    (pool          (unwrap! (map-get? liquidity-pools pool-key) ERR-POOL-NOT-FOUND))
    (reserve-a     (get reserve-a pool))
    (reserve-b     (get reserve-b pool))
  )
    (asserts! (get active pool)               ERR-POOL-INACTIVE)
    (asserts! (is-oracle-fresh in-principal)  ERR-STALE-ORACLE)
    (asserts! (is-oracle-fresh out-principal) ERR-STALE-ORACLE)
    (asserts! (> amount-in u0)                ERR-ZERO-AMOUNT)
    (asserts! (> reserve-b u0)                ERR-INSUFFICIENT-LIQUIDITY)
    (let (
      (gross   (compute-gross-out amount-in reserve-a reserve-b))
      (fee-amt (compute-fee gross))
      (net-out (- gross fee-amt))
    )
      (asserts! (>= net-out min-amount-out) ERR-SLIPPAGE-EXCEEDED)
      ;; Pull: user sends token-in to this contract.
      ;; current-contract is the Clarity 4+ built-in for this contract's principal.
      (try! (contract-call? token-in transfer amount-in tx-sender current-contract none))
      ;; Push: contract sends token-out to recipient.
      ;; as-contract? switches tx-sender to current-contract and enforces the
      ;; declared allowance. with-all-assets-unsafe is required here because the
      ;; token contract and token name are not known statically (trait parameter).
      (try! (as-contract? ((with-all-assets-unsafe))
        (try! (contract-call? token-out transfer net-out tx-sender recipient none))
      ))
      ;; Update reserves atomically; fee stays in contract balance.
      (map-set liquidity-pools pool-key
        (merge pool {
          reserve-a: (+ reserve-a amount-in),
          reserve-b: (- reserve-b gross)
        })
      )
      (map-set protocol-fees out-principal
        (+ (default-to u0 (map-get? protocol-fees out-principal)) fee-amt)
      )
      (ok net-out)
    )
  )
)

;; Add liquidity to an existing pool.
;;
;; The deposit ratio must match the current reserve ratio within 1% (100 bps).
;; This protects existing LPs from price manipulation via skewed additions:
;;
;;   |amount-a * reserve-b - amount-b * reserve-a| * 10000
;;     <= min(cross-a, cross-b) * 100
;;
;; @param token-a   Pool's token-a (must match pool key order)
;; @param token-b   Pool's token-b (must match pool key order)
;; @param amount-a  Units of token-a to deposit (> 0)
;; @param amount-b  Units of token-b to deposit (> 0)
;; @returns (ok true)
;; @errors  ERR-POOL-NOT-FOUND, ERR-ZERO-AMOUNT, ERR-RATIO-MISMATCH
(define-public (add-liquidity
  (token-a  <ft-trait>)
  (token-b  <ft-trait>)
  (amount-a uint)
  (amount-b uint)
)
  (let (
    (a-principal (contract-of token-a))
    (b-principal (contract-of token-b))
    (pool-key    { token-a: a-principal, token-b: b-principal })
    (pool        (unwrap! (map-get? liquidity-pools pool-key) ERR-POOL-NOT-FOUND))
    (reserve-a   (get reserve-a pool))
    (reserve-b   (get reserve-b pool))
  )
    (asserts! (and (> amount-a u0) (> amount-b u0)) ERR-ZERO-AMOUNT)
    (let (
      (cross-a   (* amount-a reserve-b))
      (cross-b   (* amount-b reserve-a))
      (diff      (if (>= cross-a cross-b) (- cross-a cross-b) (- cross-b cross-a)))
      (min-cross (if (<= cross-a cross-b) cross-a cross-b))
    )
      (asserts! (<= (* diff u10000) (* min-cross u100)) ERR-RATIO-MISMATCH)
    )
    (try! (contract-call? token-a transfer amount-a tx-sender current-contract none))
    (try! (contract-call? token-b transfer amount-b tx-sender current-contract none))
    (map-set liquidity-pools pool-key
      (merge pool {
        reserve-a: (+ reserve-a amount-a),
        reserve-b: (+ reserve-b amount-b)
      })
    )
    (ok true)
  )
)

;; Update the oracle price for a token.
;;
;; CONTRACT-OWNER only. Records stacks-block-height as the update timestamp.
;; In production this should be called by an automated oracle keeper
;; (Pyth / Redstone) rather than the contract owner directly.
;;
;; @param token      Token principal to update
;; @param price-usd  Price in USD scaled by 10^decimals
;; @param decimals   Decimal scale for price-usd
;; @returns (ok true)
;; @errors  ERR-NOT-OWNER
(define-public (set-oracle-price
  (token     principal)
  (price-usd uint)
  (decimals  uint)
)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-OWNER)
    (map-set oracle-prices token
      {
        price-usd:    price-usd,
        decimals:     decimals,
        last-updated: stacks-block-height
      }
    )
    (ok true)
  )
)

;; Create a new liquidity pool with initial reserves.
;;
;; CONTRACT-OWNER only. Transfers initial liquidity from owner to contract.
;; Pool key ordering ({token-a, token-b}) is determined by the caller;
;; callers should canonicalise by alphabetical contract principal to avoid
;; creating duplicate reversed pools.
;;
;; @param token-a    First pool token
;; @param token-b    Second pool token
;; @param initial-a  Initial units of token-a to seed the pool (> 0)
;; @param initial-b  Initial units of token-b to seed the pool (> 0)
;; @returns (ok true)
;; @errors  ERR-NOT-OWNER, ERR-POOL-EXISTS, ERR-ZERO-LIQUIDITY
(define-public (create-pool
  (token-a   <ft-trait>)
  (token-b   <ft-trait>)
  (initial-a uint)
  (initial-b uint)
)
  (let (
    (a-principal (contract-of token-a))
    (b-principal (contract-of token-b))
    (pool-key    { token-a: a-principal, token-b: b-principal })
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER)              ERR-NOT-OWNER)
    (asserts! (is-none (map-get? liquidity-pools pool-key)) ERR-POOL-EXISTS)
    (asserts! (and (> initial-a u0) (> initial-b u0))      ERR-ZERO-LIQUIDITY)
    (try! (contract-call? token-a transfer initial-a tx-sender current-contract none))
    (try! (contract-call? token-b transfer initial-b tx-sender current-contract none))
    (map-set liquidity-pools pool-key
      {
        reserve-a: initial-a,
        reserve-b: initial-b,
        fee-bps:   FEE-BPS,
        active:    true
      }
    )
    (ok true)
  )
)

;; Collect accumulated protocol fees for a given token.
;;
;; CONTRACT-OWNER only. Transfers the full tracked fee balance to the owner
;; and resets the counter to zero. Fees accumulate in the contract balance
;; independently of pool reserves (fee-on-output model), so reserves are
;; unaffected by collection.
;;
;; @param token   SIP-010 token whose fees to collect
;; @returns (ok uint)  Amount transferred to owner
;; @errors  ERR-NOT-OWNER, ERR-ZERO-AMOUNT (no fees accrued)
(define-public (collect-fees (token <ft-trait>))
  (let (
    (token-principal (contract-of token))
    (fee-total       (default-to u0 (map-get? protocol-fees token-principal)))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-OWNER)
    (asserts! (> fee-total u0)                 ERR-ZERO-AMOUNT)
    (map-set protocol-fees token-principal u0)
    (try! (as-contract? ((with-all-assets-unsafe))
      (try! (contract-call? token transfer fee-total tx-sender CONTRACT-OWNER none))
    ))
    (ok fee-total)
  )
)
