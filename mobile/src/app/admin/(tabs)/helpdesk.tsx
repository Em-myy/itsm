import TicketDetails from "@/components/tickets/ticket-details";
import { supabase } from "@/lib/supabase";
import api from "@/utils/axios";
import { TicketType } from "@/utils/helpers";
import { AlertCircle, Ban, CheckCircle2, UserCheck } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ColumnKey = "pending" | "inProgress" | "resolved" | "cancelled";

interface TicketCardProps {
  ticket: TicketType;
  showClaim?: boolean;
  showResolve?: boolean;
  showCancel?: boolean;
  onClaim?: () => void;
  onResolve?: () => void;
  onCancel?: () => void;
  onCardClick?: () => void;
}

interface Column {
  key: ColumnKey;
  label: string;
  status: string;
  emptyText: string;
}

const COLUMNS: Column[] = [
  {
    key: "pending",
    label: "New",
    status: "Pending",
    emptyText: "No new tickets",
  },
  {
    key: "inProgress",
    label: "In Progress",
    status: "In Progress",
    emptyText: "No tickets in progress",
  },
  {
    key: "resolved",
    label: "Resolved",
    status: "Resolved",
    emptyText: "No tickets resolved",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    status: "Cancelled",
    emptyText: "No tickets cancelled",
  },
];

const TicketCard = ({
  ticket,
  showClaim,
  showResolve,
  showCancel,
  onClaim,
  onResolve,
  onCancel,
  onCardClick,
}: TicketCardProps) => {
  const hasAssignee =
    ticket.assignee_name && ticket.assignee_name !== "Unassigned";
  const initials = ticket.assignee_name?.charAt(0).toUpperCase() || "?";

  return (
    <Pressable onPress={onCardClick}>
      <View>
        <Text>{ticket.title}</Text>

        <View>
          <Text>
            {ticket.department}
            {ticket.priority && (
              <>
                {" "}
                &middot; <Text>{ticket.priority}</Text>
              </>
            )}
          </Text>
          <Text>{ticket.reference.slice(12)}</Text>
        </View>

        {hasAssignee && (
          <View>
            <Text>{initials}</Text>
            <Text>{ticket.assignee_name}</Text>
          </View>
        )}

        {(showClaim || showResolve || showCancel) && (
          <View>
            {showClaim && (
              <Pressable
                onPress={() => {
                  if (onClaim) onClaim();
                }}
                className="rounded-lg border border-dashed border-line bg-input-bg px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-surface-hover cursor-pointer"
              >
                <Text className="flex gap-1 items-center">
                  <UserCheck className="w-3 h-3" />
                  Claim
                </Text>
              </Pressable>
            )}
            {showResolve && (
              <Pressable
                onPress={() => {
                  if (onResolve) onResolve();
                }}
                className="rounded-lg border border-dashed border-line bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-500 cursor-pointer"
              >
                <Text className="flex gap-1 items-center">
                  <CheckCircle2 className="w-3 h-3" />
                  Resolve
                </Text>
              </Pressable>
            )}
            {showCancel && (
              <Pressable
                onPress={() => {
                  if (onCancel) onCancel();
                }}
                className="rounded-lg border border-dashed border-line bg-red-800 px-3 py-1.5 text-xs font-semibold text-red-50 transition hover:bg-red-700 cursor-pointer"
              >
                <Text className="flex gap-1 items-center">
                  <Ban className="w-3 h-3" />
                  Cancel
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
};

const HelpdeskBoard = ({}) => {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  const fetchTickets = async (): Promise<void> => {
    try {
      const response = await api.get("/tickets");
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    }
  };

  useEffect(() => {
    fetchTickets();

    const channel = supabase
      .channel("admin_helpdesk_board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        () => {
          if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
          }

          debounceTimer.current = setTimeout(() => {
            fetchTickets();
          }, 2000);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleClaimTicket = async (ticketId: number): Promise<void> => {
    try {
      await api.patch("/tickets/claim", { ticket_id: ticketId });
    } catch (error) {
      throw error;
    }
  };

  const handleResolveTicket = async (ticketId: number): Promise<void> => {
    try {
      await api.patch("/tickets/resolve", { ticket_id: ticketId });
    } catch (error) {
      throw error;
    }
  };

  const handleCancelTicket = async (ticketId: number): Promise<void> => {
    try {
      await api.patch("/tickets/cancel", { ticket_id: ticketId });
    } catch (error) {
      throw error;
    }
  };

  const runAction = async (
    action: () => Promise<void>,
    errorMessage: string,
  ) => {
    setActionError(null);
    try {
      await action();
    } catch (error: any) {
      console.error(error);
      setActionError(errorMessage);
    }
  };

  const grouped = COLUMNS.reduce<Record<ColumnKey, TicketType[]>>(
    (acc, column) => {
      acc[column.key] = tickets.filter((t) => t.status === column.status);
      return acc;
    },
    { pending: [], inProgress: [], resolved: [], cancelled: [] },
  );

  return (
    <SafeAreaView>
      <ScrollView>
        <View>
          <Text className="font-serif text-3xl text-heading">
            Helpdesk board
          </Text>
          <Text className="mt-1 text-sm text-body">
            Unassigned tickets show{" "}
            <Text className="font-semibold text-heading">+ Claim</Text> — use
            the actions on each card.
          </Text>
        </View>
        <View>
          {actionError && (
            <View className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{actionError}</span>
            </View>
          )}

          <View>
            <View>
              {COLUMNS.map((column) => {
                const columnTickets = grouped[column.key];

                return (
                  <View key={column.key}>
                    <View>
                      <Text>{column.label}</Text>
                      <Text>{columnTickets.length}</Text>
                    </View>

                    <View id={column.key}>
                      {columnTickets.length === 0 ? (
                        <Text>{column.emptyText}</Text>
                      ) : (
                        columnTickets.map((ticket) => {
                          const cardProps = {
                            onCardClick: () => setSelectedTicket(ticket),
                            showClaim: column.key === "pending",
                            showResolve: column.key === "inProgress",
                            showCancel:
                              column.key === "pending" ||
                              column.key === "inProgress",
                            onClaim: () =>
                              runAction(
                                () => handleClaimTicket(ticket.id),
                                "Couldn't claim this ticket.",
                              ),
                            onResolve: () =>
                              runAction(
                                () => handleResolveTicket(ticket.id),
                                "Couldn't resolve this ticket.",
                              ),
                            onCancel: () =>
                              runAction(
                                () => handleCancelTicket(ticket.id),
                                "Couldn't cancel this ticket.",
                              ),
                          };
                          return (
                            <View
                              key={ticket.id}
                              className={
                                column.key === "cancelled" ? "opacity-60" : ""
                              }
                            >
                              <TicketCard ticket={ticket} {...cardProps} />
                            </View>
                          );
                        })
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {selectedTicket && (
            <TicketDetails
              ticket={selectedTicket}
              relatedTickets={[selectedTicket]}
              onClose={() => setSelectedTicket(null)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpdeskBoard;
