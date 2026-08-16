"use client";

import api from "@/src/lib/axios";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TicketType {
  reference: string;
  title: string;
  category: string;
  department: string;
  priority: string;
  related_asset: string;
  description: string;
  created_at: string;
}

const TicketsPage = () => {
  const [tickets, setTickets] = useState<TicketType[] | null>(null);

  useEffect(() => {
    const fetchTickets = async (): Promise<void> => {
      try {
        const response = await api.get("/tickets/mine");
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
            tickets?.map((ticket) => (
              <table key={ticket.reference}>
                <thead>
                  <tr>
                    <td>REFERENCE</td>
                    <td>ISSUE</td>
                    <td>CATEGORY</td>
                    <td>PRIORITY</td>
                    <td>STATUS</td>
                    <td>FILED</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{ticket.reference}</td>
                    <td>{ticket.title}</td>
                    <td>{ticket.category}</td>
                    <td>{ticket.priority}</td>
                    <td>""</td>
                    <td>
                      {new Date(ticket.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;
