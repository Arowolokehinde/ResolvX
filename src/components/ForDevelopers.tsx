"use client";

import { useState } from "react";

const FEATURES = [
  { icon: "bolt", label: "One-line setup" },
  { icon: "lock", label: "Type-safe SDK" },
  { icon: "currency_bitcoin", label: "Native sBTC" },
  { icon: "swap_horiz", label: "Atomic swaps" },
];

const CODE_LINES = [
  { tokens: [{ text: "import", color: "text-[#c792ea]" }, { text: " { ResolvX } ", color: "text-white" }, { text: "from", color: "text-[#c792ea]" }, { text: " '@resolvx/sdk'", color: "text-[#c3e88d]" }, { text: ";", color: "text-white/60" }] },
  { tokens: [] },
  { tokens: [{ text: "// Create a cross-asset payment", color: "text-[#546e7a] italic" }] },
  { tokens: [{ text: "const", color: "text-[#c792ea]" }, { text: " payment ", color: "text-white" }, { text: "=", color: "text-[#89ddff]" }, { text: " await ", color: "text-[#c792ea]" }, { text: "ResolvX", color: "text-[#82aaff]" }, { text: ".", color: "text-white/60" }, { text: "create", color: "text-[#82aaff]" }, { text: "({", color: "text-white/60" }] },
  { tokens: [{ text: "  amount", color: "text-[#f07178]" }, { text: ":", color: "text-white/60" }, { text: " 0.01", color: "text-[#f78c6c]" }, { text: ",", color: "text-white/60" }, { text: "          // sBTC", color: "text-[#546e7a] italic" }] },
  { tokens: [{ text: "  sendAsset", color: "text-[#f07178]" }, { text: ":", color: "text-white/60" }, { text: " 'sBTC'", color: "text-[#c3e88d]" }, { text: ",", color: "text-white/60" }] },
  { tokens: [{ text: "  receiveAsset", color: "text-[#f07178]" }, { text: ":", color: "text-white/60" }, { text: " 'USDCx'", color: "text-[#c3e88d]" }, { text: ",", color: "text-white/60" }] },
  { tokens: [{ text: "  recipient", color: "text-[#f07178]" }, { text: ":", color: "text-white/60" }, { text: " 'SP3FG...X2'", color: "text-[#c3e88d]" }, { text: ",", color: "text-white/60" }] },
  { tokens: [{ text: "});", color: "text-white/60" }] },
  { tokens: [] },
  { tokens: [{ text: "// Executes atomically in 1 transaction", color: "text-[#546e7a] italic" }] },
  { tokens: [{ text: "const", color: "text-[#c792ea]" }, { text: " result ", color: "text-white" }, { text: "=", color: "text-[#89ddff]" }, { text: " await ", color: "text-[#c792ea]" }, { text: "payment", color: "text-[#82aaff]" }, { text: ".", color: "text-white/60" }, { text: "execute", color: "text-[#82aaff]" }, { text: "();", color: "text-white/60" }] },
  { tokens: [{ text: "// → { txId: '0x3f9a…', status: 'confirmed' }", color: "text-[#546e7a] italic" }] },
];

