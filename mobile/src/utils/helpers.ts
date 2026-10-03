export const DEPARTMENTS = [
  "Admin/HR",
  "Environment",
  "Education",
  "Tourism",
  "Finance",
  "ICT",
];

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
