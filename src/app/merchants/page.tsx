"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BENEFITS = [
  {
    icon: "payments",
    title: "Accept any token",
    body: "Your customer pays with whatever they hold — USDCx, sBTC, STX, or any SIP-010 token on Stacks. You set what you want to receive.",
  },
  {
    icon: "currency_bitcoin",
    title: "Settle in BTC or any asset",
    body: "Tell ResolvX your preferred settlement asset. The cross-asset swap and transfer happen atomically in a single Clarity transaction.",
  },
  {
    icon: "bolt",
    title: "One transaction, no middleware",
    body: "No escrow. No off-chain relayer. The swap and the payout settle together on Stacks, secured by Bitcoin. If one step fails, everything reverts.",
  },
  {
    icon: "code_blocks",
    title: "Simple SDK integration",
    body: "Three lines to create a payment request. ResolvX handles routing, pricing, and settlement. You just receive the asset you specified.",
  },
  {
    icon: "verified_user",
    title: "Oracle-guaranteed rate",
    body: "Rates are fetched from the ResolvX oracle at execution time and enforced on-chain. No slippage surprises, no off-chain price manipulation.",
  },
  {
    icon: "group",
    title: "No wallet friction for customers",
    body: "Customers with a ResolvX seedless wallet pay with Face ID or fingerprint. No seed phrase, no confirmation dialogs — just a biometric tap.",
  },
];

const CODE_EXAMPLE = `import { ResolvX } from '@resolvx/sdk';

const resolvx = new ResolvX({ network: 'mainnet' });

// Create a payment request:
// Customer pays in USDCx, you receive BTC
const payment = await resolvx.createPayment({
  receiveAsset: 'BTC',
  receiveAmount: 0.001,          // 0.001 BTC
  merchantAddress: 'bc1q...your-btc-address',
  memo: 'Order #1042',
});

// Share payment.requestUrl with your customer.
// ResolvX handles the USDCx → BTC swap and
// delivers BTC to your address in one transaction.

// Listen for settlement confirmation:
resolvx.onSettled(payment.id, (result) => {
  console.log('Settled:', result.txid);
});`;

