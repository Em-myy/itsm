import { fetchFromGo } from "@/lib/api-server";
import { TicketType } from "@/lib/types";
import TicketsClientPage from "./TicketsClient";

const TicketsPage = async () => {
  const tickets = (await fetchFromGo("/tickets/mine")) as TicketType[] | null;
  return (
    <div>
      <h1>My Tickets</h1>
      <p>Every Requests you've filed in one place</p>
      <TicketsClientPage initialTickets={tickets} />
    </div>
  );
};

export default TicketsPage;
