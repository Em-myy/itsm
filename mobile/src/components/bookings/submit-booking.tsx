import BookingForm, { BookingFormValues } from "./booking-form";
import api from "@/utils/axios";
import { colors, VenueType } from "@/utils/helpers";
import { X } from "lucide-react-native";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface BookingComponentType {
  venues: VenueType[] | null;
  onClose: () => void;
}

const SubmitBooking = ({ venues, onClose }: BookingComponentType) => {
  const handleSubmit = async (values: BookingFormValues): Promise<void> => {
    const start = new Date(`${values.date}T${values.startTime}:00`);
    const end = new Date(`${values.date}T${values.endTime}:00`);

    const bookingPayload = {
      purpose: values.purpose,
      venue_id: Number(values.venueId),
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      equipment_needed: values.equipmentNeeded,
    };

    await api.post("/bookings", bookingPayload);

    onClose();
  };

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#f3eee1" }}
          edges={Platform.OS === "ios" ? ["bottom"] : ["top", "bottom"]}
        >
          <View className="flex-row items-center justify-between border-b border-line px-5 py-4">
            <View className="mr-3 flex-1">
              <Text className="font-sans-extrabold text-xl text-heading">
                Book a venue
              </Text>
              <Text className="mt-0.5 font-sans text-sm text-body">
                {" "}
                Pick a hall, a time slot and any equipment you need.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-10 w-10 items-center justify-center rounded-full border border-line bg-surface-hover active:opacity-80"
              accessibilityLabel="Close"
            >
              <X size={20} color={colors.heading} />
            </Pressable>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              <BookingForm
                venues={venues}
                submitLabel="Book hall"
                submittingLabel="Booking..."
                onSubmit={handleSubmit}
                onCancel={onClose}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

export default SubmitBooking;
