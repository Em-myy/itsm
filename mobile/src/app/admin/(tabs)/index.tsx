import { useAuthContext } from "@/hooks/use-auth-context";
import api from "@/utils/axios";
import { colors, DEPARTMENTS, TicketType } from "@/utils/helpers";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ActivityLog from "@/components/activities/activity-log";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import FormMessage from "@/components/layout/form-message";
import { Building2, CalendarClock, Ticket, Wrench } from "lucide-react-native";

type CountType = {
  count: number;
};

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

const StatCard = ({
  icon,
  value,
  label,
  tone = "default",
}: {
  icon: ReactNode;
  value: number;
  label: string;
  tone?: "default" | "danger";
}): React.ReactElement => {
  return (
    <View className="flex-1 rounded-card border border-line bg-surface-hover p-4">
      <Text
        className={`mt-3 font-sans-extrabold text-3xl ${
          tone === "danger" ? "text-danger" : "text-heading"
        }`}
      >
        {value}
      </Text>
      <Text className="mt-0.5 font-sans text-sm text-body">{label}</Text>
    </View>
  );
};

const AdminHomePage = () => {
  const { profile } = useAuthContext();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [bookingsCount, setBookingsCount] = useState<CountType | null>(null);
  const [venuesCount, setVenuesCount] = useState<CountType | null>(null);
  const [assetsCount, setAssetsCount] = useState<CountType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const fetchData = async (): Promise<void> => {
    try {
      const [ticketResults, bookingResults, assetResults, venueResults] =
        await Promise.allSettled([
          api.get<TicketType[]>("/tickets"),
          api.get<CountType>("/admin/bookings/count"),
          api.get<CountType>("/admin/assets/count"),
          api.get<CountType>("/admin/venues/count"),
        ]);

      if (ticketResults.status === "fulfilled") {
        setTickets(ticketResults.value.data);
      } else {
        console.error("Failed to fetch ticket count:", ticketResults.reason);
      }

      if (bookingResults.status === "fulfilled") {
        setBookingsCount(bookingResults.value.data);
      } else {
        console.error("Failed to fetch ticket count:", bookingResults.reason);
      }

      if (assetResults.status === "fulfilled") {
        setAssetsCount(assetResults.value.data);
      } else {
        console.error("Failed to fetch ticket count:", assetResults.reason);
      }

      if (venueResults.status === "fulfilled") {
        setVenuesCount(venueResults.value.data);
      } else {
        console.error("Failed to fetch ticket count:", venueResults.reason);
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
      .channel("realtime_admin_home_page")
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

  const openTickets = tickets.filter(
    (ticket) => ticket.status !== "Resolved" && ticket.status !== "Cancelled",
  );

  const departmentCounts = DEPARTMENTS.map((department) => ({
    department,
    count: tickets.filter((ticket) => ticket.department === department).length,
  })).sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...departmentCounts.map((item) => item.count), 1);

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const assets = assetsCount?.count ?? 0;
  const venues = venuesCount?.count ?? 0;
  const bookings = bookingsCount?.count ?? 0;
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.cream }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.button}
            colors={[colors.button]}
          />
        }
      >
        <View className="mb-5">
          <Text className="font-sans text-sm text-body">{greeting}</Text>
          <Text
            className="font-sans-extrabold text-2xl text-heading"
            numberOfLines={1}
          >
            {profile?.username}
          </Text>
          <Text className="mt-1 font-sans text-xs text-muted">
            {format(new Date(), "EEEE, d MMMM")}
            {profile?.department ? ` · ${profile.department}` : ""}
          </Text>
        </View>

        {hasError && (
          <FormMessage
            message={{
              type: "error",
              text: "Some data couldn't be loaded. Pull down to try again.",
            }}
          />
        )}

        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={colors.button} />
          </View>
        ) : (
          <>
            <View className="mb-3 flex-row gap-3">
              <StatCard
                icon={<Ticket size={22} color={colors.button} />}
                value={openTickets.length}
                label={plural(
                  openTickets.length,
                  "Open ticket",
                  "Open tickets",
                )}
              />

              <StatCard
                icon={<Wrench size={22} color={colors.danger} />}
                value={assets}
                label={plural(
                  assets,
                  "Asset under maintenance",
                  "Assets under maintenance",
                )}
                tone="danger"
              />
            </View>

            <View className="mb-6 flex-row gap-3">
              <StatCard
                icon={<Building2 size={22} color={colors.button} />}
                value={venues}
                label={plural(venues, "Active venue", "Active venues")}
              />

              <StatCard
                icon={<CalendarClock size={22} color={colors.button} />}
                value={bookings}
                label={plural(
                  bookings,
                  "Booking awaiting approval",
                  "Bookings awaiting approval",
                )}
              />
            </View>

            <View className="mb-4 rounded-card border border-line bg-surface-hover p-5">
              <Text className="mb-4 font-sans-bold text-lg text-heading">
                Tickets by department
              </Text>

              <View className="gap-3">
                {departmentCounts.map(({ department, count }) => (
                  <View key={department} className="flex-row items-center">
                    <View style={{ width: 104, flexShrink: 0 }}>
                      <Text
                        className="mr-3 w-28 font-sans text-sm text-body"
                        numberOfLines={1}
                      >
                        {department}
                      </Text>
                    </View>

                    <View className="h-3 flex-1 overflow-hidden rounded-full bg-input-bg">
                      <View
                        className="h-full rounded-full bg-chart-amber"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </View>
                    <Text className="ml-3 w-6 text-right font-sans-semibold text-sm text-heading">
                      {count}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="rounded-card border border-line bg-surface-hover p-5">
              <View className="flex-row items-center justify-between">
                <Text className="font-sans-bold text-lg text-heading">
                  Recent activity
                </Text>
                <View className="flex-row items-center rounded-full bg-success-bg px-2.5 py-1">
                  <View className="mr-1.5 h-2 w-2 rounded-full bg-success" />
                  <Text className="font-sans-medium text-xs text-success">
                    Live
                  </Text>
                </View>
              </View>

              <ActivityLog />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminHomePage;
