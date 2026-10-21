import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, TicketIcon, UserRound } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  colors,
  formerTimeAgo,
  getStatusStyle,
  TicketType,
} from "@/utils/helpers";
import api from "@/utils/axios";
import SubmitTicket from "@/components/tickets/submit-ticket";
import TicketDetails from "@/components/tickets/ticket-details";
import { supabase } from "@/lib/supabase";
import { PriorityTag, StatusBadge, Tag } from "@/components/layout/badges";
import FormMessage from "@/components/layout/form-message";

const TicketCard = ({
  ticket,
  onPress,
}: {
  ticket: TicketType;
  onPress: () => void;
}) => {
  const status = getStatusStyle(ticket.status);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row overflow-hidden rounded-card border border-line bg-surface-hover active:opacity-80"
    >
      <View className={`w-1.5 ${status.accent}`} />

      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-sans-medium text-xs text-muted">
            {ticket.reference}
          </Text>
          <StatusBadge status={ticket.status} />
        </View>

        <Text
          className="mt-2 font-sans-bold text-base text-heading"
          numberOfLines={2}
        >
          {ticket.title}
        </Text>

        <View className="mt-3 flex-row flex-wrap gap-2">
          <Tag label={ticket.category} />
          <PriorityTag priority={ticket.priority} />
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="font-sans text-xs text-muted">
            {formerTimeAgo(ticket.created_at)}
          </Text>
          {ticket.assignee_name ? (
            <View className="flex-row items-center">
              <UserRound size={14} color={colors.muted} />
              <Text
                className="ml-1 max-w-[160px] font-sans text-xs text-muted"
                numberOfLines={1}
              >
                {ticket.assignee_name}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

const Tickets = () => {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  const fetchTickets = async (): Promise<void> => {
    try {
      const response = await api.get("/tickets/mine");
      setTickets(response.data);
      setHasError(false);
    } catch (error) {
      console.error("Failed to fetch data");
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
      .channel("staff_tickets_page")
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

  const header = (
    <View className="mb-2">
      <View className="flex-row items-start justify-between">
        <View className="mr-3 flex-1">
          <Text className="font-sans-extrabold text-2xl text-heading">
            My Tickets
          </Text>
          <Text className="mt-1 font-sans text-sm text-body">
            Every request you&apos;ve filed, in one place.
          </Text>
        </View>
        <Pressable
          onPress={() => setIsSubmittingTicket(true)}
          className="h-11 flex-row items-center rounded-control bg-button px-4 active:bg-button-hover"
          accessibilityRole="button"
          accessibilityLabel="Create a new ticket"
        >
          <Plus size={18} color={colors.cream} />
          <Text className="ml-1.5 font-sans-semibold text-sm text-cream">
            New Ticket
          </Text>
        </Pressable>
      </View>

      {hasError && (
        <View className="mt-4">
          <FormMessage
            message={{
              type: "error",
              text: "Couldn't load your tickets. Pull down to try again.",
            }}
          />
        </View>
      )}
    </View>
  );

  const empty = isLoading ? (
    <View className="items-center py-16">
      <ActivityIndicator size="large" color={colors.button} />
    </View>
  ) : hasError ? null : (
    <View className="items-center py-16">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full border border-line bg-surface-hover">
        <TicketIcon size={28} color={colors.muted} />
      </View>
      <Text className="font-sans-bold text-lg text-heading">
        No tickets yet
      </Text>
      <Text className="mt-1 text-center font-sans text-sm text-body">
        Tap &quot;New ticket&quot; to file your first request.
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.cream,
      }}
      edges={["top"]}
    >
      <FlatList
        data={tickets}
        keyExtractor={(ticket) => String(ticket.id)}
        renderItem={({ item }) => (
          <TicketCard ticket={item} onPress={() => setSelectedTicket(item)} />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={{ padding: 20, paddingBottom: 30, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.button}
            colors={[colors.button]}
          />
        }
      />

      {isSubmittingTicket && (
        <SubmitTicket
          initialTickets={tickets}
          onClose={() => setIsSubmittingTicket(false)}
        />
      )}
      {selectedTicket && (
        <TicketDetails
          ticket={selectedTicket}
          relatedTickets={tickets}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </SafeAreaView>
  );
};

export default Tickets;
