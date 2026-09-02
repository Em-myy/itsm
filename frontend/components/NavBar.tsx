"use client";

import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { Menu, Search } from "lucide-react";

const Navbar = () => {
  const { avatar, initials, displayName, role } = useAuth();
  const { openMobile } = useSidebar();

  return (
    <div className="flex w-full items-center gap-3 border-b border-line bg-white px-4 py-3 md:px-6">
      <button
        type="button"
        onClick={openMobile}
        aria-label="Open menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-heading transition hover:bg-input-bg md:hidden"
      >
        <Menu size={26} />
      </button>

      <button
        type="button"
        className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-line bg-input-bg px-3 py-2 text-sm text-muted transition hover:border-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        <Search className="h-5 w-5 shrink-0" />
        <span className="hidden sm:inline">
          {role.name === "Staff"
            ? "Search tickets or bookings"
            : "Search tickets, bookings, assets and venues"}
        </span>
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        {role.name && (
          <span className="hidden rounded-full bg-input-bg px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-muted sm:inline-block">
            {role.name}
          </span>
        )}

        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className="h-9 w-9 shrink-0 rounded-full border border-line object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-button text-xs font-semibold uppercase text-white">
            {initials}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
