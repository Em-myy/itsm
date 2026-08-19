"use client";

import GoogleButton from "@/components/GoogleButton";
import { createClient } from "@/utils/supabase/client";
import {
  Box,
  Calendar,
  KeyRound,
  Pencil,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface formType {
  username?: string;
  email: string;
  password: string;
}

type Mode = "signin" | "signup";

const palette = {
  ink: "#152922",
  inkBorder: "#3E5C4E",
  sage: "#93AC97",
  cream: "#F3EEE1",
  bullet: "#C7D0C4",
  button: "#1F4A3B",
  buttonHover: "#26593F",
  surface: "#FFFFFF",
  inputBg: "#F2EEE3",
  border: "#E5E0D1",
  headingDark: "#182620",
  body: "#4B5650",
  muted: "#8D8879",
};

const TEXT = {
  signin: {
    heading: "One portal for tickets, assets and hall bookings.",
    bullets: [
      {
        Icon: Box,
        lead: "Asset & inventory manager",
        rest: "- know where every laptop and UPS is, always.",
      },
      {
        Icon: Pencil,
        lead: "Helpdesk ticketing",
        rest: "- report an issue and track it to resolution.",
      },
      {
        Icon: Calendar,
        lead: "Venue & resource allocator",
        rest: "- book a hall without double-booking the projector.",
      },
    ],
  },
  signup: {
    heading: "Set up once. Every module opens with the same login.",
    bullets: [
      {
        Icon: ShieldCheck,
        lead: "Verified with your mail",
        rest: "- Each mail are verified and secure.",
      },
      {
        Icon: UserCog,
        lead: "Role-based from first login",
        rest: "- staff and IT admins land on different consoles automatically.",
      },
      {
        Icon: KeyRound,
        lead: "One account, three modules",
        rest: "- tickets, assets and bookings share a single sign-on.",
      },
    ],
  },
};

export default function Home() {
  const [signUpForm, setSignUpForm] = useState<formType>({
    username: "",
    email: "",
    password: "",
  });
  const [department, setDepartment] = useState<string>("");
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

  const handleDepartment = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setDepartment(event.target.value);
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

    if (!department) {
      console.log("Select a Department");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: signUpForm.email,
      password: signUpForm.password,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
        data: {
          username: signUpForm.username,
          department: department,
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
              <div>
                <label>Department: </label>
                <select value={department} onChange={handleDepartment}>
                  <option value="">Select a department</option>
                  <option value="Admin/HR">Admin/HR</option>
                  <option value="Environment">Environment</option>
                  <option value="Education">Education</option>
                  <option value="Tourism">Tourism</option>
                  <option value="Finance">Finance</option>
                  <option value="ICT">ICT</option>
                </select>
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

        <div>
          <GoogleButton />
        </div>
      </main>
    </div>
  );
}

const TextPanel = ({ mode }: { mode: Mode }): React.ReactElement => {
  const data = TEXT[mode];

  return (
    <div
      className="relative flex h-full flex-col justify-between overflow-hidden px-10 py-12 md:px-16 md:py-16"
      style={{ color: palette.cream }}
    >
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full"
        style={{ border: `1px solid ${palette.inkBorder}` }}
      />
      <div
        className="pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 rounded-full"
        style={{ border: `1px solid ${palette.inkBorder}` }}
      />

      <div className="relative">
        <div
          className="mb-10 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-semibold"
          style={{ border: `1px solid ${palette.inkBorder}` }}
        >
          0
        </div>
        <p
          className="font-mono text-xs uppercase"
          style={{ color: palette.sage, letterSpacing: "0.2em" }}
        >
          Ojo Local Government Secretariat &middot; IT &amp; Computer Unit
        </p>
        <h1
          className="mt-6 max-w-md font-serif text-4xl leading-tight md:text-5xl"
          style={{ color: palette.cream }}
        >
          {data.heading}
        </h1>
      </div>

      <ul className="relative mt-12 max-w-sm space-y-6">
        {data.bullets.map(({ Icon, lead, rest }, index) => (
          <li
            key={index}
            className="flex gap-4 text-sm leading-relaxed"
            style={{ color: palette.bullet }}
          >
            <Icon
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: palette.sage }}
            />
            <span>
              <span className="font-medium" style={{ color: palette.cream }}>
                {lead}
              </span>{" "}
              {rest}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
