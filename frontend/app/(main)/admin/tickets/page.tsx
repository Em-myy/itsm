import { fetchFromGo } from "@/lib/api-server";
import { TicketType } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import AdminKanbanBoard from "./AdminKanbanBoard";

const AdminTicketPage = async () => {
  const ticketsResult = (await fetchFromGo("/tickets")) as TicketType[];
  const tickets = ticketsResult || [];
  return (
    <div>
      <div>
        <h1>Helpdesk board</h1>
        <p>
          Unassigned tickets show <span className="font-semibold">+ Claim</span>{" "}
          - click a card for the full detail, or drag to move it.
        </p>
      </div>
      <AdminKanbanBoard initialTickets={tickets} />
    </div>
  );
};

export default AdminTicketPage;
