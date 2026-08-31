"use client";

import { BookingType } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RealTimeBookings = ({
  initialBookings,
}: {
  initialBookings: BookingType | BookingType[] | null;
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

  if (
    !initialBookings ||
    (Array.isArray(initialBookings) && initialBookings.length === 0)
  ) {
    return <h2>No booking submitted yet......</h2>;
  }

  const bookingsArray = Array.isArray(initialBookings)
    ? initialBookings
    : [initialBookings];
  return (
    <div>
      {bookingsArray.map((booking) => (
        <div key={booking.reference}>
          <h2>{booking.purpose}</h2>
          <h3>{booking.status}</h3>
          <div>
            <h4>{booking.venue_name}</h4>
            <span>
              {new Date(booking.start_time).toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </span>
            <div>
              <span>
                {new Date(booking.start_time).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
                {" - "}
                {new Date(booking.end_time).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          <h3>{booking.reference}</h3>
          <div>
            {booking.equipment_needed?.map((eq) => (
              <ul key={eq}>
                <li>{eq}</li>
              </ul>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealTimeBookings;
