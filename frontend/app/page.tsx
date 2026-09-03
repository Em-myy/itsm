"use client";

import GoogleButton from "@/components/GoogleButton";
import { useAuth } from "@/context/AuthContext";
import { DEPARTMENTS } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import {
  AlertCircle,
  Box,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Pencil,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FormType {
  username?: string;
  email: string;
  password: string;
}

interface FormPanelProps {
  mode: Mode;
  onSwitch: (m: Mode) => void;
  signUpForm: FormType;
  signInForm: FormType;
  department: string;
  showPassword: boolean;
  loading: boolean;
  message: Message | null;
  showDoorTransition: boolean;
  onSignUpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignInChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDepartmentChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onTogglePassword: () => void;
  onSignUp: (e: React.SubmitEvent<HTMLFormElement>) => void;
  onSignIn: (e: React.SubmitEvent<HTMLFormElement>) => void;
}

type Mode = "signin" | "signup";
type Label = "Username" | "E-Mail" | "Department" | "Password";
type Message = { type: "error" | "success"; text: string };

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

const inputClass =
  "w-full rounded-xl border border-line bg-input-bg px-4 py-3 text-sm text-heading placeholder:text-muted outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

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
  const [mode, setMode] = useState<Mode>("signin");
  const isSignUp = mode === "signup";

  const [signUpForm, setSignUpForm] = useState<FormType>({
    username: "",
    email: "",
    password: "",
  });
  const [department, setDepartment] = useState<string>("");
  const [signInForm, setSignInForm] = useState<FormType>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [showDoorTransition, setShowDoorTransition] = useState<boolean>(false);

  const supabase = createClient();
  const router = useRouter();
  const { role } = useAuth();

  const handleSwitch = (m: Mode): void => {
    setMode(m);
    setMessage(null);
  };

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

  const handleDepartmentChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setDepartment(event.target.value);
  };

  const handleSignUp = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setMessage(null);

    if (!department) {
      setMessage({ type: "error", text: "Select a department to continue" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signUpForm.email,
      password: signUpForm.password,
      options: {
        data: {
          username: signUpForm.username,
          department: department,
        },
      },
    });
    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setMessage({
      type: "success",
      text: "Check your email to confirm your account",
    });
    setSignUpForm({
      username: "",
      email: "",
      password: "",
    });
    setDepartment("");
  };

  const handleSignIn = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: signInForm.email,
      password: signInForm.password,
    });
    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setShowDoorTransition(true);
  };

  useEffect(() => {
    if (!showDoorTransition) return;

    if (role.name === "") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = setTimeout(
      () =>
        router.push(`${role.name === "Staff" ? "/staff/home" : "/admin/home"}`),
      prefersReducedMotion ? 150 : 1100,
    );

    return () => clearTimeout(timer);
  }, [showDoorTransition, router, role.name]);

  const formPanelProps: FormPanelProps = {
    mode,
    onSwitch: handleSwitch,
    signUpForm,
    signInForm,
    department,
    showPassword,
    loading,
    message,
    showDoorTransition,
    onSignUpChange: handleSignUpChange,
    onSignInChange: handleSignInChange,
    onDepartmentChange: handleDepartmentChange,
    onTogglePassword: () => setShowPassword((p) => !p),
    onSignUp: handleSignUp,
    onSignIn: handleSignIn,
  };

  return (
    <div className="min-h-screen w-full bg-ink">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden md:flex-row">
        <div className="relative z-0 flex-1 bg-ink transition-colors duration-300 motion-reduce:transition-none">
          <div
            key={`text-${mode}`}
            className="h-full animate-panel-fade motion-reduce:animate-none"
          >
            <TextPanel mode={mode} />
          </div>
        </div>

        <div className="relative z-10 flex-1 transition-colors duration-300 motion-reduce:transition-none md:ml-[-6%] md:[clip-path:polygon(6%_0%,100%_0%,100%_100%,0%_100%)] bg-white">
          <div
            key={`form-${mode}`}
            className="h-full animate-panel-fade motion-reduce:animate-none"
          >
            <FormPanel {...formPanelProps} />
          </div>
        </div>
      </div>
    </div>
  );
}

