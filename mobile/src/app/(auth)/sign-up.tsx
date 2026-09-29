import { Link } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignUp = () => {
  return (
    <SafeAreaView>
      <Text>SignUp</Text>
      <Link href="/sign-in">Login</Link>
    </SafeAreaView>
  );
};

export default SignUp;
