import { ActivityIndicator, Text } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { useAuthContext } from "@/hooks/use-auth-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "lucide-react-native";

const AdminLayout = () => {
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

  if (!isLoggedIn || profile?.role_name !== "IT Admin") {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="helpdesk" options={{ title: "Helpdesk Board" }} />
      <Tabs.Screen name="bookings" options={{ title: "Booking Approvals" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
};

export default AdminLayout;
