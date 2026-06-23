/* eslint-disable @next/next/no-img-element */
export default function HowItWorks() {
  return (
    <section className="py-12 md:py-xl bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-gutter">

        {/* ── Section header ── */}
        <div className="text-center mb-xl">
          <h2
            className="font-extrabold tracking-[-0.02em] mb-sm"
            style={{ fontSize: "clamp(28px, 3vw, 40px)", fontFamily: "Inter, sans-serif" }}
          >
            <span className="text-on-surface">How it </span>
            <span className="hero-gradient-text">works</span>
          </h2>
          <p className="text-body-lg text-secondary">
            Three steps. One transaction. No complexity.
          </p>
        </div>

        {/* ── Steps — flex row with connectors on md+ ── */}
        <div className="flex flex-col md:flex-row items-start gap-lg md:gap-0">

          {/* ─── Step 1 ─── */}
          <div className="flex-1 flex flex-col gap-md">
            <div className="w-11 h-11 text-white flex items-center justify-center font-extrabold text-lg rounded-xl shadow-md flex-shrink-0" style={{ background: "linear-gradient(135deg, #151c27, #0052ff)" }}>
              1
            </div>
            <h3 className="font-bold text-lg text-on-surface">Choose assets.</h3>
            <p className="text-secondary text-body-md">
              Connect your wallet and pick any asset on Stacks. No need to pre-swap.
            </p>

            {/* Visual: token selector mockup */}
            <div className="mt-auto bg-white dark:bg-[#1a2235] border border-outline-variant/60 p-md rounded-2xl shadow-sm flex flex-col gap-sm">
              <div className="text-[10px] font-bold uppercase tracking-wide text-secondary mb-xs">Select asset</div>

              {/* sBTC row */}
              <div className="flex items-center gap-sm bg-[#eef0ff] dark:bg-[#1a2840] border-2 border-primary-container rounded-xl px-sm py-2">
                <img
                  src="https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400"
                  alt="sBTC"
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-on-surface">sBTC</div>
                  <div className="text-[10px] text-secondary">Bitcoin on Stacks</div>
                </div>
                <span className="material-symbols-outlined text-primary-container" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>
                  radio_button_checked
                </span>
              </div>

              {/* STX row */}
              <div className="flex items-center gap-sm bg-surface-container-low border border-outline-variant/40 rounded-xl px-sm py-2">
                <img
                  src="https://coin-images.coingecko.com/coins/images/2069/large/Stacks_Logo_png.png?1709979332"
                  alt="STX"
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-on-surface">STX</div>
                  <div className="text-[10px] text-secondary">Stacks Token</div>
                </div>
                <span className="material-symbols-outlined text-secondary/40" style={{ fontSize: "16px" }}>
                  radio_button_unchecked
                </span>
              </div>
            </div>
          </div>

          {/* Connector 1→2 */}
          <div className="hidden md:flex items-start pt-[21px] px-md flex-shrink-0">
            <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: "24px" }}>
              arrow_forward
            </span>
          </div>

          {/* ─── Step 2 ─── */}
          <div className="flex-1 flex flex-col gap-md">
            <div className="w-11 h-11 text-white flex items-center justify-center font-extrabold text-lg rounded-xl shadow-md flex-shrink-0" style={{ background: "linear-gradient(135deg, #151c27, #0052ff)" }}>
              2
            </div>
            <h3 className="font-bold text-lg text-on-surface">One transaction does everything.</h3>
            <p className="text-secondary text-body-md">
              Sign a single Clarity transaction. The swap and the transfer happen atomically.
            </p>

            {/* Visual: atomic transaction */}
            <div className="mt-auto bg-white dark:bg-[#1a2235] border border-outline-variant/60 p-md rounded-2xl shadow-sm flex flex-col gap-sm">
              {/* Swap + Transfer pills */}
              <div className="flex items-center gap-xs">
                <div className="flex-1 flex items-center gap-xs bg-surface-container-low border border-outline-variant/40 rounded-lg px-sm py-1.5">
                  <span className="material-symbols-outlined text-primary-container" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>
                    swap_horiz
                  </span>
                  <span className="text-[11px] font-bold text-on-surface">Swap</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant flex-shrink-0" style={{ fontSize: "14px" }}>add</span>
                <div className="flex-1 flex items-center gap-xs bg-surface-container-low border border-outline-variant/40 rounded-lg px-sm py-1.5">
                  <span className="material-symbols-outlined text-primary-container" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>
                    send
                  </span>
                  <span className="text-[11px] font-bold text-on-surface">Transfer</span>
                </div>
              </div>
              {/* Atomic badge */}
              <div className="bg-primary-container/10 border border-primary-container/20 rounded-xl px-sm py-2 flex items-center justify-center gap-xs">
                <span className="material-symbols-outlined text-primary-container" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
                <span className="text-xs font-bold text-primary-container">Atomic · Single block</span>
              </div>
              {/* Tiny tx hash mockup */}
              <div className="flex items-center gap-xs px-xs">
                <span className="material-symbols-outlined text-secondary/50" style={{ fontSize: "12px" }}>tag</span>
                <span className="text-[10px] text-secondary font-mono truncate">0x3f9a…c81d</span>
                <span className="ml-auto text-[10px] font-bold text-green-600">✓ confirmed</span>
              </div>
            </div>
          </div>

          {/* Connector 2→3 */}
          <div className="hidden md:flex items-start pt-[21px] px-md flex-shrink-0">
            <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: "24px" }}>
              arrow_forward
            </span>
          </div>

          {/* ─── Step 3 ─── */}
          <div className="flex-1 flex flex-col gap-md">
            <div className="w-11 h-11 text-white flex items-center justify-center font-extrabold text-lg rounded-xl shadow-md flex-shrink-0" style={{ background: "linear-gradient(135deg, #151c27, #0052ff)" }}>
              3
            </div>
            <h3 className="font-bold text-lg text-on-surface">They receive what they wanted.</h3>
            <p className="text-secondary text-body-md">
              The recipient gets the specific asset they requested instantly. Done.
            </p>

            {/* Visual: success receipt */}
            <div className="mt-auto bg-white dark:bg-[#1a2235] border border-outline-variant/60 p-md rounded-2xl shadow-sm flex flex-col gap-sm">
              {/* Status header */}
              <div className="flex items-center gap-sm">
                <div className="w-8 h-8 bg-primary-container/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary-container" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-secondary">Transaction complete</div>
                  <div className="text-xs font-bold text-on-surface">Confirmed on Stacks</div>
                </div>
              </div>

              {/* Received amount */}
              <div className="flex items-center gap-sm bg-[#eef0ff] dark:bg-[#1a2840] border border-primary-container/20 rounded-xl px-sm py-2">
                <img
                  src="https://coin-images.coingecko.com/coins/images/6319/large/USDC.png?1769615602"
                  alt="USDCx"
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <div className="text-[10px] text-secondary font-bold uppercase tracking-wide">Recipient received</div>
                  <div className="text-sm font-extrabold text-primary-container">+ USDCx</div>
                </div>
                <span className="material-symbols-outlined text-primary-container ml-auto" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
