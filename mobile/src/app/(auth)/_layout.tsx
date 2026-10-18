import { Redirect, Stack } from "expo-router";
import { useAuthContext } from "@/hooks/use-auth-context";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FullScreenLoader from "@/components/layout/full-screen-loader";

const AuthLayout = () => {
  const { profile, isLoggedIn, isLoading } = useAuthContext();

  if (isLoading || (isLoggedIn && !profile)) {
    return <FullScreenLoader />;
  }

  if (isLoggedIn) {
    if (profile?.role_name === "Staff") {
      return <Redirect href="/staff/(tabs)" />;
    }

    if (profile?.role_name === "IT Admin") {
      return <Redirect href="/admin/(tabs)" />;
    }
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: "#f3eee1" },
      }}
    />
  );
};

export default AuthLayout;
