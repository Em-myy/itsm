"use client";

import api from "@/lib/axios";
import { UserType } from "@/lib/types";
import { getStatusStyle } from "@/utils/status-styles";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type InviteStatus = "idle" | "loading" | "success" | "error";

const formatRole = (role: string): string => role.replace(/_/g, "");

const UserClientPage = ({ initialUsers }: { initialUsers: UserType[] }) => {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<InviteStatus>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const channel = supabase
      .channel("realtime_users_page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  const handleInvite = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const invitedEmail = email.trim();

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("You must be logged in to send an invite");
      }

      await api.post("/user/invite-admin", { email: invitedEmail });

      setStatus("success");
      setMessage(`Invitation sent successfully to ${invitedEmail}`);
      setEmail("");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.response.data.message || error.message);
    }
  };

  const isSending = status === "loading";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-heading">
          This is the users page
        </h1>
        <p className="mt-1 text-sm text-body">
          {" "}
          Everyone with access to the platform, and a way to add new IT admins.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="users-heading" className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="users-heading"
              className="font-mono text-xs uppercase tracking-[0.15em] text-muted"
            >
              Existing Users
            </h2>
            <span className="text-muted">
              {" "}
              {initialUsers.length}{" "}
              {initialUsers.length === 1 ? "user" : "users"}
            </span>
          </div>

          {initialUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-white px-4 py-10 text-center">
              <p className="text-sm text-body">No users yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
              <table className="w-full min-w-170 text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-muted">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Member since</th>
                  </tr>
                </thead>
                <tbody>
                  {initialUsers.map((user) => {
                    const awaitingSetup = user.username === "Unknown";
                    const statusStyle = getStatusStyle(user.status ?? "");
                    const initials = awaitingSetup
                      ? user.email?.[0].toUpperCase()
                      : user.username.charAt(0).toUpperCase();

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-line last:border-b-0 transition hover:bg-surface-hover"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              aria-hidden="true"
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-button text-xs font-semibold text-white"
                            >
                              {initials}
                            </span>
                            <div className="min-w-0">
                              <p
                                className={`truncate font-semibold ${
                                  awaitingSetup
                                    ? "italic text-muted"
                                    : "text-heading"
                                }`}
                              >
                                {awaitingSetup
                                  ? "Awaiting setup"
                                  : user.username}
                              </p>
                              <p className="truncate text-xs text-body">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-body">
                          {user.department || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-input-bg px-2.5 py-1 text-xs font-medium capitalize text-body">
                            {formatRole(user.role_name)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle.pill}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                            />
                            {user.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-body">
                          {new Date(user.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section aria-labelledby="invite-heading" className="lg:col-span-1">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-button" aria-hidden="true" />
              <h2
                id="invite-heading"
                className="font-serif text-xl text-heading"
              >
                Add new IT admin
              </h2>
            </div>
            <p className="mt-1 text-sm text-body">
              {" "}
              Send an email invitation to set up a new admin account.
            </p>

            {status === "success" && (
              <div
                role="status"
                className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {status === "error" && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-heading">
                  Work email
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  required
                  autoComplete="off"
                  placeholder="admin@example.com"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(event.target.value)
                  }
                  disabled={isSending}
                  className="w-full rounded-xl border border-line bg-input-bg px-4 py-2.5 text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={isSending || !email.trim()}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-button px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSending ? "Sending Invite..." : "Send Invitation"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserClientPage;
