import api from "@/utils/axios";
import {
  colors,
  formerTimeAgo,
  getPriorityColors,
  TicketType,
} from "@/utils/helpers";
import { ReactNode, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import TicketForm, { TicketFormValues } from "./ticket-form";
import { X } from "lucide-react-native";
import DownloadButton from "../layout/download-button";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBadge, Tag } from "../layout/badges";
import FormMessage from "../layout/form-message";

const Row = ({
  label,
  children,
  last,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) => (
  <View className={`py-3 ${last ? "" : "border-b border-line"}`}>
    <Text className="mb-1 font-sans-medium text-xs uppercase text-muted">
      {label}
    </Text>
    {children}
  </View>
);

const TicketDetails = ({
  ticket,
  relatedTickets,
  onClose,
}: {
  ticket: TicketType;
  relatedTickets: TicketType[];
  onClose: () => void;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmingCancel, setConfirmingCancel] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const status = ticket.status.toLowerCase();
  const isFinished = status === "cancelled" || status === "resolved";
  const hasAttachment = !!ticket.picture && ticket.picture.length > 0;

  const handleCancelTicket = async (ticketId: number): Promise<void> => {
    setError(null);
    setIsCancelling(true);

    try {
      await api.patch("/tickets/cancel", { ticket_id: ticketId });
      onClose();
    } catch (error: any) {
      console.error(error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleEditSubmit = async (values: TicketFormValues) => {
    const ticketPayload = {
      ticket_id: values.ticketId,
      title: values.title,
      category: values.category,
      department: values.department,
      priority: values.priority,
      related_asset: values.relatedAsset,
      description: values.description,
    };

    await api.patch("/tickets/update", ticketPayload);
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
          <View className="flex-row items-start justify-between border-b border-line px-5 py-4">
            <View className="mr-3 flex-1">
              {mode === "edit" ? (
                <>
                  <Text className="font-sans-extrabold text-xl text-heading">
                    Edit ticket
                  </Text>
                  <Text className="mt-0.5 font-sans text-sm text-muted">
                    {ticket.reference}
                  </Text>
                </>
              ) : (
                <>
                  <View className="mb-2 flex-row items-center gap-2">
                    <Text className="font-sans-medium text-xs text-muted">
                      {ticket.reference}
                    </Text>
                    <StatusBadge status={ticket.status} />
                  </View>
                  <Text className="font-sans-extrabold text-xl text-heading">
                    {ticket.title}
                  </Text>
                </>
              )}
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

          {mode === "edit" ? (
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
              >
                <TicketForm
                  relatedTickets={relatedTickets}
                  initialValues={{
                    ticketId: ticket.id,
                    title: ticket.title,
                    category: ticket.category,
                    department: ticket.department,
                    priority: ticket.priority,
                    relatedAsset:
                      ticket.related_asset ??
                      "None - not tied to a registered asset",
                    description: ticket.description ?? "",
                  }}
                  submitLabel="Save changes"
                  submittingLabel="Saving..."
                  cancelLabel="Discard changes"
                  onSubmit={handleEditSubmit}
                  onCancel={() => setMode("view")}
                />
              </ScrollView>
            </KeyboardAvoidingView>
          ) : (
            <>
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
              >
                <View className="rounded-card border border-line bg-surface-hover px-4">
                  <Row label="Category">
                    <Tag label={ticket.category} />
                  </Row>

                  <Row label="Department">
                    <Tag label={ticket.department} />
                  </Row>

                  <Row label="Priority">
                    <Text
                      className={`font-sans-semibold text-base ${getPriorityColors(ticket.priority)}`}
                    >
                      {ticket.priority}
                    </Text>
                  </Row>

                  {ticket.assignee_name ? (
                    <Row label="Assigned to">
                      <Text className="font-sans text-base text-heading">
                        {ticket.assignee_name}
                      </Text>
                    </Row>
                  ) : null}

                  <Row label="Created" last>
                    <Text className="font-sans text-base text-heading">
                      {formerTimeAgo(ticket.created_at)}
                    </Text>
                  </Row>
                </View>

                <View className="mt-4 rounded-card border border-line bg-surface-hover px-4">
                  <Row label="Description">
                    <Text className="font-sans text-base leading-6 text-body">
                      {ticket.description || "No description provided."}
                    </Text>
                  </Row>

                  <Row label="Attachment" last>
                    {hasAttachment ? (
                      <View className="mt-1">
                        <DownloadButton
                          filePath={ticket.picture}
                          onError={setError}
                        />
                      </View>
                    ) : (
                      <Text className="font-sans text-sm text-muted">
                        No attachment provided
                      </Text>
                    )}
                  </Row>
                </View>

                {error && (
                  <View className="mt-4">
                    <FormMessage message={{ type: "error", text: error }} />
                  </View>
                )}
              </ScrollView>

              <View className="border-t border-line bg-cream px-5 py-4">
                {isFinished ? (
                  <Text className="text-sm text-center font-sans text-muted">
                    This ticket is {status} and can no longer be changed.
                  </Text>
                ) : confirmingCancel ? (
                  <View>
                    <Text className="mb-3 text-center font-sans-medium text-base text-heading">
                      Cancel this ticket?
                    </Text>
                    <View className="flex-row gap-3">
                      <Pressable
                        onPress={() => setConfirmingCancel(false)}
                        disabled={isCancelling}
                        className="h-12 flex-1 items-center justify-center rounded-control border border-line bg-surface-hover active:opacity-80"
                      >
                        <Text className="font-sans-semibold text-base text-heading">
                          Never mind
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleCancelTicket(ticket.id)}
                        disabled={isCancelling}
                        className={`h-12 flex-1 flex-row items-center justify-center rounded-control bg-danger active:opacity-80 ${
                          isCancelling ? "opacity-60" : ""
                        }`}
                      >
                        {isCancelling && (
                          <ActivityIndicator
                            color={colors.cream}
                            className="mr-2"
                          />
                        )}
                        <Text className="font-sans-semibold text-base text-cream">
                          {isCancelling ? "Cancelling..." : "Yes, cancel"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => {
                        setError(null);
                        setConfirmingCancel(true);
                      }}
                      className="h-12 flex-1 items-center justify-center rounded-control border border-danger bg-danger-bg active:opacity-80"
                    >
                      <Text className="font-sans-semibold text-base text-danger">
                        Cancel ticket
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setError(null);
                        setMode("edit");
                      }}
                      className="h-12 flex-1 items-center justify-center rounded-control bg-button active:bg-button-hover"
                    >
                      <Text className="ont-sans-semibold text-base text-cream">
                        Edit
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

export default TicketDetails;
