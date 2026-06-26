;; =============================================================================
;; ResolvX Smart Wallet -- v0
;; Clarity 5 (Stacks Nakamoto, epoch 3.x)
;; secp256r1-verify: pass SHA-256 hash directly -- no internal re-hash (Clarity 5 behavior)
;;
;; Security model
;; --------------
;; Each Stacks principal registers one secp256r1 (P-256) public key derived
;; from a WebAuthn credential (Face ID / Touch ID). The private key never
;; leaves the device's Secure Enclave. Every state-changing call requires:
;;   1. A valid outer Stacks transaction signed by the wallet owner (secp256k1)
;;   2. A valid inner biometric signature over the typed payload (secp256r1)
;;
;; This is dual-factor security: holding the Stacks key alone is insufficient
;; to move funds -- the biometric must also authorise each operation.
;;
;; Payload hashing
;; ---------------
;; All payloads are SHA-256 hashed over the Clarity consensus-serialized tuple.
;; Tuple keys are ordered alphabetically in Clarity consensus encoding.
;;
;;   transfer  : { action:"TRANSFER",   amount, nonce, owner, recipient, token }
;;   key-update: { action:"KEY-UPDATE", new-pubkey, nonce, owner }
;;   revoke    : { action:"REVOKE",     nonce, owner }
;;
;; To replicate in JavaScript (frontend / tests):
;;   import { tupleCV, stringAsciiCV, uintCV, principalCV, serializeCV }
;;     from "@stacks/transactions";
;;   const bytes = serializeCV(tupleCV({ action: stringAsciiCV("TRANSFER"), ... }));
;;   const hash  = await crypto.subtle.digest("SHA-256", bytes);
;;
;; Signature format
;; ----------------
;; secp256r1-verify in Clarity 5 takes a 32-byte SHA-256 hash directly --
;; no internal re-hashing. Pass the raw SHA-256 digest.
;; WebAuthn returns DER-encoded signatures; the frontend MUST decode to raw
;; r||s (64 bytes) before submission.
;; =============================================================================

