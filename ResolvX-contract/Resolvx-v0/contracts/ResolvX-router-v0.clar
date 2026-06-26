;; =============================================================================
;; ResolvX Cross-Asset Payment Router -- v0
;; Clarity 5 (Stacks Nakamoto, epoch 3.x)
;;
;; ResolvX is a seedless wallet and cross-asset payment layer on Stacks.
;; This router enables atomic cross-asset payments:
;;   sender pays in any SIP-010 token they hold
;;   recipient receives the token THEY want
;;   conversion happens in one atomic transaction -- no manual swap required
;;
;; Payment flow
;; ------------
;;   1. Router pulls token-in from the sender into this contract
;;   2. Router (acting as the contract) routes the swap through ALEX or Bitflow
;;   3. Router delivers token-out directly to the recipient
;;
;; Routing model
;; -------------
;;   ALEX  (SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-03)
;;     General cross-asset payments. Any SIP-010 pair.
;;     Entry point: pay(token-in, token-out, amount-in, min-out, recipient)
;;
;;   Bitflow StableSwap (SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M)
;;     Stable-to-stable payments with tighter spreads.
;;     Supported pairs: USDA/sUSDT, aBTC/xBTC
;;     Entry points: pay-usda-for-susdt, pay-susdt-for-usda,
;;                   pay-abtc-for-xbtc,  pay-xbtc-for-abtc
;;
;; Merchant integration
;; --------------------
;;   Merchant configures preferred receive token (e.g. USDC) in their app.
;;   Customer pays in any token. ResolvX converts and delivers USDC to merchant.
;;   The merchant always receives their preferred token.
;;
;; Clarity 4+ built-ins (SIP-033)
;;   current-contract  -- this contract's principal
;;   as-contract?      -- elevates tx-sender to current-contract for outbound transfers
;; =============================================================================

;; ---------------------------------------------------------------------------
;; TRAITS
;;
;; Traits are imported from the actual DEX contracts so that token instances
;; passed to our pay functions can be forwarded directly to ALEX and Bitflow.
;; Clarity's type system requires trait identity to match at call sites.
;; ---------------------------------------------------------------------------

;; ALEX uses this SIP-010 trait for its swap-helper parameters
(use-trait alex-ft 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.trait-sip-010.sip-010-trait)

;; Bitflow StableSwap uses its own SIP-010 trait and a separate LP token trait
(use-trait bitflow-ft 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.sip-010-trait-ft-standard.sip-010-trait)
(use-trait bitflow-lp 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.lp-trait.lp-trait)

;; ---------------------------------------------------------------------------
;; ERROR CODES
;; ---------------------------------------------------------------------------
(define-constant ERR-ZERO-AMOUNT  (err u300))
(define-constant ERR-SELF-PAYMENT (err u301))

;; ---------------------------------------------------------------------------
;; PUBLIC FUNCTIONS - ALEX (general cross-asset payments)
;; ---------------------------------------------------------------------------

;; Pay in any SIP-010 token; recipient receives any other SIP-010 token.
;;
;; The conversion routes through ALEX's swap-helper, which automatically
;; selects the best pool in ALEX's network for the given pair. No oracle
;; setup or pool management is required on the ResolvX side.
;;
;; Pull-swap-push flow:
;;   1. Router pulls token-in from tx-sender (the payer)
;;   2. Router (as-contract) calls ALEX -- ALEX converts token-in to token-out
;;   3. Router delivers token-out to recipient
;;
;; @param token-in   SIP-010 token the payer holds and is spending
;; @param token-out  SIP-010 token the recipient will receive
;; @param amount-in  Amount of token-in to spend (must be > 0)
;; @param min-out    Minimum token-out the recipient must receive; reverts if not met
;; @param recipient  Principal that receives token-out (must differ from caller)
;; @returns (ok uint)  Net amount of token-out delivered to recipient
;; @errors  ERR-ZERO-AMOUNT, ERR-SELF-PAYMENT; ALEX errors propagate unchanged
(define-public (pay
  (token-in  <alex-ft>)
  (token-out <alex-ft>)
  (amount-in uint)
  (min-out   uint)
  (recipient principal)
)
  (let ((sender tx-sender))
    (asserts! (> amount-in u0)               ERR-ZERO-AMOUNT)
    (asserts! (not (is-eq sender recipient)) ERR-SELF-PAYMENT)
    (match (contract-call? token-in transfer amount-in sender current-contract none)
      ok-pull
      (as-contract? ((with-all-assets-unsafe))
        (match (contract-call? 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-03
          swap-helper token-in token-out amount-in (some min-out))
          net-out
          (match (contract-call? token-out transfer net-out tx-sender recipient none)
            ok-push (ok net-out)
            e       (err e)
          )
          e (err e)
        )
      )
      e (err e)
    )
  )
)

;; ---------------------------------------------------------------------------
;; PUBLIC FUNCTIONS - Bitflow StableSwap (stable-to-stable payments)
;;
;; Use these for price-correlated asset pairs where Bitflow's StableSwap curve
;; gives tighter spreads than ALEX's constant-product AMM.
;;
;; Each Bitflow pool is a separate contract keyed to a specific pair. The caller
;; must supply the correct LP token for the pool being used. LP token principals
;; are published in Bitflow's documentation.
;;
;; Pull-swap-push flow is identical to the ALEX pay function above.
;; ---------------------------------------------------------------------------

