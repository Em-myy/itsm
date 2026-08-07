"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface authContextType {
  user: User | null;
  loading: boolean;
  handleSignout: () => void;
}

const AuthContext = createContext<authContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(error);
    }
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, handleSignout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside the provider");
  }

  return context;
};
