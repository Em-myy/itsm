"use client";

import { AssetType, VenueType } from "@/lib/types";
import { useEffect, useState } from "react";

interface VenueFormProps {
  initialVenue?: VenueType | null;
  availableAssets: AssetType[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  onDelete?: () => void;
}

export interface VenueFormType {
  name: string;
  capacity: number | "";
  status: string;
  equipments: string[];
}

const VenueForm = ({
  initialVenue,
  availableAssets,
  onSubmit,
  onCancel,
  isSubmitting,
  onDelete,
}: VenueFormProps) => {
  const [form, setForm] = useState<VenueFormType>({
    name: "",
    capacity: "",
    status: "",
    equipments: [],
  });

  useEffect(() => {
    if (initialVenue) {
      setForm({
        name: initialVenue.name || "",
        capacity: initialVenue.capacity || "",
        status: initialVenue.status || "",
        equipments: initialVenue.equipments || [],
      });
    }
  }, [initialVenue]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleEquipment = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setForm((prev) => ({
      ...form,
      equipments: event.target.checked
        ? [...prev.equipments, event.target.value]
        : prev.equipments.filter(
            (equipment) => equipment !== event.target.value,
          ),
    }));
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    try {
      await onSubmit({ ...form, capacity: Number(form.capacity) });
      onCancel();
    } catch (error) {
      console.log(error);
    }
  };

  const isEditing = !!initialVenue;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>{isEditing ? "Edit Venue" : "Add New Venue"}</h2>
        <button type="button" onClick={onCancel}>
          Close (x)
        </button>
        <div>
          <label>Venue Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            required
            placeholder="Main Hall 3"
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Capacity</label>
          <input
            type="number"
            name="capacity"
            value={form.capacity}
            required
            min={1}
            onChange={handleChange}
          />
        </div>
        <div>
          <select
            name="status"
            value={form.status}
            required
            onChange={handleChange}
          >
            <option value="" disabled>
              Select the status of the venue
            </option>
            <option value="Active">Active</option>
            <option value="In Repair">In Repair</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
        <div>
          <h3>Assign Equipments</h3>
          {availableAssets.length < 1 ? (
            <p>No asset, please add an asset</p>
          ) : (
            availableAssets.map((asset) => {
              const assetLabel = `${asset.reference} - ${asset.asset_type}`;
              return (
                <label key={asset.id}>
                  <input
                    type="checkbox"
                    value={assetLabel}
                    checked={form.equipments.includes(assetLabel)}
                    onChange={handleEquipment}
                  />
                  {assetLabel}
                </label>
              );
            })
          )}
        </div>
        <div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Add Venue"}
          </button>
        </div>

        {isEditing && onDelete && (
          <button type="button" onClick={onDelete} disabled={isSubmitting}>
            Delete Venue
          </button>
        )}
      </form>
    </div>
  );
};

export default VenueForm;
