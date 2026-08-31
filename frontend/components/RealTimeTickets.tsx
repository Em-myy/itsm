"use client";

import { TicketType } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RealTimeTickets = ({
  initialTickets,
}: {
  initialTickets: TicketType | TicketType[] | null;
}) => {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("realtime_tickets")
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
    !initialTickets ||
    (Array.isArray(initialTickets) && initialTickets.length === 0)
  ) {
    return <h2>No tickets filed yet......</h2>;
  }

  const ticketsArray = Array.isArray(initialTickets)
    ? initialTickets
    : [initialTickets];
  return (
    <>
      {ticketsArray.map((ticket) => (
        <div key={ticket.reference}>
          <div>{ticket.title}</div>
          <div>
            <div>{ticket.department}</div>
            <div>{ticket.category}</div>
            <div>{ticket.priority}</div>
            <div>{ticket.status}</div>
          </div>
          <div>{ticket.reference}</div>
        </div>
      ))}
    </>
  );
};

export default RealTimeTickets;
