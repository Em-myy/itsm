import { fetchFromGo } from "@/lib/api-server";
import { BookingType, VenueType } from "@/lib/types";
import CalendarClient from "./CalendarClient";

const CalendarPage = async () => {
  const [bookings, venues] = await Promise.all([
    fetchFromGo("/bookings/mine") as Promise<BookingType[] | null>,
    fetchFromGo("/venues") as Promise<VenueType[] | null>,
  ]);
  return (
    <CalendarClient
      initialBookings={bookings || []}
      initialVenues={venues || []}
    />
  );
};

export default CalendarPage;
