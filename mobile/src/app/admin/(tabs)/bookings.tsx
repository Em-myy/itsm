import VenueDetails from "@/components/venues/VenueDetails";
import { supabase } from "@/lib/supabase";
import api from "@/utils/axios";
import {
  AssetType,
  BookingType,
  getEquipmentLabel,
  VenueType,
} from "@/utils/helpers";
import { AlertCircle } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const timeFormatOptions: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
  hour12: false,
};

const formatBookingWhen = (
  booking: BookingType,
): { date: string; time: string } => {
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);

  const date = start.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const time = `${start.toLocaleTimeString("en-GB", timeFormatOptions)}–${end.toLocaleTimeString("en-GB", timeFormatOptions)}`;

  return { date, time };
};

const BookingHistoryCard = ({ booking }: { booking: BookingType }) => {
  const { date, time } = formatBookingWhen(booking);
  const equipments = booking.equipment_needed || [];

  return (
    <View>
      <View>
        <View>
          <Text>{booking.purpose}</Text>
          <Text>
            {booking.username} &middot; {booking.department}
          </Text>
        </View>
        <Text>{booking.reference}</Text>
      </View>

      <Text>
        {booking.venue_name} &middot; {date} &middot; {time}
      </Text>
      {equipments.length > 0 && (
        <View>
          {equipments.map((equip) => (
            <Text key={equip}>{getEquipmentLabel(equip)}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const PendingBookingCard = ({
  booking,
  isProcessing,
  isEquipUnderMaintenance,
  onApprove,
  onReject,
}: {
  booking: BookingType;
  isProcessing: boolean;
  isEquipUnderMaintenance: (equip: string) => boolean;
  onApprove: () => void;
  onReject: () => void;
}) => {
  const { date, time } = formatBookingWhen(booking);
  const equipments = booking.equipment_needed || [];
  const hasMaintenanceIssue = equipments.some(isEquipUnderMaintenance);

  return (
    <View>
      <View>
        <View>
          <Text>{booking.purpose}</Text>
          <Text>
            {booking.username} &middot; {booking.department}
          </Text>
        </View>
        <Text>{booking.reference}</Text>
      </View>

      <Text>
        {booking.venue_name} &middot; {date} &middot; {time}
      </Text>

      {equipments.length > 0 && (
        <View>
          {equipments.map((equip) => {
            const isBroken = isEquipUnderMaintenance(equip);
            return (
              <Text key={equip}>
                {getEquipmentLabel(equip)}
                {isBroken && " — under maintenance"}
              </Text>
            );
          })}
        </View>
      )}

      {hasMaintenanceIssue && (
        <Text>
          {" "}
          Resolve or swap this equipment before approving the booking.
        </Text>
      )}

      <View className="mt-4 flex gap-3">
        <Pressable
          onPress={onApprove}
          disabled={isProcessing}
          className="flex-1 rounded-xl bg-button py-2.5 text-sm font-semibold text-white transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          <Text>
            {isProcessing
              ? "Working..."
              : hasMaintenanceIssue
                ? "Approve anyway"
                : "Approve"}
          </Text>
        </Pressable>
        <Pressable
          onPress={onReject}
          disabled={isProcessing}
          className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          <Text>Reject</Text>
        </Pressable>
      </View>
    </View>
  );
};

const AdminBookingPage = () => {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [venues, setVenues] = useState<VenueType[]>([]);
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<VenueType | null>(null);
  const [processingBookingId, setProcessingBookingId] = useState<number | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

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
        console.error("Failed to fetch ticket count:", bookingResults.reason);
      }

      if (venueResults.status === "fulfilled") {
        setVenues(venueResults.value.data);
      } else {
        console.error("Failed to fetch ticket count:", venueResults.reason);
      }

      if (assetResults.status === "fulfilled") {
        setAssets(assetResults.value.data);
      } else {
        console.error("Failed to fetch ticket count:", assetResults.reason);
      }
    } catch (error) {
      console.log("Unexpected error during fetch");
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

  const handleApproveBooking = async (bookingId: number): Promise<void> => {
    setActionError(null);
    setProcessingBookingId(bookingId);
    try {
      await api.patch("/bookings/approve", { booking_id: bookingId });
    } catch (error: any) {
      setActionError(error.response.data.message || error.message);
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleRejectBooking = async (bookingId: number): Promise<void> => {
    setActionError(null);
    setProcessingBookingId(bookingId);
    try {
      await api.patch("/bookings/reject", { booking_id: bookingId });
    } catch (error: any) {
      setActionError(error.response.data.message || error.message);
    } finally {
      setProcessingBookingId(null);
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

  return (
    <SafeAreaView>
      <ScrollView>
        <View>
          <View>
            <View>
              <Text>Booking Approvals</Text>
              <Text className="mt-1 text-sm text-body">
                Requests are cross-checked against the asset register
                automatically.
              </Text>
            </View>
          </View>

          {actionError && (
            <View className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{actionError}</span>
            </View>
          )}

          {selectedVenue && (
            <Pressable onPress={() => setSelectedVenue(null)}>
              <View>
                <VenueDetails
                  venue={selectedVenue}
                  onClose={() => setSelectedVenue(null)}
                />
              </View>
            </Pressable>
          )}

          <View>
            <View>
              <Text className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-muted">
                Venues
              </Text>
              {venues.length < 1 ? (
                <View>
                  <Text className="text-sm text-body">No venues created</Text>
                </View>
              ) : (
                <View>
                  {venues.map((venue) => {
                    const equipments = venue.equipments || [];
                    return (
                      <Pressable
                        key={venue.id}
                        onPress={() => setSelectedVenue(venue)}
                        className="flex items-stretch cursor-pointer overflow-hidden rounded-xl border border-line bg-white transition hover:border-muted"
                      >
                        <View className="flex-1 p-4">
                          <View className="flex items-start justify-between gap-2">
                            <Text className="text-sm font-semibold text-heading">
                              {venue.name}
                            </Text>
                            <Text>{venue.status}</Text>
                          </View>
                          <Text className="mt-0.5 text-xs text-body">
                            Seats {venue.capacity}
                          </Text>
                          {equipments.length > 0 && (
                            <View className="mt-2 flex flex-wrap gap-1.5">
                              {equipments.map((equip) => (
                                <Text
                                  key={equip}
                                  className="rounded-full bg-input-bg px-2 py-0.5 text-xs text-muted"
                                >
                                  {getEquipmentLabel(equip)}
                                </Text>
                              ))}
                            </View>
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            <View>
              <View>
                <Text className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-muted">
                  Pending Bookings ({pendingBookings.length})
                </Text>
                {pendingBookings.length < 1 ? (
                  <View>
                    <Text className="text-sm text-body">
                      No bookings requested
                    </Text>
                  </View>
                ) : (
                  <View>
                    {pendingBookings.map((booking) => (
                      <PendingBookingCard
                        key={booking.id}
                        booking={booking}
                        isProcessing={processingBookingId === booking.id}
                        isEquipUnderMaintenance={isEquipUnderMaintenance}
                        onApprove={() => handleApproveBooking(booking.id)}
                        onReject={() => handleRejectBooking(booking.id)}
                      />
                    ))}
                  </View>
                )}
              </View>

              <View>
                <Text className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-muted">
                  Approved Bookings ({approvedBookings.length})
                </Text>
                {approvedBookings.length < 1 ? (
                  <View>
                    <Text className="text-sm text-body">
                      No approved bookings yet
                    </Text>
                  </View>
                ) : (
                  <View>
                    {approvedBookings.map((booking) => (
                      <BookingHistoryCard key={booking.id} booking={booking} />
                    ))}
                  </View>
                )}
              </View>

              <View>
                <Text className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-muted">
                  Rejected bookings ({rejectedBookings.length})
                </Text>
                {rejectedBookings.length < 1 ? (
                  <View>
                    <Text className="text-sm text-body">
                      No rejected bookings
                    </Text>
                  </View>
                ) : (
                  <View>
                    {rejectedBookings.map((booking) => (
                      <BookingHistoryCard key={booking.id} booking={booking} />
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminBookingPage;
