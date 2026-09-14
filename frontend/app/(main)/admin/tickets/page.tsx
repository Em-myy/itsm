import { fetchFromGo } from "@/lib/api-server";
import { TicketType } from "@/lib/types";
import AdminKanbanBoard from "./AdminKanbanBoard";

const AdminTicketPage = async () => {
  const ticketsResult = (await fetchFromGo("/tickets")) as TicketType[];
  const tickets = ticketsResult || [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-heading">Helpdesk board</h1>
        <p className="mt-1 text-sm text-body">
          Unassigned tickets show{" "}
          <span className="font-semibold text-heading">+ Claim</span> — drag a
          card to move it, or use the actions on each card.
        </p>
      </div>
      <AdminKanbanBoard initialTickets={tickets} />
    </div>
  );
};

export default AdminTicketPage;
