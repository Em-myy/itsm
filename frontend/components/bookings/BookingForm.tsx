"use client";

import { VenueType } from "@/lib/types";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

export interface BookingFormValues {
  bookingId: number;
  purpose: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  equipmentNeeded: string[];
}

interface BookingFormProps {
  venues: VenueType[] | null;
  initialValues?: Partial<BookingFormValues>;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: BookingFormValues) => Promise<void>;
  onCancel: () => void;
}

const inputClass =
  "w-full rounded-xl border border-line bg-input-bg px-4 py-3 text-sm text-heading placeholder:text-muted outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

const BookingForm = ({
  venues,
  initialValues,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: BookingFormProps) => {
  const bookingId = initialValues?.bookingId ?? "";
  const [purpose, setPurpose] = useState<string>(initialValues?.purpose ?? "");
  const [selectedVenue, setSelectedVenue] = useState<string>(
    initialValues?.venueId ?? "",
  );
  const [date, setDate] = useState<string>(initialValues?.date ?? "");
  const [startTime, setStartTime] = useState<string>(
    initialValues?.startTime ?? "",
  );
  const [endTime, setEndTime] = useState<string>(initialValues?.endTime ?? "");
  const [equipmentNeeded, setEquipmentNeeded] = useState<string[]>(
    initialValues?.equipmentNeeded ?? [],
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

    const finalStartDate = new Date(`${date}T${startTime}:00`);
    const finalEndDate = new Date(`${date}T${endTime}:00`);

    if (finalEndDate <= finalStartDate) {
      setError("End time must be after start time.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        bookingId: Number(bookingId),
        purpose,
        venueId: selectedVenue,
        date,
        startTime,
        endTime,
        equipmentNeeded,
      });
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-heading">
          Purpose
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Q3 budget review"
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
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
              {venue.name} — seats {venue.capacity}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-heading">
          Date
        </label>
        <input
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-heading">
            Start time
          </label>
          <input
            type="time"
            required
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-heading">
            End time
          </label>
          <input
            type="time"
            required
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {selectedVenueData && selectedVenueData.equipments.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-heading">
            Equipment needed
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
                    checked={checked}
                    onChange={handleEquipmentChange}
                    className="sr-only"
                  />
                  {eq}
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
          <AlertCircle className="mt-0.5 w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-heading transition hover:bg-input-bg cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-button py-3 text-sm font-semibold text-white transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
