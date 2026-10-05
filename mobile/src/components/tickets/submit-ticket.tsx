import { View, Text, TouchableOpacity } from "react-native";

const SubmitTicket = ({ onClose }: { onClose: () => void }) => {
  return (
    <View>
      <Text>SubmitTicket</Text>
      <TouchableOpacity onPress={onClose}>
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SubmitTicket;
