import { Link } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignUp = () => {
  const [username, onChangeUsername] = useState<string>("");
  return (
    <SafeAreaView>
      <Text>This is the Sign Up page</Text>
      <View>
        <View>
          <Text>Username</Text>
          <TextInput />
        </View>
      </View>
      <Link href="/sign-in">Login</Link>
    </SafeAreaView>
  );
};

export default SignUp;
