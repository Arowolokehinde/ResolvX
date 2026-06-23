/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useEffect, useRef } from "react";

type Asset = "sBTC" | "STX" | "USDCx";

const ASSETS: Record<Asset, { label: string; description: string; logo: string }> = {
  sBTC: {
    label: "sBTC",
    description: "Bitcoin on Stacks",
    logo: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
  },
  STX: {
    label: "STX",
    description: "Stacks Token",
    logo: "https://coin-images.coingecko.com/coins/images/2069/large/Stacks_Logo_png.png?1709979332",
  },
  USDCx: {
    label: "USDCx",
    description: "USD Stablecoin on Stacks",
    logo: "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png?1769615602",
  },
};

const ALL_ASSETS = Object.keys(ASSETS) as Asset[];

const DEFAULT_RATES: Record<Asset, number> = { sBTC: 105000, STX: 0.18, USDCx: 1.0 };

const FEATURES = [
  "Preview the exact amount before sending",
  "Recipient gets their preferred asset",
  "Settled atomically in one transaction",
];

function formatAmount(n: number): string {
  if (n >= 10000)  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1)      return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 8 });
}

export default function QuoteWidget() {
  const [payAmount, setPayAmount]       = useState("1");
  const [sendAsset, setSendAsset]       = useState<Asset>("sBTC");
  const [receiveAsset, setReceiveAsset] = useState<Asset>("USDCx");
  const [rates, setRates]               = useState<Record<Asset, number>>(DEFAULT_RATES);
  const [priceLoading, setPriceLoading] = useState(true);
  const [showSendDrop, setShowSendDrop]         = useState(false);
  const [showReceiveDrop, setShowReceiveDrop]   = useState(false);

  const sendRef    = useRef<HTMLDivElement>(null);
  const receiveRef = useRef<HTMLDivElement>(null);

  /* ── Fetch live rates ── */
  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,blockstack,usd-coin&vs_currencies=usd"
    )
      .then((r) => r.json())
      .then((data) => {
        setRates({
          sBTC:  data.bitcoin?.usd       ?? DEFAULT_RATES.sBTC,
          STX:   data.blockstack?.usd    ?? DEFAULT_RATES.STX,
          USDCx: data["usd-coin"]?.usd   ?? DEFAULT_RATES.USDCx,
        });
        setPriceLoading(false);
      })
      .catch(() => setPriceLoading(false));
  }, []);

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (sendRef.current    && !sendRef.current.contains(e.target as Node))    setShowSendDrop(false);
      if (receiveRef.current && !receiveRef.current.contains(e.target as Node)) setShowReceiveDrop(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* ── Derived values ── */
  const sendRate    = rates[sendAsset];
  const receiveRate = rates[receiveAsset];

  const receiveAmount = useMemo(() => {
    const n = parseFloat(payAmount);
    if (isNaN(n) || n <= 0) return "—";
    return formatAmount((n * sendRate) / receiveRate);
  }, [payAmount, sendRate, receiveRate]);

  const exchangeRate = useMemo(() => {
    return formatAmount(sendRate / receiveRate);
  }, [sendRate, receiveRate]);

  const feeAmount = useMemo(() => {
    const n = parseFloat(payAmount);
    if (isNaN(n) || n <= 0) return "—";
    return formatAmount(n * 0.002);
  }, [payAmount]);

  /* ── Handlers ── */
  function handleSwap() {
    setSendAsset(receiveAsset);
    setReceiveAsset(sendAsset);
  }

  function selectSend(a: Asset) {
    if (a === receiveAsset) setReceiveAsset(sendAsset);
    setSendAsset(a);
    setShowSendDrop(false);
  }

  function selectReceive(a: Asset) {
    if (a === sendAsset) setSendAsset(receiveAsset);
    setReceiveAsset(a);
    setShowReceiveDrop(false);
  }

  /* ── Token dropdown component ── */
  function TokenDropdown({
    selected, onSelect, open, onToggle, ref: dropRef,
  }: {
    selected: Asset;
    onSelect: (a: Asset) => void;
    open: boolean;
    onToggle: () => void;
    ref: React.RefObject<HTMLDivElement | null>;
  }) {
    const info = ASSETS[selected];
    return (
      <div ref={dropRef} className="relative flex-shrink-0">
        <button
          onClick={onToggle}
          className="flex items-center gap-xs bg-white dark:bg-[#1a2235] px-sm py-1.5 border border-outline-variant rounded-lg hover:border-primary-container/60 transition-colors"
        >
          <img src={info.logo} alt={selected} className="w-5 h-5 rounded-full object-cover" />
          <span className="font-bold text-sm">{selected}</span>
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: "16px" }}>
            expand_more
          </span>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-[#1a2235] border border-outline-variant rounded-xl shadow-xl z-30 overflow-hidden">
            {ALL_ASSETS.map((a) => {
              const isActive = a === selected;
              return (
                <button
                  key={a}
                  onClick={() => onSelect(a)}
                  className={`w-full flex items-center gap-sm px-sm py-3 hover:bg-surface-container-low transition-colors text-left ${isActive ? "bg-[#eef0ff] dark:bg-[#1a2840]" : ""}`}
                >
                  <img src={ASSETS[a].logo} alt={a} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold ${isActive ? "text-primary-container" : "text-on-surface"}`}>
                      {ASSETS[a].label}
                    </div>
                    <div className="text-[10px] text-secondary truncate">{ASSETS[a].description}</div>
                  </div>
                  {isActive && (
                    <span className="material-symbols-outlined text-primary-container flex-shrink-0" style={{ fontSize: "16px" }}>
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="py-12 md:py-xl bg-[#F4F6F9] dark:bg-[#0e1525] transition-colors duration-200">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="grid md:grid-cols-2 gap-lg md:gap-xl items-center">

          {/* ── Left: copy ── */}
          <div className="flex flex-col gap-md">
            <h2
              className="font-extrabold leading-[1.2] tracking-[-0.02em]"
              style={{ fontSize: "clamp(28px, 3vw, 40px)", fontFamily: "Inter, sans-serif" }}
            >
              <span className="text-on-surface">Get an instant </span>
              <span className="hero-gradient-text">quote</span>
            </h2>
            <p className="text-body-lg text-secondary" style={{ maxWidth: "400px" }}>
              Choose any asset to send, choose what the recipient gets. No
              pre-swapping, no surprises.
            </p>
            <ul className="flex flex-col gap-sm mt-xs">
              {FEATURES.map((item) => (
                <li key={item} className="flex items-center gap-sm text-body-md text-on-surface">
                  <span
                    className="material-symbols-outlined text-primary-container flex-shrink-0"
                    style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right: widget ── */}
          <div>
            <div className="bg-white dark:bg-[#111827] border border-outline-variant rounded-2xl shadow-lg overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-r from-[#dde4ff] to-[#c4d0f5] dark:from-[#1a2840] dark:to-[#162033] px-lg py-md flex justify-between items-center">
                <h3 className="font-bold text-on-surface">Payment Quote</h3>
                <div className="flex items-center gap-xs">
                  <div className={`w-2 h-2 rounded-full ${priceLoading ? "bg-yellow-400 animate-pulse" : "bg-green-500 animate-blink"}`} />
                  <span className="text-xs text-secondary font-semibold">
                    {priceLoading ? "Fetching rates…" : "Live rate"}
                  </span>
                </div>
              </div>

              <div className="p-lg flex flex-col gap-sm">

                {/* You pay */}
                <div className="p-md bg-surface-container-low border border-outline-variant rounded-xl">
                  <label className="text-xs text-secondary font-bold uppercase tracking-wide block mb-xs">
                    You pay
                  </label>
                  <div className="flex items-center gap-sm">
                    <input
                      className="bg-transparent font-bold text-2xl outline-none flex-1 min-w-0 text-on-surface"
                      type="number"
                      min="0"
                      step="0.001"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                    />
                    <TokenDropdown
                      selected={sendAsset}
                      onSelect={selectSend}
                      open={showSendDrop}
                      onToggle={() => { setShowSendDrop(!showSendDrop); setShowReceiveDrop(false); }}
                      ref={sendRef}
                    />
                  </div>
                </div>

                {/* Swap button */}
                <div className="flex justify-center -my-1 relative z-10">
                  <button
                    onClick={handleSwap}
                    className="bg-white dark:bg-[#1a2235] border border-outline-variant p-1.5 rounded-xl shadow-sm hover:bg-primary-container hover:border-primary-container transition-all duration-200 group"
                  >
                    <span
                      className="material-symbols-outlined text-primary-container group-hover:text-white"
                      style={{ fontSize: "20px" }}
                    >
                      swap_vert
                    </span>
                  </button>
                </div>

                {/* They receive */}
                <div className="p-md bg-surface-container-low border border-outline-variant rounded-xl">
                  <label className="text-xs text-secondary font-bold uppercase tracking-wide block mb-xs">
                    They receive <span className="normal-case font-normal">(est.)</span>
                  </label>
                  <div className="flex items-center gap-sm">
                    <div className="font-bold text-2xl text-on-surface flex-1 tabular-nums">
                      {receiveAmount}
                    </div>
                    <TokenDropdown
                      selected={receiveAsset}
                      onSelect={selectReceive}
                      open={showReceiveDrop}
                      onToggle={() => { setShowReceiveDrop(!showReceiveDrop); setShowSendDrop(false); }}
                      ref={receiveRef}
                    />
                  </div>
                </div>

                {/* Rate + fee row */}
                <div className="flex justify-between text-xs text-secondary px-xs">
                  <span>
                    1 {sendAsset} ≈{" "}
                    <span className="font-semibold text-on-surface">
                      {priceLoading ? "…" : `${exchangeRate} ${receiveAsset}`}
                    </span>
                  </span>
                  <span>
                    Fee:{" "}
                    <span className="font-semibold text-on-surface">
                      {feeAmount} {sendAsset}
                    </span>
                  </span>
                </div>

                {/* CTA */}
                <button
                  className="w-full mt-xs text-white py-md font-bold rounded-xl hover:brightness-110 transition-all duration-200 active:scale-95 shadow-md"
                  style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }}
                >
                  Get Started
                </button>

                <p className="text-center text-xs text-secondary/70">
                  Rates sourced from CoinGecko. Final amount confirmed on-chain.
                </p>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