;; Pay USDA; recipient receives sUSDT. Routes via Bitflow USDA/sUSDT StableSwap.
;;
;; @param token-x  USDA SIP-010 token contract (the x-token of this pool)
;; @param token-y  sUSDT SIP-010 token contract (the y-token of this pool)
;; @param lp       Bitflow USDA/sUSDT LP token contract
;; @param amount-in  Amount of USDA to spend (must be > 0)
;; @param min-out    Minimum sUSDT the recipient must receive
;; @param recipient  Principal that receives sUSDT
;; @returns (ok uint)  Net sUSDT delivered to recipient
;; @errors  ERR-ZERO-AMOUNT, ERR-SELF-PAYMENT; Bitflow errors propagate unchanged
(define-public (pay-usda-for-susdt
  (token-x  <bitflow-ft>)
  (token-y  <bitflow-ft>)
  (lp       <bitflow-lp>)
  (amount-in uint)
  (min-out   uint)
  (recipient principal)
)
  (let ((sender tx-sender))
    (asserts! (> amount-in u0)               ERR-ZERO-AMOUNT)
    (asserts! (not (is-eq sender recipient)) ERR-SELF-PAYMENT)
    (match (contract-call? token-x transfer amount-in sender current-contract none)
      ok-pull
      (as-contract? ((with-all-assets-unsafe))
        (match (contract-call? 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-usda-susdt-v-1-2
          swap-x-for-y token-x token-y lp amount-in min-out)
          net-out
          (match (contract-call? token-y transfer net-out tx-sender recipient none)
            ok-push (ok net-out)
            e       (err e)
          )
          e (err e)
        )
      )
      e (err e)
    )
  )
)

;; Pay sUSDT; recipient receives USDA. Routes via Bitflow USDA/sUSDT StableSwap.
;;
;; @param token-y  sUSDT SIP-010 token contract
;; @param token-x  USDA SIP-010 token contract
;; @param lp       Bitflow USDA/sUSDT LP token contract
;; @param amount-in  Amount of sUSDT to spend (must be > 0)
;; @param min-out    Minimum USDA the recipient must receive
;; @param recipient  Principal that receives USDA
;; @returns (ok uint)  Net USDA delivered to recipient
(define-public (pay-susdt-for-usda
  (token-y  <bitflow-ft>)
  (token-x  <bitflow-ft>)
  (lp       <bitflow-lp>)
  (amount-in uint)
  (min-out   uint)
  (recipient principal)
)
  (let ((sender tx-sender))
    (asserts! (> amount-in u0)               ERR-ZERO-AMOUNT)
    (asserts! (not (is-eq sender recipient)) ERR-SELF-PAYMENT)
    (match (contract-call? token-y transfer amount-in sender current-contract none)
      ok-pull
      (as-contract? ((with-all-assets-unsafe))
        (match (contract-call? 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-usda-susdt-v-1-2
          swap-y-for-x token-y token-x lp amount-in min-out)
          net-out
          (match (contract-call? token-x transfer net-out tx-sender recipient none)
            ok-push (ok net-out)
            e       (err e)
          )
          e (err e)
        )
      )
      e (err e)
    )
  )
)

;; Pay aBTC; recipient receives xBTC. Routes via Bitflow aBTC/xBTC StableSwap.
;;
;; @param token-x  aBTC SIP-010 token contract
;; @param token-y  xBTC SIP-010 token contract
;; @param lp       Bitflow aBTC/xBTC LP token contract
;; @param amount-in  Amount of aBTC to spend (must be > 0)
;; @param min-out    Minimum xBTC the recipient must receive
;; @param recipient  Principal that receives xBTC
;; @returns (ok uint)  Net xBTC delivered to recipient
(define-public (pay-abtc-for-xbtc
  (token-x  <bitflow-ft>)
  (token-y  <bitflow-ft>)
  (lp       <bitflow-lp>)
  (amount-in uint)
  (min-out   uint)
  (recipient principal)
)
  (let ((sender tx-sender))
    (asserts! (> amount-in u0)               ERR-ZERO-AMOUNT)
    (asserts! (not (is-eq sender recipient)) ERR-SELF-PAYMENT)
    (match (contract-call? token-x transfer amount-in sender current-contract none)
      ok-pull
      (as-contract? ((with-all-assets-unsafe))
        (match (contract-call? 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-abtc-xbtc-v-1-2
          swap-x-for-y token-x token-y lp amount-in min-out)
          net-out
          (match (contract-call? token-y transfer net-out tx-sender recipient none)
            ok-push (ok net-out)
            e       (err e)
          )
          e (err e)
        )
      )
      e (err e)
    )
  )
)

;; Pay xBTC; recipient receives aBTC. Routes via Bitflow aBTC/xBTC StableSwap.
;;
;; @param token-y  xBTC SIP-010 token contract
;; @param token-x  aBTC SIP-010 token contract
;; @param lp       Bitflow aBTC/xBTC LP token contract
;; @param amount-in  Amount of xBTC to spend (must be > 0)
;; @param min-out    Minimum aBTC the recipient must receive
;; @param recipient  Principal that receives aBTC
;; @returns (ok uint)  Net aBTC delivered to recipient
(define-public (pay-xbtc-for-abtc
  (token-y  <bitflow-ft>)
  (token-x  <bitflow-ft>)
  (lp       <bitflow-lp>)
  (amount-in uint)
  (min-out   uint)
  (recipient principal)
)
  (let ((sender tx-sender))
    (asserts! (> amount-in u0)               ERR-ZERO-AMOUNT)
    (asserts! (not (is-eq sender recipient)) ERR-SELF-PAYMENT)
    (match (contract-call? token-y transfer amount-in sender current-contract none)
      ok-pull
      (as-contract? ((with-all-assets-unsafe))
        (match (contract-call? 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-abtc-xbtc-v-1-2
          swap-y-for-x token-y token-x lp amount-in min-out)
          net-out
          (match (contract-call? token-x transfer net-out tx-sender recipient none)
            ok-push (ok net-out)
            e       (err e)
          )
          e (err e)
        )
      )
      e (err e)
    )
  )
)
