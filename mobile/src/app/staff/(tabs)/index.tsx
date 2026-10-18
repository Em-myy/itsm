import { PriorityTag, StatusBadge, Tag } from "@/components/layout/badges";
import FormMessage from "@/components/layout/form-message";
import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import api from "@/utils/axios";
import {
  BookingType,
  colors,
  formerTimeAgo,
  getEquipmentLabel,
  TicketType,
} from "@/utils/helpers";
import { Image } from "expo-image";
import { CalendarClock, MapPin, Ticket } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CountType = {
  count: number;
};

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) => (
  <View className="flex-1 rounded-card border border-line bg-surface-hover p-4">
    {icon}
    <Text className="mt-3 font-sans-extrabold text-3xl text-heading">
      {value}
    </Text>
    <Text className="mt-0.5 font-sans text-sm text-body">{label}</Text>
  </View>
);

const SectionTitle = ({ children }: { children: string }) => (
  <Text className="mb-3 px-5 font-sans-bold text-lg text-heading">
    {children}
  </Text>
);

const StaffHomePage = () => {
  const { profile, avatar, initials } = useAuthContext();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [ticketsCount, setTicketsCount] = useState<CountType | null>(null);
  const [bookingsCount, setBookingsCount] = useState<CountType | null>(null);
  const [recentTickets, setRecentTickets] = useState<TicketType[]>([]);
  const [nextBooking, setNextBooking] = useState<BookingType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [currentTicket, setCurrentTicket] = useState<number>(0);

  const fetchData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const [ticketsResults, bookingsResults, recentTickets, nextBooking] =
        await Promise.allSettled([
          api.get<CountType>("/tickets/count"),
          api.get<CountType>("/bookings/count"),
          api.get<TicketType[]>("/tickets/recent"),
          api.get<BookingType>("/bookings/next"),
        ]);

      if (ticketsResults.status === "fulfilled") {
        setTicketsCount(ticketsResults.value.data);
      } else {
        console.error("Failed to fetch ticket count:", ticketsResults.reason);
      }

      if (bookingsResults.status === "fulfilled") {
        setBookingsCount(bookingsResults.value.data);
      } else {
        console.error("Failed to fetch ticket count:", bookingsResults.reason);
      }

      if (recentTickets.status === "fulfilled") {
        setRecentTickets(recentTickets.value.data);
      } else {
        console.error("Failed to fetch ticket count:", recentTickets.reason);
      }

      if (nextBooking.status === "fulfilled") {
        setNextBooking(nextBooking.value.data);
      } else {
        console.error("Failed to fetch ticket count:", nextBooking.reason);
      }
    } catch (error) {
      console.log("Unexpected error during fetch:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
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
      .channel("realtime_staff_home_page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        handleRealtimeUpdate,
      )
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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assets" },
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

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const equipment = nextBooking?.equipment_needed ?? [];

  const { width } = useWindowDimensions();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#f3eee1",
      }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.button}
            colors={[colors.button]}
          />
        }
      >
        <View className="flex-row items-center px-5 pb-5 pt-3">
          {avatar ? (
            <Image
              source={avatar}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              contentFit="cover"
              alt={profile?.username}
            />
          ) : (
            <View
              className="h-12 w-12 items-center justify-center rounded-full bg-button
              "
            >
              <Text className="font-sans-bold text-base uppercase text-cream">
                {initials}
              </Text>
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text className="font-sans text-sm text-body">{greeting}</Text>
            <Text
              className="font-sans-extrabold text-xl text-heading"
              numberOfLines={1}
            >
              {profile?.username}
            </Text>
            <Text className="font-sans text-xs text-muted">
              {[profile?.department, profile?.role_name]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
        </View>

        {hasError && (
          <View className="px-5">
            <FormMessage
              message={{
                type: "error",
                text: "Some data couldn't be loaded. Pull down to try again.",
              }}
            />
          </View>
        )}

        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={colors.button} />
          </View>
        ) : (
          <>
            <View className="mb-6 flex-row gap-3 px-5">
              <StatCard
                icon={<Ticket size={22} color={colors.button} />}
                value={ticketsCount?.count ?? 0}
                label="Pending tickets"
              />
              <StatCard
                icon={<CalendarClock size={22} color={colors.button} />}
                value={bookingsCount?.count ?? 0}
                label="Bookings awaiting approval"
              />
            </View>

            <View className="mb-6">
              <SectionTitle>Recent Requests</SectionTitle>
              {recentTickets.length < 1 ? (
                <Text className="px-5 font-sans text-sm text-muted">
                  No tickets submitted yet
                </Text>
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
                        <View className="mx-5 rounded-card border border-line bg-surface-hover p-4">
                          <View className="flex-row items-center justify-between">
                            <Text className="font-sans-medium text-xs text-muted">
                              {ticket.reference}
                            </Text>
                            <StatusBadge status={ticket.status} />
                          </View>
                          <Text
                            className="mt-2 font-sans-bold text-base text-heading"
                            numberOfLines={2}
                          >
                            {ticket.title}
                          </Text>
                          <View className="mt-3 flex-row flex-wrap gap-2">
                            <Tag label={ticket.department} />
                            <Tag label={ticket.category} />
                            <PriorityTag priority={ticket.priority} />
                          </View>
                          <Text className="mt-3 font-sans text-xs text-muted">
                            {formerTimeAgo(ticket.created_at)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>

                  <View className="mt-3 flex-row justify-center gap-2">
                    {recentTickets.map((ticket, index) => (
                      <View
                        key={ticket.id}
                        className={`h-2 w-2 rounded-full ${
                          currentTicket === index ? "bg-button" : "bg-bullet"
                        }`}
                      />
                    ))}
                  </View>
                </>
              )}
            </View>
          </>
        )}

        <View>
          <SectionTitle>Upcoming Booking</SectionTitle>
          {!nextBooking ? (
            <Text className="px-5 font-sans text-sm text-muted">
              No upcoming booking
            </Text>
          ) : (
            <View className="mx-5 rounded-card border border-line bg-surface-hover p-4">
              <View className="flex-row items-center justify-between">
                <Text className="font-sans-medium text-xs text-muted">
                  {nextBooking.reference}
                </Text>
                <StatusBadge status={nextBooking.status} />
              </View>
              <Text
                className="mt-2 font-sans-bold text-base text-heading"
                numberOfLines={2}
              >
                {nextBooking.purpose}
              </Text>
              <View className="mt-3 flex-row items-center">
                <MapPin size={16} color={colors.muted} />
                <Text className="ml-2 font-sans text-sm text-body">
                  {nextBooking.venue_name}
                </Text>
              </View>
              <View className="mt-2 flex-row items-start">
                <CalendarClock size={20} color={colors.muted} />
                <View className="ml-2">
                  <Text className="font-sans text-sm text-body">
                    {new Date(nextBooking.start_time).toLocaleDateString(
                      "en-GB",
                      {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </Text>
                  <Text className="font-sans text-sm text-muted">
                    {`${new Date(nextBooking.start_time).toLocaleTimeString(
                      "en-GB",
                      {
                        hour: "numeric",
                        hour12: true,
                      },
                    )} - ${new Date(nextBooking.end_time).toLocaleTimeString(
                      "en-GB",
                      {
                        hour: "numeric",
                        hour12: true,
                      },
                    )}`}
                  </Text>
                </View>
              </View>
              {equipment.length > 0 && (
                <View className="mt-3 flex-row flex-wrap gap-2">
                  {equipment.map((equip) => (
                    <Tag key={equip} label={getEquipmentLabel(equip)} />
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffHomePage;
