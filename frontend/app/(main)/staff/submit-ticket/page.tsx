import { fetchFromGo } from "@/lib/api-server";
import { TicketType } from "@/lib/types";
import SubmitTicketClient from "./SubmitTicketClient";

const SubmitTicketPage = async () => {
  const PrevTickets = (await fetchFromGo("/tickets/mine")) as
    | TicketType[]
    | null;

  return <SubmitTicketClient initialTickets={PrevTickets || []} />;
};

export default SubmitTicketPage;
