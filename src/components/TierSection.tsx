"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { DomainCard } from "@/components/DomainCard";
import { TierSkeleton } from "@/components/DomainCardSkeleton";
import { cn } from "@/lib/utils";
import type { Tier, SearchResponse } from "@/types/domain";

const TIER_CONFIG = {
  core: {
    label: "Core & Indonesian TLDs",
    description: "Essential extensions — .id, .co.id, .my.id and global staples",
    badge: "Default",
    badgeClass: "bg-[--brand]/15 text-[--brand]",
    skeletonCount: 15,  // matches core TLD list length
  },
  secondary: {
    label: "Professional Extensions",
    description: "Popular tech, business, and regional extensions",
    badge: "More",
    badgeClass: "bg-violet-500/15 text-violet-400",
    skeletonCount: 21,
  },
  extended: {
    label: "Extended / Niche",
    description: "Creative, lifestyle, and specialty TLDs",
    badge: "All",
    badgeClass: "bg-amber-500/15 text-amber-400",
    skeletonCount: 21,
  },
} satisfies Record<string, {
  label: string;
  description: string;
  badge: string;
  badgeClass: string;
  skeletonCount: number;
}>;

interface TierSectionProps {
  tier: Tier;
  data: SearchResponse | null | undefined;
  isFetching: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export function TierSection({
  tier,
  data,
  isFetching,
  page,
  onPageChange,
}: TierSectionProps) {
  if (tier === "all") return null;
  const cfg = TIER_CONFIG[tier];

  const totalPages = data?.totalPages ?? 1;
  const results = data?.results ?? [];
  const total = data?.total ?? 0;

  const availableCount = results.filter((r) => r.available).length;
  const takenCount = results.filter((r) => !r.available).length;

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {isFetching ? (
          /* ── Loading: full-section skeleton ─────────────────────────── */
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <TierSkeleton
              count={cfg.skeletonCount}
              label={cfg.label}
              badge={cfg.badge}
              badgeClass={cfg.badgeClass}
            />
          </motion.div>
        ) : (
          /* ── Results ─────────────────────────────────────────────────── */
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Tier header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    cfg.badgeClass
                  )}
                >
                  {cfg.badge}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{cfg.label}</p>
                  <p className="text-xs text-muted-foreground">{cfg.description}</p>
                </div>
              </div>

              {/* Stats */}
              {data && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hidden items-center gap-3 text-xs sm:flex"
                >
                  <span className="text-emerald-400">{availableCount} available</span>
                  <span className="text-rose-400">{takenCount} taken</span>
                  <span className="text-muted-foreground/50">{total} total</span>
                </motion.div>
              )}
            </div>

            {/* Cards */}
            {results.length > 0 && (
              <div className="space-y-2">
                {results.map((r, i) => (
                  <DomainCard key={r.domain} result={r} index={i} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 pt-1"
              >
                <button
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg border border-border/60",
                    "text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground",
                    "disabled:cursor-not-allowed disabled:opacity-40"
                  )}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                <span className="min-w-16 text-center text-xs text-muted-foreground">
                  Page {page} / {totalPages}
                </span>

                <button
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg border border-border/60",
                    "text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground",
                    "disabled:cursor-not-allowed disabled:opacity-40"
                  )}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Show More Button ─────────────────────────────────────────────────────────
interface ShowMoreButtonProps {
  tier: Tier;
  isLoading: boolean;
  onClick: () => void;
}

export function ShowMoreButton({ tier, isLoading, onClick }: ShowMoreButtonProps) {
  if (tier === "all") return null;
  const cfg = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center"
    >
      <button
        onClick={onClick}
        disabled={isLoading}
        className={cn(
          "group inline-flex items-center gap-2 rounded-xl border border-dashed border-border/60",
          "px-5 py-2.5 text-sm text-muted-foreground",
          "transition-all duration-200 hover:border-[--brand]/40 hover:bg-[--brand]/5 hover:text-[--brand]",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
        )}
        <span>
          {isLoading ? "Loading…" : `Show ${cfg.label}`}
        </span>
      </button>
    </motion.div>
  );
}
