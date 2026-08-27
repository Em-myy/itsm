"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ResetPage = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const supabase = createClient();
  const router = useRouter();

  const handleNewPassword = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setNewPassword(event.target.value);
  };

  const handleConfirmPassword = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setConfirmPassword(event.target.value);
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.log(error);
      return;
    }

    router.push("/");
  };
  return (
    <div>
      <h1>Reset Password</h1>
      <div>
        <p>Type in your new password and confirm it</p>
        <div>
          <form onSubmit={handleSubmit}>
            <div>
              <label>New Password: </label>
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                required
                onChange={handleNewPassword}
              />
            </div>
            <div>
              <label>Confirm Password: </label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                required
                onChange={handleConfirmPassword}
              />
            </div>
            <button>Reset Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPage;
