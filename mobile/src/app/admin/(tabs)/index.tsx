import "@/global.css";
import { useAuthContext } from "@/hooks/use-auth-context";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AdminHomePage = () => {
  const { profile, handleSignout } = useAuthContext();
  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
      }}
    >
      <Text className="text-7xl font-sans-extrabold text-green-500">
        Admin Home
      </Text>
      <View>
        <Text>{profile?.username}</Text>
        <Text>{profile?.role_name}</Text>
      </View>
      <Button title="Sign Out" onPress={handleSignout} />
    </SafeAreaView>
  );
};

export default AdminHomePage;
