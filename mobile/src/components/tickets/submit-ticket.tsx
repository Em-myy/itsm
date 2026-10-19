import { View, Text, TouchableOpacity } from "react-native";
import TicketForm, { TicketFormValues } from "./ticket-form";
import { TicketType } from "@/utils/helpers";
import { supabase } from "@/lib/supabase";
import api from "@/utils/axios";

const BUCKET = "ticket-attachments";

const SubmitTicket = ({
  initialTickets,
  onClose,
}: {
  initialTickets: TicketType[];
  onClose: () => void;
}) => {
  const handleSubmit = async (values: TicketFormValues): Promise<void> => {
    let uploadedPath: string | null = null;
    const picture: string[] = [];

    if (values.file) {
      const ext = values.file.name.split(".").pop() ?? "jpg";
      uploadedPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const bytes = await (await fetch(values.file.uri)).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(uploadedPath, bytes, { contentType: values.file.type });

      if (uploadError) {
        throw new Error(`Upload Failed: ${uploadError.message}`);
      }

      picture.push(
        supabase.storage.from(BUCKET).getPublicUrl(uploadedPath).data.publicUrl,
      );
    }

    try {
      const ticketPayload = {
        title: values.title,
        category: values.category,
        department: values.department,
        priority: values.priority,
        related_asset: values.relatedAsset,
        description: values.description,
        picture,
      };

      await api.post("/tickets", ticketPayload);
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage.from(BUCKET).remove([uploadedPath]);
      }
      throw error;
    }
    onClose();
  };

  return (
    <View>
      <Text>SubmitTicket</Text>
      <TouchableOpacity onPress={onClose}>
        <Text>Close</Text>
      </TouchableOpacity>
      <TicketForm
        relatedTickets={initialTickets}
        showFileUpload
        submitLabel="Submit ticket"
        submittingLabel="Submitting..."
        onSubmit={handleSubmit}
        onCancel={() => onClose()}
      />
    </View>
  );
};

export default SubmitTicket;
