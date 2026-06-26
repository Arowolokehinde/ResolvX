/**
 * ResolvX Smart Wallet — unit tests
 *
 * Cryptography strategy (no external deps):
 *   Web Crypto API (Node.js 18+ built-in) ECDSA-P256 returns IEEE P1363 format:
 *   raw r||s (64 bytes) — exactly what secp256r1-verify expects.
 *
 *   crypto.subtle.sign(ECDSA-SHA256, privKey, payloadBytes)
 *     internally computes SHA-256(payloadBytes) → sign that hash
 *
 *   The contract does:
 *     hash = sha256(to-consensus-buff? payload)   ← same computation
 *     secp256r1-verify hash sig pubkey            ← no re-hash in Clarity 5
 *
 *   serializeCV from @stacks/transactions produces the same bytes as
 *   to-consensus-buff? (both use alphabetically-sorted consensus encoding).
 *   So SHA-256(serializeCV(cv)) == SHA-256(to-consensus-buff? cv).
 */
import { describe, it, expect, beforeAll } from "vitest";
import { Cl, serializeCV } from "@stacks/transactions";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const WALLET = "ResolvX-v0";
const TOKEN  = "mock-token";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1  = accounts.get("wallet_1")!;
const wallet2  = accounts.get("wallet_2")!;
const wallet3  = accounts.get("wallet_3")!;

const tokenAddr = `${deployer}.${TOKEN}`;

// ---------------------------------------------------------------------------
// P-256 key state — generated once, shared across tests in this file
// ---------------------------------------------------------------------------
let privateKey:       CryptoKey;
let compressedPubKey: Uint8Array; // 33-byte compressed

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a raw P-256 public key (65 bytes, uncompressed 04||x||y) → compressed 33 bytes */
function compressRawPubKey(raw: Uint8Array): Uint8Array {
  const out = new Uint8Array(33);
  out[0] = (raw[64] & 1) ? 0x03 : 0x02; // odd or even y
  out.set(raw.slice(1, 33), 1);           // x coordinate
  return out;
}

/**
 * Sign a Clarity tuple payload with ECDSA-P256-SHA256.
 * Web Crypto internally does SHA-256(serializeCV(cv)) and returns 64-byte r||s.
 * The contract does the same SHA-256 and passes the result to secp256r1-verify.
 */
async function sign(cv: ReturnType<typeof Cl.tuple>): Promise<Uint8Array> {
  // In @stacks/transactions v7, serializeCV returns a hex string, not a Buffer.
  // Pass 'hex' encoding so Buffer.from decodes binary bytes, not UTF-8 chars.
  const bytes = Buffer.from(serializeCV(cv), 'hex');
  const sigBuf = await crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    privateKey,
    bytes,
  );
  return new Uint8Array(sigBuf); // 64 bytes IEEE P1363 r||s
}

async function transferCV(
  owner: string, recipient: string, amount: bigint, nonce: bigint,
): Promise<Uint8Array> {
  return sign(Cl.tuple({
    action:    Cl.stringAscii("TRANSFER"),
    amount:    Cl.uint(amount),
    nonce:     Cl.uint(nonce),
    owner:     Cl.principal(owner),
    recipient: Cl.principal(recipient),
    token:     Cl.principal(tokenAddr),
  }));
}

async function keyUpdateCV(
  owner: string, newPub: Uint8Array, nonce: bigint,
): Promise<Uint8Array> {
  return sign(Cl.tuple({
    action:       Cl.stringAscii("KEY-UPDATE"),
    "new-pubkey": Cl.buffer(newPub),
    nonce:        Cl.uint(nonce),
    owner:        Cl.principal(owner),
  }));
}

async function revokeCV(owner: string, nonce: bigint): Promise<Uint8Array> {
  return sign(Cl.tuple({
    action: Cl.stringAscii("REVOKE"),
    nonce:  Cl.uint(nonce),
    owner:  Cl.principal(owner),
  }));
}

// ---------------------------------------------------------------------------
// Suite-level setup — runs once before all tests in this file
// ---------------------------------------------------------------------------
beforeAll(async () => {
  const kp = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );
  privateKey = kp.privateKey;
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  compressedPubKey = compressRawPubKey(raw);
});

