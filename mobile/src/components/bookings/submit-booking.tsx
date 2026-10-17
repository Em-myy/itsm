import BookingForm, { BookingFormValues } from "./booking-form";
import api from "@/utils/axios";
import { VenueType } from "@/utils/helpers";
import { Text, TouchableOpacity, View } from "react-native";

interface BookingComponentType {
  venues: VenueType[] | null;
  onClose: () => void;
}

const SubmitBooking = ({ venues, onClose }: BookingComponentType) => {
  const handleSubmit = async (values: BookingFormValues): Promise<void> => {
    const finalStartDate = new Date(`${values.date}T${values.startTime}:00`);
    const finalEndDate = new Date(`${values.date}T${values.endTime}:00`);

    const bookingPayload = {
      purpose: values.purpose,
      venue_id: Number(values.venueId),
      start_time: finalStartDate.toISOString(),
      end_time: finalEndDate.toISOString(),
      equipment_needed: values.equipmentNeeded,
    };

    await api.post("/bookings", bookingPayload);

    onClose();
  };

  return (
    <View>
      <Text>SubmitTicket</Text>
      <TouchableOpacity onPress={onClose}>
        <Text>Close</Text>
      </TouchableOpacity>
      <BookingForm
        venues={venues}
        submitLabel="Book hall"
        submittingLabel="Booking..."
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </View>
  );
};

export default SubmitBooking;
