"use client";

import { createClient } from "@/utils/supabase/client";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Message = { type: "error" | "success"; text: string };

const inputClass =
  "w-full rounded-xl border border-line bg-input-bg px-4 py-3 text-sm text-heading placeholder:text-muted outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const BULLETS = [
  {
    Icon: Mail,
    lead: "Reset link by email",
    rest: "- we'll send it to the address you signed up with.",
  },
  {
    Icon: KeyRound,
    lead: "Choose a new password",
    rest: "- the link takes you straight to the reset page.",
  },
];

const ForgotPage = () => {
  const supabase = createClient();

  const [email, setEmail] = useState<string>("");
  const [loading, SetLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setMessage(null);
    SetLoading(true);

    const submittedMail = email.trim();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        submittedMail,
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        },
      );

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      setMessage({
        type: "success",
        text: `If an account exists for ${submittedMail}, a reset link is on its way. Check your inbox.`,
      });
      setEmail("");
    } catch (error: any) {
      setMessage({
        type: "error",
        text:
          error.response.data.message ||
          error.message ||
          "Couldn't send the reset email. Please try again.",
      });
    } finally {
      SetLoading(false);
    }
  };
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
                {" "}
                Ojo Local Government Secretariat &middot; IT &amp; Computer Unit
              </p>
              <h1 className="mt-6 max-w-md font-serif text-3xl leading-tight text-cream sm:text-4xl md:text-5xl">
                Locked out? Let&apos;s get you back in.
              </h1>
            </div>

            <ul className="relative mt-12 max-w-sm space-y-6">
              {BULLETS.map(({ Icon, lead, rest }) => (
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

        <div className="relative z-10 flex-none bg-white md:ml-[-6%] md:flex-1 md:[clip-path:polygon(6%_0%,100%_0%,100%_100%,0%_100%)]">
          <div className="h-full animate-panel-fade motion-reduce:animate-none">
            <div className="relative flex h-full flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 md:px-16">
              <div className="mx-auto w-full max-w-sm">
                <Link
                  href="/"
                  className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-body transition hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>

                <h2 className="font-serif text-3xl text-heading">
                  Reset your password
                </h2>
                <p className="mt-2 text-sm text-body">
                  {" "}
                  Enter your work email and we&apos;ll send you a reset link.
                </p>

                {message && (
                  <div
                    role={message.type === "error" ? "alert" : "status"}
                    className={`mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                      message.type === "error"
                        ? "bg-red-50 text-red-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {message.type === "error" ? (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <span>{message.text}</span>
                  </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-heading">
                      E-Mail
                    </span>
                    <input
                      className={inputClass}
                      type="email"
                      name="email"
                      value={email}
                      required
                      autoComplete="email"
                      placeholder="name@example.com"
                      disabled={loading}
                      onChange={handleChange}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-button py-3.5 text-sm font-semibold text-white transition hover:bg-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Sending link..." : "Send reset link"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPage;
