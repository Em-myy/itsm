import api from "@/utils/axios";
import { TicketType } from "@/utils/helpers";
import { useState } from "react";
import { View, Text, Pressable, Button } from "react-native";
import TicketForm, { TicketFormValues } from "./ticket-form";
import { AlertCircle } from "lucide-react-native";

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

  const isCancelled = ticket.status.toLowerCase() === "cancelled";

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

  if (mode === "edit") {
    return (
      <Pressable onPress={onClose}>
        <View>
          <View>
            <Button title="Close" onPress={onClose} />

            <Text>Edit ticket</Text>
            <Text>{ticket.reference}</Text>

            <View>
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
            </View>
          </View>
        </View>
      </Pressable>
    );
  }
  return (
    <View>
      <View>
        <Button title="Close" onPress={onClose} />

        <Text>{ticket.title}</Text>
        <Text>{ticket.reference}</Text>

        <View>
          <View>
            <Text>Category</Text>
            <Text>{ticket.category}</Text>
          </View>

          <View>
            <Text>Department</Text>
            <Text>{ticket.department}</Text>
          </View>

          <View>
            <Text>Priority</Text>
            <Text>{ticket.priority}</Text>
          </View>

          <View>
            <Text>Status</Text>
            <Text>{ticket.status}</Text>
          </View>

          <View>
            <Text>Description</Text>
            <Text>{ticket.description || "No description provided."}</Text>
          </View>

          <View>
            <Text>Attachment</Text>
            {ticket.picture && ticket.picture.length > 0 ? (
              <View className="pt-2">
                <DownloadButton filePath={ticket.picture} onError={setError} />
              </View>
            ) : (
              <Text>No attachment provided</Text>
            )}
          </View>
        </View>

        {error && (
          <View>
            <AlertCircle />
            <Text>{error}</Text>
          </View>
        )}

        <View>
          {isCancelled || ticket.status === "Resolved" ? (
            <Button title="Close" onPress={onClose} />
          ) : confirmingCancel ? (
            <>
              <Text>Cancel this ticket?</Text>
              <Button
                title="Never mind"
                onPress={() => setConfirmingCancel(false)}
                disabled={isCancelling}
              />
              <Button
                title={isCancelling ? "Cancelling..." : "Confirm cancel"}
                onPress={() => handleCancelTicket(ticket.id)}
                disabled={isCancelling}
              />
            </>
          ) : (
            <>
              <Button
                title="Cancel Ticket"
                onPress={() => setConfirmingCancel(true)}
              />
              <Button title="Edit" onPress={() => setMode("edit")} />
              <Button title="Close" onPress={onClose} />
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default TicketDetails;
