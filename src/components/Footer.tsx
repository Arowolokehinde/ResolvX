import { LOGO_BASE64 } from "@/lib/logo";

const LINKS = [
  {
    heading: "Product",
    items: [
      { label: "App", href: "#" },
      { label: "How it works", href: "#" },
      { label: "Security", href: "#" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    heading: "Developers",
    items: [
      { label: "Docs", href: "#" },
      { label: "SDK Reference", href: "#" },
      { label: "GitHub", href: "https://github.com/Arowolokehinde/ResolvX" },
      { label: "Contract", href: "#" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About", href: "#" },
      { label: "Audit", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Legal", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#080D1A] text-white">

      {/* Gradient accent line at top */}
      <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, #151c27, #0052ff)" }} />

      <div className="max-w-container-max mx-auto px-gutter pt-xl pb-lg">

        {/* Top row: brand + links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-lg md:gap-xl mb-xl">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-md">
            {/* Logo */}
            <div className="flex items-center gap-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="ResolvX"
                className="h-7 w-auto brightness-0 invert opacity-90"
                src={LOGO_BASE64}
              />
              <span className="text-lg font-extrabold tracking-tight text-white/90">
                Resolv<span style={{ color: "#0052ff" }}>X</span>
              </span>
            </div>

            {/* Tagline */}
            <p className="text-white/50 text-sm leading-relaxed" style={{ maxWidth: "220px" }}>
              The cross-asset payment layer for Stacks. Powered by Bitcoin.
            </p>

            {/* Social / GitHub icon */}
            <div className="flex items-center gap-sm mt-xs">
              <a
                href="#"
                className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all duration-200"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>code</span>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all duration-200"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>article</span>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {LINKS.map(({ heading, items }) => (
            <div key={heading} className="flex flex-col gap-sm">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-xs">
                {heading}
              </span>
              {items.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-white/60 hover:text-white text-sm transition-colors duration-150"
                >
                  {label}
                </a>
              ))}
            </div>
          ))}

        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-sm">

          {/* Copyright */}
          <p className="text-white/30 text-xs">
            © 2026 ResolvX. Built on Stacks · Secured by Bitcoin.
          </p>

          {/* Status + badges */}
          <div className="flex items-center gap-md">
            <div className="flex items-center gap-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/40 text-xs">Mainnet live</span>
            </div>
            <div
              className="text-[10px] font-bold px-sm py-1 rounded-full text-white/70"
              style={{ background: "linear-gradient(90deg, #151c2730, #0052ff30)", border: "1px solid #0052ff30" }}
            >
              Built on Stacks
            </div>
          </div>

        </div>
      </div>

    </footer>
  );
}
