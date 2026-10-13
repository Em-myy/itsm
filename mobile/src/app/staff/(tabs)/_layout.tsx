import { useAuthContext } from "@/hooks/use-auth-context";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StaffLayout = () => {
  const { profile, isLoggedIn, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <SafeAreaView>
        <View>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn || profile?.role_name !== "Staff") {
    return <Redirect href="/sign-in" />;
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
