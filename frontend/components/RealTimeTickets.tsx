"use client";

import { TicketType } from "@/lib/types";
import { getStatusStyle } from "@/utils/status-styles";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RealTimeTickets = ({
  initialTickets,
  emptyFallback,
  hasError,
}: {
  initialTickets: TicketType | TicketType[] | null;
  emptyFallback: React.ReactNode;
  hasError?: boolean;
}) => {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("realtime_tickets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
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
          Couldn&apos;t load tickets right now.
        </p>
        <p className="text-xxs text-muted">Try refreshing the page.</p>
      </div>
    );
  }

  if (
    !initialTickets ||
    (Array.isArray(initialTickets) && initialTickets.length === 0)
  ) {
    return <>{emptyFallback}</>;
  }

  const ticketsArray = Array.isArray(initialTickets)
    ? initialTickets
    : [initialTickets];
  return (
    <>
      {ticketsArray.map((ticket) => {
        const style = getStatusStyle(ticket.status);

        return (
          <div
            key={ticket.reference}
            className="flex items-stretch overflow-hidden rounded-xl border border-line bg-white"
          >
            <span className={`w-1 shrink-0 ${style.accent}`} />
            <div className="flex flex-1 flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-heading">
                  {ticket.title}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {ticket.department} &middot; {ticket.category} &middot;{" "}
                  <span className="font-semibold text-heading">
                    {ticket.priority}
                  </span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style.pill}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {ticket.status}
                </span>
                <span className="rounded-full bg-input-bg px-2.5 py-1 font-mono text-xs text-muted">
                  {ticket.reference}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default RealTimeTickets;
