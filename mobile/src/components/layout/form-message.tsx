import { colors, FormMessageData } from "@/utils/helpers";
import { CircleAlert, CircleCheck } from "lucide-react-native";
import { View, Text } from "react-native";

const FormMessage = ({ message }: { message: FormMessageData }) => {
  if (!message) {
    return null;
  }

  const isError = message.type === "error";
  const Icon = isError ? CircleAlert : CircleCheck;
  return (
    <View
      accessibilityRole="alert"
      className={`mb-4 flex-row items-start rounded-control border px-3 py-3 ${
        isError ? "border-danger bg-danger-bg" : "border-success bg-success-bg"
      }`}
    >
      <Icon size={18} color={isError ? colors.danger : colors.success} />
      <Text
        className={`ml-2 flex-1 font-sans-medium text-sm ${
          isError ? "text-danger" : "text-success"
        }`}
      >
        {message.text}
      </Text>
    </View>
  );
};

export default FormMessage;
