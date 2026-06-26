;; Mock mintable SIP-010 token for tests only.
(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.ResolvX-v0.sip-010-trait)

(define-fungible-token mock-token)

;; No tx-sender check: in Clarity 5, inter-contract calls change tx-sender to the
;; calling contract, which would break the standard (is-eq tx-sender sender) guard.
;; ft-transfer? enforces balance accounting -- this is safe for testing.
(define-public (transfer
  (amount    uint)
  (sender    principal)
  (recipient principal)
  (memo      (optional (buff 34)))
)
  (ft-transfer? mock-token amount sender recipient)
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance mock-token who))
)
(define-read-only (get-decimals)     (ok u6))
(define-read-only (get-name)         (ok "Mock Token"))
(define-read-only (get-symbol)       (ok "MOCK"))
(define-read-only (get-token-uri)    (ok none))
(define-read-only (get-total-supply) (ok (ft-get-supply mock-token)))

;; Unrestricted mint for testing
(define-public (mint (amount uint) (to principal))
  (ft-mint? mock-token amount to)
)
