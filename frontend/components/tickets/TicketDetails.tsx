"use client";

import api from "@/lib/axios";
import { TicketType } from "@/lib/types";
import { getStatusStyle } from "@/utils/status-styles";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TicketForm, { TicketFormValues } from "./TicketForm";
import { AlertCircle, Ban, Pencil, X } from "lucide-react";
import { getPriorityColors } from "@/utils/priority-styles";

const TicketDetails = ({
  ticket,
  relatedTickets,
  onClose,
}: {
  ticket: TicketType;
  relatedTickets: TicketType[] | null;
  onClose: () => void;
}) => {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmingCancel, setConfirmingCancel] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const style = getStatusStyle(ticket.status);
  const isCancelled = ticket.status.toLowerCase() === "cancelled";

  const handleCancelTicket = async (ticketId: number) => {
    setError(null);
    setIsCancelling(true);

    try {
      await api.patch("/tickets/cancel", { ticket_id: ticketId });
      router.refresh();
      onClose();
    } catch (error: any) {
      console.error(error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Couldn't cancel this ticket. Please try again.",
      );
      setIsCancelling(false);
    }
  };

  const handleEditSubmit = async (values: TicketFormValues) => {
    const ticketPayload = {
      ticket_id: values.ticketId,
      title: values.title,
      category: values.category,
      department: values.department,
      priority: values.priority,
      related_asset: values.relatedAsset,
      description: values.description,
    };

    await api.patch("/tickets/update", ticketPayload);
    router.refresh();
    onClose();
  };

  if (mode === "edit") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
      >
        <div
          className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-muted cursor-pointer transition hover:text-heading"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="pr-8 font-serif text-2xl text-heading">Edit ticket</h2>
          <p className="mt-1 font-mono text-xs text-muted">
            {ticket.reference}
          </p>

          <div className="mt-6">
            <TicketForm
              relatedTickets={relatedTickets}
              initialValues={{
                ticketId: ticket.id,
                title: ticket.title,
                category: ticket.category,
                department: ticket.department,
                priority: ticket.priority,
                relatedAsset:
                  ticket.related_asset ??
                  "None - not tied to a registered asset",
                description: ticket.description ?? "",
              }}
              submitLabel="Save changes"
              submittingLabel="Saving..."
              cancelLabel="Discard changes"
              onSubmit={handleEditSubmit}
              onCancel={() => setMode("view")}
            />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted cursor-pointer transition hover:text-heading"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="pr-8 font-serif text-2xl text-heading">
          {ticket.title}
        </h2>
        <p className="mt-1 font-mono text-xs text-muted">{ticket.reference}</p>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between border-b border-line pb-3">
            <span className="font-medium text-body">Category</span>
            <span className="text-heading">{ticket.category}</span>
          </div>

          <div className="flex justify-between border-b border-line pb-3">
            <span className="font-medium text-body">Department</span>
            <span className="text-heading">{ticket.department}</span>
          </div>

          <div className="flex justify-between border-b border-line pb-3">
            <span className="font-medium text-body">Priority</span>
            <span
              className={`font-semibold ${getPriorityColors(ticket.priority)}`}
            >
              {ticket.priority}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="font-medium text-body">Status</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style.pill}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {ticket.status}
            </span>
          </div>

          <div className="pt-1">
            <span className="mb-1 block font-medium text-body">
              Description
            </span>
            <p className="text-heading">
              {ticket.description || "No description provided."}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          {isCancelled ? (
            <button
              onClick={onClose}
              type="button"
              className="rounded-xl bg-button px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-button-hover cursor-pointer"
            >
              Close
            </button>
          ) : confirmingCancel ? (
            <>
              <span className="mr-auto text-sm text-body">
                Cancel this ticket?
              </span>
              <button
                type="button"
                onClick={() => setConfirmingCancel(false)}
                disabled={isCancelling}
                className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-heading transition hover:bg-input-bg disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              >
                Never mind
              </button>
              <button
                type="button"
                onClick={() => handleCancelTicket(ticket.id)}
                disabled={isCancelling}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              >
                {isCancelling ? "Cancelling..." : "Confirm cancel"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConfirmingCancel(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 cursor-pointer"
              >
                <Ban className="h-5 w-5" />
                Cancel ticket
              </button>
              <button
                type="button"
                onClick={() => setMode("edit")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-heading transition hover:bg-input-bg cursor-pointer"
              >
                <Pencil className="h-5 w-5" />
                Edit
              </button>
              <button
                onClick={onClose}
                type="button"
                className="rounded-xl bg-button px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-button-hover cursor-pointer"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
