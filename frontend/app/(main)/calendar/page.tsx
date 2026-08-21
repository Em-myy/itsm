"use client";

import BookingComponent from "@/components/BookingComponent";
import api from "@/src/lib/axios";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

interface BookingType {
  id: number;
  purpose: string;
  venue_id: number;
  venue_name: string;
  start_time: string;
  end_time: string;
  status: string;
  equipment_needed: string[];
}

export interface VenueType {
  id: number;
  name: string;
  capacity: number;
  status: string;
  equipments: string[];
}

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
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [openBooking, setOpenBooking] = useState<boolean>(false);
  const [venues, setVenues] = useState<VenueType[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(
    null,
  );

  useEffect(() => {
    const fetchBookings = async (): Promise<void> => {
      try {
        const response = await api.get("/bookings/mine");

        setBookings(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchVenues = async (): Promise<void> => {
      try {
        const response = await api.get("/venues");
        setVenues(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBookings();
    fetchVenues();
  }, []);

  const calendarEvents = bookings.map((booking) => ({
    title: booking.purpose,
    venue: booking.venue_name,
    start: new Date(booking.start_time),
    end: new Date(booking.end_time),
    resource: booking,
  }));

  const handleSelectEvent = (event: any) => {
    setSelectedBooking(event.resource);
  };

  return (
    <div className="relative">
      <div>
        <button type="button" onClick={() => setOpenBooking((b) => !b)}>
          + Book a hall
        </button>
      </div>

      {openBooking && <BookingComponent venues={venues} />}

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setSelectedBooking(null)}
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold"
            >
              X
            </button>
            <h2 className="text-2xl font-bold mb-1">
              {selectedBooking.purpose}
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              {selectedBooking.venue_name}
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-600">Start:</span>
                <span>
                  {new Date(selectedBooking.start_time).toLocaleDateString(
                    "en-US",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    },
                  )}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-600">End:</span>
                <span>
                  {new Date(selectedBooking.end_time).toLocaleDateString(
                    "en-US",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    },
                  )}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-600">Status:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  {selectedBooking.status || "Pending"}
                </span>
              </div>

              <div className="pt-2">
                <span className="font-semibold text-gray-600 block mb-1">
                  Equipment Needed:
                </span>
                <p className="text-gray-700">
                  {selectedBooking.equipment_needed?.length > 0
                    ? selectedBooking.equipment_needed.join(", ")
                    : "None requested"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div>
          <h1>Venues</h1>
          {venues.map((venue) => (
            <div key={venue.id}>
              <h2>{venue.name}</h2>
              <h4>Seats {venue.capacity}</h4>
              <p>{venue.status}</p>
              <p>{venue.equipments}</p>
            </div>
          ))}
        </div>
        <div className="h-175 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
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
            components={{ event: CustomEvent }}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
