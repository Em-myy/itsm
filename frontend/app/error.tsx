"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  const pathname = usePathname();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const dashboardPath = pathname.startsWith("/admin")
    ? "/admin/home"
    : pathname.startsWith("/staff")
      ? "/staff/home"
      : "/";
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-ink px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-ink-border animate-badge-pulse">
        <AlertCircle className="h-6 w-6 text-sage" />
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-sage">
          Something went wrong
        </p>
        <h1 className="mt-3 max-w-md font-serif text-3xl leading-tight text-cream">
          That request hit a snag.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-bullet">
          Try again, or head back to the dashboard. If this keeps happening,
          pass the reference code below to IT.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted">
            Ref: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-button px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-button-hover cursor-pointer"
        >
          Try again
        </button>
        <Link
          href={dashboardPath}
          className="rounded-xl border border-ink-border px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-white/5"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
};

export default Error;
