"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Temporary: surface error details in console while debugging production crash
    // eslint-disable-next-line no-console
    console.error("[App error boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-cream font-body px-6 safe-top safe-bottom">
      <div className="text-center max-w-md">
        <h1 className="font-display text-4xl font-light text-cream mb-4">
          Something went wrong
        </h1>
        <p className="text-cream/60 mb-8">
          We couldn’t load the page. Please try again.
        </p>
        {/* Temporary debug details: remove once crash is fixed */}
        {error?.message && (
          <p className="text-xs text-cream/40 break-words mb-4">
            <span className="font-semibold">Error:</span> {error.message}
          </p>
        )}
        {error?.digest && (
          <p className="text-[11px] text-cream/30 mb-6">
            <span className="font-semibold">Digest:</span> {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="inline-block min-h-[44px] px-6 py-3 text-sm tracking-wide text-background bg-cream/90 hover:bg-cream rounded transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Try again
        </button>
        <p className="mt-8">
          <a
            href="/"
            className="text-sm text-cream/80 hover:text-cream underline underline-offset-4 transition-colors cursor-pointer"
          >
            Back to Belicia
          </a>
        </p>
      </div>
    </div>
  );
}
