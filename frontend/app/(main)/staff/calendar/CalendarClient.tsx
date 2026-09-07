"use client";

import BookingComponent from "@/components/bookings/BookingComponent";
import RealTimeVenues from "@/components/venues/RealTimeVenues";
import { BookingType, VenueType } from "@/lib/types";
import {
  format,
  getDay,
  isBefore,
  isSameDay,
  parse,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { enGB } from "date-fns/locale";
import { useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  EventProps,
  View,
} from "react-big-calendar";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-overrides.css";
import BookingDetails from "@/components/bookings/BookingDetails";

interface ToolbarProps {
  date: Date;
  view: View;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
  onView: (view: View) => void;
}

type CalendarEvent = {
  title: string;
  venue: string;
  start: Date;
  end: Date;
  resource: BookingType;
};

const locales = { "en-GB": enGB };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const VIEW_OPTIONS: { key: View; label: string }[] = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "day", label: "Day" },
];

const CustomToolbar = ({ date, view, onNavigate, onView }: ToolbarProps) => {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-serif text-2xl text-heading">
        {format(date, "MMMM yyyy")}
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1 rounded-full bg-input-bg p-1">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => onView(opt.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                view === opt.key
                  ? "bg-white text-heading shadow-sm"
                  : "text-body hover:text-heading"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onNavigate("PREV")}
            aria-label="Previous"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-heading transition hover:bg-input-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate("NEXT")}
            aria-label="Next"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-heading transition hover:bg-input-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

type EventTiming = "past" | "today" | "future";

const EVENT_TIMING_STYLES: Record<EventTiming, string> = {
  past: "bg-input-bg text-muted",
  today: "bg-button text-white",
  future: "bg-blue-50 text-blue-700",
};

const getEventTiming = (start: Date): EventTiming => {
  const today = startOfDay(new Date());
  const eventDay = startOfDay(start);
  if (isSameDay(eventDay, today)) return "today";
  return isBefore(eventDay, today) ? "past" : "future";
};

const CustomEvent = ({
  event,
}: EventProps<CalendarEvent>): React.ReactElement => {
  const timing = getEventTiming(event.start);
  return (
    <div
      className={`h-full w-full rounded-md px-2 py-1 ${EVENT_TIMING_STYLES[timing]}`}
    >
      <div className="truncate text-xs font-semibold">{event.title}</div>
      {event.venue && (
        <div className="truncate text-[11px] opacity-80">{event.venue}</div>
      )}
    </div>
  );
};

const CalendarClient = ({
  initialBookings,
  initialVenues,
}: {
  initialBookings: BookingType[] | null;
  initialVenues: VenueType[] | null;
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>("month");
  const [openBooking, setOpenBooking] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(
    null,
  );
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);

  const calendarEvents =
    initialBookings?.map((booking) => ({
      title: booking.purpose,
      venue: booking.venue_name,
      start: new Date(booking.start_time),
      end: new Date(booking.end_time),
      resource: booking,
    })) ?? [];

  const handleSelectEvent = (event: any): void => {
    setSelectedBooking(event.resource);
  };

  const handleSelectSlot = (slotInfo: {
    start: Date;
    action: string;
  }): void => {
    setSelectedSlotDate(slotInfo.start);
    setOpenBooking(true);
  };

  return (
    <div className="relative space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-heading">
            Booking, Venue &amp; Calendar
          </h1>
          <p className="mt-1 text-sm text-body">
            {" "}
            Equipment availability is checked automatically against the asset
            register.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedSlotDate(null);
            setOpenBooking((b) => !b);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-button px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 cursor-pointer"
        >
          {openBooking ? (
            <X className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
          {openBooking ? "Close" : "Book a hall"}
        </button>
      </div>

      {openBooking && (
        <BookingComponent
          venues={initialVenues}
          preSelectedDate={selectedSlotDate}
          onSuccess={() => setOpenBooking(false)}
          onClose={() => setOpenBooking(false)}
        />
      )}

      {selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          venues={initialVenues}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-muted">
            Halls &amp; Rooms
          </h2>
          <RealTimeVenues
            initialVenues={initialVenues}
            emptyFallback={
              <div className="rounded-xl border border-dashed border-line bg-white px-4 py-8 text-center">
                <p className="text-sm text-body">No venue available</p>
              </div>
            }
          />
        </div>

        <div className="lg:col-span-3">
          <div className="h-175 rounded-2xl border border-line bg-white p-6 shadow-sm">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              views={["month", "week", "day"]}
              date={currentDate}
              view={currentView}
              onNavigate={(newDate) => setCurrentDate(newDate)}
              onView={(newView) => setCurrentView(newView)}
              components={{ event: CustomEvent, toolbar: CustomToolbar }}
              onSelectEvent={handleSelectEvent}
              selectable
              onSelectSlot={handleSelectSlot}
              style={{ height: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarClient;