export default function MerchantsPage() {
  function copyCode() {
    navigator.clipboard.writeText(CODE_EXAMPLE);
  }

  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="py-16 md:py-[100px] bg-white dark:bg-[#0a0f1e] transition-colors duration-200 border-b border-outline-variant/40">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="max-w-2xl">

            {/* Label */}
            <span className="hero-gradient-text font-bold text-xs uppercase tracking-widest block mb-md">
              For merchants
            </span>

            {/* Headline */}
            <h1
              className="font-extrabold tracking-[-0.03em] leading-tight mb-md"
              style={{ fontSize: "clamp(30px, 4vw, 52px)", fontFamily: "Inter, sans-serif" }}
            >
              <span className="text-on-surface">Your customer has USDCx.</span>
              <br />
              <span className="hero-gradient-text">You receive BTC.</span>
            </h1>

            <p className="text-secondary text-body-lg leading-relaxed mb-lg" style={{ maxWidth: "560px" }}>
              ResolvX lets merchants accept any Stacks token and settle in the asset
              they actually want — BTC, STX, USDCx, or any SIP-010 token. No manual
              swaps. No off-chain bridges. One transaction on Stacks, secured by Bitcoin.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap gap-md items-center">
              <a
                href="/docs"
                className="text-white px-lg py-3 font-bold rounded-xl text-sm shadow-md hover:brightness-110 transition-all active:scale-95 flex items-center gap-xs"
                style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  menu_book
                </span>
                Read the SDK docs
              </a>
              <a
                href="#integration"
                className="text-primary-container font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all hover:opacity-80"
              >
                See code example
                <span className="material-symbols-outlined" style={{ fontSize: "16px", lineHeight: 1 }}>
                  arrow_downward
                </span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── How it works for a merchant ── */}
      <section className="py-12 md:py-xl bg-surface-container-low dark:bg-[#0e1525] transition-colors duration-200">
        <div className="max-w-container-max mx-auto px-gutter">

          <div className="text-center mb-xl">
            <h2
              className="font-extrabold tracking-[-0.02em] mb-sm"
              style={{ fontSize: "clamp(24px, 2.8vw, 38px)", fontFamily: "Inter, sans-serif" }}
            >
              <span className="text-on-surface">The merchant </span>
              <span className="hero-gradient-text">flow</span>
            </h2>
            <p className="text-secondary text-body-lg" style={{ maxWidth: "480px", margin: "0 auto" }}>
              From payment request to BTC in your wallet — one atomic transaction.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-4 gap-md">
            {[
              {
                step: "1",
                icon: "receipt_long",
                title: "Create a payment request",
                body: "Call ResolvX.createPayment() with your preferred settlement asset and amount. Get back a payment URL to share with your customer.",
              },
              {
                step: "2",
                icon: "account_balance_wallet",
                title: "Customer pays with what they have",
                body: "Customer opens the payment link, selects their token (e.g. USDCx), and confirms with their ResolvX wallet biometric.",
              },
              {
                step: "3",
                icon: "swap_horiz",
                title: "ResolvX swaps atomically",
                body: "A single Clarity transaction swaps USDCx → BTC at the oracle rate and routes the BTC output to your merchant address.",
              },
              {
                step: "4",
                icon: "check_circle",
                title: "You receive BTC",
                body: "Your wallet receives BTC in the same block. ResolvX fires a settlement webhook to your backend. Done.",
              },
            ].map(({ step, icon, title, body }) => (
              <div
                key={step}
                className="bg-white dark:bg-[#1a2235] border border-outline-variant rounded-2xl p-lg flex flex-col gap-md relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }}
                />
                <div className="flex items-center gap-sm">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #151c27, #0052ff)" }}
                  >
                    {step}
                  </div>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1", color: "#0052ff" }}
                  >
                    {icon}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-sm text-on-surface mb-xs">{title}</div>
                  <div className="text-secondary text-xs leading-relaxed">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits grid ── */}
      <section className="py-12 md:py-xl bg-white dark:bg-[#0a0f1e] transition-colors duration-200">
        <div className="max-w-container-max mx-auto px-gutter">

          <div className="text-center mb-xl">
            <h2
              className="font-extrabold tracking-[-0.02em] mb-sm"
              style={{ fontSize: "clamp(24px, 2.8vw, 38px)", fontFamily: "Inter, sans-serif" }}
            >
              <span className="text-on-surface">Why merchants </span>
              <span className="hero-gradient-text">choose ResolvX</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-md">
            {BENEFITS.map(({ icon, title, body }) => (
              <div
                key={title}
                className="bg-surface dark:bg-[#111827] border border-outline-variant rounded-2xl p-lg flex flex-col gap-sm"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #151c2712, #0052ff18)" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1", color: "#0052ff" }}
                  >
                    {icon}
                  </span>
                </div>
                <div className="font-bold text-sm text-on-surface">{title}</div>
                <div className="text-secondary text-xs leading-relaxed">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Code example ── */}
      <section
        id="integration"
        className="py-12 md:py-xl bg-surface-container-low dark:bg-[#0e1525] transition-colors duration-200"
      >
        <div className="max-w-container-max mx-auto px-gutter">

          <div className="grid md:grid-cols-2 gap-xl items-start">

            {/* Left: copy */}
            <div className="flex flex-col gap-lg">
              <div>
                <span className="hero-gradient-text font-bold text-xs uppercase tracking-widest block mb-sm">
                  SDK integration
                </span>
                <h2
                  className="font-extrabold tracking-[-0.02em] leading-tight mb-md"
                  style={{ fontSize: "clamp(22px, 2.6vw, 34px)", fontFamily: "Inter, sans-serif" }}
                >
                  <span className="text-on-surface">Live in </span>
                  <span className="hero-gradient-text">minutes,</span>
                  <br />
                  <span className="text-on-surface">not days.</span>
                </h2>
                <p className="text-secondary text-sm leading-relaxed">
                  Install the ResolvX SDK, create a payment, and you&apos;re done.
                  The SDK handles oracle pricing, route selection, and on-chain
                  execution. Your backend just listens for the settlement event.
                </p>
              </div>

              {/* Install pill */}
              <div className="bg-surface dark:bg-[#111827] border border-outline-variant rounded-xl px-md py-sm flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: "16px" }}>
                  terminal
                </span>
                <code className="text-xs font-mono text-on-surface">
                  npm install @resolvx/sdk
                </code>
              </div>

              {/* Key facts */}
              <ul className="flex flex-col gap-sm">
                {[
                  "Works with any SIP-010 token on Stacks",
                  "Atomic execution — no partial fills",
                  "Webhook + on-chain event for settlement confirmation",
                  "Testnet sandbox available",
                ].map((fact) => (
                  <li key={fact} className="flex items-center gap-sm text-sm text-secondary">
                    <span
                      className="material-symbols-outlined flex-shrink-0"
                      style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1", color: "#0052ff" }}
                    >
                      check_circle
                    </span>
                    {fact}
                  </li>
                ))}
              </ul>

              <a
                href="/docs"
                className="inline-flex items-center gap-xs text-primary-container font-bold text-sm hover:underline"
              >
                Full SDK reference
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
              </a>
            </div>

            {/* Right: code block */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-outline-variant shadow-xl">
                {/* Code block header */}
                <div className="flex items-center justify-between px-md py-sm bg-[#0d1117] border-b border-white/10">
                  <div className="flex items-center gap-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <span className="text-[10px] text-white/30 font-mono">merchant-payment.ts</span>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-xs text-[10px] text-white/40 hover:text-white/70 transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>content_copy</span>
                    Copy
                  </button>
                </div>

                {/* Code */}
                <pre
                  className="p-md text-[11px] leading-relaxed overflow-x-auto"
                  style={{
                    background: "#0d1117",
                    color: "#e6edf3",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <code>{CODE_EXAMPLE}</code>
                </pre>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-12 md:py-xl bg-white dark:bg-[#0a0f1e] transition-colors duration-200 border-t border-outline-variant/40">
        <div className="max-w-container-max mx-auto px-gutter text-center flex flex-col items-center gap-lg">
          <h2
            className="font-extrabold tracking-[-0.02em]"
            style={{ fontSize: "clamp(22px, 2.8vw, 36px)", fontFamily: "Inter, sans-serif" }}
          >
            <span className="text-on-surface">Ready to integrate? </span>
            <span className="hero-gradient-text">Start building.</span>
          </h2>
          <p className="text-secondary text-body-lg" style={{ maxWidth: "480px" }}>
            ResolvX is in active development. SDK docs and testnet access are available now.
          </p>
          <div className="flex flex-wrap gap-md justify-center">
            <a
              href="/docs"
              className="text-white px-lg py-3 font-bold rounded-xl text-sm shadow-md hover:brightness-110 transition-all active:scale-95 flex items-center gap-xs"
              style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>menu_book</span>
              Read the docs
            </a>
            <a
              href="/"
              className="px-lg py-3 font-bold rounded-xl text-sm border border-outline-variant text-secondary hover:text-on-surface hover:border-outline transition-all active:scale-95 flex items-center gap-xs"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
              Back to home
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
