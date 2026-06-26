/**
 * ResolvX Payment Router -- unit tests
 *
 * The router is a cross-asset payment layer. It converts the payer's token
 * to the recipient's preferred token in a single atomic transaction by routing
 * through ALEX (general pairs) or Bitflow StableSwap (stable pairs).
 *
 * Test scope
 * ----------
 * Simnet (runs here):
 *   Input validation only -- zero-amount and self-payment guards on all
 *   entry points. These run without needing ALEX or Bitflow state.
 *
 * Testnet required:
 *   End-to-end payment flows -- actual token conversion and delivery to
 *   recipient. Requires ALEX and Bitflow pools with real liquidity.
 *   ALEX and Bitflow are declared as [[project.requirements]] in Clarinet.toml
 *   and are available at their mainnet addresses when remote_data is enabled.
 */
import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const ROUTER = "ResolvX-router-v0";
const TOKEN  = "mock-token";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1  = accounts.get("wallet_1")!;
const wallet2  = accounts.get("wallet_2")!;

// ---------------------------------------------------------------------------
// pay -- ALEX routing (input validation)
// ---------------------------------------------------------------------------
describe("pay -- input validation", () => {
  it("rejects zero amount-in", () => {
    const { result } = simnet.callPublicFn(ROUTER, "pay", [
      Cl.contractPrincipal(deployer, TOKEN), // token-in
      Cl.contractPrincipal(deployer, TOKEN), // token-out
      Cl.uint(0n),                           // amount-in = 0
      Cl.uint(0n),
      Cl.principal(wallet2),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(300)); // ERR-ZERO-AMOUNT
  });

  it("rejects self-payment (sender == recipient)", () => {
    const { result } = simnet.callPublicFn(ROUTER, "pay", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(100n),
      Cl.uint(1n),
      Cl.principal(wallet1), // same as tx-sender
    ], wallet1);
    expect(result).toBeErr(Cl.uint(301)); // ERR-SELF-PAYMENT
  });
});

// ---------------------------------------------------------------------------
// pay-usda-for-susdt -- input validation
// ---------------------------------------------------------------------------
describe("pay-usda-for-susdt -- input validation", () => {
  it("rejects zero amount-in", () => {
    const { result } = simnet.callPublicFn(ROUTER, "pay-usda-for-susdt", [
      Cl.contractPrincipal(deployer, TOKEN), // token-x (USDA mock)
      Cl.contractPrincipal(deployer, TOKEN), // token-y (sUSDT mock)
      Cl.contractPrincipal(deployer, TOKEN), // lp token mock
      Cl.uint(0n),
      Cl.uint(0n),
      Cl.principal(wallet2),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(300));
  });

  it("rejects self-payment", () => {
    const { result } = simnet.callPublicFn(ROUTER, "pay-usda-for-susdt", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(100n),
      Cl.uint(1n),
      Cl.principal(wallet1),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(301));
  });
});

// ---------------------------------------------------------------------------
// pay-susdt-for-usda -- input validation
// ---------------------------------------------------------------------------
describe("pay-susdt-for-usda -- input validation", () => {
  it("rejects zero amount-in", () => {
    const { result } = simnet.callPublicFn(ROUTER, "pay-susdt-for-usda", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(0n),
      Cl.uint(0n),
      Cl.principal(wallet2),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(300));
  });

  it("rejects self-payment", () => {
    const { result } = simnet.callPublicFn(ROUTER, "pay-susdt-for-usda", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(100n),
      Cl.uint(1n),
      Cl.principal(wallet1),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(301));
  });
});

// ---------------------------------------------------------------------------
// pay-abtc-for-xbtc -- input validation
// ---------------------------------------------------------------------------
describe("pay-abtc-for-xbtc -- input validation", () => {
  it("rejects zero amount-in", () => {
    const { result } = simnet.callPublicFn(ROUTER, "pay-abtc-for-xbtc", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(0n),
      Cl.uint(0n),
      Cl.principal(wallet2),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(300));
  });

  it("rejects self-payment", () => {
    const { result } = simnet.callPublicFn(ROUTER, "pay-abtc-for-xbtc", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(100n),
      Cl.uint(1n),
      Cl.principal(wallet1),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(301));
  });
});

// ---------------------------------------------------------------------------
// pay-xbtc-for-abtc -- input validation
// ---------------------------------------------------------------------------
describe("pay-xbtc-for-abtc -- input validation", () => {
  it("rejects zero amount-in", () => {
    const { result } = simnet.callPublicFn(ROUTER, "pay-xbtc-for-abtc", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(0n),
      Cl.uint(0n),
      Cl.principal(wallet2),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(300));
  });

  it("rejects self-payment", () => {
    const { result } = simnet.callPublicFn(ROUTER, "pay-xbtc-for-abtc", [
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.contractPrincipal(deployer, TOKEN),
      Cl.uint(100n),
      Cl.uint(1n),
      Cl.principal(wallet1),
    ], wallet1);
    expect(result).toBeErr(Cl.uint(301));
  });
});

// ---------------------------------------------------------------------------
// Integration tests -- require testnet with real ALEX and Bitflow state
// ---------------------------------------------------------------------------
describe("pay via ALEX -- testnet integration", () => {
  it.todo("payer sends STX, recipient receives sBTC via ALEX (testnet only)");
  it.todo("payer sends STX, recipient receives USDA via ALEX (testnet only)");
  it.todo("reverts when min-out is not met (slippage protection from ALEX)");
  it.todo("token-out is delivered to recipient, not back to payer");
});

describe("pay-usda-for-susdt via Bitflow -- testnet integration", () => {
  it.todo("payer sends USDA, recipient receives sUSDT via Bitflow StableSwap (testnet only)");
  it.todo("tighter spread than ALEX for this stable pair");
});

describe("pay-susdt-for-usda via Bitflow -- testnet integration", () => {
  it.todo("payer sends sUSDT, recipient receives USDA via Bitflow (testnet only)");
});

describe("pay-abtc-for-xbtc via Bitflow -- testnet integration", () => {
  it.todo("payer sends aBTC, recipient receives xBTC via Bitflow (testnet only)");
});

describe("pay-xbtc-for-abtc via Bitflow -- testnet integration", () => {
  it.todo("payer sends xBTC, recipient receives aBTC via Bitflow (testnet only)");
});
