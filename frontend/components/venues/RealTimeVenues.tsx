"use client";

import { VenueType } from "@/lib/types";
import { getStatusStyle } from "@/utils/status-styles";
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
    <div className="space-y-3">
      {venuesArray.map((venue) => {
        const style = venue.status ? getStatusStyle(venue.status) : null;
        return (
          <div
            key={venue.id}
            className="rounded-xl border border-line bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm font-semibold text-heading">
                {venue.name}
              </h2>
              {style && (
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style.pill}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {venue.status}
                </span>
              )}
            </div>
            <h4 className="mt-0.5 text-xs text-body">Seats {venue.capacity}</h4>

            {venue.equipments && venue.equipments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {venue.equipments.map((eq) => (
                  <span
                    key={eq}
                    className="rounded-full bg-input-bg px-2.5 py-1 text-xs text-body"
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

export default RealTimeVenues;
