"use client";

import { useAuth } from "@/context/AuthContext";
import api from "@/src/lib/axios";
import { TicketType } from "@/src/lib/types";
import { useEffect, useState } from "react";

const AdminTicketPage = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);

  const { user, displayName } = useAuth();

  useEffect(() => {
    const getTickets = async (): Promise<void> => {
      try {
        const response = await api.get("/tickets");
        setTickets(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    getTickets();
  }, []);

  const handleClaimTicket = async (ticketId: number): Promise<void> => {
    try {
      await api.patch("/tickets/claim", { ticket_id: ticketId });

      setTickets((prevTickets) =>
        prevTickets.map((ticket) => {
          if (ticket.id === ticketId) {
            return {
              ...ticket,
              status: "In Progress",
              assignee_id: user?.id,
              assignee_name: displayName,
            };
          }
          return ticket;
        }),
      );
    } catch (error) {
      console.log("Failed to claim ticket", error);
    }
  };

  const handleResolveTicket = async (ticketId: number): Promise<void> => {
    try {
      await api.patch("/tickets/resolve", { ticket_id: ticketId });

      setTickets((prevTickets) =>
        prevTickets.map((ticket) => {
          if (ticket.id === ticketId) {
            return {
              ...ticket,
              status: "Resolved",
            };
          }
          return ticket;
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <div>
        <h1>Helpdesk board</h1>
        <p>
          Unassigned tickets show <span>+ Claim - </span>click a card foe the
          full detail, or drag to move it.
        </p>
      </div>

      <div>
        <div>
          <div>
            <h2>PENDING</h2>
            <p>
              {tickets.filter((ticket) => ticket.status === "Pending").length}
            </p>
            {tickets.filter((ticket) => ticket.status === "Pending").length <
            1 ? (
              <p>No tickets submitted</p>
            ) : (
              tickets
                .filter((ticket) => ticket.status === "Pending")
                .map((ticket) => (
                  <div key={ticket.id}>
                    <h3>{ticket.title}</h3>
                    <h4>{ticket.reference.slice(9)}</h4>
                    <p>{ticket.department}</p>
                    <p>{ticket.priority}</p>
                    {ticket.assignee_name === "Unassigned" &&
                    ticket.status === "Pending" ? (
                      <button
                        type="button"
                        onClick={() => handleClaimTicket(ticket.id)}
                      >
                        Claim
                      </button>
                    ) : null}
                  </div>
                ))
            )}
          </div>

          <div>
            <h2>IN PROGRESS</h2>
            <p>
              {
                tickets.filter((ticket) => ticket.status === "In Progress")
                  .length
              }
            </p>
            {tickets.filter((ticket) => ticket.status === "In Progress")
              .length < 1 ? (
              <p>No tickets is in progress</p>
            ) : (
              tickets
                .filter((ticket) => ticket.status === "In Progress")
                .map((ticket) => (
                  <div key={ticket.id}>
                    <h3>{ticket.title}</h3>
                    <h4>{ticket.reference.slice(9)}</h4>
                    <p>{ticket.department}</p>
                    <p>{ticket.priority}</p>
                    <p>{ticket.assignee_name}</p>
                    {ticket.status === "In Progress" ? (
                      <button
                        type="button"
                        onClick={() => handleResolveTicket(ticket.id)}
                      >
                        Resolve Ticket
                      </button>
                    ) : null}
                  </div>
                ))
            )}
          </div>

          <div>
            <h2>RESOLVED</h2>
            <p>
              {tickets.filter((ticket) => ticket.status === "Resolved").length}
            </p>
            {tickets.filter((ticket) => ticket.status === "Resolved").length <
            1 ? (
              <p>No tickets resolved</p>
            ) : (
              tickets
                .filter((ticket) => ticket.status === "Resolved")
                .map((ticket) => (
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

export default AdminTicketPage;
