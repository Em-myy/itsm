"use client";

import { AssetType, VenueType } from "@/lib/types";
import { useState } from "react";
import VenueForm from "./VenueForm";
import { AlertCircle, X } from "lucide-react";
import { getStatusStyle } from "@/utils/status-styles";
import { getEquipmentLabel } from "@/utils/format-helpers";

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
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (venueId: number): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onDelete(venueId);
      onClose();
    } catch (error: any) {
      setError(error.response.data.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: any): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onUpdate({ ...data, id: venue.id });
      onClose();
      setIsEditing(false);
    } catch (error: any) {
      setError(error.response.data.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <div>
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <VenueForm
          initialVenue={venue}
          availableAssets={availableAssets}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isSubmitting={isSubmitting}
          onDelete={() => handleDelete(venue.id as number)}
        />
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-start justify-between">
        <h2 className="font-serif text-2xl text-heading">Venue Details</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-muted transition hover:text-heading cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="mt-1 font-mono text-xs text-muted">{venue.reference}</p>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between border-b border-line pb-3">
          <span className="font-medium text-body">Name</span>
          <span className="text-heading">{venue.name}</span>
        </div>

        <div className="flex justify-between border-b border-line pb-3">
          <span className="font-medium text-body">Capacity</span>
          <span className="text-heading">{venue.capacity}</span>
        </div>

        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="font-medium text-body">Status</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusStyle(venue.status).pill}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${getStatusStyle(venue.status).dot}`}
            />
            {venue.status}
          </span>
        </div>

        <div className="pt-1">
          <span className="mb-2 block font-medium text-body">Equipment</span>
          {venue.equipments?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {venue.equipments.map((eq) => (
                <span
                  key={eq}
                  className="rounded-full bg-input-bg px-2.5 py-1 text-xs text-body"
                >
                  {getEquipmentLabel(eq)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted">None</p>
          )}
        </div>
      </div>

      {venue.status !== "Retired" && (
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-heading transition hover:bg-input-bg cursor-pointer"
          >
            Edit Venue
          </button>
          <button
            type="button"
            onClick={() => handleDelete(venue.id as number)}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? "Deleting..." : "Delete Venue"}
          </button>
        </div>
      )}
    </div>
  );
};

export default VenueDetails;
