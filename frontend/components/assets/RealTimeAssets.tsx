"use client";

import { AssetType } from "@/lib/types";
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
    <div>
      {assetsArray.map((asset) => (
        <div key={asset.id}>
          <div>{asset.reference}</div>
          <div>{asset.type}</div>
          <div>{asset.department}</div>
          <div>{asset.status}</div>
          <div>{asset.assignee_name}</div>
          <div>{asset.last_serviced}</div>
          <div>{asset.notes}</div>
        </div>
      ))}
    </div>
  );
};

export default RealTimeAssets;
