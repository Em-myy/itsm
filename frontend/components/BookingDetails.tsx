"use client";

import api from "@/lib/axios";
import { BookingType } from "@/lib/types";
import { getStatusStyle } from "@/utils/status-styles";
import { AlertCircle, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const timeFormatOptions: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

const BookingDetails = ({
  booking,
  onClose,
}: {
  booking: BookingType;
  onClose: () => void;
}) => {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const style = getStatusStyle(booking.status || "pending");

  const handleDelete = async (bookingId: number): Promise<void> => {
    setError(null);
    setIsDeleting(true);

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
      setIsDeleting(false);
    }
  };
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
          className="absolute right-4 top-4 text-muted transition hover:text-heading"
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
          {confirmingDelete ? (
            <>
              <span className="mr-auto text-sm text-body">
                Delete this booking?
              </span>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={isDeleting}
                className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-heading transition hover:bg-input-bg disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {" "}
                {isDeleting ? "Deleting..." : "Confirm delete"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-5 w-5" />
                Delete booking
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-button px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-button-hover"
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
