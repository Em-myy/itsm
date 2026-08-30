"use client";

import VenueComponent from "@/components/VenueComponent";
import api from "@/src/lib/axios";
import { AssetType, BookingType, VenueType } from "@/src/lib/types";
import { useEffect, useState } from "react";

const BookingsPage = () => {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [venues, setVenues] = useState<VenueType[]>([]);
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [openVenueComponent, setOpenVenueComponent] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [bookingRes, venueRes, assetRes] = await Promise.all([
          api.get("/bookings"),
          api.get("/venues"),
          api.get("/assets"),
        ]);

        setBookings(bookingRes.data || []);
        setVenues(venueRes.data || []);
        setAssets(assetRes.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const isEquipUnderMaintenance = (equipLabel: string): boolean => {
    const matchedAsset = assets.find(
      (a) => `${a.reference} - ${a.type}` === equipLabel,
    );
    return matchedAsset?.status === "Maintenance";
  };

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
        <h2>Venues</h2>
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
              {(venue.equipments || []).map((equip) => (
                <ul key={equip}>
                  <li>{equip}</li>
                </ul>
              ))}
            </div>
          ))
        )}
      </div>

      <div>
        <h2>Bookings</h2>
        {bookings.length < 1 ? (
          <div>
            <p>No bookings requested</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const safeEquipments = booking.equipment_needed || [];

            const brokenEquipments = safeEquipments.filter((equip) =>
              isEquipUnderMaintenance(equip),
            );

            const hasMaintenanceIssue = brokenEquipments.length > 0;

            return (
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
                        {new Date(booking?.start_time).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </span>
                      {" - "}
                      <span>
                        {new Date(booking.start_time).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                        {" - "}
                        {new Date(booking.end_time).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  }
                </h3>

                <div>
                  {safeEquipments.map((equip) => {
                    const isBroken = isEquipUnderMaintenance(equip);
                    return (
                      <div key={equip}>
                        <div>
                          <span>{equip}</span>
                          {isBroken && <span> Under Maintenance</span>}
                        </div>
                        {isBroken && (
                          <p>
                            Resolve or swap this equipment before approving the
                            booking.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div>
                  <button>
                    {hasMaintenanceIssue ? "Approve Anyway" : "Approve"}
                  </button>
                  <button>Reject</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
