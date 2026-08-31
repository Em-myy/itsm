import RealTimeBookings from "@/components/RealTimeBookings";
import RealTimeTickets from "@/components/RealTimeTickets";
import { fetchFromGo } from "@/lib/api-server";
import { BookingType, cardType, TicketType } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { Calendar, Edit2, Menu, MoveRight } from "lucide-react";
import Link from "next/link";

const HomePage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [tickets, bookings] = await Promise.all([
    fetchFromGo("/tickets/recent") as Promise<TicketType | TicketType[] | null>,
    fetchFromGo("/bookings/next") as Promise<
      BookingType | BookingType[] | null
    >,
  ]);

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
          {!tickets || (Array.isArray(tickets) && tickets.length === 0) ? (
            <Link href="/staff/submit-tickets">Submit a ticket</Link>
          ) : null}
          <RealTimeTickets initialTickets={tickets} />
        </div>
      </div>

      <div>
        <h3>Upcoming Bookings</h3>
        <div>
          {!bookings || (Array.isArray(bookings) && bookings.length === 0) ? (
            <Link href="/staff/calendar">Reserve a booking</Link>
          ) : null}
          <RealTimeBookings initialBookings={bookings} />
        </div>

        <div>
          <Link href="/staff/calendar">View calendar</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