const TextPanel = ({ mode }: { mode: Mode }): React.ReactElement => {
  const data = TEXT[mode];

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden px-10 py-12 text-cream md:px-16 md:py-16">
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full border border-ink-border animate-badge-pulse" />
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 rounded-full border border-ink-border animate-badge-pulse" />

      <div className="relative">
        <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-xl border border-ink-border text-lg font-semibold animate-badge-pulse">
          O
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-sage">
          Ojo Local Government Secretariat &middot; IT &amp; Computer Unit
        </p>
        <h1 className="mt-6 max-w-md font-serif text-4xl leading-tight text-cream md:text-5xl">
          {data.heading}
        </h1>
      </div>

      <ul className="relative mt-12 max-w-sm space-y-6">
        {data.bullets.map(({ Icon, lead, rest }, index) => (
          <li
            key={index}
            className="flex gap-4 text-sm leading-relaxed text-bullet"
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
            <span>
              <span className="font-medium text-cream">{lead}</span> {rest}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Field = ({
  label,
  right,
  children,
}: {
  label: Label;
  right?: React.ReactNode;
  children: React.ReactNode;
}): React.ReactElement => {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm font-medium">
        <span className="text-heading"> {label}</span>
        {right}
      </span>
      {children}
    </label>
  );
};

const ButtonDoorScene = (): React.ReactElement => {
  return (
    <span className="relative inline-flex h-6 w-16 items-center perspective-[200px]">
      <span className="absolute left-0.5 top-1/2 -mt-1.25 flex w-1.5 flex-col items-center animate-walker-enter motion-reduce:animate-none [animation-delay:150ms]">
        <span className="mb-px block h-1 w-1 rounded-full bg-white" />
        <span className="block h-1.5 w-1.25 rounded-t-xs rounded-b-[1px] bg-white" />
      </span>
      <span className="absolute right-0.5 top-px h-5.5 w-3 rounded-sm border-2 border-white" />
      <span className="absolute right-0.5 top-px h-5.5 w-3 origin-left rounded-sm bg-white animate-door-swing motion-reduce:animate-none [animation-delay:150ms]" />
    </span>
  );
};

const FormPanel = ({
  mode,
  onSwitch,
  signUpForm,
  signInForm,
  department,
  showPassword,
  loading,
  message,
  showDoorTransition,
  onSignUpChange,
  onSignInChange,
  onDepartmentChange,
  onTogglePassword,
  onSignUp,
  onSignIn,
}: FormPanelProps): React.ReactElement => {
  const isSignUp = mode === "signup";
  const modes: Mode[] = ["signin", "signup"];

  return (
    <div className="relative flex h-full flex-col justify-center px-10 py-14 md:px-16">
      <div className="mx-auto w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-8 inline-flex rounded-full bg-input-bg p-1">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onSwitch(m)}
              className={`rounded-full cursor-pointer px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] transition focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                mode === m
                  ? "bg-button text-white"
                  : "bg-transparent text-muted"
              }`}
            >
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <h2 className="font-serif text-3xl text-heading">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mt-2 text-sm text-body">
          {isSignUp
            ? "Set up secretariat access with your email."
            : "Sign in to continue to your dashboard."}
        </p>

        {message && (
          <div
            role={message.type === "error" ? "alert" : "status"}
            className={`mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
              message.type === "error"
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form
          className="mt-8 space-y-5"
          onSubmit={isSignUp ? onSignUp : onSignIn}
        >
          {isSignUp && (
            <Field label="Username">
              <input
                className={inputClass}
                type="text"
                value={signUpForm.username}
                name="username"
                placeholder="Famuyiwa Emmanuel"
                required
                onChange={onSignUpChange}
              />
            </Field>
          )}

          <Field label="E-Mail">
            <input
              className={inputClass}
              type="email"
              value={isSignUp ? signUpForm.email : signInForm.email}
              name="email"
              placeholder="famuyiwaemmanuel565@gmail.com"
              required
              onChange={isSignUp ? onSignUpChange : onSignInChange}
            />
          </Field>

          {isSignUp && (
            <Field label="Department">
              <select
                className={`${inputClass} cursor-pointer`}
                value={department}
                onChange={onDepartmentChange}
                required
              >
                <option value="" disabled>
                  Select a department
                </option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field
            label="Password"
            right={
              !isSignUp && (
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-button transition hover:underline"
                >
                  Forgot Password?
                </Link>
              )
            }
          >
            <div className="relative">
              <input
                className={`${inputClass} pr-11`}
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={isSignUp ? signUpForm.password : signInForm.password}
                name="password"
                required
                onChange={isSignUp ? onSignUpChange : onSignInChange}
              />
              <button
                type="button"
                onClick={onTogglePassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </Field>

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 flex w-full items-center justify-center rounded-xl bg-button py-3.5 text-sm font-semibold text-white transition hover:bg-button-hover focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed ${
              loading && !showDoorTransition ? "opacity-70" : ""
            }`}
          >
            {showDoorTransition ? (
              <ButtonDoorScene />
            ) : loading ? (
              isSignUp ? (
                "Creating account..."
              ) : (
                "Signing in..."
              )
            ) : isSignUp ? (
              "Create account"
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-body">
          {isSignUp
            ? "Already have an account?"
            : "New to the secretariat portal?"}{" "}
          <button
            type="button"
            onClick={() => onSwitch(isSignUp ? "signin" : "signup")}
            className="font-medium text-button underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            {isSignUp ? "Sign in" : "Create one"}
          </button>
        </p>

        <div className="my-7 flex items-center gap-3 text-muted">
          <span className="h-px flex-1 bg-line" />
          <span className="text-xs font-medium uppercase tracking-widest">
            Or continue with
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <GoogleButton />
      </div>
    </div>
  );
};
