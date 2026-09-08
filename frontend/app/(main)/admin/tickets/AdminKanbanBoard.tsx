"use client";

import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { TicketType } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AdminKanbanBoard = ({
  initialTickets,
}: {
  initialTickets: TicketType[];
}) => {
  const supabase = createClient();
  const { user, displayName } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("realtime_kanban_tickets")
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

  const handleClaimTicket = async (ticketId: number): Promise<void> => {
    try {
      await api.patch("/tickets/claim", { ticket_id: ticketId });

      router.refresh();
    } catch (error) {
      console.log("Failed to claim ticket", error);
    }
  };

  const handleResolveTicket = async (ticketId: number): Promise<void> => {
    try {
      await api.patch("/tickets/resolve", { ticket_id: ticketId });

      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancelTicket = async (ticketId: number): Promise<void> => {
    try {
      await api.patch("/tickets/cancel", { ticket_id: ticketId });

      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  const pendingTickets = initialTickets.filter((t) => t.status === "Pending");
  const inProgressTickets = initialTickets.filter(
    (t) => t.status === "In Progress",
  );
  const resolvedTickets = initialTickets.filter((t) => t.status === "Resolved");
  const cancelledTickets = initialTickets.filter(
    (t) => t.status === "Cancelled",
  );

  return (
    <div>
      <div>
        <div>
          <div>
            <h2>PENDING</h2>
            <p>{pendingTickets.length}</p>
            {pendingTickets.length < 1 ? (
              <p>No tickets submitted</p>
            ) : (
              pendingTickets.map((ticket) => (
                <div key={ticket.id}>
                  <h3>{ticket.title}</h3>
                  <h4>{ticket.reference.slice(9)}</h4>
                  <p>{ticket.department}</p>
                  <p>{ticket.priority}</p>
                  {ticket.assignee_name === "Unassigned" &&
                  ticket.status === "Pending" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleClaimTicket(ticket.id)}
                      >
                        Claim Ticket
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelTicket(ticket.id)}
                      >
                        Cancel Ticket
                      </button>
                    </>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div>
            <h2>IN PROGRESS</h2>
            <p>{inProgressTickets.length}</p>
            {inProgressTickets.length < 1 ? (
              <p>No tickets is in progress</p>
            ) : (
              inProgressTickets.map((ticket) => (
                <div key={ticket.id}>
                  <h3>{ticket.title}</h3>
                  <h4>{ticket.reference.slice(9)}</h4>
                  <p>{ticket.department}</p>
                  <p>{ticket.priority}</p>
                  <p>{ticket.assignee_name}</p>
                  {ticket.status === "In Progress" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleResolveTicket(ticket.id)}
                      >
                        Resolve Ticket
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelTicket(ticket.id)}
                      >
                        Cancel Ticket
                      </button>
                    </>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div>
            <h2>RESOLVED</h2>
            <p>{resolvedTickets.length}</p>
            {resolvedTickets.length < 1 ? (
              <p>No tickets resolved</p>
            ) : (
              resolvedTickets.map((ticket) => (
                <div key={ticket.id}>
                  <h3>{ticket.title}</h3>
                  <h4>{ticket.reference.slice(9)}</h4>
                  <p>{ticket.department}</p>
                  <p>{ticket.priority}</p>
                  {ticket.status === "Resolved" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCancelTicket(ticket.id)}
                      >
                        Cancel Ticket
                      </button>
                    </>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div>
            <h2>Cancelled</h2>
            <p>{cancelledTickets.length}</p>
            {cancelledTickets.length < 1 ? (
              <p>No tickets cancelled</p>
            ) : (
              cancelledTickets.map((ticket) => (
                <div key={ticket.id}>
                  <h3>{ticket.title}</h3>
                  <h4>{ticket.reference.slice(9)}</h4>
                  <p>{ticket.department}</p>
                  <p>{ticket.priority}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminKanbanBoard;
