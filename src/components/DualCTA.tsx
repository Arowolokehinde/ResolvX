export default function DualCTA() {
  return (
    <section className="py-12 md:py-xl bg-white dark:bg-[#0e1525] transition-colors duration-200">
      <div className="max-w-container-max mx-auto px-gutter">

        {/* Full-width banner */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-xl border border-outline-variant/30 bg-gradient-to-br from-[#f8f9ff] via-[#eef2ff] to-[#dde4ff] dark:from-[#111827] dark:via-[#1a2235] dark:to-[#162033]"
        >
          {/* Subtle blue orbs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #0052ff18, transparent 70%)" }} />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #151c2710, transparent 70%)" }} />

          {/* Gradient accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }} />

          <div className="relative z-10 px-md py-lg md:px-xl md:py-xl grid md:grid-cols-2 gap-lg md:gap-xl items-center">

            {/* Left: headline */}
            <div className="flex flex-col gap-md">
              <span className="hero-gradient-text font-bold text-xs uppercase tracking-widest">
                Get started today
              </span>
              <h2
                className="font-extrabold leading-[1.2] tracking-[-0.02em]"
                style={{ fontSize: "clamp(26px, 2.8vw, 38px)", fontFamily: "Inter, sans-serif" }}
              >
                <span className="text-on-surface">Ready to resolve </span>
                <span className="hero-gradient-text">payments on Stacks?</span>
              </h2>
              <p className="text-secondary text-body-lg" style={{ maxWidth: "380px" }}>
                Send any asset, deliver any asset. One transaction. No complexity.
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-md mt-xs">
                {[
                  { icon: "bolt", label: "Instant settlement" },
                  { icon: "lock", label: "Non-custodial" },
                  { icon: "verified", label: "Audited contracts" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-xs">
                    <span
                      className="material-symbols-outlined text-primary-container"
                      style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}
                    >
                      {icon}
                    </span>
                    <span className="text-xs text-secondary font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: two CTA cards */}
            <div className="grid sm:grid-cols-2 gap-md">

              {/* Users card */}
              <div className="bg-white dark:bg-[#1a2235] border border-outline-variant/60 rounded-2xl p-lg flex flex-col gap-md hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #151c2712, #0052ff18)" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1", color: "#0052ff" }}
                  >
                    account_balance_wallet
                  </span>
                </div>
                <div>
                  <div className="font-bold text-on-surface text-base mb-xs">For users</div>
                  <p className="text-secondary text-sm leading-relaxed">
                    Connect your wallet and start paying with any asset.
                  </p>
                </div>
                <button
                  className="mt-auto w-full text-white py-2.5 font-bold rounded-xl text-sm active:scale-95 transition-all duration-200 shadow-md hover:brightness-110"
                  style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }}
                >
                  Get Started
                </button>
              </div>

              {/* Developers card */}
              <div className="bg-white dark:bg-[#1a2235] border border-outline-variant/60 rounded-2xl p-lg flex flex-col gap-md hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #151c2712, #0052ff18)" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1", color: "#0052ff" }}
                  >
                    terminal
                  </span>
                </div>
                <div>
                  <div className="font-bold text-on-surface text-base mb-xs">For developers</div>
                  <p className="text-secondary text-sm leading-relaxed">
                    Integrate multi-asset payments into your dapp today.
                  </p>
                </div>
                <div className="mt-auto relative rounded-xl overflow-hidden group/sdk">
                  {/* gradient fill shown on hover via opacity */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover/sdk:opacity-100 transition-opacity duration-200"
                    style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }}
                  />
                  <button
                    className="relative w-full border-2 py-2.5 font-bold rounded-xl text-sm active:scale-95 transition-colors duration-200 group-hover/sdk:text-white group-hover/sdk:border-transparent"
                    style={{ borderColor: "#0052ff", color: "#0052ff" }}
                  >
                    View SDK Docs
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
