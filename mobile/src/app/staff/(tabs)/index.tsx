import "@/global.css";
import { useAuthContext } from "@/hooks/use-auth-context";
import api from "@/utils/axios";
import { BookingType, TicketType } from "@/utils/helpers";
import axios from "axios";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CountType = {
  count: number;
};

const StaffHomePage = () => {
  const { profile, avatar, initials } = useAuthContext();

  const [ticketsCount, setTicketsCount] = useState<CountType | null>(null);
  const [bookingsCount, setBookingsCount] = useState<CountType | null>(null);
  const [recentTickets, setRecentTickets] = useState<TicketType[]>([]);
  const [nextBooking, setNextBooking] = useState<BookingType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTicket, setCurrentTicket] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsResults, bookingsResults, recentTickets, nextBooking] =
          await Promise.all([
            api.get<CountType>("/tickets/count"),
            api.get<CountType>("/bookings/count"),
            api.get<TicketType[]>("/tickets/recent"),
            api.get<BookingType>("/bookings/next"),
          ]);

        setTicketsCount(ticketsResults.data);
        setBookingsCount(bookingsResults.data);
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

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const { width } = useWindowDimensions();

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
              <Text>{ticketsCount?.count ?? 0} Pending Tickets</Text>
              <Text>And</Text>
              <Text>
                {bookingsCount?.count ?? 0} Bookings Awaiting Approval
              </Text>
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
                {recentTickets.map((ticket) => (
                  <View key={ticket.id} style={{ width }}>
                    <View className="mx-4 rounded-2xl bg-white p-4">
                      <Text>{ticket.reference}</Text>
                      <Text>{ticket.title}</Text>
                      <Text>{ticket.status}</Text>
                      <View className="flex flex-row gap-2">
                        <Text>{ticket.department}</Text>
                        <Text>{ticket.category}</Text>
                        <Text>{ticket.priority}</Text>
                      </View>
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
              </View>
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
