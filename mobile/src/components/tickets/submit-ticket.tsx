import {
  View,
  Text,
  Modal,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import TicketForm, { TicketFormValues } from "./ticket-form";
import { colors, TicketType } from "@/utils/helpers";
import { supabase } from "@/lib/supabase";
import api from "@/utils/axios";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";

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
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#f3eee1" }}
          edges={Platform.OS === "ios" ? ["bottom"] : ["top", "bottom"]}
        >
          <View className="flex-row items-center justify-between border-b border-line px-5 py-4">
            <View className="mr-3 flex-1">
              <Text className="font-sans-extrabold text-xl text-heading">
                New ticket
              </Text>
              <Text className="mt-0.5 font-sans text-xs text-body">
                Tell us what&apos;s wrong and we&apos;ll route it to IT.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-10 w-10 items-center justify-center rounded-full border border-line bg-surface-hover active:opacity-80"
              accessibilityLabel="Close"
            >
              <X size={20} color={colors.button} />
            </Pressable>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              <TicketForm
                relatedTickets={initialTickets}
                showFileUpload
                submitLabel="Submit ticket"
                submittingLabel="Submitting..."
                onSubmit={handleSubmit}
                onCancel={() => onClose()}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

export default SubmitTicket;
