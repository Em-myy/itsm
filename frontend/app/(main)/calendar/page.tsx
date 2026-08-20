"use client";

import api from "@/src/lib/axios";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CustomEvent = ({ event }: any): React.ReactElement => {
  return (
    <div className="p-1">
      <div className="font-semibold text-sm leading-tight">{event.title}</div>
      {event.venue && (
        <div className="text-xs text-gray-200 mt-1 flex items-center gap-1">
          {event.venue}
        </div>
      )}
    </div>
  );
};

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>("month");
  const [bookings, setBookings] = useState(null);

  const events = [
    {
      title: "Network Switch Upgrade",
      venue: "Server Room A",
      start: new Date(2026, 7, 21, 10, 0),
      end: new Date(2026, 7, 21, 12, 0),
    },
    {
      title: "General Staff Meeting",
      venue: "Main Conference Hall",
      start: new Date(2026, 7, 25, 14, 0),
      end: new Date(2026, 7, 25, 15, 0),
    },
  ];

  useEffect(() => {
    const fetchBookings = async (): Promise<void> => {
      try {
        const response = await api.get("/bookings/mine");
        console.log(response.data);
        setBookings(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchBookings();
  }, []);
  return (
    <div className="h-175 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div>{bookings}</div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week", "day"]}
        date={currentDate}
        view={currentView}
        onNavigate={(newDate) => setCurrentDate(newDate)}
        onView={(newView) => setCurrentView(newView)}
        components={{ event: CustomEvent }}
      />
    </div>
  );
};

export default CalendarPage;