;; ---------------------------------------------------------------------------
;; TRAIT
;; SIP-010 fungible token standard -- compatible with all Stacks FTs.
;; ---------------------------------------------------------------------------
(define-trait sip-010-trait
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
;; u1xx  wallet lifecycle
;; u2xx  authentication
;; u3xx  transfer validation
;; ---------------------------------------------------------------------------
(define-constant ERR-WALLET-EXISTS        (err u100))
(define-constant ERR-WALLET-NOT-FOUND     (err u101))
(define-constant ERR-WALLET-REVOKED       (err u102))
(define-constant ERR-RECOVERY-PENDING     (err u103))
(define-constant ERR-NO-RECOVERY-REQUEST  (err u104))
(define-constant ERR-RECOVERY-TOO-EARLY   (err u105))
(define-constant ERR-INVALID-SIGNATURE    (err u200))
(define-constant ERR-INVALID-NONCE        (err u201))
(define-constant ERR-INVALID-PUBKEY       (err u202))
(define-constant ERR-ZERO-AMOUNT          (err u300))
(define-constant ERR-SELF-TRANSFER        (err u301))

;; ---------------------------------------------------------------------------
;; CONSTANTS - recovery
;;
;; Blocks the owner has to cancel a pending recovery before it can be
;; finalised. At ~10-minute Stacks block times this is approximately 24 hours.
;; Front-ends must surface pending recovery requests so users can abort within
;; this window. Increase to u1008 (~7 days) for production.
;; ---------------------------------------------------------------------------
(define-constant RECOVERY-DELAY-BLOCKS u144)

;; ---------------------------------------------------------------------------
;; DATA
;;
;; One map entry per principal. All operations are O(1).
;; The map is the authoritative record of wallet state.
;; ---------------------------------------------------------------------------
(define-map wallets principal
  {
    pubkey:     (buff 33),  ;; compressed secp256r1 (P-256) public key -- 33 bytes
    nonce:      uint,       ;; monotonically increasing -- prevents replay attacks
    active:     bool,       ;; false after owner-initiated revocation (permanent)
    created-at: uint        ;; block height at registration -- immutable audit record
  }
)

;; Pending time-locked recovery initiated by the secp256k1 key only.
;; Only one request may exist per principal at a time.
(define-map recovery-requests principal
  {
    new-pubkey:   (buff 33), ;; replacement secp256r1 key to install after the delay
    requested-at: uint       ;; block height of the initiate-recovery call
  }
)

;; ---------------------------------------------------------------------------
;; READ-ONLY
;; ---------------------------------------------------------------------------

;; Returns the full wallet record for a given principal, or none.
(define-read-only (get-wallet (owner principal))
  (map-get? wallets owner)
)

;; Returns the current nonce for a registered wallet.
;; The frontend must read this before constructing a signed payload.
(define-read-only (get-nonce (owner principal))
  (match (map-get? wallets owner)
    wallet (ok (get nonce wallet))
    ERR-WALLET-NOT-FOUND
  )
)

;; Returns true if the principal has a registered wallet (active or revoked).
(define-read-only (is-registered (owner principal))
  (is-some (map-get? wallets owner))
)

;; Returns true if the principal has an active (non-revoked) wallet.
(define-read-only (is-active (owner principal))
  (match (map-get? wallets owner)
    wallet (get active wallet)
    false
  )
)

;; ---------------------------------------------------------------------------
;; PRIVATE HELPERS
;; ---------------------------------------------------------------------------

;; Verifies a secp256r1 signature over a 32-byte SHA-256 hash.
;; Returns (ok true) on success, ERR-INVALID-SIGNATURE on failure.
;;
;; Clarity 5 secp256r1-verify takes the pre-hashed input directly (no
;; internal re-hashing). sig must be 64-byte raw r||s, NOT DER-encoded.
(define-private (verify-sig
  (payload-hash (buff 32))
  (sig          (buff 64))
  (pubkey       (buff 33))
)
  (if (secp256r1-verify payload-hash sig pubkey)
    (ok true)
    ERR-INVALID-SIGNATURE
  )
)

;; Builds the canonical SHA-256 hash for a transfer authorisation.
;;
;; Alphabetical key order in consensus serialization:
;;   action, amount, nonce, owner, recipient, token
;;
;; Including owner and token prevents cross-wallet and cross-token replay.
(define-private (transfer-hash
  (owner     principal)
  (recipient principal)
  (amount    uint)
  (nonce     uint)
  (token     principal)
)
  (sha256
    (unwrap-panic
      (to-consensus-buff?
        {
          action:    "TRANSFER",
          amount:    amount,
          nonce:     nonce,
          owner:     owner,
          recipient: recipient,
          token:     token
        }
      )
    )
  )
)

;; Builds the canonical SHA-256 hash for a public key rotation.
;;
;; Alphabetical key order: action, new-pubkey, nonce, owner
;;
;; The new-pubkey is included so the current credential explicitly authorises
;; its own replacement.
(define-private (key-update-hash
  (owner      principal)
  (new-pubkey (buff 33))
  (nonce      uint)
)
  (sha256
    (unwrap-panic
      (to-consensus-buff?
        {
          action:     "KEY-UPDATE",
          new-pubkey: new-pubkey,
          nonce:      nonce,
          owner:      owner
        }
      )
    )
  )
)

;; Builds the canonical SHA-256 hash for a wallet revocation.
;;
;; Alphabetical key order: action, nonce, owner
(define-private (revoke-hash
  (owner principal)
  (nonce uint)
)
  (sha256
    (unwrap-panic
      (to-consensus-buff?
        {
          action: "REVOKE",
          nonce:  nonce,
          owner:  owner
        }
      )
    )
  )
)

;; ---------------------------------------------------------------------------
;; PUBLIC FUNCTIONS
;; ---------------------------------------------------------------------------

;; Register a new seedless wallet for the caller.
;;
;; Called once during wallet setup -- typically from a connected Stacks wallet
;; (Leather / Xverse). After registration, all further actions require only
;; the biometric signature; the outer Stacks transaction is still needed for
;; fee payment but does not grant transfer authority on its own.
;;
;; @param pubkey  33-byte compressed secp256r1 public key from WebAuthn credential
;; @returns       (ok true) on success
;; @errors        ERR-WALLET-EXISTS if already registered
;;                ERR-INVALID-PUBKEY if pubkey is not exactly 33 bytes
(define-public (create-wallet (pubkey (buff 33)))
  (let ((owner tx-sender))
    (asserts! (not (is-registered owner)) ERR-WALLET-EXISTS)
    (asserts! (is-eq (len pubkey) u33)    ERR-INVALID-PUBKEY)
    (ok
      (map-set wallets owner
        {
          pubkey:     pubkey,
          nonce:      u0,
          active:     true,
          created-at: stacks-block-height
        }
      )
    )
  )
)

;; Execute a biometric-authenticated SIP-010 token transfer.
;;
;; The caller (tx-sender) must be the wallet owner. The token contract's
;; transfer function sees tx-sender = wallet owner, satisfying SIP-010
;; sender authorisation. The biometric signature is an additional on-chain
;; constraint that the standard tx signature cannot bypass.
;;
;; Nonce is incremented BEFORE the token transfer to prevent reentrancy:
;; any reentrant call within the same tx would fail ERR-INVALID-NONCE.
;;
;; @param token      SIP-010 token contract to transfer
;; @param recipient  Transfer destination -- must differ from caller
;; @param amount     Token units to transfer -- must be greater than zero
;; @param nonce      Must equal the wallet's current nonce exactly
;; @param sig        64-byte raw r||s secp256r1 signature over transfer-hash
;; @param memo       Optional 34-byte memo forwarded to the token contract
;; @returns          (ok true) on success, forwarded from token contract
;; @errors           ERR-WALLET-NOT-FOUND, ERR-WALLET-REVOKED, ERR-ZERO-AMOUNT,
;;                   ERR-SELF-TRANSFER, ERR-INVALID-NONCE, ERR-INVALID-SIGNATURE
(define-public (execute-transfer
  (token     <sip-010-trait>)
  (recipient principal)
  (amount    uint)
  (nonce     uint)
  (sig       (buff 64))
  (memo      (optional (buff 34)))
)
  (let (
    (owner        tx-sender)
    (wallet       (unwrap! (map-get? wallets owner) ERR-WALLET-NOT-FOUND))
    (payload-hash (transfer-hash owner recipient amount nonce (contract-of token)))
  )
    (asserts! (get active wallet)              ERR-WALLET-REVOKED)
    (asserts! (> amount u0)                    ERR-ZERO-AMOUNT)
    (asserts! (not (is-eq recipient owner))    ERR-SELF-TRANSFER)
    (asserts! (is-eq nonce (get nonce wallet)) ERR-INVALID-NONCE)
    (try! (verify-sig payload-hash sig (get pubkey wallet)))
    ;; Increment nonce before contract-call to prevent reentrancy
    (map-set wallets owner (merge wallet { nonce: (+ nonce u1) }))
    (contract-call? token transfer amount owner recipient memo)
  )
)

;; Rotate the registered secp256r1 public key.
;;
;; Required when migrating to a new device or re-enrolling a biometric
;; credential. The signature MUST be made with the CURRENT key -- the new
;; key is included in the signed payload so the current credential explicitly
;; authorises its own replacement.
;;
;; @param new-pubkey  33-byte replacement secp256r1 public key
;; @param nonce       Must equal the wallet's current nonce exactly
;; @param sig         64-byte signature over key-update-hash, signed by CURRENT key
;; @returns           (ok true) on success
;; @errors            ERR-WALLET-NOT-FOUND, ERR-WALLET-REVOKED, ERR-INVALID-PUBKEY,
;;                    ERR-INVALID-NONCE, ERR-INVALID-SIGNATURE
(define-public (update-pubkey
  (new-pubkey (buff 33))
  (nonce      uint)
  (sig        (buff 64))
)
  (let (
    (owner        tx-sender)
    (wallet       (unwrap! (map-get? wallets owner) ERR-WALLET-NOT-FOUND))
    (payload-hash (key-update-hash owner new-pubkey nonce))
  )
    (asserts! (get active wallet)              ERR-WALLET-REVOKED)
    (asserts! (is-eq (len new-pubkey) u33)     ERR-INVALID-PUBKEY)
    (asserts! (is-eq nonce (get nonce wallet)) ERR-INVALID-NONCE)
    (try! (verify-sig payload-hash sig (get pubkey wallet)))
    (ok
      (map-set wallets owner
        (merge wallet { pubkey: new-pubkey, nonce: (+ nonce u1) })
      )
    )
  )
)

;; Permanently revoke a wallet.
;;
;; Sets active = false. This is irreversible -- the wallet entry is preserved
;; on-chain for audit purposes but no further transfers or key updates can
;; be executed. To use ResolvX again the owner must register from a different
;; principal.
;;
;; @param nonce  Must equal the wallet's current nonce exactly
;; @param sig    64-byte signature over revoke-hash
;; @returns      (ok true) on success
;; @errors       ERR-WALLET-NOT-FOUND, ERR-WALLET-REVOKED (if already revoked),
;;               ERR-INVALID-NONCE, ERR-INVALID-SIGNATURE
(define-public (revoke-wallet
  (nonce uint)
  (sig   (buff 64))
)
  (let (
    (owner        tx-sender)
    (wallet       (unwrap! (map-get? wallets owner) ERR-WALLET-NOT-FOUND))
    (payload-hash (revoke-hash owner nonce))
  )
    (asserts! (get active wallet)              ERR-WALLET-REVOKED)
    (asserts! (is-eq nonce (get nonce wallet)) ERR-INVALID-NONCE)
    (try! (verify-sig payload-hash sig (get pubkey wallet)))
    (ok
      (map-set wallets owner
        (merge wallet { active: false, nonce: (+ nonce u1) })
      )
    )
  )
)
