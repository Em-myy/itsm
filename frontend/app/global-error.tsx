"use client";

import "./globals.css";

const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-ink px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-ink-border text-xl font-semibold text-cream animate-badge-pulse">
          !
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-sage">
            Application Error
          </p>
          <h1 className="mt-3 max-w-md font-serif text-3xl leading-tight text-cream">
            Something broke at the root.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-bullet">
            Reloading usually fixes this. If it keeps happening, contact IT with
            the reference code below.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-muted">
              Ref: {error.digest}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-button px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-button-hover cursor-pointer"
        >
          Try again
        </button>
      </body>
    </html>
  );
};

export default GlobalError;
