export const DEPARTMENTS = [
  "Admin/HR",
  "Environment",
  "Education",
  "Tourism",
  "Finance",
  "ICT",
] as const;

export const colors = {
  cream: "#f3eee1",
  surface: "#f7f4ea",
  line: "#e5e0d1",
  button: "#1f4a3b",
  heading: "#182620",
  muted: "#8d8879",
  danger: "#b4432f",
  success: "#2f7d4f",
  overlay: "rgba(21,41,34,0.5)",
} as const;

export interface StatusStyle {
  bg: string;
  text: string;
  dot: string;
  accent: string;
}

export type FormMessageData = {
  type: "error" | "success";
  text: string;
} | null;

export interface UserType {
  id?: number;
  username: string;
  email: string;
  department: string;
  role_id: number;
  role_name: string;
  status: "Pending" | "Active" | "Suspended";
  created_at: string;
}

export interface TicketType {
  id: number;
  reference: string;
  title: string;
  category: string;
  department: string;
  priority: string;
  status: string;
  related_asset: string;
  description: string;
  assignee_id?: string;
  assignee_name?: string;
  picture?: string;
  created_at: string;
}

export interface BookingType {
  id: number;
  reference: string;
  username?: string;
  department?: string;
  purpose: string;
  venue_id: number;
  venue_name: string;
  start_time: string;
  end_time: string;
  status: string;
  equipment_needed: string[];
}

export interface VenueType {
  id: number;
  reference?: string;
  name: string;
  capacity: number;
  status: string;
  equipments: string[];
}

export interface AssetType {
  id: number;
  reference: string;
  asset_type: string;
  department: string;
  status: string;
  assignee_name: string;
  last_serviced?: string;
  notes?: string;
}

export const formerTimeAgo = (dateString: string | Date) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export const getEquipmentLabel = (equipment: string): string => {
  const separatorIndex = equipment.indexOf(" - ");
  return separatorIndex === -1
    ? equipment
    : equipment.slice(separatorIndex + 3);
};

const ROSE: StatusStyle = {
  bg: "bg-rose-50",
  text: "text-rose-700",
  dot: "bg-rose-500",
  accent: "bg-rose-400",
};
const AMBER: StatusStyle = {
  bg: "bg-amber-50",
  text: "text-amber-700",
  dot: "bg-amber-500",
  accent: "bg-amber-400",
};
const EMERALD: StatusStyle = {
  bg: "bg-emerald-50",
  text: "text-emerald-700",
  dot: "bg-emerald-500",
  accent: "bg-emerald-400",
};
const RED: StatusStyle = {
  bg: "bg-red-50",
  text: "text-red-700",
  dot: "bg-red-500",
  accent: "bg-red-400",
};
const NEUTRAL: StatusStyle = {
  bg: "bg-input-bg",
  text: "text-muted",
  dot: "bg-muted",
  accent: "bg-line",
};

const STATUS_STYLES: Record<string, StatusStyle> = {
  pending: ROSE,
  open: AMBER,
  "in progress": AMBER,
  "in repair": AMBER,
  confirmed: EMERALD,
  approved: EMERALD,
  resolved: EMERALD,
  active: EMERALD,
  rejected: RED,
  cancelled: RED,
  retired: NEUTRAL,
};

export const getStatusStyle = (status: string): StatusStyle => {
  return STATUS_STYLES[status.toLowerCase()] ?? NEUTRAL;
};

export const getPriorityColors = (priority: string): string => {
  const value = priority.toLowerCase();

  if (value === "urgent") {
    return "text-red-600";
  }

  if (value === "low") {
    return "text-emerald-600";
  }

  return "text-blue-700";
};
