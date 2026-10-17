import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Linking, Pressable, Text } from "react-native";

const DownloadButton = ({
  filePath,
  onError,
}: {
  filePath: string;
  onError: (msg: string | null) => void;
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleView = async (): Promise<void> => {
    setLoading(true);
    onError(null);

    const actualPath = Array.isArray(filePath) ? filePath[0] : filePath;
    if (!actualPath || typeof actualPath !== "string") {
      onError("Invalid file path: No attachment was provided.");
      setLoading(false);
      return;
    }

    try {
      let url: string;
      if (
        actualPath.startsWith("http://") ||
        actualPath.startsWith("https://")
      ) {
        url = actualPath;
      } else {
        const { data, error } = await supabase.storage
          .from("ticket-attachments")
          .createSignedUrl(actualPath, 60);

        if (error) {
          throw Error;
        }

        url = data.signedUrl;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.log("Download Error:", error);

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
      className={loading ? "opacity-50" : ""}
    >
      <Text className="text-sm font-medium text-emerald-600">
        {loading ? "Opening..." : "View Attachment"}
      </Text>
    </Pressable>
  );
};

export default DownloadButton;
