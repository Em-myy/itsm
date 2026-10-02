import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "@/lib/supabase";
import { DEPARTMENTS } from "@/utils/helpers";

const SignUp = () => {
  const [username, onChangeUsername] = useState<string>("");
  const [email, onChangeEmail] = useState<string>("");
  const [department, onChangeDepartment] = useState<string>("");
  const [password, onChangePassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignUpWithEmail = async () => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
          department: department,
        },
        emailRedirectTo: "itsm://auth/callback",
      },
    });
    if (error) {
      Alert.alert(error.message);
      return;
    }
    if (!session) {
      setLoading(false);
      Alert.alert("Please check your inbox for email verification!");
      return;
    }
    setLoading(false);
  };

  return (
    <SafeAreaView>
      <Text>This is the Sign Up page</Text>
      <View>
        <View>
          <Text>Username</Text>
          <TextInput
            value={username}
            onChangeText={onChangeUsername}
            placeholder="Famuyiwa Emmanuel"
          />
        </View>

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
          <Text>Department</Text>
          <Picker onValueChange={onChangeDepartment} selectedValue={department}>
            <Picker.Item label="Select a department" value="" enabled={false} />
            {DEPARTMENTS.map((dept) => (
              <Picker.Item label={dept} value={dept} />
            ))}
          </Picker>
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
          <TouchableOpacity onPress={handleSignUpWithEmail} disabled={loading}>
            <Text>{loading ? "Signing Up..." : "Sign Up"}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Link href="/sign-in">Login</Link>
    </SafeAreaView>
  );
};

export default SignUp;
