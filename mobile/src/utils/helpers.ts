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
