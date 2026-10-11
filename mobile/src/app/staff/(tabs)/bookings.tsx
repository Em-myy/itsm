import api from "@/utils/axios";
import { BookingType } from "@/utils/helpers";
import { Plus, View } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Bookings = () => {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [isSubmittingBooking, setIsSubmittingBooking] =
    useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(
    null,
  );

  useEffect(() => {
    const fetchBookings = async (): Promise<void> => {
      const response = await api.get("/bookings/mine");
      setBookings(response.data);
    };

    fetchBookings();
  }, []);

  const closeSubmit = () => {
    setIsSubmittingBooking(false);
  };
  return (
    <SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <View>
              <Text>My Tickets</Text>
              <Text> Every request you&apos;ve filed, in one place.</Text>
            </View>
            <TouchableOpacity onPress={() => setIsSubmittingBooking(true)}>
              <Plus size={30} />
              <Text>New Ticket</Text>
            </TouchableOpacity>
          </View>
          {bookings.map((booking) => (
            <View key={booking.id}>
              <Pressable onPress={() => setSelectedTicket(booking)}>
                <Text>{booking.reference}</Text>
                <Text>{booking.purpose}</Text>
                <Text>{booking.venue_name}</Text>
                <Text>{booking.status}</Text>
                <Text>{booking.status}</Text>
                <Text>{booking.start_time}</Text>
                <Text>{booking.end_time}</Text>
                {booking.equipment_needed.map((equip) => (
                  <Text>{equip}</Text>
                ))}
              </Pressable>
            </View>
          ))}

          {isSubmittingBooking && (
            <SubmitTicket initialBookings={bookings} onClose={closeSubmit} />
          )}
          {selectedBooking && (
            <TicketDetails
              ticket={selectedBooking}
              relatedTickets={bookings}
              onClose={() => setSelectedBooking(null)}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Bookings;
