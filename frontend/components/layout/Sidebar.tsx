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
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavType {
  icon: React.ReactNode;
  name: string;
  path: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const StaffNav: NavType[] = [
  {
    icon: <HomeIcon className="w-5 h-5" />,
    name: "Dashboard",
    path: "/staff/home",
  },
  {
    icon: <Edit2 className="w-5 h-5" />,
    name: "Submit a ticket",
    path: "/staff/submit-ticket",
  },
  {
    icon: <Menu className="w-5 h-5" />,
    name: "My tickets",
    path: "/staff/tickets",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    name: "Bookings",
    path: "/staff/calendar",
  },
];

const AdminNav: NavType[] = [
  {
    icon: <House className="w-5 h-5" />,
    name: "Dashboard",
    path: "/admin/home",
  },
  {
    icon: <Columns3 className="w-5 h-5" />,
    name: "Helpdesk board",
    path: "/admin/tickets",
  },
  {
    icon: <Package className="w-5 h-5" />,
    name: "Master inventory",
    path: "/admin/assets",
  },
  {
    icon: <CircleCheck className="w-5 h-5" />,
    name: "Booking approvals",
    path: "/admin/bookings",
  },
  {
    icon: <UsersRound className="w-5 h-5" />,
    name: "User management",
    path: "/admin/users",
  },
];

const SignoutScene = (): React.ReactElement => {
  return (
    <span className="relative inline-flex h-6 w-16 items-center perspective-[200px]">
      <span className="absolute left-0.5 top-px h-5.5 w-3 rounded-sm border-2 border-white" />
      <span className="absolute left-0.5 top-px h-5.5 w-3 origin-right rounded-sm bg-white animate-door-out-swing motion-reduce:animate-none [animation-delay:150ms]" />
      <span className="absolute left-4 top-1/2 -mt-1.25 flex w-1.5 flex-col items-center animate-walker-exit motion-reduce:animate-none [animation-delay:250ms]">
        <span className="mb-px block h-1 w-1 rounded-full bg-white" />
        <span className="block h-1.5 w-1.25 rounded-t-xs rounded-b-[1px] bg-white" />
      </span>
    </span>
  );
};

const SidebarContent = ({
  isStaff,
  navItems,
  pathname,
  isSigningOut,
  onSignOutClick,
  onNavigate,
}: {
  isStaff: boolean;
  navItems: NavType[];
  pathname: string;
  isSigningOut: boolean;
  onSignOutClick: () => void;
  onNavigate: () => void;
}): React.ReactElement => {
  return (
    <>
      <div>
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-ink-border text-2xl font-semibold text-cream animate-badge-pulse">
            O
          </div>
          <div>
            <p className="text-[15px] font-semibold text-cream">Ojo ITSM</p>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-sage">
              IT &amp; Computer Unit
            </p>
          </div>
        </div>

        <div className="border-t border-ink-border pt-4">
          <p className="mb-3 px-2 font-mono text-xs uppercase tracking-[0.18em] text-sage">
            {isStaff ? "Staff Portal" : "IT ADMIN - COMMAND CENTER"}
          </p>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-button text-white hover:bg-button-hover"
                    : "text-bullet hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`flex items-center ${active ? "text-white" : "text-sage"}`}
                >
                  {item.icon}
                </span>
                <span className="text-[16px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-ink-border pt-4">
        <button
          type="button"
          onClick={onSignOutClick}
          disabled={isSigningOut}
          aria-label={isSigningOut ? "Signing Out" : undefined}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-bullet transition hover:bg-white/5 disabled:pointer-events-none disabled:cursor-not-allowed text-[16px] cursor-pointer"
        >
          {isSigningOut ? (
            <SignoutScene />
          ) : (
            <>
              <LogOut className="w-5 h-5" /> Sign Out
            </>
          )}
        </button>
      </div>
    </>
  );
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { role, handleSignout } = useAuth();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  if (!role) {
    return null;
  }

  const isStaff = role.name === "Staff";
  const isAdmin = role.name === "IT Admin";

  if (!isStaff && !isAdmin) {
    return null;
  }

  const navItems = isStaff ? StaffNav : AdminNav;

  const handleSignOut = (): void => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setTimeout(() => {
      handleSignout();
    }, 1100);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden animate-fade-in motion-reduce:animate-none"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col justify-between bg-ink px-4 py-6 shadow-xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-sage hover:bg-white/5 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent
          isStaff={isStaff}
          navItems={navItems}
          pathname={pathname}
          isSigningOut={isSigningOut}
          onSignOutClick={handleSignOut}
          onNavigate={onClose}
        />
      </aside>
    </>
  );
};

export default Sidebar;
