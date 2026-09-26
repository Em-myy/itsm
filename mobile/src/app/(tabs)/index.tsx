import "@/global.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding">Onboarding</Link>
      <Link href="/sign-up">Sign Up</Link>
      <Link href="/sign-in">Sign In</Link>
    </View>
  );
}
