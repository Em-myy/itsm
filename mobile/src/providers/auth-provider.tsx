import { PropsWithChildren, useEffect, useState } from "react";
import api from "@/utils/axios";
import { supabase } from "@/lib/supabase";
import { AuthContext } from "@/hooks/use-auth-context";
import { UserType } from "@/utils/helpers";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

const AuthProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  const [claims, setClaims] = useState<
    Record<string, any> | undefined | null
  >();
  const [profile, setProfile] = useState<UserType | null>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClaims = async () => {
      setIsLoading(true);

      const { data, error } = await supabase.auth.getClaims();

      if (error) {
        console.error("Error fetching claims:", error);
      }

      setClaims(data?.claims ?? null);
      setIsLoading(false);
    };

    fetchClaims();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, _session) => {
      const { data } = await supabase.auth.getClaims();
      setClaims(data?.claims ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);

      if (claims) {
        const response = await api.get("/user/profile");
        setProfile(response.data);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [claims]);

  const handleSignout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Sign Out Error");
      return;
    }
    router.replace("/sign-in");
  };

  return (
    <AuthContext.Provider
      value={{
        claims,
        isLoading,
        profile,
        isLoggedIn: !!claims,
        handleSignout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
