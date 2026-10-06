"use client";

import VenueDetails from "@/components/venues/VenueDetails";
import VenueForm, { VenueFormType } from "@/components/venues/VenueForm";
import api from "@/lib/axios";
import { AssetType, BookingType, VenueType } from "@/lib/types";
import { getEquipmentLabel } from "@/utils/format-helpers";
import { getStatusStyle } from "@/utils/status-styles";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface VenueSubmitType {
  id: number;
  name: string;
  capacity: number;
  status: string;
  equipments: string[];
}

interface BookingClientProps {
  initialBookings: BookingType[];
  initialVenues: VenueType[];
  initialAssets: AssetType[];
}

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
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-heading">
            {booking.purpose}
          </p>
          <p className="text-xs text-body">
            {booking.username} &middot; {booking.department}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-input-bg px-2.5 py-1 font-mono text-xs text-muted">
          {booking.reference}
        </span>
      </div>

      <p className="mt-2 text-sm text-body">
        {booking.venue_name} &middot; {date} &middot; {time}
      </p>
      {equipments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {equipments.map((equip) => (
            <span
              key={equip}
              className="rounded-full bg-input-bg px-2.5 py-1 text-xs text-body"
            >
              {getEquipmentLabel(equip)}
            </span>
          ))}
        </div>
      )}
    </div>
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
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-heading">
            {booking.purpose}
          </p>
          <p className="text-xs text-body">
            {booking.username} &middot; {booking.department}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-input-bg px-2.5 py-1 font-mono text-xs text-muted">
          {booking.reference}
        </span>
      </div>

      <p className="mt-2 text-sm text-body">
        {booking.venue_name} &middot; {date} &middot; {time}
      </p>

      {equipments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {equipments.map((equip) => {
            const isBroken = isEquipUnderMaintenance(equip);
            return (
              <span
                key={equip}
                className={`rounded-full px-2.5 py-1 text-xs ${
                  isBroken ? "bg-red-50 text-red-700" : "bg-input-bg text-body"
                }`}
              >
                {getEquipmentLabel(equip)}
                {isBroken && " — under maintenance"}
              </span>
            );
          })}
        </div>
      )}

      {hasMaintenanceIssue && (
        <p className="mt-2 text-xs text-red-700">
          {" "}
          Resolve or swap this equipment before approving the booking.
        </p>
      )}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onApprove}
          disabled={isProcessing}
          className="flex-1 rounded-xl bg-button py-2.5 text-sm font-semibold text-white transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          {isProcessing
            ? "Working..."
            : hasMaintenanceIssue
              ? "Approve anyway"
              : "Approve"}
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={isProcessing}
          className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

const BookingClientPage = ({
  initialBookings,
  initialVenues,
  initialAssets,
}: BookingClientProps) => {
  const supabase = createClient();
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueType | null>(null);
  const [isSubmittingVenue, setIsSubmittingVenue] = useState<boolean>(false);
  const [processingBookingId, setProcessingBookingId] = useState<number | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("realtime_bookings_page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "venues" },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assets" },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  const handleCreateVenue = async (data: VenueFormType) => {
    setIsSubmittingVenue(true);
    try {
      await api.post("/venues", data);

      setIsCreateOpen(false);
    } finally {
      setIsSubmittingVenue(false);
    }
  };

  const handleUpdateVenue = async (data: VenueSubmitType) => {
    const venuePayload = {
      venue_id: data.id,
      name: data.name,
      capacity: data.capacity,
      status: data.status,
      equipments: data.equipments,
    };

    await api.patch("/venues/update", venuePayload);
  };

  const handleDeleteVenue = async (venueId: number) => {
    await api.patch("/venues/cancel", { venue_id: venueId });
  };

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
    const matchedAsset = initialAssets.find(
      (a) => `${a.reference} - ${a.asset_type}` === equipLabel,
    );
    return matchedAsset?.status === "Maintenance";
  };

  const pendingBookings = initialBookings.filter((b) => b.status === "Pending");
  const approvedBookings = initialBookings.filter(
    (b) => b.status === "Approved",
  );
  const rejectedBookings = initialBookings.filter(
    (b) => b.status === "Rejected",
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-heading">
            Booking Approvals
          </h1>
          <p className="mt-1 text-sm text-body">
            Requests are cross-checked against the asset register automatically.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-button px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Venue
        </button>
      </div>

      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <VenueForm
              availableAssets={initialAssets}
              onSubmit={handleCreateVenue}
              onCancel={() => setIsCreateOpen(false)}
              isSubmitting={isSubmittingVenue}
            />
          </div>
        </div>
      )}

      {selectedVenue && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedVenue(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <VenueDetails
              venue={selectedVenue}
              availableAssets={initialAssets}
              onClose={() => setSelectedVenue(null)}
              onUpdate={handleUpdateVenue}
              onDelete={handleDeleteVenue}
            />
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-muted">
            Venues
          </h2>
          {initialVenues.length < 1 ? (
            <div className="rounded-xl border border-dashed border-line bg-white px-4 py-8 text-center">
              <p className="text-sm text-body">No venues created</p>
            </div>
          ) : (
            <div className="space-y-3">
              {initialVenues.map((venue) => {
                const style = getStatusStyle(venue.status);
                const equipments = venue.equipments || [];
                return (
                  <div
                    key={venue.id}
                    onClick={() => setSelectedVenue(venue)}
                    className="flex items-stretch cursor-pointer overflow-hidden rounded-xl border border-line bg-white transition hover:border-muted"
                  >
                    <span className={`w-1 shrink-0 ${style.accent}`} />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-heading">
                          {venue.name}
                        </p>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${style.pill}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                          />
                          {venue.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-body">
                        Seats {venue.capacity}
                      </p>
                      {equipments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {equipments.map((equip) => (
                            <span
                              key={equip}
                              className="rounded-full bg-input-bg px-2 py-0.5 text-xs text-muted"
                            >
                              {getEquipmentLabel(equip)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-3">
          <div>
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-muted">
              Pending Bookings ({pendingBookings.length})
            </h2>
            {pendingBookings.length < 1 ? (
              <div className="rounded-xl border border-dashed border-line bg-white px-4 py-8 text-center">
                <p className="text-sm text-body">No bookings requested</p>
              </div>
            ) : (
              <div className="space-y-3">
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
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-muted">
              Approved Bookings ({approvedBookings.length})
            </h2>
            {approvedBookings.length < 1 ? (
              <div className="rounded-xl border border-dashed border-line bg-white px-4 py-8 text-center">
                <p className="text-sm text-body">No approved bookings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvedBookings.map((booking) => (
                  <BookingHistoryCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-muted">
              Rejected bookings ({rejectedBookings.length})
            </h2>
            {rejectedBookings.length < 1 ? (
              <div className="rounded-xl border border-dashed border-line bg-white px-4 py-8 text-center">
                <p className="text-sm text-body">No rejected bookings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rejectedBookings.map((booking) => (
                  <BookingHistoryCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingClientPage;
