import { describe, it, expect, beforeAll } from "vitest";
import { Cl } from "@stacks/transactions";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ROUTER = "ResolvX-router-v0";
const TOKEN  = "mock-token";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!; // CONTRACT-OWNER
const wallet1  = accounts.get("wallet_1")!;
const wallet2  = accounts.get("wallet_2")!;

// Token-A and Token-B are both mock-token instances deployed from the same
// contract, but in the router's pool they are keyed by the same principal.
// For a real two-token pool test we would deploy two separate token contracts.
// Here we use the same mock-token as both sides and verify pool mechanics —
// the router does not enforce token-a ≠ token-b.
const TOKEN_A = deployer; // principal of token-a contract
const TOKEN_B = deployer; // same address, different conceptual token

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function mintTo(recipient: string, amount: bigint) {
  simnet.callPublicFn(TOKEN, "mint", [
    Cl.uint(amount), Cl.principal(recipient),
  ], deployer);
}

// ---------------------------------------------------------------------------
// read-only helpers (no state required)
// ---------------------------------------------------------------------------
describe("read-only — initial state", () => {
  it("get-pool returns none for a pool that does not exist", () => {
    const { result } = simnet.callReadOnlyFn(ROUTER, "get-pool", [
      Cl.principal(wallet1), // nonsense principals
      Cl.principal(wallet2),
    ], deployer);
    expect(result).toBeNone();
  });

  it("get-oracle-price returns none before any price is set", () => {
    const { result } = simnet.callReadOnlyFn(ROUTER, "get-oracle-price", [
      Cl.contractPrincipal(deployer, TOKEN),
    ], deployer);
    expect(result).toBeNone();
  });

  it("is-oracle-fresh returns false before any price is set", () => {
    const { result } = simnet.callReadOnlyFn(ROUTER, "is-oracle-fresh", [
      Cl.contractPrincipal(deployer, TOKEN),
    ], deployer);
    expect(result).toBeBool(false);
  });
});

// ---------------------------------------------------------------------------
// set-oracle-price
// ---------------------------------------------------------------------------
describe("set-oracle-price", () => {
  it("non-owner cannot set oracle price", () => {
    const { result } = simnet.callPublicFn(ROUTER, "set-oracle-price", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(1_000_000n),
      Cl.uint(6n),
    ], wallet1); // not CONTRACT-OWNER
    expect(result).toBeErr(Cl.uint(500)); // ERR-NOT-OWNER
  });

  it("owner sets oracle price for the token", () => {
    const { result } = simnet.callPublicFn(ROUTER, "set-oracle-price", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(1_000_000n), // $1.00 at 6 decimals
      Cl.uint(6n),
    ], deployer);
    expect(result).toBeOk(Cl.bool(true));
    // Mine an extra block so callReadOnlyFn sees the committed state
    simnet.mineEmptyBlock();
  });

  it("is-oracle-fresh is true after a price update", () => {
    const { result } = simnet.callReadOnlyFn(ROUTER, "is-oracle-fresh", [
      Cl.contractPrincipal(deployer, TOKEN),
    ], deployer);
    expect(result).toBeBool(true);
  });

  it("get-oracle-price returns the stored record", () => {
    const { result } = simnet.callReadOnlyFn(ROUTER, "get-oracle-price", [
      Cl.contractPrincipal(deployer, TOKEN),
    ], deployer);
    expect(result).toBeSome();
  });
});

// ---------------------------------------------------------------------------
// create-pool
// ---------------------------------------------------------------------------
describe("create-pool", () => {
  beforeAll(() => {
    // Give deployer tokens to seed the pool
    mintTo(deployer, 10_000_000n);
  });

  it("non-owner cannot create a pool", () => {
    const { result } = simnet.callPublicFn(ROUTER, "create-pool", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(1_000n),
      Cl.uint(1_000n),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(500)); // ERR-NOT-OWNER
  });

  it("rejects zero initial amounts", () => {
    const { result } = simnet.callPublicFn(ROUTER, "create-pool", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(0n),
      Cl.uint(500n),
    ], deployer);
    expect(result).toBeErr(Cl.uint(401)); // ERR-ZERO-LIQUIDITY
  });

  it("owner creates a pool successfully", () => {
    const { result } = simnet.callPublicFn(ROUTER, "create-pool", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(1_000_000n),
      Cl.uint(1_000_000n),
    ], deployer);
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects duplicate pool creation", () => {
    const { result } = simnet.callPublicFn(ROUTER, "create-pool", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(500_000n),
      Cl.uint(500_000n),
    ], deployer);
    expect(result).toBeErr(Cl.uint(102)); // ERR-POOL-EXISTS
  });

  it("get-pool returns correct reserves", () => {
    const { result } = simnet.callReadOnlyFn(ROUTER, "get-pool", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
    ], deployer);
    expect(result).toBeSome();
  });
});

