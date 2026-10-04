"use client";

import api from "@/lib/axios";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FormType {
  username: string;
  password: string;
}

const labelClass = "mb-2 block text-sm font-medium text-heading";

const inputClass =
  "w-full rounded-xl border border-line bg-input-bg px-4 py-3 text-sm text-heading placeholder:text-muted outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

const AdminInvitePage = () => {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<FormType>({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [isSessionReady, setIsSessionReady] = useState<boolean>(false);
  const [inviteFailed, setInviteFailed] = useState<boolean>(false);
  const [authStatus, setAuthStatus] = useState<string>(
    "Validating invite link...",
  );

  useEffect(() => {
    const handleInvite = async (): Promise<void> => {
      try {
        const hash = window.location.hash;

        if (!hash) {
          setAuthStatus("Link expired or invalid.");
          setInviteFailed(true);
          return;
        }

        const params = new URLSearchParams(hash.substring(1));

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");

        if (!accessToken || !refreshToken || type !== "invite") {
          setAuthStatus("Link expired or invalid.");
          setInviteFailed(true);
          return;
        }

        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setAuthStatus("Link expired or invalid.");
          setInviteFailed(true);
          return;
        }

        if (data.session) {
          setIsSessionReady(true);
          setAuthStatus("");

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }
      } catch (error) {
        setAuthStatus("Link expired or invalid.");
        setInviteFailed(true);
      }
    };

    handleInvite();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.patch("/user/update-admin", { username: form.username });

      const { error: authError } = await supabase.auth.updateUser({
        password: form.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      router.push("/admin/home");
    } catch (error: any) {
      setError(error.response.data.message || error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-ink px-4">
      <div className="w-full max-w-md rounded-2xl border border-ink-border bg-white p-8 shadow-xl">
        <h1 className="font-serif text-2xl text-heading text-center">
          Complete Admin Setup
        </h1>

        <p className="mt-1 text-sm text-body">
          Setup credentials for the Ojo local government ITSM portal
        </p>

        {!isSessionReady && (
          <div
            className={`mt-6 rounded-lg px-4 py-3 text-center text-sm font-medium ${
              inviteFailed ? "bg-red-50 text-red-700" : "bg-input-bg text-body"
            }`}
          >
            {authStatus}
            {inviteFailed && (
              <p className="mt-2 text-xs text-muted">
                Contact your IT administrator for a new invite link.
              </p>
            )}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSessionReady && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                required
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Permanent Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                required
                minLength={8}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-button py-3 text-sm font-semibold text-white transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Completing Setup..." : "Save & Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminInvitePage;
