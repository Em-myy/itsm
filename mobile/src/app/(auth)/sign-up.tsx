import { Link } from "expo-router";
import { View, Text } from "react-native";

const SignUp = () => {
  return (
    <View>
      <Text>SignUp</Text>
      <Link href="/sign-in">Login</Link>
    </View>
  );
};

export default SignUp;
