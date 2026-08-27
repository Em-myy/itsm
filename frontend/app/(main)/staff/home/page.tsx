"use client";

import { useAuth } from "@/context/AuthContext";
import api from "@/src/lib/axios";
import { BookingType, cardType, TicketType } from "@/src/lib/types";
import { Calendar, Edit2, Menu, MoveRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const HomePage = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [booking, setBooking] = useState<BookingType | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchTickets = async (): Promise<void> => {
      try {
        const response = await api.get("/tickets/recent");
        setTickets(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchBookings = async (): Promise<void> => {
      try {
        const response = await api.get("/bookings/next");
        console.log(response.data);
        setBooking(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTickets();
    fetchBookings();
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
      <div>
        <h3>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h3>
        <p>{user?.user_metadata?.department}</p>
      </div>
      <div className="flex">
        {cards.map((card, index) => (
          <Link href={`/staff/${card.link}`} key={index}>
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
                  <div>{ticket.status}</div>
                </div>
                <div>{ticket.reference}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3>Upcoming Bookings</h3>

        <div>
          {booking ? (
            <div>
              <h2>{booking?.purpose}</h2>
              <div>
                <h4>{booking?.venue_name}</h4>
                <span>
                  {new Date(booking?.start_time).toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })}
                </span>

                <div>
                  <span>
                    {new Date(booking.start_time).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {" - "}
                    {new Date(booking.end_time).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <h3>{booking?.reference}</h3>
              <div>
                {booking?.equipment_needed.map((eq) => (
                  <ul key={eq}>
                    <li>{eq}</li>
                  </ul>
                ))}
              </div>
            </div>
          ) : (
            <p>No recent booking</p>
          )}
        </div>

        <div>
          <Link href="/staff/calendar">View calendar</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
