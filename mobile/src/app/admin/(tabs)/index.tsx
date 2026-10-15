import "@/global.css";
import { useAuthContext } from "@/hooks/use-auth-context";
import api from "@/utils/axios";
import { DEPARTMENTS, formerTimeAgo, TicketType } from "@/utils/helpers";
import { useEffect, useState } from "react";
import {
  Button,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RenderHtml from "@native-html/render";
import DOMPurify from "dompurify";

interface ActivityLog {
  id: number;
  action_message: string;
  created_at: string;
}

type CountType = {
  count: number;
};

const { width } = useWindowDimensions();

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

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [bookingsCount, setBookingsCount] = useState<CountType | null>(null);
  const [venuesCount, setVenuesCount] = useState<CountType | null>(null);
  const [assetsCount, setAssetsCount] = useState<CountType | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [
          ticketResults,
          bookingResults,
          assetResults,
          venueResults,
          activityResults,
        ] = await Promise.allSettled([
          api.get<TicketType[]>("/tickets"),
          api.get<CountType>("/admin/bookings/count"),
          api.get<CountType>("/admin/assets/count"),
          api.get<CountType>("/admin/venues/count"),
          api.get<ActivityLog[]>("/activity"),
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

        if (activityResults.status === "fulfilled") {
          setActivities(activityResults.value.data);
        } else {
          console.error(
            "Failed to fetch ticket count:",
            activityResults.reason,
          );
        }
      } catch (error) {
        console.log("Unexpected error during fetch:", error);
      }
    };
    fetchData();
  }, []);

  const formattedActivities = activities.map((log) => ({
    id: String(log.id),
    action: (
      <RenderHtml
        contentWidth={width}
        source={{ html: DOMPurify.sanitize(log.action_message) }}
      />
    ),
    time: formerTimeAgo(log.created_at),
  }));

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
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
      }}
    >
      <Text className="text-7xl font-sans-extrabold text-green-500">
        Admin Home
      </Text>
      <View>
        <Text>{profile.username}</Text>
        <Text>{profile.role_name}</Text>
      </View>
    </SafeAreaView>
  );
};

export default AdminHomePage;
