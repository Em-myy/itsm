import { AlertCircle, ArrowLeft, Clock, Repeat } from "lucide-react";
import Link from "next/link";

const REASONS = [
  {
    Icon: Clock,
    lead: "It expired",
    rest: "- links only work for a limited time.",
  },
  {
    Icon: Repeat,
    lead: "It was already used",
    rest: "- each link works once, so opening it again won't help.",
  },
];

const AuthCodeErrorPage = () => {
  return (
    <div className="min-h-screen w-full bg-ink">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden md:flex-row">
        <div className="relative z-0 flex-none bg-ink md:flex-1">
          <div className="relative flex h-full flex-col justify-between overflow-hidden px-6 py-10 text-cream sm:px-10 sm:py-12 md:px-16 md:py-16">
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full border border-ink-border" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 rounded-full border border-ink-border" />

            <div className="relative">
              <div className="mb-10 flex h-11 w-11 items-center justify-center rounded-xl border border-ink-border text-lg font-semibold animate-badge-pulse">
                O
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-sage">
                Ojo Local Government Secretariat &middot; IT &amp; Computer Unit
              </p>
              <h1 className="mt-6 max-w-md font-serif text-3xl leading-tight text-cream sm:text-4xl md:text-5xl">
                That link didn&apos;t work.
              </h1>
            </div>

            <div className="relative mt-12 max-w-sm">
              <p className="mb-4 text-sm font-medium text-cream">
                This usually means:
              </p>
              <ul className="space-y-6">
                {REASONS.map(({ Icon, lead, rest }) => (
                  <li
                    key={lead}
                    className="flex gap-4 text-sm leading-relaxed text-bullet"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                    <span>
                      <span className="font-medium text-cream">{lead}</span>{" "}
                      {rest}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-none bg-white md:ml-[-6%] md:flex-1 md:[clip-path:polygon(6%_0%,100%_0%,100%_100%,0%_100%)]">
          <div className="h-full animate-panel-fade motion-reduce:animate-none">
            <div className="relative flex h-full flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 md:px-16">
              <div className="mx-auto w-full max-w-sm">
                <div
                  aria-hidden="true"
                  className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-700 animate-badge-pulse"
                >
                  <AlertCircle className="w-7 h-7 shrink-0" strokeWidth={1.5} />
                </div>

                <h2 className="font-serif text-3xl text-heading">
                  Link expired or invalid
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-body">
                  Your link has expired or has already been used. Head back to
                  sign in and request a new one.
                </p>

                <Link
                  href="/"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-button py-3.5 text-sm font-semibold text-white transition hover:bg-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>

                <p className="mt-6 text-center text-sm text-body">
                  Trying to reset your password?{" "}
                  <Link
                    href="/forgot-password"
                    className="font-medium text-button underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  >
                    Request a new reset link
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCodeErrorPage;
