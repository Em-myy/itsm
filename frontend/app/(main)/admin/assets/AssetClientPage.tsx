"use client";

import AssetDetails from "@/components/assets/AssetDetails";
import AssetForm, { AssetFormType } from "@/components/assets/AssetForm";
import api from "@/lib/axios";
import { AssetType } from "@/lib/types";
import { getStatusStyle } from "@/utils/status-styles";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, Plus } from "lucide-react";
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
  const [createError, setCreateError] = useState<string | null>(null);

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

  const handleCreate = async (data: AssetFormType): Promise<void> => {
    setIsSubmittingCreate(true);
    setCreateError(null);

    try {
      await api.post("/assets", data);
      setIsCreateOpen(false);
    } catch (error: any) {
      setCreateError(error.response.data.message || error.message);
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleUpdate = async (data: AssetSubmitType): Promise<void> => {
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

    await api.patch("/assets/update", assetPayload);
    setSelectedAsset(null);
  };

  const handleDelete = async (assetId: number) => {
    if (!selectedAsset) return;

    await api.patch("/assets/cancel", { asset_id: assetId });
    setSelectedAsset(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-heading">Master Inventory</h1>
          <p className="mt-1 text-sm text-body">
            Every registered asset, its department and its status
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-button px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add asset
        </button>
      </div>

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {createError && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}
            <AssetForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreateOpen(false)}
              isSubmitting={isSubmittingCreate}
            />
          </div>
        </div>
      )}

      {selectedAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <AssetDetails
              asset={selectedAsset}
              onClose={() => setSelectedAsset(null)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      <div>
        {initialAssets.length < 1 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white px-4 py-12 text-center">
            <p className="text-sm text-body">
              No asset registered, please register an asset
            </p>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="mt-2 inline-block text-sm font-medium text-button hover:underline cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Asset
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-215 text-left text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted">
                      Asset tag
                    </th>
                    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted">
                      Type
                    </th>
                    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted">
                      Department
                    </th>
                    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted">
                      Status
                    </th>
                    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted">
                      Last serviced
                    </th>
                    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted">
                      Notes
                    </th>
                    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted">
                      Assigned to
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {initialAssets?.map((asset) => {
                    const style = getStatusStyle(asset.status);
                    const hasAssignee =
                      asset.assignee_name &&
                      asset.assignee_name !== "Unassigned";
                    const initials =
                      asset.assignee_name.charAt(0).toUpperCase() ?? "?";

                    return (
                      <tr
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className="cursor-pointer border-b border-line transition last:border-0 hover:bg-input-bg/60"
                      >
                        <td className="px-4 py-4">
                          <span className="inline-block -skew-x-6 rounded-md bg-input-bg px-2.5 py-1">
                            <span className="inline-block skew-x-6 font-mono text-xs text-muted">
                              {asset.reference}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-4 text-heading">
                          {asset.asset_type}
                        </td>
                        <td className="px-4 py-4 text-body">
                          {asset.department}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style.pill}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                            />
                            {asset.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-body">
                          {asset.last_serviced
                            ? new Date(asset.last_serviced).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "No last service date"}
                        </td>
                        <td className="max-w-50 truncate px-4 py-4 text-body">
                          {asset.notes || "No notes available"}
                        </td>
                        <td className="px-4 py-4">
                          {hasAssignee ? (
                            <span className="flex items-center gap-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-button text-[10px] font-semibold uppercase text-white">
                                {initials}
                              </span>
                              <span className="truncate text-heading">
                                {asset.assignee_name}
                              </span>
                            </span>
                          ) : (
                            <span className="text-muted">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetClientPage;
