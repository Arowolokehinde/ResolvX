const FEATURES = [
  {
    icon: "fingerprint",
    title: "Biometric unlock",
    body: "Face ID, Touch ID, or your device fingerprint is the only key you need. No password. No PIN. Nothing to forget.",
  },
  {
    icon: "phishing",
    title: "Nothing to phish",
    body: "There is no seed phrase. No 12 words someone can trick you into typing into a fake site. The attack surface simply doesn't exist.",
  },
  {
    icon: "verified_user",
    title: "On-chain verified signature",
    body: "Every transaction is authorised by a signature  using Clarity.",
  },
];

export default function SeedlessWallet() {
  return (
    <section className="py-12 md:py-xl bg-white dark:bg-[#0a0f1e] transition-colors duration-200 border-t border-outline-variant/40">
      <div className="max-w-container-max mx-auto px-gutter">

        <div className="grid md:grid-cols-2 gap-xl md:gap-2xl items-center">

          {/* ── Left: copy ── */}
          <div className="flex flex-col gap-lg">

            {/* Label */}
            <span className="hero-gradient-text font-bold text-xs uppercase tracking-widest">
              Wallet design
            </span>

            {/* Headline */}
            <h2
              className="font-extrabold tracking-[-0.02em] leading-tight"
              style={{ fontSize: "clamp(26px, 3vw, 42px)", fontFamily: "Inter, sans-serif" }}
            >
              <span className="text-on-surface">No seed phrase.</span>
              <br />
              <span className="hero-gradient-text">Just your fingerprint.</span>
            </h2>

            {/* Intro paragraph */}
            <p className="text-secondary text-body-lg leading-relaxed" style={{ maxWidth: "480px" }}>
              ResolvX wallets are created entirely in the browser using your device&apos;s
              biometric hardware. You don&apos;t write down words. You don&apos;t store a
              file. Your face or fingerprint <em>is</em> the key.
            </p>

            {/* Feature list */}
            <ul className="flex flex-col gap-md">
              {FEATURES.map(({ icon, title, body }) => (
                <li key={title} className="flex items-start gap-md">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #151c2712, #0052ff18)" }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "20px",
                        fontVariationSettings: "'FILL' 1",
                        color: "#0052ff",
                      }}
                    >
                      {icon}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-on-surface mb-[2px]">{title}</div>
                    <div className="text-secondary text-sm leading-relaxed">{body}</div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Privacy clarifier note */}
            <div className="flex items-start gap-sm bg-surface-container-low border border-outline-variant/50 rounded-xl p-md">
              <span
                className="material-symbols-outlined text-secondary flex-shrink-0 mt-0.5"
                style={{ fontSize: "18px" }}
              >
                info
              </span>
              <p className="text-secondary text-xs leading-relaxed">
                <strong className="text-on-surface">Sovereignty, not secrecy.</strong>{" "}
                Your private key is yours alone — no one else can touch it. Note that
                on-chain transactions are still public on the Stacks blockchain, as with
                all Bitcoin-secured networks.
              </p>
            </div>
          </div>

          {/* ── Right: visual mockup ── */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-sm flex flex-col gap-md">

              {/* Wallet creation card */}
              <div className="bg-surface dark:bg-[#111827] border border-outline-variant rounded-2xl p-lg shadow-xl flex flex-col gap-md">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Create wallet
                  </div>
                  <div
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      color: "#0052ff",
                      background: "#0052ff15",
                      border: "1px solid #0052ff25",
                    }}
                  >
                    No seed phrase
                  </div>
                </div>

                {/* Fingerprint hero */}
                <div
                  className="rounded-2xl flex flex-col items-center justify-center gap-sm py-8"
                  style={{ background: "linear-gradient(135deg, #151c2708, #0052ff12)" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "72px",
                      fontVariationSettings: "'FILL' 1",
                      color: "#0052ff",
                      opacity: 0.9,
                    }}
                  >
                    fingerprint
                  </span>
                  <p className="text-xs text-secondary text-center px-md">
                    Touch the sensor or use Face ID to create your wallet
                  </p>
                </div>

                {/* Steps */}
                <div className="flex flex-col gap-xs">
                  {[
                    { done: true,  label: "Browser requests biometric" },
                    { done: true,  label: "Secure enclave generates key pair" },
                    { done: false, label: "Smart wallet deployed on Stacks" },
                  ].map(({ done, label }) => (
                    <div key={label} className="flex items-center gap-sm">
                      <span
                        className="material-symbols-outlined flex-shrink-0"
                        style={{
                          fontSize: "16px",
                          fontVariationSettings: "'FILL' 1",
                          color: done ? "#22c55e" : "#0052ff55",
                        }}
                      >
                        {done ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: done ? "var(--color-on-surface)" : "var(--color-secondary)" }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sovereignty badge row */}
              <div className="grid grid-cols-3 gap-sm text-center">
                {[
                  { icon: "key_off",      label: "No seed phrase" },
                  { icon: "cloud_off",    label: "No server storage" },
                  { icon: "admin_panel_settings", label: "Self-sovereign" },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    className="bg-surface dark:bg-[#111827] border border-outline-variant rounded-xl py-md px-xs flex flex-col items-center gap-xs"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "22px",
                        fontVariationSettings: "'FILL' 1",
                        color: "#0052ff",
                      }}
                    >
                      {icon}
                    </span>
                    <span className="text-[10px] text-secondary font-medium leading-tight">{label}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
