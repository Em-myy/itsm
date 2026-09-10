"use client";

import { AssetType, VenueType } from "@/lib/types";
import { useState } from "react";
import VenueForm from "./VenueForm";

interface VenueDetailsProps {
  venue: VenueType;
  availableAssets: AssetType[];
  onClose: () => void;
  onUpdate: (data: any) => Promise<void>;
  onDelete: (venueId: number) => Promise<void>;
}

const VenueDetails = ({
  venue,
  availableAssets,
  onClose,
  onUpdate,
  onDelete,
}: VenueDetailsProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleDelete = async (venueId: number) => {
    setIsSubmitting(true);
    try {
      await onDelete(venueId);
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onUpdate({ ...data, id: venue.id });
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <VenueForm
        initialVenue={venue}
        availableAssets={availableAssets}
        onSubmit={handleUpdate}
        onCancel={() => setIsEditing(false)}
        isSubmitting={isSubmitting}
        onDelete={() => handleDelete(venue.id as number)}
      />
    );
  }
  return (
    <div>
      <h2>Venue Details</h2>
      <button type="button" onClick={onClose}>
        Close (x)
      </button>
      <div>
        <p>
          <strong>Name:</strong> {venue.name}
        </p>
        <p>
          <strong>Reference:</strong> {venue.reference}
        </p>
        <p>
          <strong>Capacity:</strong> {venue.capacity}
        </p>
        <p>
          <strong>Status:</strong> {venue.status}
        </p>
        <div>
          <strong>Equipment:</strong>
          {venue.equipments?.length ? (
            <ul>
              {venue.equipments.map((eq) => (
                <li key={eq}>{eq}</li>
              ))}
            </ul>
          ) : (
            <p>None</p>
          )}
        </div>
      </div>

      <div>
        {venue.status !== "Retired" && (
          <>
            <button type="button" onClick={() => setIsEditing(true)}>
              Edit Venue
            </button>
            <button
              type="button"
              onClick={() => handleDelete(venue.id as number)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Venue"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VenueDetails;
