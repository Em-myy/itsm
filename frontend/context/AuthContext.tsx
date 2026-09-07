"use client";

import api from "@/lib/axios";
import { RoleType } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  roleLoading: boolean;
  avatar: any;
  initials: string;
  displayName: string;
  role: RoleType | null;
  handleSignout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<RoleType | null>(null);
  const [roleLoading, setRoleLoading] = useState<boolean>(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async (): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getRole = async (): Promise<void> => {
      if (!user) {
        setRole(null);
        setRoleLoading(false);
        return;
      }

      setRoleLoading(true);

      try {
        const response = await api.get("/role");
        setRole(response.data);
      } catch (error) {
        console.error("Failed to get user role");
        setRole(null);
      } finally {
        setRoleLoading(false);
      }
    };
    getRole();
  }, [user]);

  const handleSignout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(error);
    }
    router.push("/");
  };

  const avatar =
    user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null;

  const displayName =
    user?.user_metadata?.username ??
    user?.user_metadata?.display_name ??
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    "Unknown User";

  const initials =
    displayName !== "Unknown User" ? displayName.charAt(0).toUpperCase() : "?";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        roleLoading,
        avatar,
        initials,
        displayName,
        role,
        handleSignout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside the provider");
  }

  return context;
};
