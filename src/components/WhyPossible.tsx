export default function WhyPossible() {
  return (
    <section className="py-xl bg-white">
      <div className="max-w-3xl mx-auto px-gutter">
        <h2 className="font-headline-md text-headline-md mb-lg">
          How is this possible?
        </h2>
        <div className="space-y-lg">
          <div className="border-l-4 border-primary-container pl-md">
            <h3 className="font-bold text-lg mb-xs">sBTC Liquidity</h3>
            <p className="text-secondary text-body-md">
              By leveraging Bitcoin-native assets on Stacks, ResolvX taps into
              deep pools of institutional-grade liquidity, allowing for
              frictionless movement between volatile and stable assets.
            </p>
          </div>
          <div className="border-l-4 border-primary-container pl-md">
            <h3 className="font-bold text-lg mb-xs">Clarity Atomicity</h3>
            <p className="text-secondary text-body-md">
              The &ldquo;X&rdquo; represents the intersection. Using the
              Clarity smart contract language, we guarantee that the payment and
              the swap either both succeed perfectly or both fail, with no risk
              of stranded funds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
