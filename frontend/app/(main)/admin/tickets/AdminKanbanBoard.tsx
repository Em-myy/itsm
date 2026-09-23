"use client";

import TicketDetails from "@/components/tickets/TicketDetails";
import api from "@/lib/axios";
import { TicketType } from "@/lib/types";
import { getPriorityColors } from "@/utils/priority-styles";
import { getStatusStyle } from "@/utils/status-styles";
import { createClient } from "@/utils/supabase/client";
import { PointerActivationConstraints } from "@dnd-kit/dom";
import {
  DragDropProvider,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
} from "@dnd-kit/react";
import { AlertCircle, Ban, CheckCircle2, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

const getValidTargets = (status: string): ColumnKey[] => {
  if (status === "Pending") return ["inProgress", "cancelled"];
  if (status === "In Progress") return ["resolved", "cancelled"];
  return [];
};

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
  const style = getStatusStyle(ticket.status);
  const hasAssignee =
    ticket.assignee_name && ticket.assignee_name !== "Unassigned";
  const initials = ticket.assignee_name?.charAt(0).toUpperCase() || "?";

  return (
    <div
      className="flex items-stretch overflow-hidden rounded-xl border border-line bg-white"
      onClick={onCardClick}
    >
      <span className={`w-1 shrink-0 ${style.accent}`} />
      <div className="min-w-0 flex-1 p-4">
        <h3 className="text-sm font-semibold text-heading">{ticket.title}</h3>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-body">
            {ticket.department}
            {ticket.priority && (
              <>
                {" "}
                &middot;{" "}
                <span
                  className={`font-semibold ${getPriorityColors(ticket.priority)}`}
                >
                  {ticket.priority}
                </span>
              </>
            )}
          </p>
          <span className="shrink-0 rounded-md bg-input-bg px-2 py-1 font-mono text-xs text-muted">
            {ticket.reference.slice(12)}
          </span>
        </div>

        {hasAssignee && (
          <div className="mt-3 flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-button text-[10px] font-semibold uppercase text-white">
              {initials}
            </span>
            <span className="truncate text-xs text-body">
              {ticket.assignee_name}
            </span>
          </div>
        )}

        {(showClaim || showResolve || showCancel) && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {showClaim && (
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  if (onClaim) onClaim();
                }}
                className="rounded-lg border border-dashed border-line bg-input-bg px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-surface-hover cursor-pointer"
              >
                <span className="flex gap-1 items-center">
                  <UserCheck className="w-3 h-3" />
                  Claim
                </span>
              </button>
            )}
            {showResolve && (
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  if (onResolve) onResolve();
                }}
                className="rounded-lg border border-dashed border-line bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-500 cursor-pointer"
              >
                <span className="flex gap-1 items-center">
                  <CheckCircle2 className="w-3 h-3" />
                  Resolve
                </span>
              </button>
            )}
            {showCancel && (
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  if (onCancel) onCancel();
                }}
                className="rounded-lg border border-dashed border-line bg-red-800 px-3 py-1.5 text-xs font-semibold text-red-50 transition hover:bg-red-700 cursor-pointer"
              >
                <span className="flex gap-1 items-center">
                  <Ban className="w-3 h-3" />
                  Cancel
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const DraggableCard = ({
  ticket,
  onCardClick,
  ...cardProps
}: TicketCardProps): React.ReactElement => {
  const { ref } = useDraggable({
    id: String(ticket.id),
  });
  return (
    <div ref={ref} onClick={onCardClick} className="cursor-pointer">
      <TicketCard ticket={ticket} {...cardProps} />
    </div>
  );
};

const DroppableColumn = ({
  id,
  isValidTarget,
  children,
}: {
  id: string;
  isValidTarget: boolean;
  children: React.ReactNode;
}): React.ReactElement => {
  const { ref } = useDroppable({
    id,
  });
  return (
    <div
      ref={ref}
      className={`min-h-32 space-y-3 rounded-xl transition ${
        isValidTarget ? "bg-surface-hover ring-2 ring-button ring-offset-2" : ""
      }`}
    >
      {children}
    </div>
  );
};

