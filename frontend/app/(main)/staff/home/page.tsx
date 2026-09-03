import RealTimeBookings from "@/components/RealTimeBookings";
import RealTimeTickets from "@/components/RealTimeTickets";
import { fetchFromGo } from "@/lib/api-server";
import { BookingType, cardType, TicketType } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { Calendar, Edit2, Menu, MoveRight } from "lucide-react";
import Link from "next/link";

const StaffHomePage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [ticketsResult, bookingsResult] = await Promise.allSettled([
    fetchFromGo("/tickets/recent") as Promise<TicketType | TicketType[] | null>,
    fetchFromGo("/bookings/next") as Promise<
      BookingType | BookingType[] | null
    >,
  ]);

  const tickets =
    ticketsResult.status === "fulfilled" ? ticketsResult.value : null;
  const ticketsFailed = ticketsResult.status === "rejected";

  const bookings =
    bookingsResult.status === "fulfilled" ? bookingsResult.value : null;
  const bookingsFailed = bookingsResult.status === "rejected";

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
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-heading sm:text-4xl">
          {greeting}, {user?.user_metadata?.username}
        </h1>
        <p className="mt-1 text-sm text-body">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
          {user?.user_metadata?.department && (
            <> &middot; {user?.user_metadata.department}</>
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <Link
            href={`/staff/${card.link}`}
            key={index}
            className="group flex flex-col rounded-2xl border border-line bg-white p-6 transition hover:border-muted"
          >
            <div className="text-heading">{card.icon}</div>
            <h3 className="mt-4 text-base font-semibold text-heading">
              {card.title}
            </h3>
            <p className="mt-1 text-sm text-body">{card.text}</p>
            <div className="mt-6 flex items-center gap-1.5 font-mono text-xs text-body transition group-hover:text-heading">
              {card.path}{" "}
              <MoveRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-6 lg:col-span-2">
          <h3 className="font-serif text-xl text-heading">Recent requests</h3>
          <div className="mt-4 space-y-3">
            <RealTimeTickets
              initialTickets={tickets}
              emptyFallback={
                <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center">
                  <p className="text-sm text-body">No tickets filed yet.</p>
                  <Link
                    href="/staff/submit-ticket"
                    className="mt-2 inline-block text-sm font-medium text-button hover:underline"
                  >
                    Report an issue
                  </Link>
                </div>
              }
            />
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-line bg-white p-6">
          <h3 className="font-serif text-xl text-heading">Upcoming Bookings</h3>
          <div className="mt-4 flex-1">
            <RealTimeBookings
              initialBookings={bookings}
              emptyFallback={
                <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center">
                  <p className="text-sm text-body">No tickets filed yet.</p>
                  <Link
                    href="/staff/calendar"
                    className="mt-2 inline-block text-sm font-medium text-button hover:underline"
                  >
                    Reserve a booking
                  </Link>
                </div>
              }
            />
          </div>

          <Link
            href="/staff/calendar"
            className="mt-4 block rounded-xl border border-line py-3 text-center text-sm font-semibold text-heading transition hover:bg-input-bg"
          >
            View calendar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaffHomePage;
