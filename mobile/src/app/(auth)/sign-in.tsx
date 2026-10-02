import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

const SignIn = () => {
  const router = useRouter();

  const [email, onChangeEmail] = useState<string>("");
  const [password, onChangePassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignInWithEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert(error.message);
        return;
      }

      router.replace("/staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <Text>This is the Sign In page</Text>
      <View>
        <View>
          <Text>Email</Text>
          <TextInput
            onChangeText={onChangeEmail}
            value={email}
            placeholder="email@address.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text>Password</Text>
          <TextInput
            onChangeText={onChangePassword}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize="none"
          />
        </View>

        <View>
          <TouchableOpacity onPress={handleSignInWithEmail} disabled={loading}>
            <Text>{loading ? "Signing In..." : "Sign In"}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Link href="/sign-up">Sign Up</Link>
    </SafeAreaView>
  );
};

export default SignIn;
