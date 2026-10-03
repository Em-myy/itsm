import "@/global.css";
import { useAuthContext } from "@/hooks/use-auth-context";
import api from "@/utils/axios";
import { BookingType, TicketType } from "@/utils/helpers";
import axios from "axios";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StaffHomePage = () => {
  const { profile, avatar, initials } = useAuthContext();

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [recentTickets, setRecentTickets] = useState<TicketType[]>([]);
  const [nextBooking, setNextBooking] = useState<BookingType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTicket, setCurrentTicket] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsResults, bookingsResults, recentTickets, nextBooking] =
          await Promise.all([
            api.get<TicketType[]>("/tickets/mine"),
            api.get<BookingType[]>("/bookings/mine"),
            api.get<TicketType[]>("/tickets/recent"),
            api.get<BookingType>("/bookings/next"),
          ]);

        setTickets(ticketsResults.data);
        setBookings(bookingsResults.data);
        setRecentTickets(recentTickets.data);
        setNextBooking(nextBooking.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(
            "API Error:",
            error.response?.data?.message || error.message,
          );
        } else {
          console.log("Unexpected error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingTickets = tickets.filter(
    (ticket) => ticket.status === "Pending",
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "Pending",
  ).length;

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const { width } = useWindowDimensions();
  const cardWidth = width - 32;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fee685",
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className="flex flex-row justify-around">
          {avatar ? (
            <Image
              source={avatar}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              contentFit="cover"
              alt={profile?.username}
            />
          ) : (
            <View
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase text-white ${
                profile?.role_name === "IT Admin" ? "bg-[#795727]" : "bg-button"
              }`}
            >
              <Text>{initials}</Text>
            </View>
          )}

          <Text>{profile?.department}</Text>

          <Text>{profile?.role_name}</Text>
        </View>

        <View>
          <Text>{greeting}</Text>
          <Text>{profile?.username}</Text>
          {isLoading ? (
            <View className="py-5">
              <ActivityIndicator size="small" />
            </View>
          ) : (
            <View>
              <Text>{pendingTickets} Pending Tickets</Text>
              <Text>And</Text>
              <Text>{pendingBookings} Bookings Awaiting Approval</Text>
            </View>
          )}
        </View>

        <View>
          <Text>Recent Requests</Text>
          {isLoading ? (
            <View className="h-40 items-center justify-center">
              <ActivityIndicator size="small" />
            </View>
          ) : recentTickets.length < 1 ? (
            <Text>No tickets submitted yet</Text>
          ) : (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x / width,
                  );
                  setCurrentTicket(index);
                }}
              >
                {recentTickets.map((tickets) => (
                  <View
                    key={tickets.id}
                    style={{ width: cardWidth }}
                    className="mr-2 ml-2 rounded-2xl bg-white p-4"
                  >
                    <Text>{tickets.reference}</Text>
                    <Text>{tickets.title}</Text>
                    <Text>{tickets.status}</Text>
                    <View>
                      <Text>{tickets.department}</Text>
                      <Text>{tickets.category}</Text>
                      <Text>{tickets.priority}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <View className="mt-3 flex-row justify-center gap-2">
                {recentTickets.map((_, index) => (
                  <View
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      currentTicket === index ? "bg-button" : "bg-gray-300"
                    }`}
                  />
                ))}
              </View>{" "}
            </>
          )}
        </View>

        <View>
          <Text>Upcoming Booking</Text>
          {!nextBooking ? (
            <Text>No upcoming booking</Text>
          ) : (
            <View key={nextBooking.id}>
              <Text>{nextBooking.reference}</Text>
              <Text>{nextBooking.purpose}</Text>
              <Text>{nextBooking.status}</Text>
              <Text>{nextBooking.venue_name}</Text>
              <View>
                <Text>{nextBooking.start_time}</Text>
                <Text>-</Text>
                <Text>{nextBooking.end_time}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffHomePage;
