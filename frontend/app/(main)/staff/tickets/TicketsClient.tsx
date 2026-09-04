"use client";

import api from "@/lib/axios";
import { TicketType } from "@/lib/types";
import { getPriorityColors } from "@/utils/priority-styles";
import { getStatusStyle } from "@/utils/status-styles";
import { createClient } from "@/utils/supabase/client";
import { Filter, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const FILTERS = ["All", "Pending", "In Progress", "Resolved"];
type Filter = (typeof FILTERS)[number];

const FILTER_STATUS: Record<Filter, string | null> = {
  All: null,
  Pending: "pending",
  "In Progress": "in progress",
  Resolved: "resolved",
};

const TicketsClientPage = ({
  initialTickets,
}: {
  initialTickets: TicketType[] | null;
}) => {
  const supabase = createClient();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  useEffect(() => {
    const channel = supabase
      .channel("realtime_tickets")
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

  const ticketsArray = initialTickets ?? [];
  const isEmpty = ticketsArray.length === 0;

  const targetStatus = FILTER_STATUS[activeFilter];
  const filteredStatus = targetStatus
    ? ticketsArray.filter(
        (ticket) => ticket.status.toLowerCase() === targetStatus,
      )
    : ticketsArray;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-heading">My tickets</h1>
          <p className="mt-1 text-sm text-body">
            Every request you&apos;ve filed, in one place.
          </p>
        </div>
        <Link
          href="/staff/submit-ticket"
          className="inline-flex items-center gap-1.5 rounded-xl bg-button px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <Plus className="h-5 w-5" />
          New ticket
        </Link>
      </div>

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-line bg-white px-4 py-12 text-center">
          <p className="text-sm text-body">No tickets filed yet.</p>
          <Link
            href="/staff/submit-ticket"
            className="mt-2 inline-block text-sm font-medium text-button hover:underline"
          >
            Report an issue
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div className="inline-flex items-center gap-1 rounded-full bg-input-bg p-1">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap rounded-full cursor-pointer px-4 py-2 text-sm font-medium transition ${
                    activeFilter === filter
                      ? "bg-white text-heading shadow-sm"
                      : "text-body hover:text-heading"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-180 text-left text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted">
                      REFERENCE
                    </th>
                    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted">
                      ISSUE
                    </th>
                    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted">
                      CATEGORY
                    </th>
                    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted">
                      PRIORITY
                    </th>
                    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted">
                      STATUS
                    </th>
                    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted">
                      FILED
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStatus.map((ticket) => {
                    const style = getStatusStyle(ticket.status);
                    return (
                      <tr
                        key={ticket.id}
                        className="border-b border-line transition last:border-0 hover:bg-input-bg/60"
                      >
                        <td className="px-4 py-4">
                          <span className="inline-block -skew-y-2 rounded-md bg-input-bg px-2.5 py-1">
                            <span className="inline-block font-mono text-xs text-muted">
                              {ticket.reference}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-4 text-heading">
                          {ticket.title}
                        </td>
                        <td className="px-4 py-4 text-body">
                          {ticket.category}
                        </td>
                        <td
                          className={`px-4 py-4 font-semibold ${getPriorityColors(ticket.priority)}`}
                        >
                          {ticket.priority}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style.pill}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                            />
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-bod">
                          {new Date(ticket.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TicketsClientPage;
