"use client";

import { AssetType, DEPARTMENTS } from "@/lib/types";
import { useState } from "react";
import AssetForm from "./AssetForm";

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

  const handleDelete = async (assetId: number) => {
    setIsSubmitting(true);
    await onDelete(assetId);
    setIsSubmitting(false);
  };

  const handleUpdate = async (data: any) => {
    setIsSubmitting(true);
    await onUpdate({ ...data, id: asset.id });
    setIsSubmitting(false);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div>
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
  return (
    <div>
      <div>
        <h2>Asset Details</h2>
        <button type="button" onClick={onClose}>
          Close (x)
        </button>

        <div>
          <div>{asset.reference}</div>
          <div>{asset.asset_type}</div>
          <div>{asset.department}</div>
          <div>{asset.status}</div>
          <div>{asset.assignee_name}</div>
          <div>
            {asset.last_serviced === null
              ? "No last service date"
              : asset.last_serviced}
          </div>
          <div>{asset.notes === null ? "No notes available" : asset.notes}</div>
        </div>

        <div>
          <button type="button" onClick={() => setIsEditing(true)}>
            Edit asset
          </button>
          <button
            type="button"
            onClick={() => handleDelete(asset.id)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete Asset"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;
