"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { LOGO_BASE64 } from "@/lib/logo";

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  /* Close on Escape */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModalOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* Prevent body scroll while modal is open */
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  return (
    <>
      {/* ── Announcement bar ── */}
      <div className="sticky top-0 z-50">
        {bannerVisible && (
          <div
            className="flex items-center justify-center gap-sm px-md py-3 text-white text-sm font-medium relative"
            style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }}
          >
            <span
              className="material-symbols-outlined flex-shrink-0"
              style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}
            >
              construction
            </span>
            <span className="tracking-wide">
              ResolvX is still in development phase.
            </span>
            <button
              onClick={() => setBannerVisible(false)}
              aria-label="Dismiss"
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
            </button>
          </div>
        )}

        <nav className="bg-surface border-b border-outline-variant transition-colors duration-200">
          <div className="max-w-container-max mx-auto px-gutter flex justify-between items-center h-16">

          {/* Left: Logo + Nav links */}
          <div className="flex items-center gap-md">
            <a href="/" className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="ResolvX"
                className="h-8 w-auto dark:brightness-0 dark:invert dark:opacity-90"
                src={LOGO_BASE64}
              />
            </a>

            <div className="hidden md:flex gap-md items-center">
              <a
                className="text-secondary hover:text-primary-container transition-colors font-label-sm text-label-sm"
                href="/docs"
              >
                Docs
              </a>
              <a
                className="text-secondary hover:text-primary-container transition-colors font-label-sm text-label-sm"
                href="/merchants"
              >
                Merchants
              </a>
              <a
                className="text-secondary hover:text-primary-container transition-colors font-label-sm text-label-sm"
                href="#"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Right: Theme toggle + Create Wallet CTA */}
          <div className="flex items-center gap-sm">

            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 text-secondary hover:text-primary-container transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>

            {/* Create Wallet CTA */}
            <button
              onClick={() => setModalOpen(true)}
              className="text-white px-md py-2 font-label-sm rounded-lg hover:brightness-110 transition-all active:scale-95 flex items-center gap-xs"
              style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}
              >
                fingerprint
              </span>
              Create Wallet
            </button>

          </div>
        </div>
        </nav>
      </div>

      {/* ── Coming Soon Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-md"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-surface dark:bg-[#111827] border border-outline-variant rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }}
            />

            {/* Close button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
            </button>

            <div className="px-xl pt-xl pb-lg flex flex-col gap-lg">

              {/* Icon + Coming Soon badge */}
              <div className="flex flex-col items-center gap-md text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #151c2712, #0052ff18)" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "44px",
                      fontVariationSettings: "'FILL' 1",
                      color: "#0052ff",
                    }}
                  >
                    fingerprint
                  </span>
                </div>

                <div>
                  <span
                    className="inline-block text-[10px] font-bold uppercase tracking-widest px-sm py-1 rounded-full mb-sm"
                    style={{
                      color: "#0052ff",
                      background: "#0052ff15",
                      border: "1px solid #0052ff25",
                    }}
                  >
                    Coming soon
                  </span>
                  <h2
                    className="font-extrabold text-on-surface tracking-tight"
                    style={{ fontSize: "22px", fontFamily: "Inter, sans-serif" }}
                  >
                    ResolvX Seedless Wallet
                  </h2>
                  <p className="text-secondary text-sm mt-xs leading-relaxed">
                    A self-sovereign wallet secured by your biometric — no seed phrase,
                    no passwords, nothing to lose.
                  </p>
                </div>
              </div>

              {/* Feature list */}
              <ul className="flex flex-col gap-sm">
                {[
                  {
                    icon: "fingerprint",
                    label: "Unlock with Face ID or fingerprint",
                    sub: "Your biometric is the only credential you need",
                  },
                  {
                    icon: "key_off",
                    label: "Zero seed phrases",
                    sub: "Nothing to write down, store, or lose",
                  },
                  {
                    icon: "swap_horiz",
                    label: "Send any token, they receive any token",
                    sub: "Cross-asset routing settled in one transaction",
                  },
                  {
                    icon: "verified_user",
                    label: "On-chain verified by Clarity",
                    sub: "secp256r1 signature — the contract enforces it",
                  },
                ].map(({ icon, label, sub }) => (
                  <li
                    key={label}
                    className="flex items-start gap-sm bg-surface-container-low border border-outline-variant/40 rounded-xl px-md py-sm"
                  >
                    <span
                      className="material-symbols-outlined flex-shrink-0 mt-0.5"
                      style={{
                        fontSize: "18px",
                        fontVariationSettings: "'FILL' 1",
                        color: "#0052ff",
                      }}
                    >
                      {icon}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-on-surface">{label}</div>
                      <div className="text-[11px] text-secondary">{sub}</div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Footer note */}
              <p className="text-center text-xs text-secondary leading-relaxed border-t border-outline-variant/40 pt-md">
                We&apos;re building this in public on Stacks.{" "}
                <a href="/docs" className="text-primary-container hover:underline" onClick={() => setModalOpen(false)}>
                  Read the technical docs →
                </a>
              </p>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
