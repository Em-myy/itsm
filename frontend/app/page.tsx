"use client";

import { createClient } from "@/utils/supabase/client";
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

    const { data, error } = await supabase.auth.signUp({
      email: signUpForm.email,
      password: signUpForm.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        data: {
          username: signUpForm.username,
        },
      },
    });

    if (error) {
      console.log(error);
    }
  };

  const handleSignIn = async (
    event: React.ChangeEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInForm.email,
      password: signInForm.password,
    });

    router.push("/dashboard");

    if (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <main>
        <h1>Sign UP and Sign In Page</h1>
        <div>
          <h2>Sign Up</h2>
          <div>
            <form
              onSubmit={(event: React.ChangeEvent<HTMLFormElement>) =>
                handleSignUp(event)
              }
            >
              <div>
                <label>Username: </label>
                <input
                  type="text"
                  value={signUpForm.username}
                  name="username"
                  required
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleSignUpChange(event)
                  }
                />
              </div>
              <div>
                <label>E-Mail: </label>
                <input
                  type="email"
                  value={signUpForm.email}
                  name="email"
                  required
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleSignUpChange(event)
                  }
                />
              </div>
              <div>
                <label>Password: </label>
                <input
                  type="password"
                  value={signUpForm.password}
                  name="password"
                  required
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleSignUpChange(event)
                  }
                />
              </div>
              <button>Sign Up</button>
            </form>
          </div>
        </div>

        <div>
          <h2>Sign In</h2>
          <div>
            <form
              onSubmit={(event: React.ChangeEvent<HTMLFormElement>) =>
                handleSignIn(event)
              }
            >
              <div>
                <label>E-Mail: </label>
                <input
                  type="text"
                  name="email"
                  value={signInForm.email}
                  required
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleSignInChange(event)
                  }
                />
              </div>
              <div>
                <label>Password: </label>
                <input
                  type="password"
                  name="password"
                  value={signInForm.password}
                  required
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleSignInChange(event)
                  }
                />
              </div>
              <button>Sign In</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
