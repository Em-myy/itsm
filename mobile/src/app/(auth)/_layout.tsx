import { Redirect, Stack } from "expo-router";
import "@/global.css";
import { useAuthContext } from "@/hooks/use-auth-context";
import { Text } from "react-native";

const AuthLayout = () => {
  const { profile, isLoggedIn, isLoading } = useAuthContext();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (isLoggedIn) {
    if (profile?.role_name === "Staff") {
      return <Redirect href="/staff/(tabs)" />;
    }

    if (profile?.role_name === "IT Admin") {
      return <Redirect href="/admin/(tabs)" />;
    }
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default AuthLayout;
