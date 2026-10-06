import { View, Text, TouchableOpacity } from "react-native";
import TicketForm, { TicketFormValues } from "./ticket-form";
import { TicketType } from "@/utils/helpers";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import api from "@/utils/axios";

const SubmitTicket = ({
  initialTickets,
  onClose,
}: {
  initialTickets: TicketType[];
  onClose: () => void;
}) => {
  const handleSubmit = async (values: TicketFormValues): Promise<void> => {
    let pictureUrl: string[] = [];

    if (values.file) {
      const fileExt = values.file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("ticket-attachments")
        .upload(fileName, values.file);

      if (uploadError) {
        throw new Error(`Upload Failed: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("ticket-attachments").getPublicUrl(fileName);

      pictureUrl.push(publicUrl);
    }

    const ticketPayload = {
      title: values.title,
      category: values.category,
      department: values.department,
      priority: values.priority,
      related_asset: values.relatedAsset,
      description: values.description,
      picture: pictureUrl,
    };

    await api.post("/tickets", ticketPayload);
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
