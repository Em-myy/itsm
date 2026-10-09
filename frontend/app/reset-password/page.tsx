"use client";

import { createClient } from "@/utils/supabase/client";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-line bg-input-bg px-4 py-3 pr-11 text-sm text-heading placeholder:text-muted outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const BULLETS = [
  {
    Icon: KeyRound,
    lead: "Pick something new",
    rest: "- use a password you don't use anywhere else.",
  },
  {
    Icon: ShieldCheck,
    lead: "One quick step",
    rest: "- once it's saved, you'll be redirected automatically.",
  },
];

const PasswordField = ({
  id,
  label,
  value,
  show,
  disabled,
  onChange,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  show: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}): React.ReactElement => (
  <div>
    <label className="mb-2 block text-sm font-medium text-heading">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        className={inputClass}
        type={show ? "text" : "password"}
        name={id}
        value={value}
        required
        autoComplete="new-password"
        placeholder="••••••••"
        disabled={disabled}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={
          show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`
        }
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted hover:text-heading"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

const ResetPage = () => {
  const supabase = createClient();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [done, setDone] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const checkSession = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth/auth-code-error");
        return;
      }

      setCheckingSession(false);
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [supabase, router]);

  useEffect(() => {
    if (!done) {
      return;
    }

    const timer = setTimeout(() => {
      router.push("/");
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [done, router]);

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setError("");

    if (newPassword !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setDone(true);
    } catch (error: any) {
      setError(
        error?.message || "Couldn't update your password. Please try again.",
      );
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div
        role="status"
        className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-ink text-cream"
      >
        <div className="flex h-11 w-11 animate-badge-pulse items-center justify-center rounded-xl border border-ink-border text-lg font-semibold motion-reduce:animate-none">
          O
        </div>
        <p className="text-sm text-bullet">Validating your reset link...</p>
      </div>
    );
  }

  const locked = loading || done;

  return (
    <div className="min-h-screen w-full bg-ink">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden md:flex-row">
        <div className="relative z-0 flex-none bg-ink md:flex-1">
          <div className="relative flex h-full flex-col justify-between overflow-hidden px-6 py-10 text-cream sm:px-10 sm:py-12 md:px-16 md:py-16">
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full border border-ink-border" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 rounded-full border border-ink-border" />

            <div className="relative">
              <div className="mb-10 flex h-11 w-11 items-center justify-center rounded-xl border border-ink-border text-lg font-semibold">
                O
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-sage">
                Ojo Local Government Secretariat &middot; IT &amp; Computer Unit
              </p>
              <h1 className="mt-6 max-w-md font-serif text-3xl leading-tight text-cream sm:text-4xl md:text-5xl">
                Choose a new password and get back to work.
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
                <h2 className="font-serif text-3xl text-heading">
                  Reset your password
                </h2>
                <p className="mt-2 text-sm text-body">
                  Type in your new password and confirm it.
                </p>

                {error && (
                  <div
                    role="alert"
                    className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {done && (
                  <div
                    role="status"
                    className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Password updated. Redirecting you now...</span>
                  </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                  <PasswordField
                    id="newPassword"
                    label="New password"
                    value={newPassword}
                    show={showNew}
                    disabled={locked}
                    onChange={setNewPassword}
                    onToggle={() => setShowNew((s) => !s)}
                  />

                  <PasswordField
                    id="confirmPassword"
                    label="Confirm password"
                    value={confirmPassword}
                    show={showConfirm}
                    disabled={locked}
                    onChange={setConfirmPassword}
                    onToggle={() => setShowConfirm((s) => !s)}
                  />

                  <button
                    type="submit"
                    disabled={locked || !newPassword || !confirmPassword}
                    className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-button py-3.5 text-sm font-semibold text-white transition hover:bg-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Resetting..." : "Reset password"}
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

export default ResetPage;
