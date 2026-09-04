"use client";

import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { SearchCategory } from "@/lib/types";
import {
  Calendar,
  Edit2,
  Menu,
  Package,
  Search,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import SearchModal from "./SearchModal";

const STAFF_SEARCH_CATEGORIES: SearchCategory[] = [
  { id: "tickets", label: "Tickets", icon: Edit2 },
  { id: "bookings", label: "Bookings", icon: Calendar },
];

const ADMIN_SEARCH_CATEGORIES: SearchCategory[] = [
  { id: "tickets", label: "Tickets", icon: Edit2 },
  { id: "assets", label: "Assets", icon: Package },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "users", label: "Users", icon: UsersRound },
];

const Navbar = () => {
  const { avatar, initials, displayName, role } = useAuth();
  const { openMobile } = useSidebar();
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  const isStaff = role?.name === "Staff";
  const categories = isStaff
    ? STAFF_SEARCH_CATEGORIES
    : ADMIN_SEARCH_CATEGORIES;
  const categoryLabels = categories
    .map((c) => c.label.toLowerCase())
    .join(", ");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex w-full items-center gap-3 border-b border-line bg-white px-4 py-3 md:px-6">
      <button
        type="button"
        onClick={openMobile}
        aria-label="Open menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-heading transition hover:bg-input-bg md:hidden"
      >
        <Menu size={18} />
      </button>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-line bg-input-bg px-3 py-2 text-sm text-muted transition hover:border-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        <Search className="h-5 w-5 shrink-0" />
        <span className="hidden sm:inline">Search {categoryLabels}</span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-line bg-white px-1.5 py-0.5 font-mono text-[10px] text-muted md:inline-block">
          &#8984;K
        </kbd>
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

      {searchOpen && (
        <SearchModal
          categories={categories}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
};

export default Navbar;
