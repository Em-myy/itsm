import { useAuthContext } from "@/hooks/use-auth-context";
import { Redirect, Tabs } from "expo-router";
import { Text } from "react-native";

const StaffLayout = () => {
  const { profile, isLoggedIn, isLoading } = useAuthContext();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!isLoggedIn || profile?.role_name !== "Staff") {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="tickets" options={{ title: "Tickets" }} />
      <Tabs.Screen name="bookings" options={{ title: "Bookings" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
};

export default StaffLayout;
