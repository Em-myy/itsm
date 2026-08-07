"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type formType = {
  username?: string;
  email: string;
  password: string;
};

export default function Home() {
  const [signUpForm, setSignUpForm] = useState<formType>({
    username: "",
    email: "",
    password: "",
  });
  const [signInForm, setSignInForm] = useState<formType>({
    email: "",
    password: "",
  });
  const supabase = createClient();
  const router = useRouter();

  const handleSignUpChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setSignUpForm({ ...signUpForm, [event.target.name]: event.target.value });
  };

  const handleSignInChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setSignInForm({ ...signInForm, [event.target.name]: event.target.value });
  };

  const handleSignUp = async (
    event: React.ChangeEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const { error } = await supabase.auth.signUp({
      email: signUpForm.email,
      password: signUpForm.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/home`,
        data: {
          username: signUpForm.username,
        },
      },
    });

    if (error) {
      console.log(error);
      return;
    }
  };

  const handleSignIn = async (
    event: React.ChangeEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email: signInForm.email,
      password: signInForm.password,
    });

    if (error) {
      console.log(error);
      return;
    } else {
      router.push("/home");
    }
  };

  return (
    <div>
      <main>
        <h1>Sign UP and Sign In Page</h1>
        <div>
          <h2>Sign Up</h2>
          <div>
            <form onSubmit={handleSignUp}>
              <div>
                <label>Username: </label>
                <input
                  type="text"
                  value={signUpForm.username}
                  name="username"
                  required
                  onChange={handleSignUpChange}
                />
              </div>
              <div>
                <label>E-Mail: </label>
                <input
                  type="email"
                  value={signUpForm.email}
                  name="email"
                  required
                  onChange={handleSignUpChange}
                />
              </div>
              <div>
                <label>Password: </label>
                <input
                  type="password"
                  value={signUpForm.password}
                  name="password"
                  required
                  onChange={handleSignUpChange}
                />
              </div>
              <button>Sign Up</button>
            </form>
          </div>
        </div>

        <div>
          <h2>Sign In</h2>
          <div>
            <form onSubmit={handleSignIn}>
              <div>
                <label>E-Mail: </label>
                <input
                  type="text"
                  name="email"
                  value={signInForm.email}
                  required
                  onChange={handleSignInChange}
                />
              </div>
              <div>
                <label>Password: </label>
                <input
                  type="password"
                  name="password"
                  value={signInForm.password}
                  required
                  onChange={handleSignInChange}
                />
              </div>
              <button>Sign In</button>
            </form>
          </div>
        </div>

        <div>
          <Link href="/forgot-password">Forgot Password</Link>
        </div>
      </main>
    </div>
  );
}
