import { StatusBadge, Tag } from "@/components/layout/badges";
import FormMessage from "@/components/layout/form-message";
import VenueDetails from "@/components/venues/VenueDetails";
import { supabase } from "@/lib/supabase";
import api from "@/utils/axios";
import {
  AssetType,
  BookingType,
  colors,
  getEquipmentLabel,
  getStatusStyle,
  VenueType,
} from "@/utils/helpers";
import { format, isSameDay } from "date-fns";
import {
  CalendarClock,
  Check,
  MapPin,
  UserRound,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabKey = "pending" | "approved" | "rejected" | "venues";

type Item =
  | { kind: "booking"; booking: BookingType }
  | { kind: "venue"; venue: VenueType };

const TABS: { key: TabKey; label: string; emptyText: string }[] = [
  {
    key: "pending",
    label: "New",
    emptyText: "No bookings requested",
  },
  {
    key: "approved",
    label: "Approved",
    emptyText: "No approved bookings yet",
  },
  {
    key: "rejected",
    label: "Rejected",
    emptyText: "No rejected bookings yet",
  },
  {
    key: "venues",
    label: "Venues",
    emptyText: "No venues created",
  },
];

const formatBookingWhen = (booking: BookingType): string => {
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);

  return isSameDay(start, end)
    ? `${format(start, "EEE d MMM")} · ${format(start, "h:mm a")} – ${format(end, "h:mm a")}`
    : `${format(start, "d MMM, h:mm a")} – ${format(end, "d MMM, h:mm a")}`;
};

