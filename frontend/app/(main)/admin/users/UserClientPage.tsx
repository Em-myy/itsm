"use client";

import api from "@/lib/axios";
import { UserType } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const UserClientPage = ({ initialUsers }: { initialUsers: UserType[] }) => {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
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

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("You must be logged in to send an invite");
      }

      await api.post("/user/invite-admin", { email: email });

      setStatus("success");
      setMessage(`Invitation sent successfully to ${email}`);
      setEmail("");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message);
    } finally {
      if (status !== "error") {
        setStatus("idle");
      }
    }
  };

  return (
    <div>
      <h1>This is the users page</h1>
      <div>
        <h2>List of existing users</h2>
      </div>
      {initialUsers.map((user) => (
        <div key={user.id}>
          <div>
            {user.username === "Unknown" ? "Awaiting Setup" : user.username}
          </div>
          <div>{user.status}</div>
          <div>{user.email}</div>
          <div>{user.department}</div>
          <div>{user.role_name}</div>
          <div>
            Member since -{" "}
            {new Date(user.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      ))}

      <div>
        <h3>Add new IT Admin</h3>
        <p>Send an email invitation to provision a new account</p>

        {status === "success" && (
          <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm border border-green-200">
            {message}
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-200">
            {message}
          </div>
        )}
        <div>
          <form onSubmit={handleInvite}>
            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={email}
                required
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(event.target.value)
                }
                disabled={status === "loading"}
              />
            </div>
            <button type="submit" disabled={status === "loading" || !email}>
              {status === "loading" ? "Sending Invite..." : "Send Invitation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserClientPage;
