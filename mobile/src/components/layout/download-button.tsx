import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { colors } from "@/utils/helpers";
import { Paperclip } from "lucide-react-native";

const DownloadButton = ({
  filePath,
  onError,
}: {
  filePath: string | string[] | undefined;
  onError: (msg: string | null) => void;
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleView = async (): Promise<void> => {
    onError(null);

    const path = Array.isArray(filePath) ? filePath[0] : filePath;
    if (!path || typeof path !== "string") {
      onError("Invalid file path: No attachment was provided.");
      return;
    }

    setLoading(true);
    try {
      let url = path;
      if (!/^https?:\/\//.test(path)) {
        const { data, error } = await supabase.storage
          .from("ticket-attachments")
          .createSignedUrl(path, 60);

        if (error) {
          throw new Error(error.message);
        }
        url = data.signedUrl;
      }

      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.log("Attachment Error:", error);

      onError(
        error instanceof Error
          ? error.message
          : "Unable to open the attachment.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      onPress={handleView}
      disabled={loading}
      className={`h-11 flex-row items-center self-start rounded-control border border-line bg-input-bg px-4 active:opacity-80 ${
        loading ? "opacity-60" : ""
      }`}
      accessibilityRole="button"
      accessibilityLabel="View attachment"
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.button} />
      ) : (
        <Paperclip size={16} color={colors.button} />
      )}
      <Text className="ml-2 font-sans-medium text-sm text-heading">
        {loading ? "Opening..." : "View Attachment"}
      </Text>
    </Pressable>
  );
};

export default DownloadButton;