const AdminKanbanBoard = ({
  initialTickets,
}: {
  initialTickets: TicketType[];
}) => {
  const supabase = createClient();
  const router = useRouter();

  const [tickets, setTickets] = useState<TicketType[]>(initialTickets);
  const [activeTickets, setActiveTickets] = useState<TicketType | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  const sensors = [
    PointerSensor.configure({
      activationConstraints: [
        new PointerActivationConstraints.Distance({ value: 5 }),
      ],
    }),
  ];

  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  useEffect(() => {
    const channel = supabase
      .channel("realtime_kanban_tickets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  const handleClaimTicket = async (ticketId: number): Promise<void> => {
    try {
      await api.patch("/tickets/claim", { ticket_id: ticketId });
      router.refresh();
    } catch (error) {
      throw error;
    }
  };

  const handleResolveTicket = async (ticketId: number): Promise<void> => {
    try {
      await api.patch("/tickets/resolve", { ticket_id: ticketId });
      router.refresh();
    } catch (error) {
      throw error;
    }
  };

  const handleCancelTicket = async (ticketId: number): Promise<void> => {
    try {
      await api.patch("/tickets/cancel", { ticket_id: ticketId });
      router.refresh();
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

  const handleDragStart = (event: DragStartEvent): void => {
    const ticket = tickets.find(
      (t) => String(t.id) === event.operation.source?.id,
    );
    setActiveTickets(ticket ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    setActiveTickets(null);
    if (event.canceled) return;

    const { source, target } = event.operation;

    if (!source || !target) return;

    const ticketId = Number(source.id);
    const targetKey = String(target?.id) as ColumnKey;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const validTargets = getValidTargets(ticket.status);
    if (!validTargets.includes(targetKey)) return;

    const targetColumn = COLUMNS.find((c) => c.key === targetKey);
    if (!targetColumn) return;

    const previousStatus = ticket.status;

    try {
      if (targetKey === "inProgress") {
        await handleClaimTicket(ticketId);
      } else if (targetKey === "resolved") {
        await handleResolveTicket(ticketId);
      } else if (targetKey === "cancelled") {
        await handleCancelTicket(ticketId);
      }
    } catch (error: any) {
      setActionError("Couldn't move that ticket. It's been put back.");
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: previousStatus } : t,
        ),
      );
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
    <div>
      {actionError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <DragDropProvider
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 overflow-x-auto pb-2">
          {COLUMNS.map((column) => {
            const columnTickets = grouped[column.key];
            const draggableColumn =
              column.key === "pending" || column.key === "inProgress";
            return (
              <div
                key={column.key}
                className="w-[calc(100vw-2rem)] sm:w-64 h-fit shrink-0 rounded-2xl border border-line bg-white p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-body">
                    {column.label}
                  </h2>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white text-xs font-semibold text-heading">
                    {columnTickets.length}
                  </span>
                </div>

                <DroppableColumn
                  id={column.key}
                  isValidTarget={
                    activeTickets
                      ? getValidTargets(activeTickets.status).includes(
                          column.key,
                        )
                      : false
                  }
                >
                  {columnTickets.length === 0 ? (
                    <p className="py-6 text-center text-xs text-muted">
                      {column.emptyText}
                    </p>
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
                      return draggableColumn ? (
                        <DraggableCard
                          key={ticket.id}
                          ticket={ticket}
                          {...cardProps}
                        />
                      ) : (
                        <div
                          key={ticket.id}
                          className={
                            column.key === "cancelled" ? "opacity-60" : ""
                          }
                        >
                          <TicketCard ticket={ticket} {...cardProps} />
                        </div>
                      );
                    })
                  )}
                </DroppableColumn>
              </div>
            );
          })}
        </div>
      </DragDropProvider>

      {selectedTicket && (
        <TicketDetails
          ticket={selectedTicket}
          relatedTickets={[selectedTicket]}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
};

export default AdminKanbanBoard;
