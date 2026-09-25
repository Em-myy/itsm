"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ResetPage = () => {
  const supabase = createClient();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
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
  }, []);

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

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
  };

  if (checkingSession) {
    return <p>Validating password reset...</p>;
  }

  return (
    <div>
      <h1>Reset Password</h1>
      <div>
        <p>Type in your new password and confirm it</p>

        {error && <p>{error}</p>}
        <div>
          <form onSubmit={handleSubmit}>
            <div>
              <label>New Password: </label>
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                required
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
            <div>
              <label>Confirm Password: </label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                required
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPage;
