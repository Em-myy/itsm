import api from "@/utils/axios";
import { colors, formerTimeAgo } from "@/utils/helpers";
import RenderHTML from "@native-html/render";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { supabase } from "@/lib/supabase";
import FormMessage from "../layout/form-message";

interface ActivityLog {
  id: string | number;
  action_message: string;
  created_at: string;
}

const HTML_FONTS = ["sans-regular", "sans-semibold", "sans-bold"];

const HTML_BASE_STYLE = {
  fontFamily: "sans-regular",
  fontSize: 14,
  lineHeight: 20,
  color: colors.body,
};

const HTML_TAG_STYLES = {
  p: { margin: 0 },
  b: {
    fontFamily: "sans-semibold",
    fontWeight: "normal" as const,
    color: colors.heading,
  },
  strong: {
    fontFamily: "sans-semibold",
    fontWeight: "normal" as const,
    color: colors.heading,
  },
};

const ActivityLog = () => {
  const { width } = useWindowDimensions();

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const fetchActivities = async (): Promise<void> => {
    try {
      const response = await api.get("/activity");
      setActivities(Array.isArray(response.data) ? response.data : []);
      setHasError(false);
    } catch (error) {
      console.error("Failed to fetch activities", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <View className="items-center py-8">
        <ActivityIndicator color={colors.button} />
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <View className="mb-4">
        {hasError && (
          <FormMessage
            message={{ type: "error", text: "Couldn't load recent activity." }}
          />
        )}
        {!hasError && (
          <Text className="py-6 text-center font-sans text-sm text-muted">
            No activities recorded yet
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className="mt-4">
      {hasError && (
        <FormMessage
          message={{ type: "error", text: "Couldn't refresh recent activity." }}
        />
      )}
      {activities.map((activity, index) => {
        const isLast = index === activities.length - 1;
        const safeDateString = activity?.created_at?.replace(" ", "T");

        return (
          <View key={String(activity?.id)} className="flex-row">
            <View className="mr-3 items-center">
              <View className="mt-1.5 h-2.5 w-2.5 rounded-full bg-button" />
              {!isLast && <View className="w-px flex-1 bg-line" />}
            </View>

            <View className={`flex-1 ${isLast ? "" : "pb-5"}`}>
              <RenderHTML
                contentWidth={width - 72}
                source={{ html: activity?.action_message || "" }}
                systemFonts={HTML_FONTS}
                baseStyle={HTML_BASE_STYLE}
                tagsStyles={HTML_TAG_STYLES}
              />
              <Text className="mt-1 font-sans text-xs text-muted">
                {formerTimeAgo(safeDateString)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default ActivityLog;
