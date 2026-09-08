"use client";

import AssetDetails from "@/components/assets/AssetDetails";
import AssetForm, { AssetFormType } from "@/components/assets/AssetForm";
import api from "@/lib/axios";
import { AssetType } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AssetSubmitType {
  id: number;
  asset_type: string;
  department: string;
  status: string;
  assignee_name: string;
  last_serviced: string;
  notes: string;
}

const AssetClientPage = ({ initialAssets }: { initialAssets: AssetType[] }) => {
  const supabase = createClient();
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetType | null>(null);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);

  useEffect(() => {
    const channel = supabase
      .channel("realtime_assets_page")
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

  const handleCreate = async (data: AssetFormType) => {
    setIsSubmittingCreate(true);

    const assetPayload = {
      asset_type: data.asset_type,
      department: data.department,
      status: data.status,
      assignee_name: data.assignee_name,
    };
    try {
      await api.post("/assets", assetPayload);
      console.log("Asset created successfully");
      setIsCreateOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdate = async (data: AssetSubmitType) => {
    if (!selectedAsset) return;

    const assetPayload = {
      asset_id: data.id,
      asset_type: data.asset_type,
      department: data.department,
      status: data.status,
      assignee_name: data.assignee_name,
      last_serviced: data.last_serviced,
      notes: data.notes,
    };

    try {
      await api.patch("/assets/update", assetPayload);
      setSelectedAsset(null);
      console.log("Asset updated successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (assetId: number) => {
    if (!selectedAsset) return;

    try {
      await api.patch("/assets/cancel", { asset_id: assetId });
      console.log("Asset cancelled successfully");
      setSelectedAsset(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div>
        <h1>Master Inventory</h1>
        <p>Every registered asset, its department and its status</p>
        <div>
          <button type="button" onClick={() => setIsCreateOpen(true)}>
            + Add asset
          </button>
        </div>

        {isCreateOpen && (
          <div>
            <AssetForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreateOpen(false)}
              isSubmitting={isSubmittingCreate}
            />
          </div>
        )}

        {selectedAsset && (
          <div>
            <AssetDetails
              asset={selectedAsset}
              onClose={() => setSelectedAsset(null)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>

      <div>
        {initialAssets.length < 1 ? (
          <div>
            <p>No asset registered, please register an asset</p>
            <button type="button" onClick={() => setIsCreateOpen(true)}>
              + Add asset
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ASSET TAG</th>
                <th>TYPE</th>
                <th>DEPARTMENT</th>
                <th>STATUS</th>
                <th>LAST SERVICED</th>
                <th>NOTES</th>
                <th>ASSIGNED TO</th>
              </tr>
            </thead>
            <tbody>
              {initialAssets?.map((asset) => (
                <tr key={asset.id} onClick={() => setSelectedAsset(asset)}>
                  <td>{asset.reference}</td>
                  <td>{asset.asset_type}</td>
                  <td>{asset.department}</td>
                  <td>{asset.status}</td>
                  <td>
                    {asset.last_serviced === null
                      ? "No last service date"
                      : asset.last_serviced}
                  </td>
                  <td>
                    {asset.notes === null ? "No notes available" : asset.notes}
                  </td>
                  <td>{asset.assignee_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssetClientPage;
