"use client";

import api from "@/lib/axios";
import { VenueType } from "@/lib/types";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BookingForm, { BookingFormValues } from "./BookingForm";
import { X } from "lucide-react";

interface BookingComponentType {
  venues: VenueType[] | null;
  preSelectedDate?: Date | null;
  onSuccess?: () => void;
  onClose: () => void;
}

const BookingComponent = ({
  venues,
  preSelectedDate,
  onSuccess,
  onClose,
}: BookingComponentType) => {
  const router = useRouter();
  const [initialDate, setInitialDate] = useState<string>("");

  useEffect(() => {
    if (preSelectedDate) {
      setInitialDate(format(preSelectedDate, "yyyy-MM-dd"));
    }
  }, [preSelectedDate]);

  const handleSubmit = async (values: BookingFormValues): Promise<void> => {
    const finalStartDate = new Date(`${values.date}T${values.startTime}:00`);
    const finalEndDate = new Date(`${values.date}T${values.endTime}:00`);

    const bookingPayload = {
      purpose: values.purpose,
      venue_id: Number(values.venueId),
      start_time: finalStartDate.toISOString(),
      end_time: finalEndDate.toISOString(),
      equipment_needed: values.equipmentNeeded,
    };

    await api.post("/bookings", bookingPayload);
    router.refresh();
    onSuccess?.();
  };

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
          <X className="h-5 w-5" />
        </button>
        <h2 className="pr-8 font-serif text-2xl text-heading">Book a hall</h2>
        <p className="mt-1 text-sm text-body">
          Reserve a room and the equipment you need.
        </p>

        <div className="mt-6">
          <BookingForm
            key={initialDate}
            venues={venues}
            initialValues={{ date: initialDate }}
            submitLabel="Book hall"
            submittingLabel="Booking..."
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingComponent;
