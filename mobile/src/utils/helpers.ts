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
  button: "#1f4a3b",
  heading: "#182620",
  muted: "#8d8879",
  danger: "#b4432f",
  success: "#2f7d4f",
  overlay: "rgba(21,41,34,0.5)",
} as const;

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
