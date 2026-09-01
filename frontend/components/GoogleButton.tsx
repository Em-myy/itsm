"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const GoogleGlyph = (): React.ReactElement => {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-13.9 4.2-17.2 10.4z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.3 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.6 5.1C9.9 39.8 16.4 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.4C41.4 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
};

const GoogleButton = () => {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);

  const handleSignin = async (): Promise<void> => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/staff/home`,
      },
    });
    if (error) {
      console.log("Error in signing in with google");
      router.push("/");
      setLoading(false);
    }
  };
  return (
    <section>
      <button
        type="button"
        onClick={handleSignin}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white py-3 text-sm font-semibold text-heading transition hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70"
      >
        <GoogleGlyph />
        {loading ? "Redirecting..." : "Continue with Google"}
      </button>
    </section>
  );
};

export default GoogleButton;