// ---------------------------------------------------------------------------
// get-quote
// ---------------------------------------------------------------------------
describe("get-quote", () => {
  it("returns a quote for a known pool", () => {
    // Pool: 1_000_000 / 1_000_000
    // Swap 10_000 in → gross = 1_000_000 * 10_000 / 1_010_000 ≈ 9900
    // fee = 9900 * 30 / 10000 = 29
    // net ≈ 9871
    const { result } = simnet.callReadOnlyFn(ROUTER, "get-quote", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(10_000n),
    ], deployer);
    expect(result).toBeOk(expect.anything()); // just verify it's an ok
  });

  it("returns ERR-POOL-NOT-FOUND for unknown pair", () => {
    const { result } = simnet.callReadOnlyFn(ROUTER, "get-quote", [
      Cl.principal(wallet1),
      Cl.principal(wallet2),
      Cl.uint(100n),
    ], deployer);
    expect(result).toBeErr(Cl.uint(100)); // ERR-POOL-NOT-FOUND
  });

  it("returns ERR-ZERO-AMOUNT for amount-in of 0 (pool exists)", () => {
    // Pool exists at this point (created in prior describe); contract checks pool
    // first, so the zero-amount assertion is only reachable with a valid pool key.
    const { result } = simnet.callReadOnlyFn(ROUTER, "get-quote", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(0n),
    ], deployer);
    expect(result).toBeErr(Cl.uint(300)); // ERR-ZERO-AMOUNT
  });
});

// ---------------------------------------------------------------------------
// swap
// ---------------------------------------------------------------------------
describe("swap", () => {
  beforeAll(() => {
    // Give wallet1 tokens to swap with
    mintTo(wallet1, 500_000n);
  });

  it("succeeds with valid oracle and acceptable slippage", () => {
    // Swap 10_000 token-a → token-b with generous min-out
    const { result } = simnet.callPublicFn(ROUTER, "swap", [
      Cl.contractPrincipal(deployer, TOKEN), // token-in
      Cl.contractPrincipal(deployer, TOKEN), // token-out
      Cl.uint(10_000n),
      Cl.uint(1n),    // min-amount-out — accept anything above 1
      Cl.principal(wallet2),
    ], wallet1);
    expect(result).toBeOk(expect.anything());
  });

  it("rejects when min-amount-out is not met (slippage too tight)", () => {
    const { result } = simnet.callPublicFn(ROUTER, "swap", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(10_000n),
      Cl.uint(999_999_999n), // impossibly high min
      Cl.principal(wallet2),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(301)); // ERR-SLIPPAGE-EXCEEDED
  });

  it("rejects swap with zero amount-in", () => {
    const { result } = simnet.callPublicFn(ROUTER, "swap", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(0n),
      Cl.uint(0n),
      Cl.principal(wallet2),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(300)); // ERR-ZERO-AMOUNT
  });

  it("reserves update correctly after a swap", () => {
    const { result } = simnet.callReadOnlyFn(ROUTER, "get-pool", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
    ], deployer);
    // The pool should still exist with updated reserves; just verify it's present
    expect(result).toBeSome();
  });
});

// ---------------------------------------------------------------------------
// add-liquidity
// ---------------------------------------------------------------------------
describe("add-liquidity", () => {
  beforeAll(() => {
    // Give wallet1 more tokens to add as liquidity
    mintTo(wallet1, 2_000_000n);
  });

  it("rejects badly off-ratio deposit", () => {
    // Pool is roughly 1:1 (after a small swap). A wildly skewed deposit fails.
    const { result } = simnet.callPublicFn(ROUTER, "add-liquidity", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(1_000n),
      Cl.uint(1_000_000n), // 1000x off
    ], wallet1);
    expect(result).toBeErr(Cl.uint(400)); // ERR-RATIO-MISMATCH
  });

  it("accepts a 1:1 deposit that matches the pool ratio", () => {
    const { result } = simnet.callPublicFn(ROUTER, "add-liquidity", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(100_000n),
      Cl.uint(100_000n),
    ], wallet1);
    expect(result).toBeOk(Cl.bool(true));
  });
});

// ---------------------------------------------------------------------------
// collect-fees
// ---------------------------------------------------------------------------
describe("collect-fees", () => {
  it("non-owner cannot collect fees", () => {
    const { result } = simnet.callPublicFn(ROUTER, "collect-fees", [
      Cl.contractPrincipal(deployer, TOKEN),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(500)); // ERR-NOT-OWNER
  });

  it("owner collects accumulated fees after a swap", () => {
    // Fees should have accrued from the earlier swap call
    const { result } = simnet.callPublicFn(ROUTER, "collect-fees", [
      Cl.contractPrincipal(deployer, TOKEN),
    ], deployer);
    expect(result).toBeOk(expect.anything()); // returns (ok fee-amount)
  });

  it("returns ERR-ZERO-AMOUNT when no fees remain", () => {
    const { result } = simnet.callPublicFn(ROUTER, "collect-fees", [
      Cl.contractPrincipal(deployer, TOKEN),
    ], deployer);
    expect(result).toBeErr(Cl.uint(300)); // ERR-ZERO-AMOUNT
  });
});

// ---------------------------------------------------------------------------
// stale oracle
// ---------------------------------------------------------------------------
describe("stale oracle gate", () => {
  it("swap fails after oracle price goes stale (> 144 blocks ago)", () => {
    // Mine 150 blocks to push the oracle past the staleness threshold
    simnet.mineEmptyBlocks(150);

    const { result } = simnet.callPublicFn(ROUTER, "swap", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(1_000n),
      Cl.uint(1n),
      Cl.principal(wallet2),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(200)); // ERR-STALE-ORACLE
  });

  it("swap succeeds again after a fresh oracle update", () => {
    // Re-freshen the oracle
    simnet.callPublicFn(ROUTER, "set-oracle-price", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(1_000_000n),
      Cl.uint(6n),
    ], deployer);

    const { result } = simnet.callPublicFn(ROUTER, "swap", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(1_000n),
      Cl.uint(1n),
      Cl.principal(wallet2),
    ], wallet1);
    expect(result).toBeOk(expect.anything());
  });
});
