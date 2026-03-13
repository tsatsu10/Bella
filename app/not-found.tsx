export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-cream font-body px-6 safe-top safe-bottom">
      <div className="text-center">
        <h1 className="font-display text-4xl font-light text-cream mb-4">404</h1>
        <p className="text-cream/60 mb-8">This page could not be found.</p>
        <a
          href="/"
          className="inline-block min-h-[44px] px-6 py-3 text-sm tracking-wide text-cream/80 hover:text-cream underline underline-offset-4 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
        >
          Back to Belicia
        </a>
      </div>
    </div>
  );
}
