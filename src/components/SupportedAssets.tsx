const ASSETS = ["sBTC", "STX", "USDCx", "USDA", "sUSDT", "DIKO", "ALEX"];

export default function SupportedAssets() {
  return (
    <section className="py-md border-y border-outline-variant bg-white overflow-hidden">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 sm:gap-x-xl items-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
          {ASSETS.map((asset) => (
            <span key={asset} className="font-bold text-sm whitespace-nowrap">
              {asset}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
