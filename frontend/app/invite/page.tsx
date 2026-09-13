"use client";

import api from "@/lib/axios";
import { createClient } from "@/utils/supabase/client";
import { Session } from "inspector/promises";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FormType {
  username: string;
  password: string;
}

const AdminInvitePage = () => {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleAuth = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          setError("Failed to verify invite link and it might have expired");
          return;
        }

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      } else {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (
          sessionError ||
          (!session && !window.location.hash.includes("access_token"))
        ) {
          setError(
            "This invite link has expired or is invalid. Please request a new one.",
          );
        }
      }
    };

    handleAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

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
      const { error: authError } = await supabase.auth.updateUser({
        password: form.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      await api.patch("/user/update-admin", { username: form.username });
      console.log("Admin username updated successfully");
      router.push("/admin/home");
    } catch (error: any) {
      console.error("Full error:", error);

      let errorMessage = "An unexpected error occurred.";

      if (error.response?.data) {
        errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message ||
              JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return;
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <h2>Complete Admin Setup</h2>
      <p>Setup credentials for the Ojo local government ITSM portal</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              required
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Permanent Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              required
              minLength={8}
              onChange={handleChange}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Completing Setup..." : "Save & Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminInvitePage;
