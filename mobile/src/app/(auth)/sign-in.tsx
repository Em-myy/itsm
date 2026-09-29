import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

const SignIn = () => {
  const [email, onChangeEmail] = useState<string>("");
  const [password, onChangePassword] = useState<string>("");
  return (
    <SafeAreaView>
      <Text>This is the Sign In page</Text>
      <View>
        <View>
          <Text>Email</Text>
          <TextInput
            onChangeText={onChangeEmail}
            value={email}
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text>Password</Text>
          <TextInput
            onChangeText={onChangePassword}
            value={password}
            keyboardType="visible-password"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
