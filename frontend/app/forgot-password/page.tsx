"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

const ForgotPage = () => {
  const [email, setEmail] = useState<string>("");
  const supabase = createClient();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      console.log("Password reset email sent successfully");
      setEmail("");

      if (error) {
        console.log(error);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <h1>Forgot Password Page</h1>
      <p>Input your email</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>E-mail: </label>
          <input type="email" name="email" required onChange={handleChange} />
        </div>
        <button>Forgot Password</button>
      </form>
    </div>
  );
};

export default ForgotPage;
