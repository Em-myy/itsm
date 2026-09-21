"use client";

import { AssetType, DEPARTMENTS } from "@/lib/types";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface AssetFormProps {
  initialAssets?: AssetType | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  onDelete?: () => void;
}

export interface AssetFormType {
  asset_type: string;
  department: string;
  status: string;
  assignee_name: string;
  last_serviced: string;
  notes: string;
}

const labelClass = "mb-2 block text-sm font-medium text-heading";

const inputClass =
  "w-full rounded-xl border border-line bg-input-bg px-4 py-3 text-sm text-heading placeholder:text-muted outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

const AssetForm = ({
  initialAssets,
  onSubmit,
  onCancel,
  isSubmitting,
  onDelete,
}: AssetFormProps) => {
  const [form, setForm] = useState<AssetFormType>({
    asset_type: "",
    department: "",
    status: "",
    assignee_name: "",
    last_serviced: "",
    notes: "",
  });

  useEffect(() => {
    if (initialAssets) {
      setForm({
        asset_type: initialAssets.asset_type || "",
        department: initialAssets.department || "",
        status: initialAssets.status || "",
        assignee_name: initialAssets.assignee_name || "",
        last_serviced: initialAssets.last_serviced || "",
        notes: initialAssets.notes || "",
      });
    }
  }, [initialAssets]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(form);
  };

  const isEditing = !!initialAssets;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start justify-between">
        <h2 className="font-serif text-2xl text-heading">
          {isEditing ? "Edit Asset" : "Add New Asset"}
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
        <label className={labelClass}>Asset type</label>
        <input
          type="text"
          name="asset_type"
          value={form.asset_type}
          required
          placeholder="e.g. HP Elitebook 840"
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Department</label>
          <select
            name="department"
            value={form.department}
            required
            onChange={handleChange}
            className={inputClass}
          >
            <option value="" disabled>
              Select a department
            </option>
            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
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
              Select the status of the asset
            </option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Assigned to <span className="text-muted">(optional)</span>
        </label>
        <input
          type="text"
          name="assignee_name"
          value={form.assignee_name}
          placeholder="Staff name, or leave blank if shared"
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {isEditing && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Last Serviced</label>
            <input
              type="date"
              name="last_serviced"
              value={form.last_serviced}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </div>
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
            Delete Asset
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
              : "Add to register"}
        </button>
      </div>
    </form>
  );
};

export default AssetForm;
