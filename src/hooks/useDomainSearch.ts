"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import axios from "axios";
import { searchDomains } from "@/lib/api";
import { RECENT_SEARCHES_KEY, MAX_RECENT_SEARCHES } from "@/lib/constants";
import { TIER_ORDER } from "@/lib/constants";
import type { Tier, DomainResult, SearchResponse } from "@/types/domain";

// ─── Recent-searches external store (useSyncExternalStore) ──────────────────
// This is the React-blessed SSR-safe pattern for reading localStorage:
//   • server: returns a stable empty array (no localStorage on server)
//   • client: reads localStorage directly, caches by JSON string to keep
//     the same array reference when the value hasn't changed (avoids
//     infinite re-renders from referential inequality).

const EMPTY_RECENT: string[] = [];
let _recentCache: string[] = [];
let _recentCacheJson = "";

function _subscribeRecent(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function _getRecentSnapshot(): string[] {
  const raw = localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]";
  if (raw === _recentCacheJson) return _recentCache;
  try {
    _recentCache = JSON.parse(raw);
    _recentCacheJson = raw;
  } catch {
    _recentCache = [];
  }
  return _recentCache;
}

function saveRecent(keyword: string): void {
  const prev = _getRecentSnapshot().filter(
    (k) => k.toLowerCase() !== keyword.toLowerCase()
  );
  const next = [keyword, ...prev].slice(0, MAX_RECENT_SEARCHES);
  const json = JSON.stringify(next);
  localStorage.setItem(RECENT_SEARCHES_KEY, json);
  // Invalidate cache so next snapshot read returns fresh data
  _recentCacheJson = json;
  _recentCache = next;
  // Notify useSyncExternalStore subscribers
  window.dispatchEvent(new StorageEvent("storage", { key: RECENT_SEARCHES_KEY }));
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface TierData {
  response: SearchResponse | null;
  isFetching: boolean;
  isError: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useDomainSearch() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  // SSR-safe localStorage read — no useEffect, no setState-in-effect warning.
  // On the server this returns EMPTY_RECENT; on the client it reads localStorage.
  const recentSearches = useSyncExternalStore(
    _subscribeRecent,
    _getRecentSnapshot,
    () => EMPTY_RECENT
  );

  // Which tiers have been "unlocked" by the user
  const [unlockedTiers, setUnlockedTiers] = useState<Set<Tier>>(
    new Set(["core"])
  );

  // Pagination state per tier
  const [pages, setPages] = useState<Record<Tier, number>>({
    core: 1,
    secondary: 1,
    extended: 1,
    all: 1,
  });

  // Reset tiers & pages when a new search is submitted
  const resetState = useCallback(() => {
    setUnlockedTiers(new Set(["core"]));
    setPages({ core: 1, secondary: 1, extended: 1, all: 1 });
  }, []);

  // ── Queries (one per unlocked tier) ───────────────────────────────────────
  const coreQuery = useQuery({
    queryKey: ["domain-search", submittedQuery, "core", pages.core],
    queryFn: () =>
      searchDomains({ keyword: submittedQuery, tier: "core", page: pages.core, limit: 20 }),
    enabled: submittedQuery.length >= 2 && unlockedTiers.has("core"),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (count, err) =>
      axios.isAxiosError(err) && err.response?.status === 429 ? false : count < 2,
  });

  const secondaryQuery = useQuery({
    queryKey: ["domain-search", submittedQuery, "secondary", pages.secondary],
    queryFn: () =>
      searchDomains({ keyword: submittedQuery, tier: "secondary", page: pages.secondary, limit: 20 }),
    enabled: submittedQuery.length >= 2 && unlockedTiers.has("secondary"),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (count, err) =>
      axios.isAxiosError(err) && err.response?.status === 429 ? false : count < 2,
  });

  const extendedQuery = useQuery({
    queryKey: ["domain-search", submittedQuery, "extended", pages.extended],
    queryFn: () =>
      searchDomains({ keyword: submittedQuery, tier: "extended", page: pages.extended, limit: 20 }),
    enabled: submittedQuery.length >= 2 && unlockedTiers.has("extended"),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (count, err) =>
      axios.isAxiosError(err) && err.response?.status === 429 ? false : count < 2,
  });

  const tierQueries: Record<Tier, typeof coreQuery> = {
    core: coreQuery,
    secondary: secondaryQuery,
    extended: extendedQuery,
    all: coreQuery, // unused
  };

  // ── Error toasts ──────────────────────────────────────────────────────────
  useEffect(() => {
    const activeErrors = [coreQuery, secondaryQuery, extendedQuery].filter(
      (q) => q.isError && q.error
    );
    if (activeErrors.length === 0) return;
    const err = activeErrors[0].error;
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 429) {
        toast.error("Rate limit reached", { description: "Too many requests. Please wait." });
      } else if ((err.response?.status ?? 0) >= 500) {
        toast.error("Service unavailable", { description: "The RDAP service is down. Try again shortly." });
      } else {
        toast.error("Search failed", { description: err.message });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coreQuery.isError, secondaryQuery.isError, extendedQuery.isError]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const submit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length < 2) return;
      resetState();
      setSubmittedQuery(trimmed);
      saveRecent(trimmed); // writes + dispatches storage event → useSyncExternalStore re-reads
    },
    [resetState]
  );

  const unlockTier = useCallback((tier: Tier) => {
    setUnlockedTiers((prev) => new Set([...prev, tier]));
  }, []);

  const setPage = useCallback((tier: Tier, page: number) => {
    setPages((prev) => ({ ...prev, [tier]: page }));
  }, []);

  const clearRecent = useCallback(() => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    // Invalidate cache and notify useSyncExternalStore
    _recentCacheJson = "";
    _recentCache = [];
    window.dispatchEvent(new StorageEvent("storage", { key: RECENT_SEARCHES_KEY }));
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────
  const hasAnyData = coreQuery.data != null;

  // Stats across all loaded tiers
  const allLoadedResults: DomainResult[] = [
    ...(coreQuery.data?.results ?? []),
    ...(secondaryQuery.data?.results ?? []),
    ...(extendedQuery.data?.results ?? []),
  ];

  const stats = {
    available: allLoadedResults.filter((r) => r.available).length,
    taken: allLoadedResults.filter((r) => !r.available).length,
  };

  // Next tier to unlock (first tier not yet unlocked)
  const nextTier = TIER_ORDER.find((t) => !unlockedTiers.has(t)) ?? null;

  return {
    query,
    setQuery,
    submit,
    submittedQuery,
    hasAnyData,
    stats,
    tierQueries,
    unlockedTiers,
    unlockTier,
    nextTier,
    pages,
    setPage,
    recentSearches,
    clearRecent,
  };
}
