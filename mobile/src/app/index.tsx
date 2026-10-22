import { useAuthContext } from "@/hooks/use-auth-context";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RootIndex = () => {
  const { profile, isLoggedIn, isLoading } = useAuthContext();

  if (isLoading || (isLoggedIn && !profile)) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-cream">
        <View ="flex-1 items-center justify-center bg-cream">
          <ActivityIndicator size="large" color="#1f4a3b" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/sign-in" />;
  }

  if (profile?.role_name === "Staff") {
    return <Redirect href="/staff" />;
  }

  if (profile?.role_name === "IT Admin") {
    return <Redirect href="/admin" />;
  }

  return <Redirect href="/sign-in" />;
};

export default RootIndex;
