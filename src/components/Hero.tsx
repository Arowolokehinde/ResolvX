export default function Hero() {
  return (
    <header className="relative overflow-hidden">
      <div className="max-w-container-max mx-auto px-gutter py-16 md:py-[120px] relative z-10">

        {/* ── Two-column layout ── */}
        <div className="grid md:grid-cols-2 gap-lg md:gap-xl items-center">

          {/* ── Left: Text ── */}
          <div className="flex flex-col gap-md">

            {/* Heading */}
            <h1
              className="font-extrabold leading-[1.15] tracking-[-0.03em]"
              style={{ fontSize: "clamp(32px, 3.8vw, 52px)", fontFamily: "Inter, sans-serif" }}
            >
              <span className="text-on-surface">Use ResolvX</span>
              <br />
              <span className="hero-gradient-text" style={{ display: "block" }}>
                Client receive exactly what they want.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-body-lg text-secondary leading-relaxed" style={{ maxWidth: "460px" }}>
              ResolvX is a seedless, biometric-secured wallet and cross-asset
              payment layer built on Stacks. No seed phrase. Send any token and
              your recipient receives any token they want. One transaction,
              settled on Bitcoin.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-sm md:gap-md items-center pt-xs">
              <button
                className="text-white px-lg py-3 md:py-4 font-bold rounded-xl text-sm md:text-body-md shadow-md hover:shadow-xl hover:brightness-110 transition-all duration-200 active:scale-95"
                style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }}
              >
                Get Started
              </button>
              <a
                className="text-primary-container font-bold inline-flex items-center gap-1 hover:gap-2 transition-all duration-200 hover:opacity-80 text-sm md:text-base"
                href="#"
              >
                View SDK Docs
                <span className="material-symbols-outlined" style={{ fontSize: "18px", lineHeight: 1 }}>
                  arrow_forward
                </span>
              </a>
            </div>

          </div>

          {/* ── Right: Visual card ── */}
          <div className="w-full">
            <div className="relative bg-gradient-to-br from-[#dde4ff] to-[#c4d0f5] dark:from-[#1a2840] dark:to-[#162033] rounded-3xl p-4 sm:p-lg shadow-xl overflow-hidden">

              {/* Ambient background orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-container/15 rounded-full blur-3xl animate-pulse pointer-events-none" />

              {/* Row: badge | arrow | hub | arrow | badge */}
              <div className="relative flex items-center gap-2 sm:gap-3">

                {/* YOU SEND */}
                <div className="group flex-1 min-w-0 bg-white/90 dark:bg-slate-800/90 border border-outline-variant/30 dark:border-slate-700/40 p-3 sm:p-5 rounded-2xl shadow-md flex items-center gap-2 sm:gap-3 animate-float hover:shadow-2xl hover:-translate-y-1.5 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 cursor-default">
                  <span
                    className="material-symbols-outlined text-primary-container flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                    style={{ fontSize: "clamp(20px, 2.5vw, 32px)", fontVariationSettings: "'FILL' 1" }}
                  >
                    currency_bitcoin
                  </span>
                  <div className="min-w-0">
                    <div className="text-[9px] sm:text-xs text-secondary font-bold uppercase tracking-wide">You Send</div>
                    <div className="font-bold text-xs sm:text-base text-on-surface truncate">0.01 sBTC</div>
                  </div>
                </div>

                {/* Arrow 1 + flowing dot */}
                <div className="relative flex-shrink-0 w-4 sm:w-6 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container/60" style={{ fontSize: "14px" }}>
                    arrow_forward
                  </span>
                  <div className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary-container shadow-[0_0_6px_2px_rgba(0,82,255,0.5)] animate-flow" />
                </div>

                {/* Hub */}
                <div className="relative flex-shrink-0 flex items-center justify-center">
                  <div className="absolute w-10 h-10 sm:w-14 sm:h-14 bg-primary-container/25 rounded-2xl animate-ping-ring" />
                  <div className="absolute w-10 h-10 sm:w-14 sm:h-14 bg-primary-container/15 rounded-2xl animate-ping-ring" style={{ animationDelay: "1.1s" }} />
                  <div className="absolute w-12 h-12 sm:w-16 sm:h-16 bg-primary-container/40 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-10 h-10 sm:w-14 sm:h-14 bg-primary-container rounded-2xl flex items-center justify-center shadow-lg z-10 hover:brightness-110 transition-all duration-200">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: "clamp(16px, 2vw, 24px)" }}>
                      hub
                    </span>
                  </div>
                </div>

                {/* Arrow 2 + flowing dot */}
                <div className="relative flex-shrink-0 w-4 sm:w-6 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container/60" style={{ fontSize: "14px" }}>
                    arrow_forward
                  </span>
                  <div
                    className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary-container shadow-[0_0_6px_2px_rgba(0,82,255,0.5)] animate-flow"
                    style={{ animationDelay: "0.9s" }}
                  />
                </div>

                {/* THEY RECEIVE */}
                <div
                  className="group flex-1 min-w-0 bg-white/90 dark:bg-slate-800/90 border border-outline-variant/30 dark:border-slate-700/40 p-3 sm:p-5 rounded-2xl shadow-md flex items-center gap-2 sm:gap-3 animate-float hover:shadow-2xl hover:-translate-y-1.5 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 cursor-default"
                  style={{ animationDelay: "0.5s" }}
                >
                  <span
                    className="material-symbols-outlined text-primary-container flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                    style={{ fontSize: "clamp(20px, 2.5vw, 32px)", fontVariationSettings: "'FILL' 1" }}
                  >
                    attach_money
                  </span>
                  <div className="min-w-0">
                    <div className="text-[9px] sm:text-xs text-secondary font-bold uppercase tracking-wide">They Receive</div>
                    <div className="font-bold text-xs sm:text-base text-on-surface truncate">47.23 USDCx</div>
                  </div>
                </div>

              </div>

              {/* Settled pill */}
              <div className="flex justify-center mt-md sm:mt-lg">
                <div
                  className="text-white px-md sm:px-lg py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase animate-rise"
                  style={{
                    background: "linear-gradient(90deg, #151c27, #0052ff)",
                    animationDelay: "0.4s",
                  }}
                >
                  Settled in 1 Transaction
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </header>
  );
}
