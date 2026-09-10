"use client";

import VenueDetails from "@/components/venues/VenueDetails";
import VenueForm, { VenueFormType } from "@/components/venues/VenueForm";
import api from "@/lib/axios";
import { AssetType, BookingType, VenueType } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { Caprasimo } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface VenueSubmitType {
  id: number;
  name: string;
  capacity: number;
  status: string;
  equipments: string[];
}

interface BookingClientProps {
  initialBookings: BookingType[];
  initialVenues: VenueType[];
  initialAssets: AssetType[];
}

const BookingClientPage = ({
  initialBookings,
  initialVenues,
  initialAssets,
}: BookingClientProps) => {
  const supabase = createClient();
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueType | null>(null);
  const [isSubmittingVenue, setIsSubmittingVenue] = useState<boolean>(false);

  useEffect(() => {
    const channel = supabase
      .channel("realtime_bookings_page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "venues" },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assets" },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  const handleCreateVenue = async (data: VenueFormType) => {
    setIsSubmittingVenue(true);
    try {
      await api.post("/venues", data);
      setIsCreateOpen(false);
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsSubmittingVenue(false);
    }
  };

  const handleUpdateVenue = async (data: VenueSubmitType) => {
    if (!selectedVenue) return;

    const venuePayload = {
      venue_id: data.id,
      name: data.name,
      capacity: data.capacity,
      status: data.status,
      equipments: data.equipments,
    };

    try {
      await api.patch("/venues/update", venuePayload);
      console.log("venue updated successfully");
      setSelectedVenue(null);
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleDeleteVenue = async (venueId: number) => {
    try {
      await api.patch("/venues/cancel", { venue_id: venueId });
      console.log("Venue cancelled successfully");
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleApproveBooking = async (bookingId: number): Promise<void> => {
    try {
      await api.patch("/bookings/approve", { booking_id: bookingId });
    } catch (error: any) {
      console.log(error.response.data || error.message);
    }
  };

  const handleRejectBooking = async (bookingId: number): Promise<void> => {
    try {
      await api.patch("/bookings/reject", { booking_id: bookingId });
    } catch (error: any) {
      console.log(error.response.data);
    }
  };

  const isEquipUnderMaintenance = (equipLabel: string): boolean => {
    const matchedAsset = initialAssets.find(
      (a) => `${a.reference} - ${a.asset_type}` === equipLabel,
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
        <button type="button" onClick={() => setIsCreateOpen(true)}>
          Create Venue
        </button>
      </div>

      {isCreateOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 50,
            padding: 20,
          }}
        >
          <div style={{ background: "white", padding: 20 }}>
            <VenueForm
              availableAssets={initialAssets}
              onSubmit={handleCreateVenue}
              onCancel={() => setIsCreateOpen(false)}
              isSubmitting={isSubmittingVenue}
            />
          </div>
        </div>
      )}

      {selectedVenue && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 50,
            padding: 20,
          }}
        >
          <div style={{ background: "white", padding: 20 }}>
            <VenueDetails
              venue={selectedVenue}
              availableAssets={initialAssets}
              onClose={() => setSelectedVenue(null)}
              onUpdate={handleUpdateVenue}
              onDelete={handleDeleteVenue}
            />
          </div>
        </div>
      )}

      <div>
        <h2>Venues</h2>
        {initialVenues.length < 1 ? (
          <div>
            <p>No venues created</p>
          </div>
        ) : (
          initialVenues.map((venue) => (
            <div key={venue.id} onClick={() => setSelectedVenue(venue)}>
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
        <h2>Pending Bookings</h2>
        {initialBookings.filter((b) => b.status === "Pending").length < 1 ? (
          <div>
            <p>No bookings requested</p>
          </div>
        ) : (
          initialBookings
            .filter((booking) => booking.status === "Pending")
            .map((booking) => {
              const safeEquipments = booking.equipment_needed || [];

              const hasMaintenanceIssue = safeEquipments.some((equip) =>
                isEquipUnderMaintenance(equip),
              );

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
                            "en-GB",
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
                            "en-GB",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                            },
                          )}
                          {" - "}
                          {new Date(booking.end_time).toLocaleTimeString(
                            "en-GB",
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
                              Resolve or swap this equipment before approving
                              the booking.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => handleApproveBooking(booking.id)}
                    >
                      {hasMaintenanceIssue ? "Approve Anyway" : "Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectBooking(booking.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })
        )}
      </div>

      <div>
        <h1>Approved Bookings</h1>
        <h2>
          <span>
            {
              initialBookings.filter((booking) => booking.status === "Approved")
                .length
            }
            {" - "}
          </span>
          Approved Bookings
        </h2>
        {initialBookings
          .filter((booking) => booking.status === "Approved")
          .map((booking) => (
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
                      {new Date(booking.end_time).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                }
              </h3>
              {booking.equipment_needed.map((equip) => (
                <p key={equip}>{equip}</p>
              ))}
            </div>
          ))}
      </div>

      <div>
        <h1>Rejected Bookings</h1>
        <h2>
          <span>
            {
              initialBookings.filter((booking) => booking.status === "Rejected")
                .length
            }{" "}
            {" - "}
          </span>
          Rejected Bookings
        </h2>
        {initialBookings
          .filter((booking) => booking.status === "Rejected")
          .map((booking) => (
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
                      {new Date(booking.end_time).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                }
              </h3>
              {booking.equipment_needed.map((equip) => (
                <p key={equip}>{equip}</p>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default BookingClientPage;
