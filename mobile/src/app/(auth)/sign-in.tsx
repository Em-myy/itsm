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
import { useRef, useState } from "react";
import { Link } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, LifeBuoy } from "lucide-react-native";
import { colors, FormMessageData } from "@/utils/helpers";
import FormMessage from "@/components/layout/form-message";

const SignIn = () => {
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<FormMessageData>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  const onChangeEmail = (e: string): void => {
    setEmail(e);
    setMessage(null);
  };

  const onChangePassword = (p: string): void => {
    setPassword(p);
    setMessage(null);
  };

  const handleSignInWithEmail = async (): Promise<void> => {
    if (!canSubmit) {
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
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
              <LifeBuoy size={32} color={colors.cream} />
            </View>
            <Text className="font-sans-extrabold text-2xl text-heading">
              Welcome back
            </Text>
            <Text className="mt-1 text-center text-sm font-sans text-body">
              Sign in to the IT Help Desk
            </Text>
          </View>

          <View className="rounded-card border border-line bg-surface-hover p-5">
            <FormMessage message={message} />

            <View className="mb-4">
              <Text className="mb-1.5 font-sans-medium text-sm text-heading">
                Email
              </Text>
              <TextInput
                onChangeText={onChangeEmail}
                value={email}
                placeholder="you@ojolga.gov.ng"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                className="h-12 rounded-control border border-line bg-input-bg px-4 font-sans text-base text-heading focus:border-sage"
              />
            </View>

            <View className="mb-2">
              <Text className="mb-1.5 font-sans-medium text-sm text-heading">
                Password
              </Text>
              <View className="h-12 flex-row items-center rounded-control border border-line bg-input-bg pl-4 pr-2">
                <TextInput
                  ref={passwordRef}
                  onChangeText={onChangePassword}
                  value={password}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoComplete="password"
                  returnKeyType="go"
                  onSubmitEditing={handleSignInWithEmail}
                  className="flex-1 font-sans text-base text-heading"
                />
                <Pressable
                  onPress={() => setShowPassword((p) => !p)}
                  hitSlop={8}
                  className="p-2"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <Eye size={20} color={colors.muted} />
                  ) : (
                    <EyeOff size={20} color={colors.muted} />
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleSignInWithEmail}
              disabled={!canSubmit}
              className={`h-12 flex-row items-center justify-center rounded-control bg-button active:bg-button-hover ${
                canSubmit ? "" : "opacity-50"
              }`}
            >
              {loading && (
                <ActivityIndicator color={colors.cream} className="mr-2" />
              )}
              <Text className="font-sans-semibold text-base text-cream">
                {loading ? "Signing In..." : "Sign in"}
              </Text>
            </Pressable>
          </View>

          <View className="mt-6 flex-row justify-center">
            <Text className="font-sans text-sm text-body">
              Don't have an account?{" "}
            </Text>
            <Link href="/sign-up">
              <Text className="font-sans-semibold text-sm text-button">
                Sign Up
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
