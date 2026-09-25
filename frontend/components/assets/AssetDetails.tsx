"use client";

import { AssetType } from "@/lib/types";
import { useState } from "react";
import AssetForm from "./AssetForm";
import { AlertCircle, X } from "lucide-react";
import { getStatusStyle } from "@/utils/status-styles";

interface AssetDetailsProps {
  asset: AssetType;
  onClose: () => void;
  onUpdate: (data: any) => void;
  onDelete: (assetId: number) => void;
}

const AssetDetails = ({
  asset,
  onClose,
  onUpdate,
  onDelete,
}: AssetDetailsProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (assetId: number): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onDelete(assetId);
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
      await onUpdate({ ...data, id: asset.id });
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

        <AssetForm
          initialAssets={asset}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isSubmitting={isSubmitting}
          onDelete={() => handleDelete(asset.id)}
        />
      </div>
    );
  }

  const style = getStatusStyle(asset.status);
  const hasAssignee =
    asset.assignee_name && asset.assignee_name !== "Unassigned";
  const initials = asset.assignee_name.charAt(0).toUpperCase() ?? "?";

  return (
    <div>
      <div className="flex items-start justify-between">
        <h2 className="font-serif text-2xl text-heading">Asset Details</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-muted transition hover:text-heading cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="mt-1 font-mono text-xs text-muted">{asset.reference}</p>

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
          <span className="font-medium text-body">Type</span>
          <span className="text-heading">{asset.asset_type}</span>
        </div>

        <div className="flex justify-between border-b border-line pb-3">
          <span className="font-medium text-body">Department</span>
          <span className="text-heading">{asset.department}</span>
        </div>

        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="font-medium text-body">Status</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style.pill}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {asset.status}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="font-medium text-body">Assigned to</span>
          {hasAssignee ? (
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-button text-[10px] font-semibold uppercase text-white">
                {initials}
              </span>
              <span className="text-heading">{asset.assignee_name}</span>
            </span>
          ) : (
            <span className="text-muted">Unassigned</span>
          )}
        </div>

        <div className="flex justify-between border-b border-line pb-3">
          <span className="font-medium text-body">Last serviced</span>
          <span className="text-heading">
            {asset.last_serviced
              ? new Date(asset.last_serviced).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "No last service date"}
          </span>
        </div>

        <div className="pt-1">
          <span className="mb-1 block font-medium text-body">Notes</span>
          <p className="text-heading wrap-break-word">
            {asset.notes || "No notes available"}
          </p>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-heading transition hover:bg-input-bg cursor-pointer"
        >
          Edit asset
        </button>
        <button
          type="button"
          onClick={() => handleDelete(asset.id)}
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          {isSubmitting ? "Deleting..." : "Delete Asset"}
        </button>
      </div>
    </div>
  );
};

export default AssetDetails;
