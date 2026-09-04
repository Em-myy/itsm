"use client";

import { SearchCategory } from "@/lib/types";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

const SearchModal = ({
  categories,
  onClose,
}: {
  categories: SearchCategory[];
  onClose: () => void;
}) => {
  const [query, setQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.id ?? "",
  );

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeydown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const activeLabel =
    categories.find((c) => c.id === activeCategory)?.label ?? "";
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24 animate-fade-in motion-reduce:animate-none"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="search"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${categories.map((c) => c.label.toLowerCase()).join(", ")}...`}
            className="w-full bg-transparent text-sm text-heading outline-none placeholder:text-muted"
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="shrink-0 rounded-md px-1.5 py-0.5 font-mono text-xs text-muted hover:bg-input-bg cursor-pointer"
          >
            Esc
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const active = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-button text-white"
                    : "bg-input-bg text-body hover:text-heading"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {category.label}
              </button>
            );
          })}
        </div>

        <div className="px-4 py-10 text-center">
          {query ? (
            <p className="text-sm text-body">
              No results for &ldquo;{query}&rdquo; in {activeLabel}.
            </p>
          ) : (
            <p className="text-sm text-muted">
              Start typing to search {activeLabel.toLowerCase()}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
