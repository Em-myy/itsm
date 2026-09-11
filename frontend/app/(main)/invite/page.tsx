"use client";

import api from "@/lib/axios";
import { createClient } from "@/utils/supabase/client";
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
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(
          "Invite link has expired. Please check your mail for more information",
        );
      }

      const { error: authError } = await supabase.auth.updateUser({
        password: form.password,
      });

      if (authError) {
        throw new Error("Error in updating password");
      }

      await api.patch("/user/update-admin", { username: form.username });
      console.log("Admin username updated successfully");
      router.push("/admin/home");
    } catch (error: any) {
      console.log(error);
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
