"use client";

import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { SearchCategory } from "@/lib/types";
import {
  Calendar,
  ChevronDown,
  Edit2,
  Menu,
  Package,
  Search,
  User,
  UsersRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SearchModal from "../shared/SearchModal";
import Image from "next/image";
import Link from "next/link";

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
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent): void => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileMenuOpen]);

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
        {role?.name && (
          <span
            className={`hidden rounded-full px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] sm:inline-block ${
              role?.name === "IT Admin"
                ? "bg-[#F3E4CD] text-slate-700"
                : "bg-input-bg text-muted"
            }`}
          >
            {role?.name}
          </span>
        )}

        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            aria-label="Account menu"
            className="flex items-center gap-1 rounded-full p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 cursor-pointer"
          >
            {avatar ? (
              <Image
                src={avatar}
                alt={displayName}
                className="h-10 w-10 shrink-0 rounded-full border border-line object-cover"
              />
            ) : (
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase text-white ${
                  role?.name === "IT Admin" ? "bg-[#795727]" : "bg-button"
                }`}
              >
                {initials}
              </div>
            )}
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform ${
                profileMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-2 w-48 animate-fade-in rounded-xl border border-line bg-white p-1.5 shadow-xl motion-reduce:animate-none"
            >
              {displayName && (
                <div className="border-b border-line px-3 py-2">
                  <p className="truncate text-sm font-semibold text-heading">
                    {displayName}
                  </p>
                  {role?.name && (
                    <p
                      className={`text-xs ${role?.name === "IT Admin" ? "text-[#795727]" : "text-muted"}`}
                    >
                      {role.name}
                    </p>
                  )}
                </div>
              )}
              <Link
                href="/profile"
                role="menuitem"
                onClick={() => setProfileMenuOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-heading transition hover:bg-input-bg"
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
            </div>
          )}
        </div>
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
