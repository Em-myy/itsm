import { Stack } from "expo-router";
import "@/global.css";
import { useFonts } from "expo-font";
import AuthProvider from "@/providers/auth-provider";
import SplashScreenController from "@/components/layout/splash-screen-controller";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/utils/helpers";

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    "sans-regular": require("@/assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("@/assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("@/assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("@/assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("@/assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("@/assets/fonts/PlusJakartaSans-Light.ttf"),
    "sans-italic": require("@/assets/fonts/PlusJakartaSans-Italic.ttf"),
  });

  if (!fontsLoaded && fontsError) {
    return null;
  }

  return (
    <AuthProvider>
      <SplashScreenController />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.cream },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="staff/(tabs)" />
        <Stack.Screen name="admin/(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
