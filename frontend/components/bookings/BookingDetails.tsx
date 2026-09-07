"use client";

import api from "@/lib/axios";
import { BookingType, VenueType } from "@/lib/types";
import { getStatusStyle } from "@/utils/status-styles";
import { AlertCircle, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BookingForm, { BookingFormValues } from "./BookingForm";
import { format } from "date-fns";

const timeFormatOptions: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
};

const BookingDetails = ({
  booking,
  venues,
  onClose,
}: {
  booking: BookingType;
  venues: VenueType[] | null;
  onClose: () => void;
}) => {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmingCancel, setConfirmingCancel] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const style = getStatusStyle(booking.status || "pending");

  const handleCancel = async (bookingId: number): Promise<void> => {
    setError(null);
    setIsCancelling(true);

    try {
      await api.patch("/bookings/cancel", { booking_id: bookingId });
      router.refresh();
      onClose();
    } catch (error: any) {
      console.error(error);
      setError(
        error.response?.data?.message ||
          "Couldn't delete this booking. Please try again.",
      );
      setIsCancelling(false);
    }
  };

  const handleEditSubmit = async (values: BookingFormValues): Promise<void> => {
    const finalStartDate = new Date(`${values.date}T${values.startTime}:00`);
    const finalEndDate = new Date(`${values.date}T${values.endTime}:00`);

    const bookingPayload = {
      booking_id: values.bookingId,
      purpose: values.purpose,
      venue_id: Number(values.venueId),
      start_time: finalStartDate.toISOString(),
      end_time: finalEndDate.toISOString(),
      equipment_needed: values.equipmentNeeded,
    };

    await api.patch("/bookings/update", bookingPayload);
    router.refresh();
    onClose();
  };

  if (mode === "edit") {
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
      >
        <div
          className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-muted transition hover:text-heading cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="pr-8 font-serif text-2xl text-heading">
            Edit booking
          </h2>
          <p className="mt-1 font-mono text-xs text-muted">
            {booking.reference}
          </p>
          <div className="mt-6">
            <BookingForm
              venues={venues}
              initialValues={{
                bookingId: booking.id,
                purpose: booking.purpose,
                venueId: String(booking.venue_id),
                date: format(start, "yyyy-MM-dd"),
                startTime: format(start, "HH:mm"),
                endTime: format(end, "HH:mm"),
                equipmentNeeded: booking.equipment_needed ?? [],
              }}
              submitLabel="Save changes"
              submittingLabel="Saving..."
              onSubmit={handleEditSubmit}
              onCancel={() => setMode("view")}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="absolute right-4 top-4 text-muted transition hover:text-heading cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="pr-8 font-serif text-2xl text-heading">
          {booking.purpose}
        </h2>
        <p className="mt-1 font-mono text-xs text-muted">{booking.reference}</p>
        <p className="mt-2 text-sm text-body">{booking.venue_name}</p>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between border-b border-line pb-3">
            <span className="font-medium text-body">Start</span>
            <span className="text-heading">
              {new Date(booking.start_time).toLocaleDateString(
                "en-GB",
                timeFormatOptions,
              )}
            </span>
          </div>

          <div className="flex justify-between border-b border-line pb-3">
            <span className="font-medium text-body">End</span>
            <span className="text-heading">
              {new Date(booking.end_time).toLocaleDateString(
                "en-GB",
                timeFormatOptions,
              )}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="font-medium text-body">Status</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style.pill}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {booking.status || "Pending"}
            </span>
          </div>

          <div className="pt-1">
            <span className="mb-1 block font-medium text-body">
              Equipment needed
            </span>
            <p className="text-heading">
              {booking.equipment_needed?.length > 0
                ? booking.equipment_needed.join(", ")
                : "None requested"}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          {confirmingCancel && booking.status !== "Cancelled" ? (
            <>
              <span className="mr-auto text-sm text-body">
                Cancel this booking?
              </span>
              <button
                type="button"
                onClick={() => setConfirmingCancel(false)}
                disabled={isCancelling}
                className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-heading transition hover:bg-input-bg disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCancel(booking.id)}
                disabled={isCancelling}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              >
                {" "}
                {isCancelling ? "Cancelling..." : "Confirm cancel"}
              </button>
            </>
          ) : (
            <>
              {booking.status !== "Cancelled" && (
                <>
                  <button
                    type="button"
                    onClick={() => setConfirmingCancel(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-5 w-5" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("edit")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-heading transition hover:bg-input-bg cursor-pointer"
                  >
                    <Pencil className="w-5 h-5" />
                    Edit
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-button px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-button-hover cursor-pointer"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
