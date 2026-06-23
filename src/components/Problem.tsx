export default function Problem() {
  return (
    <section className="py-12 md:py-xl bg-white dark:bg-[#111827] border-y border-outline-variant transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-gutter text-center">
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Crypto payments are still broken.
        </h2>
        <p className="mt-md text-secondary text-body-lg max-w-2xl mx-auto">
          Recipients shouldn&apos;t have to worry about what you have, and you
          shouldn&apos;t have to swap manually before you pay. ResolvX handles
          the atomic swap and payment in a single step.
        </p>
      </div>
    </section>
  );
}
