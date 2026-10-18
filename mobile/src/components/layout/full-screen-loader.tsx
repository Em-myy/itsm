import { colors } from "@/utils/helpers";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FullScreenLoader = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color={colors.button} />
      </View>
    </SafeAreaView>
  );
};

export default FullScreenLoader;
