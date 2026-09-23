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

  const [form, setForm] = useState<FormType>({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [isSessionReady, setIsSessionReady] = useState<boolean>(false);
  const [authStatus, setAuthStatus] = useState<string>(
    "Validating invite link...",
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSessionReady(!!session);
      if (!session) setAuthStatus("Link expired or invalid.");
    });
  }, [supabase]);

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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-2">Complete Admin Setup</h2>
      <p className="mb-6 text-gray-600">
        Setup credentials for the Ojo local government ITSM portal
      </p>

      {!isSessionReady && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded text-center font-medium">
          {authStatus}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {isSessionReady && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              required
              onChange={handleChange}
              className="w-full border-2 p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Permanent Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              required
              minLength={8}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Completing Setup..." : "Save & Login"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminInvitePage;
