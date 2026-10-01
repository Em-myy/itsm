import { useRouter } from "expo-router";
import { useEffect } from "react";
import * as Linking from "expo-linking";
import { ActivityIndicator, Alert, View } from "react-native";
import { supabase } from "../../../lib/supabase";

const AuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async (url: string) => {
      try {
        const { queryParams } = Linking.parse(url);
        const code = queryParams?.code;

        if (typeof code !== "string") {
          Alert.alert("Authentication Error", "No authentication code found.");
          router.replace("/sign-in");
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          Alert.alert("Authentication Error", error.message);
          router.replace("/sign-in");
          return;
        }

        router.replace("/staff");
      } catch (error) {
        Alert.alert(
          "Authentication Error",
          "Something went wrong while signing you in.",
        );
        router.replace("/sign-in");
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleCallback(url);
      }
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleCallback(url);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);
  return (
    <View>
      <ActivityIndicator />
    </View>
  );
};

export default AuthCallback;