// ---------------------------------------------------------------------------
// create-wallet
// ---------------------------------------------------------------------------
describe("create-wallet", () => {
  it("registers a new wallet", () => {
    const { result } = simnet.callPublicFn(WALLET, "create-wallet", [
      Cl.buffer(compressedPubKey),
    ], wallet1);
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects duplicate registration", () => {
    const { result } = simnet.callPublicFn(WALLET, "create-wallet", [
      Cl.buffer(compressedPubKey),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(100)); // ERR-WALLET-EXISTS
  });

  it("rejects pubkey shorter than 33 bytes", () => {
    const { result } = simnet.callPublicFn(WALLET, "create-wallet", [
      Cl.buffer(new Uint8Array(32)),
    ], wallet3);
    expect(result).toBeErr(Cl.uint(202)); // ERR-INVALID-PUBKEY
  });
});

// ---------------------------------------------------------------------------
// read-only helpers
// ---------------------------------------------------------------------------
describe("read-only", () => {
  it("get-wallet returns the wallet record", () => {
    const { result } = simnet.callReadOnlyFn(WALLET, "get-wallet", [
      Cl.principal(wallet1),
    ], deployer);
    // toBeSome() with no arg is broken in vitest-environment-clarinet v3 — check inner value directly
    expect(result.value).toBeDefined();
  });

  it("get-nonce starts at 0", () => {
    const { result } = simnet.callReadOnlyFn(WALLET, "get-nonce", [
      Cl.principal(wallet1),
    ], deployer);
    expect(result).toBeOk(Cl.uint(0));
  });

  it("is-registered is true after creation", () => {
    const { result } = simnet.callReadOnlyFn(WALLET, "is-registered", [
      Cl.principal(wallet1),
    ], deployer);
    expect(result).toBeBool(true);
  });

  it("is-active is true for a live wallet", () => {
    const { result } = simnet.callReadOnlyFn(WALLET, "is-active", [
      Cl.principal(wallet1),
    ], deployer);
    expect(result).toBeBool(true);
  });

  it("get-wallet returns none for an unregistered principal", () => {
    const { result } = simnet.callReadOnlyFn(WALLET, "get-wallet", [
      Cl.principal(wallet3),
    ], deployer);
    expect(result).toBeNone();
  });
});

// ---------------------------------------------------------------------------
// execute-transfer
// ---------------------------------------------------------------------------
describe("execute-transfer", () => {
  beforeAll(() => {
    // Give wallet1 tokens to transfer in the success case
    simnet.callPublicFn(TOKEN, "mint", [
      Cl.uint(1_000_000n), Cl.principal(wallet1),
    ], deployer);
  });

  it("rejects transfer from an unregistered wallet", () => {
    const { result } = simnet.callPublicFn(WALLET, "execute-transfer", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.principal(wallet1),
      Cl.uint(100n),
      Cl.uint(0n),
      Cl.buffer(new Uint8Array(64)),
      Cl.none(),
    ], wallet3); // wallet3 never registered
    expect(result).toBeErr(Cl.uint(101)); // ERR-WALLET-NOT-FOUND
  });

  it("rejects zero amount", () => {
    const { result } = simnet.callPublicFn(WALLET, "execute-transfer", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.principal(wallet2),
      Cl.uint(0n),
      Cl.uint(0n),
      Cl.buffer(new Uint8Array(64)),
      Cl.none(),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(300)); // ERR-ZERO-AMOUNT
  });

  it("rejects self-transfer", () => {
    const { result } = simnet.callPublicFn(WALLET, "execute-transfer", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.principal(wallet1), // same as tx-sender
      Cl.uint(100n),
      Cl.uint(0n),
      Cl.buffer(new Uint8Array(64)),
      Cl.none(),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(301)); // ERR-SELF-TRANSFER
  });

  it("rejects wrong nonce", () => {
    const { result } = simnet.callPublicFn(WALLET, "execute-transfer", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.principal(wallet2),
      Cl.uint(100n),
      Cl.uint(99n), // wallet is at nonce 0
      Cl.buffer(new Uint8Array(64)),
      Cl.none(),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(201)); // ERR-INVALID-NONCE
  });

  it("rejects a zeroed (invalid) signature", () => {
    const { result } = simnet.callPublicFn(WALLET, "execute-transfer", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.principal(wallet2),
      Cl.uint(100n),
      Cl.uint(0n),
      Cl.buffer(new Uint8Array(64)), // all zeros — not a valid P-256 sig
      Cl.none(),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(200)); // ERR-INVALID-SIGNATURE
  });

  it("succeeds with a valid biometric signature and increments nonce", async () => {
    const sig = await transferCV(wallet1, wallet2, 100n, 0n);
    const { result } = simnet.callPublicFn(WALLET, "execute-transfer", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.principal(wallet2),
      Cl.uint(100n),
      Cl.uint(0n),
      Cl.buffer(sig),
      Cl.none(),
    ], wallet1);
    expect(result).toBeOk(Cl.bool(true));
  });

  it("nonce advances to 1 after one successful transfer", () => {
    const { result } = simnet.callReadOnlyFn(WALLET, "get-nonce", [
      Cl.principal(wallet1),
    ], deployer);
    expect(result).toBeOk(Cl.uint(1));
  });

  it("replaying a consumed nonce fails", async () => {
    const sig = await transferCV(wallet1, wallet2, 100n, 0n); // nonce 0 already used
    const { result } = simnet.callPublicFn(WALLET, "execute-transfer", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.principal(wallet2),
      Cl.uint(100n),
      Cl.uint(0n),
      Cl.buffer(sig),
      Cl.none(),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(201)); // ERR-INVALID-NONCE
  });
});

