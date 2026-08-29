"use client";

import VenueComponent from "@/components/VenueComponent";
import api from "@/src/lib/axios";
import { BookingType, VenueType } from "@/src/lib/types";
import { useEffect, useState } from "react";

const BookingsPage = () => {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [venues, setVenues] = useState<VenueType[]>([]);
  const [openVenueComponent, setOpenVenueComponent] = useState<boolean>(false);

  useEffect(() => {
    const getBookings = async (): Promise<void> => {
      try {
        const response = await api.get("/bookings");
        setBookings(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    const getVenues = async (): Promise<void> => {
      try {
        const response = await api.get("/venues");
        setVenues(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getBookings();
    getVenues();
  }, []);
  return (
    <div>
      <div>
        <h1>Booking Approvals</h1>
        <p>
          Requests are cross-checked against the asset register automatically.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setOpenVenueComponent((prev) => !prev)}
        >
          Create Venue
        </button>
      </div>

      <div>{openVenueComponent && <VenueComponent />}</div>

      <div>
        {venues.length < 1 ? (
          <div>
            <p>No venues created</p>
            <button
              type="button"
              onClick={() => setOpenVenueComponent((prev) => !prev)}
            >
              Create Venue
            </button>{" "}
          </div>
        ) : (
          venues.map((venue) => (
            <div key={venue.id}>
              <h1>{venue.name}</h1>
              <h2>{venue.reference}</h2>
              <h2>{venue.capacity}</h2>
              <h3>{venue.status}</h3>
              {venue.equipments.map((equip) => (
                <ul key={equip}>
                  <li>{equip}</li>
                </ul>
              ))}
            </div>
          ))
        )}
      </div>

      <div>
        {bookings.length < 1 ? (
          <div>
            <p>No bookings requested</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id}>
              <h1>
                <span>{booking.username}</span>
                {" · "}
                <span>{booking.department}</span>
              </h1>
              <h3>
                <span>{booking.venue_name}</span>
                {" · "}
                {
                  <div>
                    <span>
                      {new Date(booking.start_time).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        },
                      )}
                      {" - "}
                      {new Date(booking.end_time).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                }
              </h3>
              <p>
                {booking.equipment_needed.map((equip) => (
                  <span key={equip}>{equip}</span>
                ))}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
