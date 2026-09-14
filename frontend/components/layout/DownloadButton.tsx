"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

const DownloadButton = ({
  filePath,
  onError,
}: {
  filePath: string;
  onError: (msg: string | null) => void;
}) => {
  const supabase = createClient();
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
      if (
        actualPath.startsWith("http://") ||
        actualPath.startsWith("https://")
      ) {
        window.open(actualPath, "_blank", "noopener,noref");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.storage
        .from("ticket-attachments")
        .createSignedUrl(actualPath, 60);

      if (error) {
        throw Error;
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.log("Download Error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleView}
      disabled={loading}
      className={`text-sm font-medium text-emerald-600 transition hover:text-emerald-800 cursor-pointer ${
        loading ? "opacity-50 cursor-wait" : ""
      }`}
    >
      {loading ? "Opening..." : "View Attachment"}
    </button>
  );
};

export default DownloadButton;
