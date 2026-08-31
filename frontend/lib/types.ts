export interface cardType {
  icon: React.ReactNode;
  title: string;
  text: string;
  path: string;
  link: string;
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
  type: string;
  department: string;
  status: string;
  assignee_name: string;
  last_serviced?: string;
  notes?: string;
}

export const DEPARTMENTS = [
  "Admin/HR",
  "Environment",
  "Education",
  "Tourism",
  "Finance",
  "ICT",
];
