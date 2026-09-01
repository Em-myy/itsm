"use client";

import { VenueType } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RealTimeVenues = ({
  initialVenues,
  emptyFallback,
}: {
  initialVenues: VenueType | VenueType[] | null;
  emptyFallback: React.ReactNode;
}) => {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("realtime_venues")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "venues" },
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
    !initialVenues ||
    (Array.isArray(initialVenues) && initialVenues.length === 0)
  ) {
    return <>{emptyFallback}</>;
  }

  const venuesArray = Array.isArray(initialVenues)
    ? initialVenues
    : [initialVenues];
  return (
    <div>
      {venuesArray.map((venue) => (
        <div key={venue.id}>
          <h2>{venue.name}</h2>
          <h4>Seats {venue.capacity}</h4>
          <p>{venue.status}</p>
          <p>{venue.equipments}</p>
        </div>
      ))}
    </div>
  );
};

export default RealTimeVenues;
