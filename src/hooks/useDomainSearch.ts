"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import axios from "axios";
import { searchDomains } from "@/lib/api";
import { RECENT_SEARCHES_KEY, MAX_RECENT_SEARCHES } from "@/lib/constants";
import type { DomainResult } from "@/types/domain";

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
  _recentCacheJson = json;
  _recentCache = next;
  window.dispatchEvent(new StorageEvent("storage", { key: RECENT_SEARCHES_KEY }));
}

export function useDomainSearch() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const recentSearches = useSyncExternalStore(
    _subscribeRecent,
    _getRecentSnapshot,
    () => EMPTY_RECENT
  );

  const searchRequest = useQuery({
    queryKey: ["domain-search", submittedQuery],
    queryFn: () => searchDomains({ keyword: submittedQuery }),
    enabled: submittedQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (count, err) =>
      axios.isAxiosError(err) && err.response?.status === 429 ? false : count < 2,
  });

  useEffect(() => {
    if (searchRequest.isError && searchRequest.error) {
      const err = searchRequest.error;
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          toast.error("Rate limit reached", { description: "Too many requests. Please wait." });
        } else if ((err.response?.status ?? 0) >= 500) {
          toast.error("Service unavailable", { description: "The backend service is down. Try again shortly." });
        } else {
          toast.error("Search failed", { description: err.message });
        }
      }
    }
  }, [searchRequest.isError, searchRequest.error]);

  const submit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length < 2) return;
      setSubmittedQuery(trimmed);
      saveRecent(trimmed);
    },
    []
  );

  const clearRecent = useCallback(() => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    _recentCacheJson = "";
    _recentCache = [];
    window.dispatchEvent(new StorageEvent("storage", { key: RECENT_SEARCHES_KEY }));
  }, []);

  const hasAnyData = searchRequest.data != null;
  const results: DomainResult[] = searchRequest.data?.results ?? [];

  const stats = {
    available: results.filter((r) => r.available).length,
    taken: results.filter((r) => !r.available).length,
  };

  return {
    query,
    setQuery,
    submit,
    submittedQuery,
    hasAnyData,
    stats,
    isFetching: searchRequest.isFetching,
    results,
    recentSearches,
    clearRecent,
  };
}
