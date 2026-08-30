"use client";

import api from "@/src/lib/axios";
import { VenueType } from "@/src/lib/types";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface FormType {
  purpose: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface BookingComponentType {
  venues: VenueType[];
  preSelectedDate?: Date | null;
}

const BookingComponent = ({
  venues,
  preSelectedDate,
}: BookingComponentType) => {
  const [formData, setFormData] = useState<FormType>({
    purpose: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [equipmentNeeded, setEquipmentNeeded] = useState<string[]>([]);

  useEffect(() => {
    if (preSelectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: format(preSelectedDate, "yyyy-MM-dd"),
      }));
    }
  }, [preSelectedDate]);

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleVenueChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedVenue(event.target.value);
    setEquipmentNeeded([]);
  };

  const handleEquipmentChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setEquipmentNeeded((prev) =>
      event.target.checked
        ? [...prev, event.target.value]
        : prev.filter((equipment) => equipment !== event.target.value),
    );
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const finalStartDate = new Date(
      `${formData.date}T${formData.startTime}:00`,
    );
    const finalEndDate = new Date(`${formData.date}T${formData.endTime}:00`);

    const bookingPayload = {
      purpose: formData.purpose,
      venue_id: Number(selectedVenue),
      start_time: finalStartDate.toISOString(),
      end_time: finalEndDate.toISOString(),
      equipment_needed: equipmentNeeded,
    };

    try {
      const response = await api.post("/bookings", bookingPayload);
      console.log("Booking created successfully");

      setFormData({
        purpose: "",
        date: "",
        startTime: "",
        endTime: "",
      });
      setSelectedVenue("");
      setEquipmentNeeded([]);
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        console.log("This venue has been booked");
      } else {
        console.log(error.response.data);
      }
    }
  };

  const selectedVenueData = venues.find((v) => String(v.id) === selectedVenue);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Purpose</label>
          <input
            type="text"
            required
            name="purpose"
            value={formData.purpose}
            onChange={handleFormChange}
          />
        </div>

        <div>
          <label>Venue</label>
          <select required value={selectedVenue} onChange={handleVenueChange}>
            <option value="" disabled>
              Select a venue
            </option>
            {venues?.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name} --- seats - {venue.capacity}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Date</label>
          <input
            name="date"
            type="date"
            required
            value={formData.date}
            onChange={handleFormChange}
          />
        </div>

        <div>
          <label>Start Time</label>
          <input
            name="startTime"
            type="time"
            required
            value={formData.startTime}
            onChange={handleFormChange}
          />
        </div>

        <div>
          <label>End Time</label>
          <input
            name="endTime"
            type="time"
            required
            value={formData.endTime}
            onChange={handleFormChange}
          />
        </div>

        {selectedVenueData && selectedVenueData.equipments.length > 0 && (
          <div>
            <label>Equipment Needed</label>
            <div>
              {selectedVenueData.equipments.map((eq) => (
                <label key={eq}>
                  <input
                    type="checkbox"
                    value={eq}
                    checked={equipmentNeeded.includes(eq)}
                    onChange={handleEquipmentChange}
                  />
                  <span>{eq}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        <button>Book Hall</button>
      </form>
    </div>
  );
};

export default BookingComponent;
