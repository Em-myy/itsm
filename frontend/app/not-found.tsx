"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NotFound = () => {
  const pathname = usePathname();

  const dashboardPath = pathname.startsWith("/admin")
    ? "/admin/home"
    : pathname.startsWith("/staff")
      ? "/staff/home"
      : "/";

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-ink px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-ink-border text-xl font-semibold text-cream">
        O
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-sage">
          404
        </p>
        <h1 className="mt-3 max-w-md font-serif text-3xl leading-tight text-cream">
          This page doesn&apos;t exist.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-bullet">
          The page you're looking for may have moved, or the link might be off.
        </p>
      </div>

      <Link
        href={dashboardPath}
        className="rounded-xl bg-button px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-button-hover"
      >
        Back to dashboard
      </Link>
    </div>
  );
};

export default NotFound;
