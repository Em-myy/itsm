import api from "@/utils/axios";
import {
  BookingType,
  colors,
  getEquipmentLabel,
  VenueType,
} from "@/utils/helpers";
import { ReactNode, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { format, isSameDay } from "date-fns";
import { X } from "lucide-react-native";
import BookingForm, { BookingFormValues } from "./booking-form";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBadge, Tag } from "../layout/badges";
import FormMessage from "../layout/form-message";
import { ActivityIndicator } from "react-native";

const Row = ({
  label,
  children,
  last,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) => (
  <View className={`py-3 ${last ? "" : "border-b border-line"}`}>
    <Text className="mb-1 font-sans-medium text-xs uppercase text-muted">
      {label}
    </Text>
    {children}
  </View>
);

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

  const status = booking.status.toLowerCase();
  const isFinished =
    status === "cancelled" || status === "approved" || status === "rejected";
  const equipment = booking.equipment_needed ?? [];

  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  const sameDay = isSameDay(start, end);

  const handleCancelBooking = async (bookingId: number): Promise<void> => {
    setError(null);
    setIsCancelling(true);

    try {
      await api.patch("/bookings/cancel", { booking_id: bookingId });
      onClose();
    } catch (error: any) {
      console.error(error);
      setError(error.response?.data?.message || error.message);
      setConfirmingCancel(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleEditSubmit = async (values: BookingFormValues) => {
    const newStart = new Date(`${values.date}T${values.startTime}:00`);
    const newEnd = new Date(`${values.date}T${values.endTime}:00`);

    const bookingPayload = {
      booking_id: values.bookingId,
      purpose: values.purpose,
      venue_id: Number(values.venueId),
      start_time: newStart.toISOString(),
      end_time: newEnd.toISOString(),
      equipment_needed: values.equipmentNeeded,
    };

    await api.patch("/bookings/update", bookingPayload);
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
          <View className="flex-row items-start justify-between border-b border-line px-5 py-4">
            <View className="mr-3 flex-1">
              {mode === "edit" ? (
                <>
                  <Text className="font-sans-extrabold text-xl text-heading">
                    Edit booking
                  </Text>
                  <Text className="mt-0.5 font-sans text-sm text-muted">
                    {booking.reference}
                  </Text>
                </>
              ) : (
                <>
                  <View className="mb-2 flex-row items-center gap-2">
                    <Text className="font-sans-medium text-xs text-muted">
                      {booking.reference}
                    </Text>
                    <StatusBadge status={booking.status} />
                  </View>
                  <Text className="font-sans-extrabold text-xl text-heading">
                    {booking.purpose}
                  </Text>
                </>
              )}
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

          {mode === "edit" ? (
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
              </ScrollView>
            </KeyboardAvoidingView>
          ) : (
            <>
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
              >
                <View className="rounded-card border border-line bg-surface-hover px-4">
                  <Row label="Venue">
                    <Text className="font-sans-semibold text-base text-heading">
                      {booking.venue_name}
                    </Text>
                  </Row>

                  {booking.department ? (
                    <Row label="Department">
                      <Tag label={booking.department} />
                    </Row>
                  ) : null}

                  {sameDay ? (
                    <>
                      <Row label="Date">
                        <Text className="font-sans text-base text-heading">
                          {format(start, "EEEE, d MMMM yyyy")}
                        </Text>
                      </Row>

                      <Row label="Time">
                        <Text className="font-sans text-base text-heading">
                          {" "}
                          {format(start, "h:mm a")} – {format(end, "h:mm a")}
                        </Text>
                      </Row>
                    </>
                  ) : (
                    <>
                      <Row label="Starts">
                        <Text className="font-sans text-base text-heading">
                          {format(start, "EEE d MMM yyyy, h:mm a")}
                        </Text>
                      </Row>
                      <Row label="Ends" last={equipment.length === 0}>
                        <Text className="font-sans text-base text-heading">
                          {format(end, "EEE d MMM yyyy, h:mm a")}
                        </Text>
                      </Row>
                    </>
                  )}

                  {equipment.length > 0 && (
                    <Row label="Equipment" last>
                      <View className="flex-row flex-wrap gap-2">
                        {equipment.map((equip) => (
                          <Tag key={equip} label={getEquipmentLabel(equip)} />
                        ))}
                      </View>
                    </Row>
                  )}
                </View>

                {error && (
                  <View className="mt-4">
                    <FormMessage message={{ type: "error", text: error }} />
                  </View>
                )}
              </ScrollView>

              <View className="border-t border-line bg-cream px-5 py-4">
                {isFinished ? (
                  <Text className="text-center font-sans text-sm text-muted">
                    This booking is {status} and can no longer be changed.
                  </Text>
                ) : confirmingCancel ? (
                  <View>
                    <Text className="mb-3 text-center font-sans-medium text-base text-heading">
                      Cancel this booking?
                    </Text>
                    <View className="flex-row gap-3">
                      <Pressable
                        onPress={() => setConfirmingCancel(false)}
                        disabled={isCancelling}
                        className="h-12 flex-1 items-center justify-center rounded-control border border-line bg-surface-hover active:opacity-80"
                      >
                        <Text className="font-sans-semibold text-base text-heading">
                          Never mind
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleCancelBooking(booking.id)}
                        disabled={isCancelling}
                        className={`h-12 flex-1 flex-row items-center justify-center rounded-control bg-danger active:opacity-80 ${
                          isCancelling ? "opacity-60" : ""
                        }`}
                      >
                        {isCancelling && (
                          <ActivityIndicator
                            color={colors.cream}
                            className="mr-2"
                          />
                        )}
                        <Text className="font-sans-semibold text-base text-cream">
                          {isCancelling ? "Cancelling..." : "Yes, cancel"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => {
                        setError(null);
                        setConfirmingCancel(true);
                      }}
                      className="h-12 flex-1 items-center justify-center rounded-control border border-danger bg-danger-bg active:opacity-80"
                    >
                      <Text className="font-sans-semibold text-base text-danger">
                        Cancel booking
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        setError(null);
                        setMode("edit");
                      }}
                      className="h-12 flex-1 items-center justify-center rounded-control bg-button active:bg-button-hover"
                    >
                      <Text className="font-sans-semibold text-base text-cream">
                        Edit
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

export default BookingDetails;
