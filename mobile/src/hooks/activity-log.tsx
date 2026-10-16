import api from "@/utils/axios";
import { formerTimeAgo } from "@/utils/helpers";
import RenderHTML from "@native-html/render";
import { useEffect, useRef, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { supabase } from "@/lib/supabase";

interface ActivityLog {
  id: string | number;
  action_message: string;
  created_at: string;
}

const ActivityLog = () => {
  const { width } = useWindowDimensions();

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const fetchActivities = async (): Promise<void> => {
    try {
      const response = await api.get("/activity");
      setActivities(response.data);
    } catch (error) {
      console.error("Failed to fetch activities", error);
    }
  };

  useEffect(() => {
    fetchActivities();

    const channel = supabase
      .channel("realtime_activity_logs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_logs" },
        () => {
          if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
          }

          debounceTimer.current = setTimeout(() => {
            fetchActivities();
          }, 2000);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const activitiesArray: ActivityLog[] = Array.isArray(activities)
    ? activities
    : activities
      ? [activities]
      : [];

  if (activitiesArray.length === 0) {
    return (
      <>
        <View>
          <Text>No activities recorded yet</Text>
        </View>
      </>
    );
  }

  return (
    <View className="relative mt-4">
      {activitiesArray.map((activity) => {
        const safeDateString = activity?.created_at?.replace(" ", "T");

        return (
          <View key={String(activity?.id)}>
            <View>
              <RenderHTML
                contentWidth={width}
                source={{ html: activity?.action_message || "" }}
              />
              <Text>{formerTimeAgo(safeDateString)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default ActivityLog;
