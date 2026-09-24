"use client";

import api from "@/lib/axios";
import { SearchCategory } from "@/lib/types";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

const SearchModal = ({
  categories,
  onClose,
}: {
  categories: SearchCategory[];
  onClose: () => void;
}) => {
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.id ?? "",
  );
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get("/search", {
          params: {
            category: activeCategory,
            q: debouncedQuery,
          },
        });
        setResults(response.data.data || []);
      } catch (error: any) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, activeCategory]);

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
            placeholder={`Search ${categories.map((c) => c.label.toLowerCase()).join(", ")} using their reference...`}
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
                onClick={() => {
                  setActiveCategory(category.id);
                  setQuery("");
                  setDebouncedQuery("");
                  setResults([]);
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
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

        <div className="px-4 py-10 text-center max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-muted text-sm">
              <Loader2 className="h-5 w-5 animate-spin" />
              Searching...
            </div>
          ) : query && results.length === 0 ? (
            <p className="text-sm text-body">
              No results for &ldquo;{query}&rdquo; in {activeLabel}.
            </p>
          ) : results.length > 0 ? (
            <div className="text-left flex flex-col gap-2">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="p-3 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-line transition"
                >
                  <p className="text-sm font-medium text-heading">
                    {result.reference}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {result.description}
                  </p>
                </div>
              ))}
            </div>
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
