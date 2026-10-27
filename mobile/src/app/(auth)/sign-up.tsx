import { Link } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { colors, FormMessageData } from "@/utils/helpers";
import { Eye, EyeOff, UserPlus } from "lucide-react-native";
import FormMessage from "@/components/layout/form-message";
import {
  AndroidDepartmentHelper,
  IOSDepartmentHelper,
} from "@/components/layout/department-helper";

const SignUp = () => {
  const emailRef = useRef<TextInput>(null);

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<FormMessageData>(null);

  const canSubmit =
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    department !== "" &&
    password.length >= 6;
  !loading;

  const edit = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setMessage(null);
  };

  const handleSignUpWithEmail = async () => {
    if (!canSubmit) {
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
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
        setMessage({ type: "error", text: error.message });
        return;
      }

      if (!session) {
        setMessage({
          type: "success",
          text: "Account created. Check your inbox to verify your email, then sign in.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Something went wrong. Check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-cream">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-10 web:mx-auto web:w-full web:max-w-md"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-card bg-button">
              <UserPlus size={30} color={colors.cream} />
            </View>

            <Text className="font-sans-extrabold text-2xl text-heading">
              Create your account
            </Text>
            <Text className="mt-1 text-center font-sans text-sm text-body">
              Register to submit and track IT tickets
            </Text>
          </View>

          <View className="rounded-card border border-line bg-surface-hover p-5">
            <FormMessage message={message} />

            <View className="mb-4">
              <Text className="mb-1.5 font-sans-medium text-sm text-heading">
                Username
              </Text>
              <TextInput
                value={username}
                onChangeText={edit(setUsername)}
                placeholder="e.g Famuyiwa Emmanuel"
                placeholderTextColor={colors.muted}
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                className="h-12 rounded-control border border-line bg-input-bg px-4 font-sans text-base text-heading focus:border-sage"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1.5 font-sans-medium text-sm text-heading">
                Email
              </Text>
              <TextInput
                ref={emailRef}
                onChangeText={edit(setEmail)}
                value={email}
                placeholder="email@address.com"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                returnKeyType="done"
                className="h-12 rounded-control border border-line bg-input-bg px-4 font-sans text-base text-heading focus:border-sage"
              />
            </View>

            {Platform.OS === "ios" ? (
              <IOSDepartmentHelper
                value={department}
                onChange={edit(setDepartment)}
              />
            ) : (
              <AndroidDepartmentHelper
                value={department}
                onChange={edit(setDepartment)}
              />
            )}

            <View className="mb-5">
              <Text className="mb-1.5 font-sans-medium text-sm text-heading">
                Password
              </Text>
              <View className="h-12 flex-row items-center rounded-control border border-line bg-input-bg pl-4 pr-2">
                <TextInput
                  onChangeText={edit(setPassword)}
                  value={password}
                  secureTextEntry={!showPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  returnKeyType="go"
                  onSubmitEditing={handleSignUpWithEmail}
                  className="flex-1 font-sans text-base text-heading"
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  className="p-2"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.muted} />
                  ) : (
                    <Eye size={20} color={colors.muted} />
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleSignUpWithEmail}
              disabled={!canSubmit}
              className={`h-12 flex-row items-center justify-center rounded-control bg-button active:bg-button-hover ${
                canSubmit ? "" : "opacity-50"
              }`}
            >
              {loading && (
                <ActivityIndicator
                  size="large"
                  color={colors.cream}
                  className="mr-2"
                />
              )}
              <Text className="font-sans-semibold text-base text-cream">
                {loading ? "Creating account..." : "Sign up"}
              </Text>
            </Pressable>
          </View>

          <View className="mt-6 flex-row justify-center">
            <Text className="font-sans font-sm text-body">
              {" "}
              Already have an account?{" "}
            </Text>
            <Link
              href="/sign-in"
              className="font-sans-semibold text-sm text-button"
            >
              Sign In
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
