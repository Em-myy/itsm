import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { TicketType } from "@/utils/helpers";
import api from "@/utils/axios";
import SubmitTicket from "@/components/tickets/submit-ticket";
import TicketDetails from "@/components/tickets/ticket-details";
import { supabase } from "@/lib/supabase";

const Tickets = () => {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  const fetchTickets = async (): Promise<void> => {
    try {
      const response = await api.get("/tickets/mine");
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch data");
    }
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

  const closeSubmit = () => {
    setIsSubmittingTicket(false);
  };
  return (
    <SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <View>
              <Text>My Tickets</Text>
              <Text> Every request you&apos;ve filed, in one place.</Text>
            </View>
            <TouchableOpacity onPress={() => setIsSubmittingTicket(true)}>
              <Plus size={30} />
              <Text>New Ticket</Text>
            </TouchableOpacity>
          </View>
          {tickets.map((ticket) => (
            <View key={ticket.id}>
              <Pressable onPress={() => setSelectedTicket(ticket)}>
                <Text>{ticket.reference}</Text>
                <Text>{ticket.title}</Text>
                <Text>{ticket.category}</Text>
                <Text>{ticket.priority}</Text>
                <Text>{ticket.status}</Text>
                <Text>{ticket.created_at}</Text>
              </Pressable>
            </View>
          ))}

          {isSubmittingTicket && (
            <SubmitTicket initialTickets={tickets} onClose={closeSubmit} />
          )}
          {selectedTicket && (
            <TicketDetails
              ticket={selectedTicket}
              relatedTickets={tickets}
              onClose={() => setSelectedTicket(null)}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Tickets;
