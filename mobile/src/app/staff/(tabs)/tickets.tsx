import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { TicketType } from "@/utils/helpers";
import api from "@/utils/axios";
import SubmitTicket from "@/components/tickets/submit-ticket";

const Tickets = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<boolean>(false);

  useEffect(() => {
    const fetchTickets = async (): Promise<void> => {
      const response = await api.get("/tickets/mine");
      setTickets(response.data);
    };

    fetchTickets();
  }, []);

  const closeSubmit = () => {
    setIsSubmittingTicket(false);
  };
  return (
    <SafeAreaView>
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
          <Text>{ticket.reference}</Text>
          <Text>{ticket.title}</Text>
          <Text>{ticket.category}</Text>
          <Text>{ticket.priority}</Text>
          <Text>{ticket.status}</Text>
          <Text>{ticket.created_at}</Text>
        </View>
      ))}

      {isSubmittingTicket && <SubmitTicket onClose={closeSubmit} />}
    </SafeAreaView>
  );
};

export default Tickets;
