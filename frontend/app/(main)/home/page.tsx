"use client";

import { useAuth } from "@/context/AuthContext";
import api from "@/src/lib/axios";
import { Calendar, Edit2, Menu, MoveRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface cardType {
  icon: React.ReactNode;
  title: string;
  text: string;
  path: string;
  link: string;
}

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

const HomePage = () => {
  const [tickets, setTickets] = useState<TicketType[] | null>(null);

  const { user } = useAuth();

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

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const cards: cardType[] = [
    {
      icon: <Edit2 />,
      title: "Report an issue",
      text: "Hardware acting up, no network, printer jammed - log it in under a minute.",
      path: "Submit a ticket",
      link: "submit-ticket",
    },
    {
      icon: <Calendar />,
      title: "Book a hall",
      text: "Check what's free and reserve a room with the equipment you need.",
      path: "Open calendar",
      link: "calendar",
    },
    {
      icon: <Menu />,
      title: "My tickets",
      text: "See where every request you've filled currently stands.",
      path: "View history",
      link: "tickets",
    },
  ];
  return (
    <div>
      <h1>This is the home page</h1>
      <h2>
        {greeting} {user?.user_metadata?.username}
      </h2>
      <p>{user?.user_metadata?.department}</p>

      <div className="flex">
        {cards.map((card, index) => (
          <Link href={`/${card.link}`} key={index}>
            <div>
              <div>{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <div className="flex">
                {card.path} <MoveRight />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <h3>Recent Requests</h3>
        <div>
          {tickets === null ? (
            <h2>
              No tickets filed yet......{" "}
              <Link href="submit-ticket">Report an issue</Link>
            </h2>
          ) : (
            tickets?.map((ticket) => (
              <div key={ticket.reference}>
                <div>{ticket.title}</div>
                <div>
                  <div>{ticket.department}</div>
                  <div>{ticket.category}</div>
                  <div>{ticket.priority}</div>
                </div>
                <div>{ticket.reference}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
