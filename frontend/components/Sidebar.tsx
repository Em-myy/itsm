"use client";

import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
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

const StaffNav: NavType[] = [
  { icon: <HomeIcon size={18} />, name: "Dashboard", path: "/staff/home" },
  {
    icon: <Edit2 size={18} />,
    name: "Submit a ticket",
    path: "/staff/submit-ticket",
  },
  { icon: <Menu size={18} />, name: "My tickets", path: "/staff/tickets" },
  {
    icon: <Calendar size={18} />,
    name: "Venue calendar",
    path: "/staff/calendar",
  },
];

const AdminNav: NavType[] = [
  { icon: <House size={18} />, name: "Dashboard", path: "/admin/home" },
  {
    icon: <Columns3 size={18} />,
    name: "Helpdesk board",
    path: "/admin/tickets",
  },
  {
    icon: <Package size={18} />,
    name: "Master inventory",
    path: "/admin/assets",
  },
  {
    icon: <CircleCheck size={18} />,
    name: "Booking approvals",
    path: "/admin/bookings",
  },
  {
    icon: <UsersRound size={18} />,
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
  onNavigate?: () => void;
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
                    ? "bg-button text-white"
                    : "text-bullet hover:bg-white/5"
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
              <LogOut size={18} /> Sign Out
            </>
          )}
        </button>
      </div>
    </>
  );
};

const Sidebar = () => {
  const { role, handleSignout } = useAuth();
  const { mobileOpen, closeMobile } = useSidebar();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const isStaff = role.name === "Staff";
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
      <aside className="hidden h-screen w-64 shrink-0 flex-col justify-between bg-ink px-4 py-6 md:flex">
        <SidebarContent
          isStaff={isStaff}
          navItems={navItems}
          pathname={pathname}
          isSigningOut={isSigningOut}
          onSignOutClick={handleSignOut}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-black/40 motion-reduce:animate-none"
            onClick={closeMobile}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] animate-drawer-in flex-col justify-between bg-ink px-4 py-6 shadow-xl motion-reduce:animate-none">
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Close menu"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-sage hover:bg-white/5"
            >
              <X size={26} />
            </button>
            <SidebarContent
              isStaff={isStaff}
              navItems={navItems}
              pathname={pathname}
              isSigningOut={isSigningOut}
              onSignOutClick={handleSignOut}
              onNavigate={closeMobile}
            />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
