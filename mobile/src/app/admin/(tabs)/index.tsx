import { useAuthContext } from "@/hooks/use-auth-context";
import api from "@/utils/axios";
import { DEPARTMENTS, TicketType } from "@/utils/helpers";
import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ActivityLog from "@/components/activities/activity-log";
import { supabase } from "@/lib/supabase";

type CountType = {
  count: number;
};

const StatCard = ({
  value,
  label,
  tone = "default",
}: {
  value: number;
  label: string;
  tone?: "default" | "danger";
}): React.ReactElement => {
  return (
    <View className="rounded-2xl border border-line bg-white p-6">
      <Text
        className={`font-serif text-4xl font-bold ${
          tone === "danger" ? "text-red-700" : "text-heading"
        }`}
      >
        {value}
      </Text>
      <Text className="mt-1 text-sm text-body">{label}</Text>
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
  return (
    <SafeAreaView>
      <ScrollView>
        <Text className="text-7xl font-sans-extrabold text-green-500">
          Admin Home
        </Text>
        <View>
          <View>
            <Text>
              {greeting} {profile?.username}
            </Text>

            <Text>
              <Text>
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </Text>
              <Text>&middot;</Text>
              <Text>{profile?.department}</Text>
            </Text>
          </View>

          <View>
            <StatCard
              value={openTickets.length}
              label={openTickets.length <= 1 ? "Open ticket" : "Open tickets"}
            />
            <StatCard
              value={assetsCount?.count ?? 0}
              label={
                assetsCount?.count === 1
                  ? "Asset under maintenance"
                  : "Assets under maintenance"
              }
              tone="danger"
            />
            <StatCard
              value={venuesCount?.count ?? 0}
              label={
                venuesCount?.count === 1 ? "Active venue" : "Active venues"
              }
            />
            <StatCard
              value={bookingsCount?.count ?? 0}
              label={
                bookingsCount?.count === 1
                  ? "Booking awaiting approval"
                  : "Bookings awaiting approval"
              }
            />
          </View>

          <View>
            <View>
              <Text>Tickets by department</Text>

              <View>
                {departmentCounts.map(({ department, count }) => (
                  <View key={department} className="flex items-center gap-3">
                    <Text className="w-24 shrink-0 truncate text-sm text-body sm:w-32 md:w-36">
                      {department}
                    </Text>

                    <View className="h-3 flex-1 rounded-full bg-input-bg">
                      <View
                        className="h-full rounded-full bg-chart-amber"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </View>

                    <Text className="w-6 shrink-0 text-right text-sm font-medium text-heading">
                      {count}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View>
              <View>
                <Text>Recent activity</Text>
                <Text>Live</Text>
              </View>

              <View>
                <ActivityLog />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminHomePage;
