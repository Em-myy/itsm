import { StatusStyle } from "@/lib/types";

const STATUS_STYLES: Record<string, StatusStyle> = {
  pending: {
    pill: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    accent: "bg-rose-400",
  },
  open: {
    pill: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    accent: "bg-amber-400",
  },
  "in progress": {
    pill: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    accent: "bg-amber-400",
  },
  confirmed: {
    pill: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    accent: "bg-emerald-400",
  },
  approved: {
    pill: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    accent: "bg-emerald-400",
  },
  resolved: {
    pill: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    accent: "bg-emerald-400",
  },
  closed: {
    pill: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    accent: "bg-emerald-400",
  },
  rejected: {
    pill: "bg-red-50 text-red-700",
    dot: "bg-red-500",
    accent: "bg-red-400",
  },
  cancelled: {
    pill: "bg-red-50 text-red-700",
    dot: "bg-red-500",
    accent: "bg-red-400",
  },
};

const DEFAULT_STATUS_STYLE: StatusStyle = {
  pill: "bg-input-bg text-muted",
  dot: "bg-muted",
  accent: "bg-line",
};

export const getStatusStyle = (status: string): StatusStyle => {
  return STATUS_STYLES[status.toLowerCase()] ?? DEFAULT_STATUS_STYLE;
};
