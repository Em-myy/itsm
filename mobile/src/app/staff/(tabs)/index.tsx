import "@/global.css";
import { JwtPayload } from "@supabase/supabase-js";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../../lib/supabase";

export default function App() {
  const router = useRouter();

  const [claims, setClaims] = useState<JwtPayload | null>(null);

  useEffect(() => {
    const loadClaims = async () => {
      const { data } = await supabase.auth.getClaims();
      setClaims(data?.claims ?? null);
    };

    loadClaims();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadClaims();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Sign Out Error");
      return;
    }
    router.replace("/sign-in");
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
      }}
    >
      <Text className="text-7xl font-sans-extrabold text-green-500">Home</Text>
      <View>
        <Text>{claims?.user_metadata?.username}</Text>
        <Text>{claims?.user_metadata?.role_id}</Text>
      </View>
      <TouchableOpacity onPress={handleSignOut}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
