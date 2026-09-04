import { fetchFromGo } from "@/lib/api-server";
import { TicketType } from "@/lib/types";
import TicketsClientPage from "./TicketsClient";

const TicketsPage = async () => {
  const tickets = (await fetchFromGo("/tickets/mine")) as TicketType[] | null;
  return (
    <div>
      <TicketsClientPage initialTickets={tickets} />
    </div>
  );
};

export default TicketsPage;
