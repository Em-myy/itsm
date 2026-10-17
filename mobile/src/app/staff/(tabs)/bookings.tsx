import BookingDetails from "@/components/bookings/booking-details";
import SubmitBooking from "@/components/bookings/submit-booking";
import { supabase } from "@/lib/supabase";
import api from "@/utils/axios";
import { BookingType, getEquipmentLabel, VenueType } from "@/utils/helpers";
import axios from "axios";
import { Plus } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StaffBookingPage = () => {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [venues, setVenues] = useState<VenueType[]>([]);
  const [isSubmittingBooking, setIsSubmittingBooking] =
    useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(
    null,
  );

  const fetchData = async () => {
    try {
      const [bookingsResult, venuesResult] = await Promise.all([
        api.get<BookingType[]>("/bookings/mine"),
        api.get<VenueType[]>("/venues"),
      ]);

      setBookings(bookingsResult.data);
      setVenues(venuesResult.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(
          "API Error:",
          error.response?.data?.message || error.message,
        );
      } else {
        console.log("Unexpected error:", error);
      }
    }
  };

  useEffect(() => {
    fetchData();

    const handleRealtimeUpdate = () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        fetchData();
      }, 2000);
    };

    const channel = supabase
      .channel("staff_bookings_page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        handleRealtimeUpdate,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "venues" },
        handleRealtimeUpdate,
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
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
              <Text>My Bookings</Text>
              <Text>A list of all your bookings</Text>
            </View>
            <TouchableOpacity onPress={() => setIsSubmittingBooking(true)}>
              <Plus size={30} />
              <Text>Request new booking</Text>
            </TouchableOpacity>
          </View>
          {bookings.map((booking) => (
            <View key={booking.id}>
              <Pressable onPress={() => setSelectedBooking(booking)}>
                <Text>{booking.reference}</Text>
                <Text>{booking.purpose}</Text>
                <Text>{booking.venue_name}</Text>
                <Text>{booking.status}</Text>
                <Text>{booking.start_time}</Text>
                <Text>{booking.end_time}</Text>
                {booking.equipment_needed.map((equip) => (
                  <Text key={equip}>{getEquipmentLabel(equip)}</Text>
                ))}
              </Pressable>
            </View>
          ))}

          {isSubmittingBooking && (
            <SubmitBooking venues={venues} onClose={closeSubmit} />
          )}
          {selectedBooking && (
            <BookingDetails
              booking={selectedBooking}
              venues={venues}
              onClose={() => setSelectedBooking(null)}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default StaffBookingPage;
