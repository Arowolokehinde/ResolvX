const CARDS = [
  {
    icon: "verified_user",
    badge: "Guaranteed",
    title: "Atomic execution",
    body: "Your payment only moves if the swap completes. Both operations succeed together or neither does — zero risk of stranded funds.",
    stat: "100%",
    statLabel: "success or full revert",
  },
  {
    icon: "shield",
    badge: "Protected",
    title: "Slippage protection",
    body: "Oracle-verified rates and advanced routing ensure you receive exactly what the quote shows. No hidden fees, no surprises.",
    stat: "±0%",
    statLabel: "rate deviation",
  },
  {
    icon: "fingerprint",
    badge: "Sovereign",
    title: "Seedless & biometric",
    body: "No seed phrase means nothing to steal, lose, or phish. Your key lives in your device's secure enclave, unlocked only by your biometric.",
    stat: "0",
    statLabel: "words to write down",
  },
  {
    icon: "code_blocks",
    badge: "Verified",
    title: "Open source contracts",
    body: "Every line of Clarity contract code would be made public, audited, and permanently verifiable on the Stacks blockchain.",
    stat: "100%",
    statLabel: "on-chain verifiable",
  },
];

export default function TrustSecurity() {
  return (
    <section className="py-12 md:py-xl bg-white dark:bg-[#0e1525] transition-colors duration-200">
      <div className="max-w-container-max mx-auto px-gutter">

        {/* Section header */}
        <div className="text-center mb-xl">
          <span className="hero-gradient-text font-bold text-xs uppercase tracking-widest block mb-sm">
            Trust &amp; Security
          </span>
          <h2
            className="font-extrabold tracking-[-0.02em] mb-sm"
            style={{ fontSize: "clamp(26px, 2.8vw, 38px)", fontFamily: "Inter, sans-serif" }}
          >
            <span className="text-on-surface">Built to be </span>
            <span className="hero-gradient-text">trustless.</span>
          </h2>
          <p className="text-body-lg text-secondary" style={{ maxWidth: "480px", margin: "0 auto" }}>
            Security isn't an afterthought. Every constraint is enforced by the protocol itself.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-md">
          {CARDS.map(({ icon, badge, title, body, stat, statLabel }) => (
            <div
              key={title}
              className="group bg-white dark:bg-[#1a2235] border border-outline-variant rounded-2xl p-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col gap-md overflow-hidden relative"
            >
              {/* Top gradient bar — matches hero gradient */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }}
              />

              {/* Icon + badge row */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:opacity-80 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #151c2712, #0052ff18)" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "24px",
                      fontVariationSettings: "'FILL' 1",
                      color: "#0052ff",
                    }}
                  >
                    {icon}
                  </span>
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-sm py-1 rounded-full"
                  style={{
                    color: "#0052ff",
                    background: "linear-gradient(90deg, #151c270d, #0052ff18)",
                    border: "1px solid #0052ff22",
                  }}
                >
                  {badge}
                </span>
              </div>

              {/* Text */}
              <div className="flex flex-col gap-xs flex-1">
                <h3 className="font-bold text-base text-on-surface">{title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{body}</p>
              </div>

              {/* Stat */}
              <div className="border-t border-outline-variant/50 pt-md flex items-baseline gap-xs">
                <span className="hero-gradient-text text-2xl font-extrabold tracking-tight">{stat}</span>
                <span className="text-xs text-secondary font-medium">{statLabel}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
