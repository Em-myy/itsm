"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ActivityType {
  id: string;
  action: React.ReactNode;
  time: string;
}

const RealTimeActivityLog = ({
  activities,
  emptyFallback,
}: {
  activities: ActivityType | ActivityType[] | null;
  emptyFallback: React.ReactNode;
}) => {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("realtime_activity_logs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_logs" },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  if (!activities || (Array.isArray(activities) && activities.length === 0)) {
    return <>{emptyFallback}</>;
  }

  const activitiesArray = Array.isArray(activities) ? activities : [activities];
  return (
    <div>
      {activitiesArray.map((activity) => (
        <div key={activity.id}>
          <div>{activity.action}</div>
          <div>{activity.time}</div>
        </div>
      ))}
    </div>
  );
};

export default RealTimeActivityLog;
