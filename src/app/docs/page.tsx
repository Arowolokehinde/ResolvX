"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ── Sidebar nav ── */
const NAV_SECTIONS = [
  {
    group: "Getting Started",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "quick-start", label: "Quick Start" },
      { id: "installation", label: "Installation" },
    ],
  },
  {
    group: "Core Concepts",
    items: [
      { id: "atomic-execution", label: "Atomic Execution" },
      { id: "cross-asset-routing", label: "Cross-Asset Routing" },
      { id: "oracle-pricing", label: "Oracle Pricing" },
    ],
  },
  {
    group: "SDK Reference",
    items: [
      { id: "resolvx-create", label: "ResolvX.create()" },
      { id: "payment-execute", label: "payment.execute()" },
      { id: "resolvx-quote", label: "ResolvX.getQuote()" },
      { id: "resolvx-listen", label: "ResolvX.listen()" },
    ],
  },
  {
    group: "Reference",
    items: [
      { id: "supported-assets", label: "Supported Assets" },
      { id: "error-handling", label: "Error Handling" },
    ],
  },
];

/* ── Inline code block component ── */
function CodeBlock({ code, language = "typescript", filename }: { code: string; language?: string; filename?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/10 overflow-hidden text-sm my-md">
      <div className="bg-[#161b22] px-md py-2 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-sm">
          {filename && (
            <div className="flex items-center gap-xs bg-[#0d1117] border border-white/10 rounded-md px-sm py-0.5">
              <span className="material-symbols-outlined text-[#c3e88d]" style={{ fontSize: "11px" }}>code</span>
              <span className="text-[11px] text-white/60 font-mono">{filename}</span>
            </div>
          )}
          {!filename && <span className="text-xs text-white/40 font-mono">{language}</span>}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-xs text-white/40 hover:text-white/80 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
            {copied ? "check_circle" : "content_copy"}
          </span>
          <span className="text-[11px] font-mono">{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-md overflow-x-auto">
        <code className="font-mono text-[13px] leading-6 text-white/85 whitespace-pre">{code.trim()}</code>
      </pre>
    </div>
  );
}

/* ── Inline callout ── */
function Callout({ type = "info", children }: { type?: "info" | "warning" | "tip"; children: React.ReactNode }) {
  const styles = {
    info:    { bg: "bg-[#0052ff0f] border-[#0052ff40]", icon: "info",    iconColor: "text-[#0052ff]" },
    warning: { bg: "bg-yellow-500/5 border-yellow-500/30", icon: "warning", iconColor: "text-yellow-400" },
    tip:     { bg: "bg-green-500/5 border-green-500/30",  icon: "tips_and_updates", iconColor: "text-green-400" },
  }[type];

  return (
    <div className={`flex gap-sm rounded-xl border p-md my-md ${styles.bg}`}>
      <span className={`material-symbols-outlined flex-shrink-0 mt-0.5 ${styles.iconColor}`} style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>
        {styles.icon}
      </span>
      <div className="text-sm text-secondary leading-relaxed">{children}</div>
    </div>
  );
}

/* ── Prop row for tables ── */
function PropRow({ name, type, required, def, desc }: { name: string; type: string; required?: boolean; def?: string; desc: string }) {
  return (
    <tr className="border-t border-outline-variant/40 hover:bg-surface-container-low/50 transition-colors">
      <td className="py-3 pr-md font-mono text-xs text-[#f07178] whitespace-nowrap">{name}{required && <span className="text-red-400 ml-0.5">*</span>}</td>
      <td className="py-3 pr-md font-mono text-xs text-[#c3e88d] whitespace-nowrap">{type}</td>
      <td className="py-3 pr-md text-xs text-secondary font-mono">{def ?? "—"}</td>
      <td className="py-3 text-sm text-secondary">{desc}</td>
    </tr>
  );
}

export default function DocsPage() {
  const [activeId, setActiveId] = useState("introduction");

  function scrollTo(id: string) {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <Navbar />

      {/* Page header banner */}
      <div className="border-b border-outline-variant bg-surface-container-low/50 dark:bg-[#0e1525]">
        <div className="max-w-container-max mx-auto px-gutter py-lg">
          <div className="flex items-center gap-sm mb-xs">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-sm py-1 rounded-full"
              style={{ color: "#0052ff", background: "linear-gradient(90deg, #151c270d, #0052ff18)", border: "1px solid #0052ff22" }}
            >
              v0.1.0-beta
            </span>
            <span className="text-xs text-secondary">Last updated Jun 2025</span>
          </div>
          <h1
            className="font-extrabold tracking-[-0.02em] mb-xs"
            style={{ fontSize: "clamp(24px, 2.5vw, 34px)", fontFamily: "Inter, sans-serif" }}
          >
            <span className="text-on-surface">ResolvX </span>
            <span className="hero-gradient-text">Documentation</span>
          </h1>
          <p className="text-secondary text-body-md" style={{ maxWidth: "520px" }}>
            Everything you need to integrate cross-asset payments into your Stacks application.
          </p>
        </div>
      </div>

      <div className="max-w-container-max mx-auto px-gutter flex gap-xl py-xl min-h-screen">

        {/* ── Sidebar ── */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div className="sticky top-24 flex flex-col gap-lg">
            {NAV_SECTIONS.map(({ group, items }) => (
              <div key={group}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-sm">{group}</p>
                <nav className="flex flex-col gap-0.5">
                  {items.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      className={`text-left text-sm py-1.5 pl-sm border-l-2 transition-all duration-150 ${
                        activeId === id
                          ? "border-primary-container text-primary-container font-semibold"
                          : "border-transparent text-secondary hover:text-on-surface hover:border-outline-variant"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 prose-custom">

          {/* Mobile nav */}
          <div className="md:hidden mb-lg overflow-x-auto flex gap-xs pb-sm">
            {NAV_SECTIONS.flatMap(s => s.items).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`flex-shrink-0 text-xs px-sm py-1.5 rounded-full border transition-all ${
                  activeId === id
                    ? "border-primary-container text-primary-container font-bold bg-[#0052ff0f]"
                    : "border-outline-variant text-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ─────────────────────────────────────── */}
          {/* INTRODUCTION                            */}
          {/* ─────────────────────────────────────── */}
          <section id="introduction" className="mb-[72px] scroll-mt-24">
            <h2 className="text-2xl font-extrabold text-on-surface mb-md tracking-tight">Introduction</h2>
            <p className="text-secondary text-body-md leading-relaxed mb-md">
              <strong className="text-on-surface">ResolvX</strong> is the cross-asset payment layer for the Stacks blockchain.
              It lets any wallet send one asset while the recipient automatically receives a different asset — all settled
              atomically in a single Clarity transaction, secured by Bitcoin.
            </p>
            <p className="text-secondary text-body-md leading-relaxed mb-md">
              No pre-swapping. No multi-step flows. No stranded funds. The sender pays with what they have; the recipient
              gets exactly what they want.
            </p>

            <div className="grid sm:grid-cols-3 gap-md mt-lg">
              {[
                { icon: "bolt", title: "Atomic", body: "The swap and transfer succeed together or both revert. Zero risk of stuck funds." },
                { icon: "shield", title: "Non-custodial", body: "Funds never leave your wallet until the full transaction is confirmed on-chain." },
                { icon: "code_blocks", title: "Open source", body: "Every Clarity contract is public, audited, and verifiable on Stacks mainnet." },
              ].map(({ icon, title, body }) => (
                <div key={title} className="bg-surface-container-low border border-outline-variant rounded-xl p-md flex flex-col gap-xs">
                  <span className="material-symbols-outlined text-primary-container" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  <div className="font-bold text-sm text-on-surface">{title}</div>
                  <p className="text-xs text-secondary leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ─────────────────────────────────────── */}
          {/* QUICK START                             */}
          {/* ─────────────────────────────────────── */}
          <section id="quick-start" className="mb-[72px] scroll-mt-24">
            <h2 className="text-2xl font-extrabold text-on-surface mb-md tracking-tight">Quick Start</h2>
            <p className="text-secondary text-body-md leading-relaxed mb-md">
              Get your first cross-asset payment running in under five minutes.
            </p>

            <h3 className="text-base font-bold text-on-surface mb-sm mt-lg">1. Install the SDK</h3>
            <CodeBlock language="bash" code={`npm install @resolvx/sdk`} />

            <h3 className="text-base font-bold text-on-surface mb-sm mt-lg">2. Create and execute a payment</h3>
            <CodeBlock
              filename="payment.ts"
              code={`import { ResolvX } from '@resolvx/sdk';

// Create a cross-asset payment
const payment = await ResolvX.create({
  amount: 0.01,          // amount in sendAsset units
  sendAsset: 'sBTC',
  receiveAsset: 'USDCx',
  recipient: 'SP3FGQ8Z7JY9BWYZ5WM53GE7RXNQD3EKH6GVLKE',
});

// Executes atomically in 1 transaction
const result = await payment.execute();
// → { txId: '0x3f9a…c81d', status: 'confirmed' }`}
            />

            <Callout type="tip">
              The <code className="font-mono text-xs bg-surface-container px-1 py-0.5 rounded">recipient</code> field accepts any valid Stacks principal address. The recipient does not need to have the ResolvX SDK installed.
            </Callout>

            <h3 className="text-base font-bold text-on-surface mb-sm mt-lg">3. Get a quote first (optional)</h3>
            <CodeBlock
              filename="quote.ts"
              code={`import { ResolvX } from '@resolvx/sdk';

const quote = await ResolvX.getQuote({
  amount: 0.01,
  sendAsset: 'sBTC',
  receiveAsset: 'USDCx',
});

console.log(quote.receiveAmount); // e.g. 1047.23
console.log(quote.fee);           // e.g. 0.00002
console.log(quote.rate);          // e.g. 104723`}
            />
          </section>

          {/* ─────────────────────────────────────── */}
          {/* INSTALLATION                            */}
          {/* ─────────────────────────────────────── */}
          <section id="installation" className="mb-[72px] scroll-mt-24">
            <h2 className="text-2xl font-extrabold text-on-surface mb-md tracking-tight">Installation</h2>
            <p className="text-secondary text-body-md leading-relaxed mb-md">
              The ResolvX SDK is available on npm and supports TypeScript out of the box.
            </p>

            <h3 className="text-base font-bold text-on-surface mb-sm">npm</h3>
            <CodeBlock language="bash" code={`npm install @resolvx/sdk`} />

            <h3 className="text-base font-bold text-on-surface mb-sm mt-lg">yarn / pnpm</h3>
            <CodeBlock language="bash" code={`yarn add @resolvx/sdk\n# or\npnpm add @resolvx/sdk`} />

            <h3 className="text-base font-bold text-on-surface mb-sm mt-lg">Requirements</h3>
            <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/60">
                    <th className="text-left px-md py-3 text-xs font-bold uppercase tracking-wide text-secondary">Requirement</th>
                    <th className="text-left px-md py-3 text-xs font-bold uppercase tracking-wide text-secondary">Version</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Node.js", "≥ 18"],
                    ["TypeScript", "≥ 5.0 (optional)"],
                    ["Stacks wallet", "Leather, Xverse, or any Stacks-compatible wallet"],
                    ["Network", "Stacks Mainnet or Testnet"],
                  ].map(([req, ver]) => (
                    <tr key={req} className="border-t border-outline-variant/40">
                      <td className="px-md py-3 font-mono text-xs text-on-surface">{req}</td>
                      <td className="px-md py-3 text-sm text-secondary">{ver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─────────────────────────────────────── */}
          {/* ATOMIC EXECUTION                        */}
          {/* ─────────────────────────────────────── */}
          <section id="atomic-execution" className="mb-[72px] scroll-mt-24">
            <h2 className="text-2xl font-extrabold text-on-surface mb-md tracking-tight">Atomic Execution</h2>
            <p className="text-secondary text-body-md leading-relaxed mb-md">
              Every ResolvX payment is encoded as a single Clarity <strong className="text-on-surface">post-condition transaction</strong>.
              The swap and the transfer are bundled into one block. If any part fails — wrong rate, slippage breach,
              insufficient liquidity — the entire transaction reverts and no assets move.
            </p>

            <div className="border border-outline-variant rounded-xl overflow-hidden my-lg">
              <div className="bg-surface-container-low px-md py-sm border-b border-outline-variant">
                <span className="text-xs font-bold text-secondary uppercase tracking-wide">Execution flow</span>
              </div>
              <div className="p-md flex flex-col gap-sm">
                {[
                  { step: "1", label: "Oracle fetch", desc: "On-chain oracle verifies the current spot rate for the asset pair." },
                  { step: "2", label: "Slippage check", desc: "Rate is compared against your quoted rate. Reverts if deviation exceeds tolerance." },
                  { step: "3", label: "Atomic swap", desc: "sendAsset is converted to receiveAsset via the ResolvX liquidity pool." },
                  { step: "4", label: "Transfer", desc: "receiveAsset is sent directly to the recipient in the same block." },
                ].map(({ step, label, desc }) => (
                  <div key={step} className="flex items-start gap-sm">
                    <div className="w-6 h-6 rounded-lg text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "linear-gradient(135deg, #151c27, #0052ff)" }}>
                      {step}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">{label}</div>
                      <div className="text-xs text-secondary leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Callout type="info">
              Because the transaction is atomic, your users can safely share a payment link without worrying about partial fills or rate manipulation between quote and execution.
            </Callout>
          </section>

          {/* ─────────────────────────────────────── */}
          {/* CROSS-ASSET ROUTING                     */}
          {/* ─────────────────────────────────────── */}
          <section id="cross-asset-routing" className="mb-[72px] scroll-mt-24">
            <h2 className="text-2xl font-extrabold text-on-surface mb-md tracking-tight">Cross-Asset Routing</h2>
            <p className="text-secondary text-body-md leading-relaxed mb-md">
              ResolvX routes payments through its on-chain liquidity pools. Direct pairs (e.g. sBTC → USDCx)
              execute in a single hop. Multi-hop routes (e.g. STX → sBTC → USDCx) are composed automatically
              when no direct pair exists.
            </p>
            <CodeBlock
              filename="routing.ts"
              code={`// Direct pair — one hop
const payment = await ResolvX.create({
  amount: 10,
  sendAsset: 'STX',
  receiveAsset: 'USDCx',
  recipient: 'SP3FGQ8Z7JY9BWYZ5WM53GE7RXNQD3EKH6GVLKE',
});

// Inspect route before executing
const quote = await ResolvX.getQuote({ amount: 10, sendAsset: 'STX', receiveAsset: 'USDCx' });
console.log(quote.route); // ['STX', 'USDCx']`}
            />
          </section>

          {/* ─────────────────────────────────────── */}
          {/* ORACLE PRICING                          */}
          {/* ─────────────────────────────────────── */}
          <section id="oracle-pricing" className="mb-[72px] scroll-mt-24">
            <h2 className="text-2xl font-extrabold text-on-surface mb-md tracking-tight">Oracle Pricing</h2>
            <p className="text-secondary text-body-md leading-relaxed mb-md">
              Prices are sourced from the ResolvX on-chain oracle, which aggregates feeds from multiple
              off-chain providers. The oracle is updated every Stacks block (~10 minutes) and is
              tamper-resistant by design.
            </p>
            <Callout type="warning">
              The default slippage tolerance is <strong>0.5%</strong>. For volatile assets or large orders, consider increasing this via the <code className="font-mono text-xs bg-surface-container px-1 py-0.5 rounded">slippageTolerance</code> option.
            </Callout>
            <CodeBlock
              filename="slippage.ts"
              code={`const payment = await ResolvX.create({
  amount: 5,
  sendAsset: 'STX',
  receiveAsset: 'sBTC',
  recipient: 'SP3FGQ8Z7JY9BWYZ5WM53GE7RXNQD3EKH6GVLKE',
  slippageTolerance: 1.0,  // 1% — default is 0.5%
});`}
            />
          </section>

          {/* ─────────────────────────────────────── */}
          {/* ResolvX.create()                        */}
          {/* ─────────────────────────────────────── */}
          <section id="resolvx-create" className="mb-[72px] scroll-mt-24">
            <h2 className="text-2xl font-extrabold text-on-surface mb-xs tracking-tight">ResolvX.create()</h2>
            <p className="text-xs font-mono text-secondary mb-md">Returns: <span className="text-[#c3e88d]">Promise&lt;Payment&gt;</span></p>
            <p className="text-secondary text-body-md leading-relaxed mb-md">
              Creates a new payment object. Validates the inputs, fetches the current oracle rate, and
              computes the expected receive amount. Does not broadcast a transaction.
            </p>
            <CodeBlock
              filename="create.ts"
              code={`import { ResolvX } from '@resolvx/sdk';

const payment = await ResolvX.create({
  amount: 0.01,
  sendAsset: 'sBTC',
  receiveAsset: 'USDCx',
  recipient: 'SP3FGQ8Z7JY9BWYZ5WM53GE7RXNQD3EKH6GVLKE',
  slippageTolerance: 0.5,    // optional, default 0.5%
  memo: 'Invoice #1042',      // optional, on-chain memo
});`}
            />

            <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden mt-md">
              <div className="px-md py-sm border-b border-outline-variant">
                <span className="text-xs font-bold text-secondary uppercase tracking-wide">Options</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/60">
                      <th className="text-left px-md py-3 text-xs font-bold text-secondary">Name</th>
                      <th className="text-left px-md py-3 text-xs font-bold text-secondary">Type</th>
                      <th className="text-left px-md py-3 text-xs font-bold text-secondary">Default</th>
                      <th className="text-left px-md py-3 text-xs font-bold text-secondary">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <PropRow name="amount" type="number" required desc="Amount to send in sendAsset units." />
                    <PropRow name="sendAsset" type="Asset" required desc="Asset the sender pays with. One of: 'sBTC' | 'STX' | 'USDCx'." />
                    <PropRow name="receiveAsset" type="Asset" required desc="Asset the recipient receives." />
                    <PropRow name="recipient" type="string" required desc="Stacks principal address of the recipient." />
                    <PropRow name="slippageTolerance" type="number" def="0.5" desc="Maximum allowed price deviation in percent." />
                    <PropRow name="memo" type="string" def="undefined" desc="Optional on-chain memo attached to the transaction." />
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────── */}
          {/* payment.execute()                       */}
          {/* ─────────────────────────────────────── */}
          <section id="payment-execute" className="mb-[72px] scroll-mt-24">
            <h2 className="text-2xl font-extrabold text-on-surface mb-xs tracking-tight">payment.execute()</h2>
            <p className="text-xs font-mono text-secondary mb-md">Returns: <span className="text-[#c3e88d]">Promise&lt;PaymentResult&gt;</span></p>
            <p className="text-secondary text-body-md leading-relaxed mb-md">
              Signs and broadcasts the atomic swap transaction. Opens the connected Stacks wallet for user approval.
              Resolves once the transaction is confirmed on-chain (typically 1 block, ~10 min).
            </p>
            <CodeBlock
              filename="execute.ts"
              code={`const result = await payment.execute();

console.log(result.txId);        // '0x3f9a…c81d'
console.log(result.status);      // 'confirmed'
console.log(result.sentAmount);  // 0.01 (sBTC)
console.log(result.receivedAmount); // 1047.23 (USDCx)
console.log(result.blockHeight); // 850421`}
            />

            <Callout type="info">
              <code className="font-mono text-xs bg-surface-container px-1 py-0.5 rounded">execute()</code> will throw a <code className="font-mono text-xs bg-surface-container px-1 py-0.5 rounded">ResolvXError</code> if the user rejects the transaction in their wallet, or if the on-chain slippage check fails.
            </Callout>
          </section>

          {/* ─────────────────────────────────────── */}
          {/* ResolvX.getQuote()                      */}
          {/* ─────────────────────────────────────── */}
          <section id="resolvx-quote" className="mb-[72px] scroll-mt-24">
            <h2 className="text-2xl font-extrabold text-on-surface mb-xs tracking-tight">ResolvX.getQuote()</h2>
            <p className="text-xs font-mono text-secondary mb-md">Returns: <span className="text-[#c3e88d]">Promise&lt;Quote&gt;</span></p>
            <p className="text-secondary text-body-md leading-relaxed mb-md">
              Fetches a live quote without creating a payment object. Useful for display purposes.
            </p>
            <CodeBlock
              filename="quote.ts"
              code={`const quote = await ResolvX.getQuote({
  amount: 0.01,
  sendAsset: 'sBTC',
  receiveAsset: 'USDCx',
});

// Quote shape
// {
//   sendAmount:     0.01,
//   receiveAmount:  1047.23,
//   fee:            0.00002,
//   rate:           104723,
//   route:          ['sBTC', 'USDCx'],
//   expiresAt:      1718123456,   // unix timestamp
// }`}
            />
          </section>

          {/* ─────────────────────────────────────── */}
          {/* ResolvX.listen()                        */}
          {/* ─────────────────────────────────────── */}
          <section id="resolvx-listen" className="mb-[72px] scroll-mt-24">
            <h2 className="text-2xl font-extrabold text-on-surface mb-xs tracking-tight">ResolvX.listen()</h2>
            <p className="text-xs font-mono text-secondary mb-md">Returns: <span className="text-[#c3e88d]">() =&gt; void</span> (unsubscribe)</p>
            <p className="text-secondary text-body-md leading-relaxed mb-md">
              Subscribe to real-time status updates for a transaction. Returns an unsubscribe function.
            </p>
            <CodeBlock
              filename="listen.ts"
              code={`const unsubscribe = ResolvX.listen(result.txId, (event) => {
  if (event.status === 'pending')   console.log('Waiting for confirmation…');
  if (event.status === 'confirmed') console.log('Payment confirmed!', event);
  if (event.status === 'failed')    console.error('Payment failed:', event.error);
});

// Stop listening when done
unsubscribe();`}
            />
          </section>

          {/* ─────────────────────────────────────── */}
          {/* SUPPORTED ASSETS                        */}
          {/* ─────────────────────────────────────── */}
          <section id="supported-assets" className="mb-[72px] scroll-mt-24">
            <h2 className="text-2xl font-extrabold text-on-surface mb-md tracking-tight">Supported Assets</h2>
            <p className="text-secondary text-body-md leading-relaxed mb-md">
              ResolvX currently supports the following assets on Stacks mainnet.
            </p>

            <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/60">
                    <th className="text-left px-md py-3 text-xs font-bold text-secondary uppercase tracking-wide">Asset</th>
                    <th className="text-left px-md py-3 text-xs font-bold text-secondary uppercase tracking-wide">Symbol</th>
                    <th className="text-left px-md py-3 text-xs font-bold text-secondary uppercase tracking-wide">Description</th>
                    <th className="text-left px-md py-3 text-xs font-bold text-secondary uppercase tracking-wide">Send</th>
                    <th className="text-left px-md py-3 text-xs font-bold text-secondary uppercase tracking-wide">Receive</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Stacked Bitcoin", sym: "sBTC", desc: "Wrapped BTC on Stacks", send: true, recv: true },
                    { name: "Stacks", sym: "STX", desc: "Native Stacks token", send: true, recv: true },
                    { name: "USD Coin (Stacks)", sym: "USDCx", desc: "Bridged USDC stablecoin", send: true, recv: true },
                  ].map(({ name, sym, desc, send, recv }) => (
                    <tr key={sym} className="border-t border-outline-variant/40">
                      <td className="px-md py-3 text-sm font-medium text-on-surface">{name}</td>
                      <td className="px-md py-3 font-mono text-xs text-primary-container font-bold">{sym}</td>
                      <td className="px-md py-3 text-xs text-secondary">{desc}</td>
                      <td className="px-md py-3">
                        <span className="material-symbols-outlined text-green-500" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </td>
                      <td className="px-md py-3">
                        <span className="material-symbols-outlined text-green-500" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─────────────────────────────────────── */}
          {/* ERROR HANDLING                          */}
          {/* ─────────────────────────────────────── */}
          <section id="error-handling" className="mb-[72px] scroll-mt-24">
            <h2 className="text-2xl font-extrabold text-on-surface mb-md tracking-tight">Error Handling</h2>
            <p className="text-secondary text-body-md leading-relaxed mb-md">
              All SDK methods throw typed <code className="font-mono text-xs bg-surface-container px-1 py-0.5 rounded text-on-surface">ResolvXError</code> instances.
              Check the <code className="font-mono text-xs bg-surface-container px-1 py-0.5 rounded text-on-surface">code</code> property to handle specific cases.
            </p>
            <CodeBlock
              filename="error-handling.ts"
              code={`import { ResolvX, ResolvXError } from '@resolvx/sdk';

try {
  const payment = await ResolvX.create({ ... });
  const result  = await payment.execute();
} catch (err) {
  if (err instanceof ResolvXError) {
    switch (err.code) {
      case 'USER_REJECTED':
        // Wallet popup was dismissed
        break;
      case 'SLIPPAGE_EXCEEDED':
        // Price moved beyond tolerance — retry or increase slippageTolerance
        break;
      case 'INSUFFICIENT_LIQUIDITY':
        // Pool doesn't have enough of the receive asset
        break;
      case 'INVALID_RECIPIENT':
        // Recipient address is malformed
        break;
      default:
        console.error('Unexpected error:', err.message);
    }
  }
}`}
            />

            <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden mt-md">
              <div className="px-md py-sm border-b border-outline-variant">
                <span className="text-xs font-bold text-secondary uppercase tracking-wide">Error codes</span>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["USER_REJECTED",           "User dismissed the wallet approval popup."],
                    ["SLIPPAGE_EXCEEDED",        "On-chain rate deviated beyond slippageTolerance."],
                    ["INSUFFICIENT_LIQUIDITY",   "Not enough liquidity in the pool for this order size."],
                    ["INVALID_RECIPIENT",        "The recipient address is not a valid Stacks principal."],
                    ["UNSUPPORTED_ASSET_PAIR",   "The sendAsset → receiveAsset route does not exist."],
                    ["NETWORK_ERROR",            "Could not reach the Stacks node or oracle endpoint."],
                  ].map(([code, desc]) => (
                    <tr key={code} className="border-t border-outline-variant/40">
                      <td className="px-md py-3 font-mono text-xs text-[#f07178] whitespace-nowrap">{code}</td>
                      <td className="px-md py-3 text-xs text-secondary">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="mb-[72px]">
            <div className="border border-outline-variant/40 rounded-2xl p-lg bg-surface-container-low/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md">
              <div>
                <div className="font-bold text-on-surface mb-xs">Have a question or found a bug?</div>
                <p className="text-sm text-secondary">Open an issue on GitHub or reach out on the Stacks Discord.</p>
              </div>
              <div className="flex gap-sm flex-shrink-0">
                <a
                  href="https://github.com/Arowolokehinde/ResolvX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white px-md py-2.5 font-bold rounded-xl text-sm hover:brightness-110 transition-all active:scale-95"
                  style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }}
                >
                  GitHub
                </a>
                <a
                  href="/"
                  className="px-md py-2.5 font-bold rounded-xl text-sm border border-outline-variant text-secondary hover:text-on-surface hover:border-primary-container transition-all"
                >
                  Back to home
                </a>
              </div>
            </div>
          </section>

        </main>
      </div>

      <Footer />
    </>
  );
}
