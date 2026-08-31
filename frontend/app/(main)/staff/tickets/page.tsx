"use client";

import api from "@/lib/axios";
import { TicketType } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

const TicketsPage = () => {
  const [tickets, setTickets] = useState<TicketType[] | null>(null);

  useEffect(() => {
    const fetchTickets = async (): Promise<void> => {
      try {
        const response = await api.get("/tickets/mine");
        console.log(response.data);
        setTickets(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTickets();
  }, []);
  return (
    <div>
      <h1>My Tickets</h1>
      <p>Every Requests you've filed in one place</p>
      <div>
        <div>
          {tickets === null ? (
            <h2>
              No tickets filed yet......{" "}
              <Link href="submit-ticket">Report an issue</Link>
            </h2>
          ) : (
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
                {tickets?.map((ticket) => (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;
