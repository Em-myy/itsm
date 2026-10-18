import { getPriorityColors, getStatusStyle } from "@/utils/helpers";
import { Text, View } from "react-native";

export const StatusBadge = ({ status }: { status?: string | null }) => {
  if (!status) {
    return null;
  }
  const s = getStatusStyle(status);

  return (
    <View className={`flex-row items-center rounded-full px-2.5 py-1 ${s.bg}`}>
      <View className={`mr-1.5 h-2 w-2 rounded-full ${s.dot}`} />
      <Text className={`font-sans-medium text-xs ${s.text}`}>{status}</Text>
    </View>
  );
};

export const Tag = ({ label }: { label?: string | null }) => {
  if (!label) {
    return null;
  }

  return (
    <View className="rounded-full border border-line bg-input-bg px-2.5 py-1">
      <Text className="font-sans-medium text-xs text-body">{label}</Text>
    </View>
  );
};

export const PriorityTag = ({ priority }: { priority?: string | null }) => {
  if (!priority) {
    return null;
  }

  return (
    <View className="rounded-full border border-line bg-input-bg px-2.5 py-1">
      <Text
        className={`font-sans-semibold text-xs ${getPriorityColors(priority)}`}
      >
        {priority}
      </Text>
    </View>
  );
};
