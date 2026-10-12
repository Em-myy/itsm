import BookingForm, { BookingFormValues } from "./booking-form";
import api from "@/utils/axios";
import { useEffect, useState } from "react";
import { VenueType } from "@/utils/helpers";
import { format } from "date-fns";
import { Text, TouchableOpacity, View } from "react-native";

interface BookingComponentType {
  venues: VenueType[] | null;
  preSelectedDate?: Date | null;
  onClose: () => void;
}

const SubmitBooking = ({
  venues,
  preSelectedDate,
  onClose,
}: BookingComponentType) => {
  const [initialDate, setInitialDate] = useState<string>("");

  useEffect(() => {
    if (preSelectedDate) {
      setInitialDate(format(preSelectedDate, "yyyy-MM-dd"));
    }
  }, [preSelectedDate]);

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
        key={initialDate}
        venues={venues}
        initialValues={{ date: initialDate }}
        submitLabel="Book hall"
        submittingLabel="Booking..."
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </View>
  );
};

export default SubmitBooking;
