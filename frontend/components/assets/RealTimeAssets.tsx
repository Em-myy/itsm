"use client";

import { AssetType } from "@/lib/types";
import { getStatusStyle } from "@/utils/status-styles";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RealTimeAssets = ({
  initialAssets,
  emptyFallback,
}: {
  initialAssets: AssetType | AssetType[] | null;
  emptyFallback: React.ReactNode;
}) => {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("realtime_assets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assets" },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  if (
    !initialAssets ||
    (Array.isArray(initialAssets) && initialAssets.length === 0)
  ) {
    return <>{emptyFallback}</>;
  }

  const assetsArray = Array.isArray(initialAssets)
    ? initialAssets
    : [initialAssets];
  return (
    <div className="space-y-3">
      {assetsArray.map((asset) => {
        const style = getStatusStyle(asset.status);
        const hasAssignee =
          asset.assignee_name && asset.assignee_name !== "Unassigned";
        const initials = asset.assignee_name.charAt(0).toUpperCase() ?? "?";

        return (
          <div
            key={asset.id}
            className="flex items-stretch overflow-hidden rounded-xl border border-line bg-white"
          >
            <span className={`w-1 shrink-0 ${style.accent}`} />
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-heading">
                  {asset.asset_type}
                </h3>
                <span className="inline-block -skew-x-6 rounded-md bg-input-bg px-2.5 py-1">
                  <span className="inline-block skew-x-6 font-mono text-xs text-muted">
                    {asset.reference}
                  </span>
                </span>
              </div>

              <div className="mt-1.5 flex items-center justify-between gap-2">
                <p className="text-xs text-body">{asset.department}</p>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style.pill}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {asset.status}
                </span>
              </div>

              {hasAssignee && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-button text-[10px] font-semibold uppercase text-white">
                    {initials}
                  </span>
                  <span> {asset.assignee_name}</span>
                </div>
              )}
              {asset.notes && (
                <p className="mt-2 text-xs text-muted">{asset.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RealTimeAssets;
