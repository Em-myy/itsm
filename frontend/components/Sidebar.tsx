"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  CircleCheck,
  Columns3,
  Edit2,
  HomeIcon,
  House,
  LogOut,
  Menu,
  Package,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

interface NavType {
  icon: React.ReactNode;
  name: string;
  path: string;
}

const Sidebar = () => {
  const StaffNav: NavType[] = [
    { icon: <HomeIcon />, name: "Dashboard", path: "/staff/home" },
    { icon: <Edit2 />, name: "Submit a ticket", path: "/staff/submit-ticket" },
    { icon: <Menu />, name: "My tickets", path: "/staff/tickets" },
    { icon: <Calendar />, name: "Venue calendar", path: "/staff/calendar" },
  ];

  const AdminNav: NavType[] = [
    { icon: <House />, name: "Dashboard", path: "/admin/home" },
    { icon: <Columns3 />, name: "Helpdesk board", path: "/admin/tickets" },
    { icon: <Package />, name: "Mater inventory", path: "/admin/assets" },
    {
      icon: <CircleCheck />,
      name: "Booking approvals",
      path: "/admin/bookings",
    },
    { icon: <UsersRound />, name: "User management", path: "/admin/users" },
  ];
  const { role, handleSignout } = useAuth();
  return (
    <div>
      <div>
        <h2>Ojo ITSM</h2>
      </div>
      {role.name === "Staff" ? (
        <div>
          <h3>Staff Portal</h3>
          <div>
            {StaffNav.map((items, index) => (
              <Link href={items.path} key={index}>
                <div>{items.icon}</div>
                <p>{items.name}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h3>IT ADMIN - COMMAND CENTER</h3>
          <div>
            {AdminNav.map((items, index) => (
              <Link href={items.path} key={index}>
                <div>{items.icon}</div>
                <p>{items.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <button type="button" onClick={handleSignout} className="flex">
          <LogOut />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
