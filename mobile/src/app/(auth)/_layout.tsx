import { Redirect, Stack } from "expo-router";
import { useAuthContext } from "@/hooks/use-auth-context";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AuthLayout = () => {
  const { profile, isLoggedIn, isLoading } = useAuthContext();

  if (isLoading || (isLoggedIn && !profile)) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center bg-cream">
          <ActivityIndicator size="large" color="#1f4a3b" />
        </View>
      </SafeAreaView>
    );
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