const BookingCard = ({
  booking,
  pending,
  busy,
  confirmingReject,
  isEquipUnderMaintenance,
  onApprove,
  onAskReject,
  onKeep,
  onConfirmReject,
}: {
  booking: BookingType;
  pending: boolean;
  busy: boolean;
  confirmingReject: boolean;
  isEquipUnderMaintenance: (equip: string) => boolean;
  onApprove: () => void;
  onAskReject: () => void;
  onKeep: () => void;
  onConfirmReject: () => void;
}) => {
  const status = getStatusStyle(booking.status);
  const equipments = booking.equipment_needed ?? [];
  const hasMaintenanceIssue = equipments.some(isEquipUnderMaintenance);

  return (
    <View className="flex-row overflow-hidden rounded-card border border-line bg-surface-hover">
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
          <UserRound size={15} color={colors.muted} />
          <Text
            className="ml-2 flex-1 font-sans text-sm text-body"
            numberOfLines={1}
          >
            {" "}
            {[booking.username, booking.department].filter(Boolean).join(" · ")}
          </Text>
        </View>

        <View className="mt-1.5 flex-row items-center">
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
            {formatBookingWhen(booking)}
          </Text>
        </View>

        {equipments.length > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {equipments.map((equip) =>
              pending && isEquipUnderMaintenance(equip) ? (
                <View
                  key={equip}
                  className="rounded-full border border-chart-amber bg-input-bg px-2.5 py-1"
                >
                  <Text className="font-sans-medium text-xs text-chart-amber">
                    {getEquipmentLabel(equip)} · under maintenance
                  </Text>
                </View>
              ) : (
                <Tag key={equip} label={getEquipmentLabel(equip)} />
              ),
            )}
          </View>
        )}

        {pending && hasMaintenanceIssue && (
          <Text className="mt-3 font-sans text-xs text-chart-amber">
            Resolve or swap this equipment before approving the booking.
          </Text>
        )}

        {pending && (
          <View className="mt-4">
            {confirmingReject ? (
              <View>
                <Text className="mb-2 font-sans-medium text-sm text-heading">
                  Reject this booking?
                </Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={onKeep}
                    disabled={busy}
                    className="h-10 flex-1 items-center justify-center rounded-control border border-line bg-input-bg active:opacity-80"
                  >
                    <Text className="font-sans-semibold text-sm text-heading">
                      No
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={onConfirmReject}
                    disabled={busy}
                    className={`h-10 flex-1 flex-row items-center justify-center rounded-control bg-danger active:opacity-80 ${
                      busy ? "opacity-60" : ""
                    }`}
                  >
                    {busy && (
                      <ActivityIndicator
                        size="small"
                        color={colors.cream}
                        className="mr-2"
                      />
                    )}
                    <Text className="font-sans-semibold text-sm text-cream">
                      Yes, reject
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="flex-row gap-2">
                <Pressable
                  onPress={onApprove}
                  disabled={busy}
                  className={`h-10 flex-[2] flex-row items-center justify-center rounded-control bg-button active:bg-button-hover ${
                    busy ? "opacity-60" : ""
                  }`}
                >
                  {busy ? (
                    <ActivityIndicator size="small" color={colors.cream} />
                  ) : (
                    <Check size={16} color={colors.cream} />
                  )}
                  <Text className="ml-1.5 font-sans-semibold text-sm text-cream">
                    {busy
                      ? "Working..."
                      : hasMaintenanceIssue
                        ? "Approve anyway"
                        : "Approve"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={onAskReject}
                  disabled={busy}
                  className={`h-10 flex-1 flex-row items-center justify-center rounded-control border border-danger bg-danger-bg active:opacity-80 ${
                    busy ? "opacity-50" : ""
                  }`}
                >
                  <X size={16} color={colors.danger} />
                  <Text className="ml-1.5 font-sans-semibold text-sm text-danger">
                    Reject
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const AdminBookingPage = () => {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [venues, setVenues] = useState<VenueType[]>([]);
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmingRejectId, setConfirmingRejectId] = useState<number | null>(
    null,
  );
  const [selectedVenue, setSelectedVenue] = useState<VenueType | null>(null);

  const fetchData = async (): Promise<void> => {
    try {
      const [bookingResults, venueResults, assetResults] =
        await Promise.allSettled([
          api.get<BookingType[]>("/bookings"),
          api.get<VenueType[]>("/venues"),
          api.get<AssetType[]>("/assets"),
        ]);

      if (bookingResults.status === "fulfilled") {
        setBookings(bookingResults.value.data);
      } else {
        console.error("Failed to fetch bookings:", bookingResults.reason);
      }

      if (venueResults.status === "fulfilled") {
        setVenues(venueResults.value.data);
      } else {
        console.error("Failed to fetch venues:", venueResults.reason);
      }

      if (assetResults.status === "fulfilled") {
        setAssets(assetResults.value.data);
      } else {
        console.error("Failed to fetch assets:", assetResults.reason);
      }

      setHasError(
        [bookingResults, venueResults, assetResults].some(
          (r) => r.status === "rejected",
        ),
      );
    } catch (error) {
      console.log("Unexpected error during fetch");
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
      .channel("admin_bookings_page")
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

  const runAction = async (
    bookingId: number,
    path: string,
    errorMessage: string,
  ): Promise<void> => {
    setActionError(null);
    setBusyId(bookingId);
    try {
      await api.patch(path, { booking_id: bookingId });
      await fetchData();
    } catch (error: any) {
      console.error(error);
      setActionError(error.response?.data?.message || errorMessage);
    } finally {
      setBusyId(null);
      setConfirmingRejectId(null);
    }
  };

  const isEquipUnderMaintenance = (equipLabel: string): boolean => {
    const matchedAsset = assets.find(
      (a) => `${a.reference} - ${a.asset_type}` === equipLabel,
    );
    return matchedAsset?.status === "Maintenance";
  };

  const pendingBookings = bookings.filter((b) => b.status === "Pending");
  const approvedBookings = bookings.filter((b) => b.status === "Approved");
  const rejectedBookings = bookings.filter((b) => b.status === "Rejected");

  const counts: Record<TabKey, number> = {
    pending: pendingBookings.length,
    approved: approvedBookings.length,
    rejected: rejectedBookings.length,
    venues: venues.length,
  };

  const toBookingItems = (list: BookingType[]): Item[] =>
    list.map((booking) => ({ kind: "booking", booking }));

  const data: Item[] =
    activeTab === "venues"
      ? venues.map((venue) => ({ kind: "venue", venue }))
      : toBookingItems(
          activeTab === "pending"
            ? pendingBookings
            : activeTab === "approved"
              ? approvedBookings
              : rejectedBookings,
        );

  const activeTabInfo = TABS.find((t) => t.key === activeTab)!;

  const message =
    actionError ??
    (hasError ? "Some data couldn't be loaded. Pull down to try again." : null);

  const header = (
    <View className="mb-4">
      <Text className="font-sans-extrabold text-2xl text-heading">
        Booking Approvals
      </Text>
      <Text className="mt-1 font-sans text-sm text-body">
        Requests are cross-checked against the asset register automatically.
      </Text>

      {message && (
        <View className="mt-4">
          <FormMessage message={{ type: "error", text: message }} />
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5 mt-4"
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                setActiveTab(tab.key);
                setActionError(null);
                setConfirmingRejectId(null);
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              className={`h-10 flex-row items-center rounded-full border px-4 ${
                active
                  ? "border-button bg-button"
                  : "border-line bg-surface-hover"
              }`}
            >
              <Text
                className={`font-sans-semibold text-sm ${active ? "text-cream" : "text-body"}`}
              >
                {tab.label}
              </Text>
              <View
                className={`ml-2 min-w-[22px] items-center rounded-full px-1.5 py-0.5 ${
                  active ? "bg-cream" : "bg-input-bg"
                }`}
              >
                <Text
                  className={`font-sans-bold text-xs ${active ? "text-button" : "text-body"}`}
                >
                  {counts[tab.key]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const empty = isLoading ? (
    <View className="items-center py-16">
      <ActivityIndicator size="large" color={colors.button} />
    </View>
  ) : (
    <Text className="py-12 text-center font-sans text-sm text-muted">
      {activeTabInfo.emptyText}
    </Text>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.cream }}
      edges={["top"]}
    >
      <FlatList
        data={data}
        keyExtractor={(item) =>
          item.kind === "booking"
            ? `b-${item.booking.id}`
            : `v-${item.venue.id}`
        }
        renderItem={({ item }) => {
          if (item.kind === "venue") {
            const { venue } = item;
            const equipments = venue.equipments ?? [];
            return (
              <Pressable
                onPress={() => setSelectedVenue(venue)}
                className="rounded-card border border-line bg-surface-hover p-4 active:opacity-80"
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className="mr-3 flex-1 font-sans-bold text-base text-heading"
                    numberOfLines={1}
                  >
                    {venue.name}
                  </Text>
                  <StatusBadge status={venue.status} />
                </View>
                <Text className="mt-1 font-sans text-sm text-body">
                  Seats {venue.capacity}
                </Text>
                {equipments.length > 0 && (
                  <View className="mt-3 flex-row flex-wrap gap-2">
                    {equipments.map((equip) => (
                      <Tag key={equip} label={getEquipmentLabel(equip)} />
                    ))}
                  </View>
                )}
              </Pressable>
            );
          }

          const { booking } = item;
          return (
            <BookingCard
              booking={booking}
              pending={activeTab === "pending"}
              busy={busyId === booking.id}
              confirmingReject={confirmingRejectId === booking.id}
              isEquipUnderMaintenance={isEquipUnderMaintenance}
              onApprove={() =>
                runAction(
                  booking.id,
                  "/bookings/approve",
                  "Couldn't approve this booking.",
                )
              }
              onAskReject={() => setConfirmingRejectId(booking.id)}
              onKeep={() => setConfirmingRejectId(null)}
              onConfirmReject={() =>
                runAction(
                  booking.id,
                  "/bookings/reject",
                  "Couldn't reject this booking.",
                )
              }
            />
          );
        }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={{ padding: 20, paddingBottom: 30, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.button}
            colors={[colors.button]}
          />
        }
      />

      {selectedVenue && (
        <VenueDetails
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
        />
      )}
    </SafeAreaView>
  );
};

export default AdminBookingPage;
