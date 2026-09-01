"use client";

import api from "@/lib/axios";
import { TicketType } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TicketsClientPage = ({
  initialTickets,
}: {
  initialTickets: TicketType[] | null;
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

  if (
    !initialTickets ||
    (Array.isArray(initialTickets) && initialTickets.length === 0)
  ) {
    return (
      <>
        <p>No tickets filed yet.</p>
        <Link href="/staff/submit-ticket">Report an issue</Link>
      </>
    );
  }

  const ticketsArray = Array.isArray(initialTickets)
    ? initialTickets
    : [initialTickets];
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>REFERENCE</th>
            <th>ISSUE</th>
            <th>CATEGORY</th>
            <th>PRIORITY</th>
            <th>STATUS</th>
            <th>FILED</th>
          </tr>
        </thead>
        <tbody>
          {ticketsArray.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.reference}</td>
              <td>{ticket.title}</td>
              <td>{ticket.category}</td>
              <td>{ticket.priority}</td>
              <td>{ticket.status}</td>
              <td>
                {new Date(ticket.created_at).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsClientPage;
