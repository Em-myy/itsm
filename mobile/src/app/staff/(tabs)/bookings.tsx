import BookingDetails from "@/components/bookings/booking-details";
import SubmitBooking from "@/components/bookings/submit-booking";
import { StatusBadge, Tag } from "@/components/layout/badges";
import FormMessage from "@/components/layout/form-message";
import { supabase } from "@/lib/supabase";
import api from "@/utils/axios";
import {
  BookingType,
  colors,
  getEquipmentLabel,
  getStatusStyle,
  VenueType,
} from "@/utils/helpers";
import { format, isSameDay } from "date-fns";
import { CalendarClock, CalendarDays, MapPin, Plus } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_EQUIPMENTS_TAGS = 3;

const BookingCard = ({
  booking,
  onPress,
}: {
  booking: BookingType;
  onPress: () => void;
}) => {
  const status = getStatusStyle(booking.status);
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  const equipment = booking.equipment_needed ?? [];
  const extra = equipment.length - MAX_EQUIPMENTS_TAGS;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row overflow-hidden rounded-card border border-line bg-surface-hover active:opacity-80"
    >
      <View className={`w-1.5 ${status.accent}`} />

      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-sans-medium text-xs text-muted">
            {booking.reference}
          </Text>
          <StatusBadge status={booking.status} />
        </View>
        <Text
          className="mt-2 font-sans-bold text-base text-heading"
          numberOfLines={2}
        >
          {booking.purpose}
        </Text>

        <View className="mt-3 flex-row items-center">
          <MapPin size={15} color={colors.muted} />
          <Text
            className="ml-2 flex-1 font-sans text-sm text-body"
            numberOfLines={1}
          >
            {booking.venue_name}
          </Text>
        </View>

        <View className="mt-1.5 flex-row items-center">
          <CalendarClock size={15} color={colors.muted} />
          <Text className="ml-2 flex-1 font-sans text-sm text-body">
            {isSameDay(start, end)
              ? `${format(start, "EEE d MMM")} · ${format(start, "h:mm a")} – ${format(end, "h:mm a")}`
              : `${format(start, "d MMM, h:mm a")} – ${format(end, "d MMM, h:mm a")}`}
          </Text>
        </View>

        {equipment.length > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {equipment.slice(0, MAX_EQUIPMENTS_TAGS).map((equip) => (
              <Tag key={equip} label={getEquipmentLabel(equip)} />
            ))}
            {extra > 0 && <Tag label={`+${extra} more`} />}
          </View>
        )}
      </View>
    </Pressable>
  );
};

const StaffBookingPage = () => {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [venues, setVenues] = useState<VenueType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSubmittingBooking, setIsSubmittingBooking] =
    useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(
    null,
  );

  const fetchData = async () => {
    try {
      const [bookingsResult, venuesResult] = await Promise.allSettled([
        api.get<BookingType[]>("/bookings/mine"),
        api.get<VenueType[]>("/venues"),
      ]);

      if (bookingsResult.status === "fulfilled") {
        setBookings(bookingsResult.value.data);
      } else {
        console.error("Failed to fetch bookings:", bookingsResult.reason);
      }

      if (venuesResult.status === "fulfilled") {
        setVenues(venuesResult.value.data);
      } else {
        console.error("Failed to fetch venues:", venuesResult.reason);
      }

      setHasError(
        bookingsResult.status === "rejected" ||
          venuesResult.status === "rejected",
      );
    } catch (error) {
      console.log("Unexpected error", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
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

  const header = (
    <View className="mb-5">
      <View className="flex-row items-start justify-between">
        <View className="mr-3 flex-1">
          <Text className="font-sans-extrabold text-2xl text-heading">
            My Bookings
          </Text>
          <Text className="mt-1 font-sans text-sm text-body">
            A list of all your bookings
          </Text>
        </View>
        <Pressable
          onPress={() => setIsSubmittingBooking(true)}
          className="h-11 flex-row items-center rounded-control bg-button px-4 active:bg-button-hover"
          accessibilityRole="button"
          accessibilityLabel="Request a new booking"
        >
          <Plus size={18} color={colors.cream} />
          <Text className="ml-1.5 font-sans-semibold text-sm text-cream">
            Request booking
          </Text>
        </Pressable>
      </View>

      {hasError && (
        <View className="mt-4">
          <FormMessage
            message={{
              type: "error",
              text: "Some data couldn't be loaded. Pull down to try again.",
            }}
          />
        </View>
      )}
    </View>
  );

  const empty = isLoading ? (
    <View className="items-center py-16">
      <ActivityIndicator size="large" color={colors.button} />
    </View>
  ) : hasError ? null : (
    <View className="items-center py-16">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full border border-line bg-surface-hover">
        <CalendarDays size={16} color={colors.muted} />
      </View>
      <Text className="font-sans-bold text-lg text-heading">
        No bookings yet
      </Text>
      <Text className="mt-1 text-center font-sans text-sm text-body">
        Tap &quot;Request booking&quot; to reserve a venue.
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f3eee1" }}
      edges={["top"]}
    >
      <FlatList
        data={bookings}
        keyExtractor={(booking) => String(booking.id)}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => setSelectedBooking(item)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={{ padding: 20, paddingBottom: 30, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.button}
            colors={[colors.button]}
          />
        }
      />

      {isSubmittingBooking && (
        <SubmitBooking
          venues={venues}
          onClose={() => setIsSubmittingBooking(false)}
        />
      )}

      {selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          venues={venues}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </SafeAreaView>
  );
};

export default StaffBookingPage;
