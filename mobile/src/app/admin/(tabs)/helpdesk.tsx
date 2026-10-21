import { PriorityTag, Tag } from "@/components/layout/badges";
import FormMessage from "@/components/layout/form-message";
import TicketDetails from "@/components/tickets/ticket-details";
import { supabase } from "@/lib/supabase";
import api from "@/utils/axios";
import {
  colors,
  formerTimeAgo,
  getStatusStyle,
  TicketType,
} from "@/utils/helpers";
import { Ban, CircleCheck, UserCheck } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { ScrollView, Text, View } from "react-native";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ColumnKey = "pending" | "inProgress" | "resolved" | "cancelled";

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
  columnKey,
  busy,
  confirmingCancel,
  onPress,
  onClaim,
  onResolve,
  onAskCancel,
  onKeep,
  onConfirmCancel,
}: {
  ticket: TicketType;
  columnKey: ColumnKey;
  busy: boolean;
  confirmingCancel: boolean;
  onPress: () => void;
  onClaim: () => void;
  onResolve: () => void;
  onAskCancel: () => void;
  onKeep: () => void;
  onConfirmCancel: () => void;
}) => {
  const status = getStatusStyle(ticket.status);
  const hasAssignee =
    !!ticket.assignee_name && ticket.assignee_name !== "Unassigned";
  const initials = ticket.assignee_name?.charAt(0).toUpperCase() || "?";

  const showClaim = columnKey === "pending";
  const showResolve = columnKey === "inProgress";
  const showCancel = columnKey === "pending" || columnKey === "inProgress";

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row overflow-hidden rounded-card border border-line bg-surface-hover active:opacity-80 ${
        columnKey === "cancelled" ? "opacity-60" : ""
      }`}
    >
      <View className={`w-1.5 ${status.accent}`} />
      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-sans-medium text-xs text-muted">
            {ticket.reference.slice(12) || ticket.reference}
          </Text>
          <Text className="font-sans text-xs text-muted">
            {formerTimeAgo(ticket.created_at)}
          </Text>
        </View>

        <Text
          className="mt-2 font-sans-bold text-base text-heading"
          numberOfLines={2}
        >
          {ticket.title}
        </Text>

        <View className="mt-3 flex-row flex-wrap gap-2">
          <Tag label={ticket.department} />
          <PriorityTag priority={ticket.priority} />
        </View>

        {hasAssignee && (
          <View className="mt-3 flex-row items-center">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-button">
              <Text className="font-sans-bold text-xs text-cream">
                {initials}
              </Text>
            </View>
            <Text
              className="ml-2 flex-1 font-sans text-sm text-body"
              numberOfLines={1}
            >
              {ticket.assignee_name}
            </Text>
          </View>
        )}

        {(showClaim || showResolve || showCancel) && (
          <View className="mt-4">
            {confirmingCancel ? (
              <View>
                <Text className="mb-2 font-sans-medium text-sm text-heading">
                  Cancel this ticket?
                </Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={onKeep}
                    disabled={busy}
                    className="h-10 flex-1 items-center justify-center rounded-control border border-line bg-input-bg active:opacity-80"
                  >
                    <Text className="font-sans-semibold text-sm text-heading">
                      No
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={onConfirmCancel}
                    disabled={busy}
                    className={`h-10 flex-1 flex-row items-center justify-center rounded-control bg-danger active:opacity-80 ${
                      busy ? "opacity-60" : ""
                    }`}
                  >
                    {busy && (
                      <ActivityIndicator
                        size="small"
                        color={colors.cream}
                        className="mr-2"
                      />
                    )}
                    <Text className="font-sans-semibold text-sm text-cream">
                      Yes, cancel
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="flex-row gap-2">
                {showClaim && (
                  <Pressable
                    onPress={onClaim}
                    disabled={busy}
                    className={`h-10 flex-1 flex-row items-center justify-center rounded-control border border-button bg-input-bg active:opacity-80 ${
                      busy ? "opacity-50" : ""
                    }`}
                  >
                    <UserCheck size={16} color={colors.button} />
                    <Text className="ml-1.5 font-sans-semibold text-sm text-button">
                      Claim
                    </Text>
                  </Pressable>
                )}
                {showResolve && (
                  <Pressable
                    onPress={onResolve}
                    disabled={busy}
                    className={`h-10 flex-1 flex-row items-center justify-center rounded-control bg-button active:bg-button-hover ${
                      busy ? "opacity-50" : ""
                    }`}
                  >
                    <CircleCheck size={16} color={colors.cream} />
                    <Text className="ml-1.5 font-sans-semibold text-sm text-cream">
                      Resolve
                    </Text>
                  </Pressable>
                )}
                {showCancel && (
                  <Pressable
                    onPress={onAskCancel}
                    disabled={busy}
                    className={`h-10 flex-1 flex-row items-center justify-center rounded-control border border-danger bg-danger-bg active:opacity-80 ${
                      busy ? "opacity-50" : ""
                    }`}
                  >
                    <Ban size={16} color={colors.danger} />
                    <Text className="ml-1.5 font-sans-semibold text-sm text-danger">
                      Cancel
                    </Text>
                  </Pressable>
                )}
              </View>
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
  const [activeKey, setActiveKey] = useState<ColumnKey>("pending");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmingCancelId, setConfirmingCancelId] = useState<number | null>(
    null,
  );
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  const fetchTickets = async (): Promise<void> => {
    try {
      const response = await api.get("/tickets");
      setTickets(response.data);
      setHasError(false);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
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
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const runAction = async (
    ticketId: number,
    path: string,
    errorMessage: string,
  ): Promise<void> => {
    setActionError(null);
    setBusyId(ticketId);

    try {
      await api.patch(path, { ticket_id: ticketId });
      await fetchTickets();
    } catch (error: any) {
      console.log(error);
      setActionError(error.response?.data?.message || errorMessage);
    } finally {
      setBusyId(null);
      setConfirmingCancelId(null);
    }
  };

  const activeColumn = COLUMNS.find((c) => c.key === activeKey)!;
  const visibleTickets = tickets.filter(
    (t) => t.status === activeColumn.status,
  );
  const countFor = (status: string) =>
    tickets.filter((t) => t.status === status).length;

  const message =
    actionError ??
    (hasError ? "Couldn't load tickets. Pull down to try again." : null);

  const header = (
    <View className="mb-4">
      <Text className="font-sans-extrabold text-2xl text-heading">
        Helpdesk board
      </Text>
      <Text className="mt-1 font-sans text-sm text-body">
        Claim new tickets, resolve them, or cancel them.
      </Text>

      {message && (
        <View className="mt-4">
          <FormMessage message={{ type: "error", text: message }} />
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5 mt-4"
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {COLUMNS.map((column) => {
          const active = column.key === activeKey;
          return (
            <Pressable
              key={column.key}
              onPress={() => {
                setActiveKey(column.key);
                setActionError(null);
                setConfirmingCancelId(null);
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              className={`h-10 flex-row items-center rounded-full border px-4 ${
                active
                  ? "border-button bg-button"
                  : "border-line bg-surface-hover"
              }`}
            >
              <Text
                className={`font-sans-semibold text-sm ${active ? "text-cream" : "text-body"}`}
              >
                {column.label}
              </Text>
              <View
                className={`ml-2 min-w-[22px] items-center rounded-full px-1.5 py-0.5 ${
                  active ? "bg-cream" : "bg-input-bg"
                }`}
              >
                <Text
                  className={`font-sans-bold text-xs ${active ? "text-button" : "text-body"}`}
                >
                  {countFor(column.status)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const empty = isLoading ? (
    <View className="items-center py-16">
      <ActivityIndicator size="large" color={colors.button} />
    </View>
  ) : (
    <Text className="py-12 text-center font-sans text-sm text-muted">
      {activeColumn.emptyText}
    </Text>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f3eee1" }}
      edges={["top"]}
    >
      <FlatList
        data={visibleTickets}
        keyExtractor={(ticket) => String(ticket.id)}
        renderItem={({ item }) => (
          <TicketCard
            ticket={item}
            columnKey={activeKey}
            busy={busyId === item.id}
            confirmingCancel={confirmingCancelId === item.id}
            onPress={() => setSelectedTicket(item)}
            onClaim={() =>
              runAction(
                item.id,
                "/tickets/claim",
                "Couldn't claim this ticket.",
              )
            }
            onResolve={() =>
              runAction(
                item.id,
                "/tickets/resolve",
                "Couldn't resolve this ticket.",
              )
            }
            onAskCancel={() => setConfirmingCancelId(item.id)}
            onKeep={() => setConfirmingCancelId(null)}
            onConfirmCancel={() =>
              runAction(
                item.id,
                "/tickets/cancel",
                "Couldn't cancel this ticket.",
              )
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={{ padding: 20, paddingBottom: 30, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.button}
            colors={[colors.button]}
          />
        }
      />

      {selectedTicket && (
        <TicketDetails
          ticket={selectedTicket}
          relatedTickets={[selectedTicket]}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </SafeAreaView>
  );
};

export default HelpdeskBoard;
