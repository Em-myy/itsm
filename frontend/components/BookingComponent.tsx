"use client";

import api from "@/lib/axios";
import { VenueType } from "@/lib/types";
import { format } from "date-fns";
import { AlertCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FormType {
  purpose: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface BookingComponentType {
  venues: VenueType[] | null;
  preSelectedDate?: Date | null;
  onSuccess?: () => void;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-xl border border-line bg-input-bg px-4 py-3 text-sm text-heading placeholder:text-muted outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

const BookingComponent = ({
  venues,
  preSelectedDate,
  onSuccess,
  onClose,
}: BookingComponentType) => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormType>({
    purpose: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [equipmentNeeded, setEquipmentNeeded] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preSelectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: format(preSelectedDate, "yyyy-MM-dd"),
      }));
    }
  }, [preSelectedDate]);

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleVenueChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedVenue(event.target.value);
    setEquipmentNeeded([]);
  };

  const handleEquipmentChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setEquipmentNeeded((prev) =>
      event.target.checked
        ? [...prev, event.target.value]
        : prev.filter((equipment) => equipment !== event.target.value),
    );
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);

    const finalStartDate = new Date(
      `${formData.date}T${formData.startTime}:00`,
    );
    const finalEndDate = new Date(`${formData.date}T${formData.endTime}:00`);

    if (finalEndDate <= finalStartDate) {
      setError("End time must be after start time.");
      return;
    }

    setIsSubmitting(true);

    const bookingPayload = {
      purpose: formData.purpose,
      venue_id: Number(selectedVenue),
      start_time: finalStartDate.toISOString(),
      end_time: finalEndDate.toISOString(),
      equipment_needed: equipmentNeeded,
    };

    try {
      await api.post("/bookings", bookingPayload);
      router.refresh();
      onSuccess?.();
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setError(
          "This venue is already booked for that time. Try a different slot.",
        );
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError(
          "Something went wrong submitting your booking. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedVenueData = venues?.find((v) => String(v.id) === selectedVenue);

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
          className="absolute right-4 top-4 text-muted transition hover:text-heading"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="pr-8 font-serif text-2xl text-heading">Book a hall</h2>
        <p className="mt-1 text-sm text-body">
          Reserve a room and the equipment you need.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-heading">
              Purpose
            </label>
            <input
              type="text"
              required
              name="purpose"
              placeholder="e.g. Q3 budget review"
              value={formData.purpose}
              onChange={handleFormChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-heading">
              Venue
            </label>
            <select
              required
              value={selectedVenue}
              onChange={handleVenueChange}
              className={inputClass}
            >
              <option value="" disabled>
                Select a venue
              </option>
              {venues?.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} --- seats - {venue.capacity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-heading">
              Date
            </label>
            <input
              name="date"
              type="date"
              required
              value={formData.date}
              onChange={handleFormChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-heading">
                Start time
              </label>
              <input
                name="startTime"
                type="time"
                required
                value={formData.startTime}
                onChange={handleFormChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-heading">
                End time
              </label>
              <input
                name="endTime"
                type="time"
                required
                value={formData.endTime}
                onChange={handleFormChange}
                className={inputClass}
              />
            </div>
          </div>

          {selectedVenueData && selectedVenueData.equipments.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-heading">
                Equipment Needed
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedVenueData.equipments.map((eq) => {
                  const checked = equipmentNeeded.includes(eq);
                  return (
                    <label
                      key={eq}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        checked
                          ? "border-button bg-button text-white"
                          : "border-line bg-input-bg text-body hover:bg-surface-hover"
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={eq}
                        checked={equipmentNeeded.includes(eq)}
                        onChange={handleEquipmentChange}
                        className="sr-only"
                      />
                      <span>{eq}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-heading transition hover:bg-input-bg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-button py-3 text-sm font-semibold text-white transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Booking..." : "Book hall"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingComponent;
