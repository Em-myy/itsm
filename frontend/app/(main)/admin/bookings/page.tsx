import { fetchFromGo } from "@/lib/api-server";
import { AssetType, BookingType, VenueType } from "@/lib/types";
import BookingClientPage from "./BookingClientPage";

const BookingPage = async () => {
  const [bookingResult, venueResult, assetResult] = await Promise.allSettled([
    fetchFromGo("/bookings") as Promise<BookingType[]>,
    fetchFromGo("/venues") as Promise<VenueType[]>,
    fetchFromGo("/assets") as Promise<AssetType[]>,
  ]);

  const bookings =
    bookingResult.status === "fulfilled" ? bookingResult.value || [] : [];
  const venues =
    venueResult.status === "fulfilled" ? venueResult.value || [] : [];
  const assets =
    assetResult.status === "fulfilled" ? assetResult.value || [] : [];
  return (
    <BookingClientPage
      initialBookings={bookings}
      initialVenues={venues}
      initialAssets={assets}
    />
  );
};

export default BookingPage;
