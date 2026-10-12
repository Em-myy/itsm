import api from "@/utils/axios";
import { BookingType, VenueType } from "@/utils/helpers";
import { useState } from "react";
import { Button, Pressable, Text, View } from "react-native";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react-native";
import BookingForm, { BookingFormValues } from "./booking-form";

const BookingDetails = ({
  booking,
  venues,
  onClose,
}: {
  booking: BookingType;
  venues: VenueType[] | null;
  onClose: () => void;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmingCancel, setConfirmingCancel] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isCancelled = booking.status.toLowerCase() === "cancelled";

  const handleCancelBooking = async (bookingId: number): Promise<void> => {
    setError(null);
    setIsCancelling(true);

    try {
      await api.patch("/bookings/cancel", { booking_id: bookingId });
      onClose();
    } catch (error: any) {
      console.error(error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleEditSubmit = async (values: BookingFormValues) => {
    const finalStartDate = new Date(`${values.date}T${values.startTime}:00`);
    const finalEndDate = new Date(`${values.date}T${values.endTime}:00`);

    const bookingPayload = {
      booking_id: values.bookingId,
      purpose: values.purpose,
      venue_id: Number(values.venueId),
      start_time: finalStartDate.toISOString(),
      end_time: finalEndDate.toISOString(),
      equipment_needed: values.equipmentNeeded,
    };

    await api.patch("/bookings/update", bookingPayload);
    onClose();
  };

  if (mode === "edit") {
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    return (
      <Pressable onPress={onClose}>
        <View>
          <View>
            <Button title="Close" onPress={onClose} />

            <Text>Edit booking</Text>
            <Text>{booking.reference}</Text>

            <View>
              <BookingForm
                venues={venues}
                initialValues={{
                  bookingId: booking.id,
                  purpose: booking.purpose,
                  venueId: String(booking.venue_id),
                  date: format(start, "yyyy-MM-dd"),
                  startTime: format(start, "HH:mm"),
                  endTime: format(end, "HH:mm"),
                  equipmentNeeded: booking.equipment_needed ?? [],
                }}
                submitLabel="Save changes"
                submittingLabel="Saving..."
                onSubmit={handleEditSubmit}
                onCancel={() => setMode("view")}
              />
            </View>
          </View>
        </View>
      </Pressable>
    );
  }
  return (
    <View>
      <View>
        <Button title="Close" onPress={onClose} />
        <View>
          <Text>{booking.purpose}</Text>
          <Text>{booking.reference}</Text>
          <Text>{booking.status}</Text>
          <Text>{booking.venue_name}</Text>
          <Text>{booking.department}</Text>
          <Text>
            {new Date(booking.start_time).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
          <Text>
            {new Date(booking.end_time).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
          {booking.equipment_needed.map((equip) => (
            <Text id={equip}>{equip}</Text>
          ))}
        </View>

        {error && (
          <View>
            <AlertCircle />
            <Text>{error}</Text>
          </View>
        )}

        <View>
          {isCancelled || booking.status === "Approved" ? (
            <Button title="Close" onPress={onClose} />
          ) : confirmingCancel ? (
            <>
              <Text>Cancel this booking?</Text>
              <Button
                title="Never mind"
                onPress={() => setConfirmingCancel(false)}
                disabled={isCancelling}
              />
              <Button
                title={isCancelling ? "Cancelling..." : "Confirm cancel"}
                onPress={() => handleCancelBooking(booking.id)}
                disabled={isCancelling}
              />
            </>
          ) : (
            <>
              <Button
                title="Cancel Booking"
                onPress={() => setConfirmingCancel(true)}
              />
              <Button title="Edit" onPress={() => setMode("edit")} />
              <Button title="Close" onPress={onClose} />
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default BookingDetails;
