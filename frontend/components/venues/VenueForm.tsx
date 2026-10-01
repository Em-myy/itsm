"use client";

import { AssetType, VenueType } from "@/lib/types";
import { getEquipmentLabel } from "@/utils/format-helpers";
import { AlertCircle, X } from "lucide-react";
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

const labelClass = "mb-2 block text-sm font-medium text-heading";

const inputClass =
  "w-full rounded-xl border border-line bg-input-bg px-4 py-3 text-sm text-heading placeholder:text-muted outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    try {
      await onSubmit({ ...form, capacity: Number(form.capacity) });
      onCancel();
    } catch (error: any) {
      setError(error.response.data.message || error.message);
    }
  };

  const isEditing = !!initialVenue;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start justify-between">
        <h2 className="font-serif text-2xl text-heading">
          {isEditing ? "Edit Venue" : "Add New Venue"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="text-muted transition hover:text-heading cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div>
        <label className={labelClass}>Venue name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          required
          placeholder="Main Hall 3"
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Capacity</label>
          <input
            type="number"
            name="capacity"
            value={form.capacity}
            required
            min={1}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            name="status"
            value={form.status}
            required
            onChange={handleChange}
            className={inputClass}
          >
            <option value="" disabled>
              Select the status of the venue
            </option>
            <option value="Active">Active</option>
            <option value="In Repair">In Repair</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-heading">
          Assign Equipments
        </h3>
        {availableAssets.length < 1 ? (
          <p className="text-sm text-muted">No asset, please add an asset</p>
        ) : (
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-line p-2">
            {availableAssets.map((asset) => {
              const assetLabel = `${asset.reference} - ${asset.asset_type}`;
              const checked = form.equipments.includes(assetLabel);
              return (
                <label
                  key={asset.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    checked
                      ? "bg-button/10 text-heading"
                      : "text-body hover:bg-input-bg"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={assetLabel}
                    checked={form.equipments.includes(assetLabel)}
                    onChange={handleEquipment}
                    style={{ accentColor: "#1F4A3B" }}
                    className="h-4 w-4 shrink-0 cursor-pointer"
                  />
                  {getEquipmentLabel(assetLabel)}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {isEditing && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isSubmitting}
            className="rounded-xl border border-line px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            Delete venue
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-button py-3 text-sm font-semibold text-white transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Add Venue"}
        </button>
      </div>
    </form>
  );
};

export default VenueForm;
