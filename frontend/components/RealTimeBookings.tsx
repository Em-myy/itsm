"use client";

import { BookingType } from "@/lib/types";
import { getStatusStyle } from "@/utils/status-styles";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RealTimeBookings = ({
  initialBookings,
  emptyFallback,
  hasError,
}: {
  initialBookings: BookingType | BookingType[] | null;
  emptyFallback: React.ReactNode;
  hasError?: boolean;
}) => {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("realtime_bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  if (hasError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line px-4 py-8 text-center">
        <AlertCircle className="h-5 w-5 text-muted" />
        <p className="text-sm text-body">
          Couldn&apos;t load bookings right now.
        </p>
        <p className="text-xs text-muted">Try refreshing the page.</p>
      </div>
    );
  }

  if (
    !initialBookings ||
    (Array.isArray(initialBookings) && initialBookings.length === 0)
  ) {
    return <>{emptyFallback}</>;
  }

  const bookingsArray = Array.isArray(initialBookings)
    ? initialBookings
    : [initialBookings];
  return (
    <div className="space-y-6">
      {bookingsArray.map((booking) => {
        const style = getStatusStyle(booking.status);
        const start = new Date(booking.start_time);
        const end = new Date(booking.end_time);
        const timeOpts: Intl.DateTimeFormatOptions = {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        };

        return (
          <div key={booking.reference} className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-serif text-lg text-heading">
                {booking.purpose}
              </h4>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style.pill}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                {booking.status}
              </span>
            </div>

            <p className="text-sm text-body">
              {booking.venue_name} &middot;{" "}
              {start.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}{" "}
              &middot; {start.toLocaleTimeString("en-GB", timeOpts)}–
              {end.toLocaleTimeString("en-GB", timeOpts)}
            </p>

            <span className="inline-block -skew-y-2 rounded-[7px] bg-input-bg px-2.5 py-1 font-mono text-xs text-muted">
              {booking.reference}
            </span>

            {booking.equipment_needed &&
              booking.equipment_needed.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {booking.equipment_needed.map((eq) => (
                    <span
                      key={eq}
                      className="-skew-y-2 rounded-[7px] border border-line px-2.5 py-1 text-xs text-body"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
};

export default RealTimeBookings;
