"use client";

import { useAuth } from "@/context/AuthContext";
import { Calendar, Edit2, HomeIcon, LogOut, Menu } from "lucide-react";
import Link from "next/link";

interface NavType {
  icon: React.ReactNode;
  name: string;
  path: string;
}

const Sidebar = () => {
  const Nav: NavType[] = [
    { icon: <HomeIcon />, name: "Dashboard", path: "/staff/home" },
    { icon: <Edit2 />, name: "Submit a ticket", path: "/staff/submit-ticket" },
    { icon: <Menu />, name: "My tickets", path: "/staff/tickets" },
    { icon: <Calendar />, name: "Venue calendar", path: "/staff/calendar" },
  ];
  const { handleSignout } = useAuth();
  return (
    <div>
      <div>
        <h2>Ojo ITSM</h2>
      </div>
      <h3>Staff Portal</h3>
      <div>
        {Nav.map((items, index) => (
          <Link href={items.path} key={index}>
            <div>{items.icon}</div>
            <p>{items.name}</p>
          </Link>
        ))}
      </div>

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
