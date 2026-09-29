import "@/global.css";
import { Link } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
      }}
    >
      <Text className="text-7xl font-sans-extrabold text-green-500">Home</Text>
      <Link href="/onboarding">Onboarding</Link>
      <Link href="/sign-up">Sign Up</Link>
      <Link href="/sign-in">Sign In</Link>
    </SafeAreaView>
  );
}