// ---------------------------------------------------------------------------
// update-pubkey
// ---------------------------------------------------------------------------
describe("update-pubkey", () => {
  // wallet1 nonce is 1 after the transfer describe above
  let newPrivKey: CryptoKey;
  let newPubKey:  Uint8Array;

  beforeAll(async () => {
    const kp = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"],
    );
    newPrivKey = kp.privateKey;
    const raw = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
    newPubKey = compressRawPubKey(raw);
  });

  it("rotates the key with a valid signature at current nonce", async () => {
    const sig = await keyUpdateCV(wallet1, newPubKey, 1n);
    const { result } = simnet.callPublicFn(WALLET, "update-pubkey", [
      Cl.buffer(newPubKey),
      Cl.uint(1n),
      Cl.buffer(sig),
    ], wallet1);
    expect(result).toBeOk(Cl.bool(true));
  });

  it("nonce advances to 2 after key rotation", () => {
    const { result } = simnet.callReadOnlyFn(WALLET, "get-nonce", [
      Cl.principal(wallet1),
    ], deployer);
    expect(result).toBeOk(Cl.uint(2));
  });

  it("rejects a stale nonce", () => {
    const { result } = simnet.callPublicFn(WALLET, "update-pubkey", [
      Cl.buffer(compressedPubKey),
      Cl.uint(0n), // stale
      Cl.buffer(new Uint8Array(64)),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(201)); // ERR-INVALID-NONCE
  });

  it("rejects a pubkey shorter than 33 bytes", () => {
    const { result } = simnet.callPublicFn(WALLET, "update-pubkey", [
      Cl.buffer(new Uint8Array(10)),
      Cl.uint(2n),
      Cl.buffer(new Uint8Array(64)),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(202)); // ERR-INVALID-PUBKEY
  });
});

// ---------------------------------------------------------------------------
// revoke-wallet
// ---------------------------------------------------------------------------
describe("revoke-wallet", () => {
  // Use wallet2 with its own P-256 key so state is independent of wallet1
  let priv2: CryptoKey;
  let pub2:  Uint8Array;

  beforeAll(async () => {
    const kp = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"],
    );
    priv2 = kp.privateKey;
    const raw = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
    pub2 = compressRawPubKey(raw);
    // Register wallet2
    simnet.callPublicFn(WALLET, "create-wallet", [Cl.buffer(pub2)], wallet2);
  });

  it("rejects revoke on an unregistered principal", () => {
    const { result } = simnet.callPublicFn(WALLET, "revoke-wallet", [
      Cl.uint(0n),
      Cl.buffer(new Uint8Array(64)),
    ], wallet3);
    expect(result).toBeErr(Cl.uint(101)); // ERR-WALLET-NOT-FOUND
  });

  it("revokes the wallet with a valid biometric signature", async () => {
    const sigBuf = await crypto.subtle.sign(
      { name: "ECDSA", hash: { name: "SHA-256" } },
      priv2,
      Buffer.from(serializeCV(Cl.tuple({
        action: Cl.stringAscii("REVOKE"),
        nonce:  Cl.uint(0n),
        owner:  Cl.principal(wallet2),
      })), 'hex'),
    );
    const { result } = simnet.callPublicFn(WALLET, "revoke-wallet", [
      Cl.uint(0n),
      Cl.buffer(new Uint8Array(sigBuf)),
    ], wallet2);
    expect(result).toBeOk(Cl.bool(true));
  });

  it("is-active is false after revocation", () => {
    const { result } = simnet.callReadOnlyFn(WALLET, "is-active", [
      Cl.principal(wallet2),
    ], deployer);
    expect(result).toBeBool(false);
  });

  it("execute-transfer on a revoked wallet returns ERR-WALLET-REVOKED", () => {
    const { result } = simnet.callPublicFn(WALLET, "execute-transfer", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.principal(wallet1),
      Cl.uint(1n),
      Cl.uint(1n),
      Cl.buffer(new Uint8Array(64)),
      Cl.none(),
    ], wallet2);
    expect(result).toBeErr(Cl.uint(102)); // ERR-WALLET-REVOKED
  });

  it("revoke on already-revoked wallet returns ERR-WALLET-REVOKED", () => {
    const { result } = simnet.callPublicFn(WALLET, "revoke-wallet", [
      Cl.uint(1n),
      Cl.buffer(new Uint8Array(64)),
    ], wallet2);
    expect(result).toBeErr(Cl.uint(102)); // ERR-WALLET-REVOKED
  });
});
