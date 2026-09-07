"use client";

import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { DEPARTMENTS, ProfileType } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Message = { type: "error" | "success"; text: string };

const inputClass =
  "w-full rounded-xl border border-line bg-input-bg px-4 py-3 text-sm text-heading placeholder:text-muted outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

const MessageBanner = ({
  message,
}: {
  message: Message;
}): React.ReactElement => {
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
        message.type === "error"
          ? "bg-red-50 text-red-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {message.type === "error" ? (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
      )}
      <span>{message.text}</span>
    </div>
  );
};

const ProfileClient = ({
  initialProfile,
  email,
  avatar,
}: {
  initialProfile: ProfileType;
  email: string;
  avatar: any;
}) => {
  const router = useRouter();
  const supabase = createClient();

  const { role, initials } = useAuth();

  const [username, setUsername] = useState<string>(initialProfile.username);
  const [department, setDepartment] = useState<string>(
    initialProfile.department,
  );
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileMessage, setProfileMessage] = useState<Message | null>(null);

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<Message | null>(null);

  const handleProfileSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setProfileMessage(null);
    setIsSavingProfile(true);

    try {
      await api.patch("/user/update-profile", { username, department });

      const { error: supabaseError } = await supabase.auth.updateUser({
        data: {
          username: username,
          department: department,
        },
      });

      if (supabaseError) {
        console.error("Failed to update metadata:", supabaseError);
      }

      router.refresh();
      setProfileMessage({ type: "success", text: "Profile updated." });
    } catch (error: any) {
      console.error(error);
      setProfileMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Couldn't update your profile. Please try again.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords don't match." });
      return;
    }

    setIsSavingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({ type: "success", text: "Password updated." });
    } catch (error: any) {
      console.error(error);
      setPasswordMessage({
        type: "error",
        text:
          error.message || "Couldn't update your password. Please try again.",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };
  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="font-serif text-3xl text-heading">Profile</h1>
        <p className="mt-1 text-sm text-body">
          Manage your account details and password.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6">
          <div className="mb-6 flex items-center gap-4">
            {avatar ? (
              <Image
                src={avatar}
                alt={initialProfile.username}
                className="h-14 w-14 rounded-full border border-line object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-button text-lg font-semibold uppercase text-white">
                {initials}
              </div>
            )}

            <div>
              <p className="font-serif text-lg text-heading">
                {initialProfile.username}
              </p>
              <span className="mt-0.5 inline-block rounded-full bg-input-bg px-2.5 py-0.5 font-mono text-xs uppercase tracking-widest text-muted">
                {role?.name}
              </span>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-heading">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-heading">
                Email
              </label>
              <input
                type="email"
                disabled
                value={email}
                className={`${inputClass} cursor-not-allowed opacity-70`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-heading">
                Department
              </label>
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                disabled={role?.name === "IT Admin"}
                className={`${inputClass} ${role?.name === "IT Admin" ? "cursor-not-allowed opacity-70" : ""}`}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {profileMessage && <MessageBanner message={profileMessage} />}

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full rounded-xl bg-button py-3 text-sm font-semibold text-white transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingProfile ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-serif text-xl text-heading">Change password</h2>
          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-heading">
                New password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-heading">
                Confirm new password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {passwordMessage && <MessageBanner message={passwordMessage} />}

            <button
              type="submit"
              disabled={isSavingPassword}
              className="w-full rounded-xl bg-button py-3 text-sm font-semibold text-white transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileClient;
