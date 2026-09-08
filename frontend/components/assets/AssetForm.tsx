"use client";

import { AssetType, DEPARTMENTS } from "@/lib/types";
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
    <div>
      <form onSubmit={handleSubmit}>
        <h2>{isEditing ? "Edit Asset" : "Add New Asset"}</h2>
        <button type="button" onClick={onCancel}>
          Close (x)
        </button>

        <div>
          <label>Asset type</label>
          <input
            type="text"
            name="asset_type"
            value={form.asset_type}
            required
            placeholder="e.g. HP Elitebook 840"
            onChange={handleChange}
          />
        </div>
        <div>
          <div>
            <label>Department</label>
            <select
              name="department"
              value={form.department}
              required
              onChange={handleChange}
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
            <label>Status</label>
            <select
              name="status"
              value={form.status}
              required
              onChange={handleChange}
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
          <label>
            Assigned to <span>(optional)</span>
          </label>
          <input
            type="text"
            name="assignee_name"
            value={form.assignee_name}
            placeholder="Staff name, or leave blank if shared"
            onChange={handleChange}
          />
        </div>

        {isEditing && (
          <div>
            <div>
              <label>Last Serviced</label>
              <input
                type="date"
                name="last_serviced"
                value={form.last_serviced}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        )}

        <div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Add to register"}
          </button>
        </div>

        {isEditing && onDelete && (
          <button type="button" onClick={onDelete} disabled={isSubmitting}>
            Delete Asset
          </button>
        )}
      </form>
    </div>
  );
};

export default AssetForm;
