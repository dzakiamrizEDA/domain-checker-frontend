"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Globe2, Zap, CheckCircle2, XCircle, Clock, X } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { ResultsSection } from "@/components/ResultsSection";
import { useDomainSearch } from "@/hooks/useDomainSearch";
import { cn } from "@/lib/utils";
import { useRef, KeyboardEvent } from "react";

const DOMAIN_REGEX = /^[a-zA-Z0-9-.]*$/;

export default function HomePage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    submit,
    submittedQuery,
    hasAnyData,
    stats,
    isFetching,
    results,
    recentSearches,
    clearRecent,
  } = useDomainSearch();

  const isValid = query.trim().length >= 2 && DOMAIN_REGEX.test(query.trim());
  const hasError = query.length > 0 && !DOMAIN_REGEX.test(query);

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValid) submit(query);
  };

  const clear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      <div className="relative min-h-screen bg-background">
        {/* Subtle ambient glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[--brand]/6 blur-3xl" />
        </div>

        <main className="relative mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6">

          {/* ── Hero ───────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[--brand]/15 ring-1 ring-[--brand]/25">
              <Globe2 className="h-6 w-6 text-[--brand]" />
            </div>

            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[--brand]/20 bg-[--brand]/8 px-2.5 py-1 text-[11px] font-medium text-[--brand]">
              <Zap className="h-3 w-3" />
              RDAP-Powered · Real-time
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Domain Availability Checker
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Check availability across Indonesian and global TLDs using IANA RDAP.
            </p>
          </motion.div>

          {/* ── Search bar ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mb-8"
          >
            <div
              className={cn(
                "flex h-12 items-center overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm transition-all",
                hasError
                  ? "border-rose-500/50 ring-2 ring-rose-500/20"
                  : "border-border/60 focus-within:border-[--brand]/50 focus-within:ring-2 focus-within:ring-[--brand]/15"
              )}
            >
              <span className="pl-4 text-muted-foreground/60">
                <Globe2 className="h-4 w-4" />
              </span>
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a keyword, e.g. acme.com or acme"
                className="h-full flex-1 border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0"
                autoComplete="off"
                spellCheck={false}
                id="domain-search-input"
                aria-label="Domain keyword"
              />
              {query.length > 0 && (
                <button
                  onClick={clear}
                  className="mr-1 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => isValid && submit(query)}
                disabled={!isValid || isFetching}
                className={cn(
                  "m-1.5 flex h-9 items-center rounded-lg px-4 text-sm font-semibold transition-all",
                  "bg-[--brand] text-white hover:bg-[--brand]/90",
                  "disabled:cursor-not-allowed disabled:opacity-40"
                )}
              >
                {isFetching ? (
                  <span className="flex items-center gap-1.5">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white"
                    />
                    Checking…
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>

            <AnimatePresence>
              {hasError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-1.5 text-xs text-rose-400"
                >
                  Only letters, numbers, hyphens, and periods allowed.
                </motion.p>
              )}
              {isFetching && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-1.5 text-center text-xs text-muted-foreground"
                >
                  Querying RDAP servers — this might take a moment...
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Recent searches (idle only) ────────────────────────────── */}
          <AnimatePresence>
            {!hasAnyData && !isFetching && recentSearches.length > 0 && (
              <motion.div
                key="recent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-10"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Recent searches
                  </span>
                  <button
                    onClick={clearRecent}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((kw) => (
                    <button
                      key={kw}
                      onClick={() => { setQuery(kw); submit(kw); }}
                      className="rounded-full border border-border/50 bg-muted/20 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-[--brand]/30 hover:bg-[--brand]/8 hover:text-[--brand]"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Results ────────────────────────────────────────────────── */}
          <AnimatePresence>
            {(hasAnyData || isFetching) && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Summary bar */}
                {hasAnyData && !isFetching && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Results for{" "}
                      <span className="font-semibold text-foreground">
                        &ldquo;{submittedQuery}&rdquo;
                      </span>
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        {stats.available} available
                      </span>
                      <span className="flex items-center gap-1 text-rose-400">
                        <XCircle className="h-3 w-3" />
                        {stats.taken} taken
                      </span>
                    </div>
                  </div>
                )}

                {hasAnyData && !isFetching && (
                  <div className="border-t border-border/40" />
                )}

                <ResultsSection 
                  results={results} 
                  isFetching={isFetching} 
                  submittedQuery={submittedQuery} 
                />

              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Idle state ─────────────────────────────────────────────── */}
          {!hasAnyData && !isFetching && recentSearches.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 grid grid-cols-3 gap-3 text-center"
            >
              {[
                ["Indonesian-first", "co.id, id, my.id & more"],
                ["RDAP Powered", "Live registry queries"],
                ["Direct Lookup", "Check specific domains"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-xl border border-border/30 bg-card/40 p-4"
                >
                  <p className="mb-1 text-xs font-semibold text-foreground">{title}</p>
                  <p className="text-[11px] text-muted-foreground">{desc}</p>
                </div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
}