export default function ForDevelopers() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText("npm install @resolvx/sdk");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="py-12 md:py-xl bg-[#F4F6F9] dark:bg-[#0e1525] transition-colors duration-200">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="grid md:grid-cols-2 gap-lg md:gap-xl items-center">

          {/* ── Left: copy ── */}
          <div className="flex flex-col gap-md">
            <span className="hero-gradient-text font-bold text-xs uppercase tracking-widest">
              For Developers
            </span>
            <h2
              className="font-extrabold leading-[1.2] tracking-[-0.02em]"
              style={{ fontSize: "clamp(26px, 2.8vw, 38px)", fontFamily: "Inter, sans-serif" }}
            >
              <span className="text-on-surface">Add cross-asset payments </span>
              <span className="hero-gradient-text">in an afternoon.</span>
            </h2>
            <p className="text-secondary text-body-lg" style={{ maxWidth: "400px" }}>
              One SDK. Simple hooks. Robust types. Native sBTC support.
              Turn any Stacks dapp into a multi-asset payment gateway.
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-sm mt-xs">
              {FEATURES.map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-xs bg-white dark:bg-[#1a2235] border border-outline-variant rounded-full px-sm py-1.5 shadow-sm"
                >
                  <span
                    className="material-symbols-outlined text-primary-container"
                    style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}
                  >
                    {icon}
                  </span>
                  <span className="text-xs font-bold text-on-surface">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-sm md:gap-md mt-xs">
              <a
                href="/docs"
                className="text-white px-lg py-3 font-bold rounded-xl hover:brightness-110 transition-all active:scale-95 shadow-md inline-block"
                style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }}
              >
                Read the docs
              </a>
              <a
                href="https://github.com/Arowolokehinde/ResolvX"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-container font-bold inline-flex items-center gap-1 hover:gap-2 transition-all duration-200 hover:opacity-80"
              >
                View on GitHub
                <span className="material-symbols-outlined" style={{ fontSize: "16px", lineHeight: 1 }}>
                  arrow_forward
                </span>
              </a>
            </div>
          </div>

          {/* ── Right: code editor ── */}
          <div className="flex flex-col gap-sm">

            {/* Editor window */}
            <div className="bg-[#0d1117] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">

              {/* Title bar */}
              <div className="bg-[#161b22] px-md py-3 flex items-center gap-sm border-b border-white/10">
                {/* macOS dots */}
                <div className="flex gap-xs mr-sm">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                {/* File tab */}
                <div className="flex items-center gap-xs bg-[#0d1117] border border-white/10 rounded-md px-sm py-1">
                  <span className="material-symbols-outlined text-[#c3e88d]" style={{ fontSize: "12px" }}>
                    code
                  </span>
                  <span className="text-[11px] text-white/70 font-mono">payment.ts</span>
                </div>
                <div className="ml-auto flex items-center gap-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#82aaff]/60 animate-pulse" />
                  <span className="text-[10px] text-white/40 font-mono">TypeScript</span>
                </div>
              </div>

              {/* Code body */}
              <div className="p-3 md:p-md overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody>
                    {CODE_LINES.map((line, i) => (
                      <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="select-none text-right pr-2 md:pr-md w-6 md:w-8 text-[10px] md:text-[11px] font-mono text-white/20 group-hover:text-white/40 align-top leading-5 md:leading-6">
                          {i + 1}
                        </td>
                        <td className="text-[11px] md:text-[13px] font-mono leading-5 md:leading-6 whitespace-pre">
                          {line.tokens.length === 0 ? (
                            <span>&nbsp;</span>
                          ) : (
                            line.tokens.map((token, j) => (
                              <span key={j} className={token.color}>
                                {token.text}
                              </span>
                            ))
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Status bar */}
              <div className="bg-[#0052ff] px-md py-1 flex items-center gap-md">
                <span className="text-[10px] text-white/80 font-mono">TypeScript</span>
                <span className="text-white/40 text-[10px]">·</span>
                <span className="text-[10px] text-white/80 font-mono flex items-center gap-xs">
                  <span className="material-symbols-outlined text-white/80" style={{ fontSize: "10px" }}>
                    check_circle
                  </span>
                  0 errors
                </span>
                <span className="ml-auto text-[10px] text-white/60 font-mono">UTF-8</span>
              </div>
            </div>

            {/* npm install pill */}
            <button
              onClick={handleCopy}
              className="bg-white dark:bg-[#1a2235] border border-outline-variant px-md py-3 rounded-xl shadow-sm flex items-center justify-between group hover:border-primary-container/50 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-sm">
                <div className="w-7 h-7 bg-[#cb3837] rounded-md flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-[10px]">npm</span>
                </div>
                <code className="text-sm font-mono font-medium text-on-surface">
                  npm install @resolvx/sdk
                </code>
              </div>
              <div className="flex items-center gap-xs">
                {copied ? (
                  <>
                    <span className="material-symbols-outlined text-primary-container" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span className="text-xs font-bold text-primary-container">Copied!</span>
                  </>
                ) : (
                  <span className="material-symbols-outlined text-secondary group-hover:text-primary-container transition-colors" style={{ fontSize: "16px" }}>
                    content_copy
                  </span>
                )}
              </div>
            </button>

          </div>
        </div>
      </div>
    </section>
  );
}
