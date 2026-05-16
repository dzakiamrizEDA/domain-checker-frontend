"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Shimmer overlay: a left-to-right sheen that travels across each skeleton row
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded bg-muted/60",
        className
      )}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/6 to-transparent"
        animate={{ translateX: ["−100%", "200%"] }}
        transition={{
          duration: 1.4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.3,
        }}
      />
    </div>
  );
}

// Pre-computed widths so every row looks realistic and different
const LABEL_WIDTHS = [
  "w-28", "w-36", "w-24", "w-32", "w-40",
  "w-28", "w-32", "w-36", "w-24", "w-30",
  "w-38", "w-26", "w-34", "w-28", "w-36",
];
const SUB_WIDTHS = [
  "w-8", "w-10", "w-8", "w-12", "w-8",
  "w-10", "w-8", "w-10", "w-12", "w-8",
  "w-10", "w-8", "w-10", "w-8", "w-10",
];

export function DomainCardSkeleton({ index }: { index: number }) {
  const label = LABEL_WIDTHS[index % LABEL_WIDTHS.length];
  const sub = SUB_WIDTHS[index % SUB_WIDTHS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.5) }}
      className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/40 px-4 py-3"
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Icon placeholder */}
        <Shimmer className="h-8 w-8 shrink-0 rounded-lg" />

        <div className="space-y-2">
          {/* Domain name + badge row */}
          <div className="flex items-center gap-2">
            <Shimmer className={cn("h-3.5 rounded", label)} />
            <Shimmer className="h-4 w-14 rounded-full" />
          </div>
          {/* TLD sub-line */}
          <Shimmer className={cn("h-2.5 rounded", sub)} />
        </div>
      </div>

      {/* Right: action button placeholder */}
      <Shimmer className="h-7 w-16 rounded-lg" />
    </motion.div>
  );
}

// ─── Section-level skeleton (header + N card skeletons) ──────────────────────
interface TierSkeletonProps {
  /** How many skeleton rows to show. Defaults to 8. */
  count?: number;
  /** Label shown in the section header area while loading. */
  label: string;
  badgeClass: string;
  badge: string;
}

export function TierSkeleton({ count = 8, label, badgeClass, badge }: TierSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* Header row skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider opacity-60",
              badgeClass
            )}
          >
            {badge}
          </span>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <Shimmer className="h-2.5 w-52 rounded" />
          </div>
        </div>
        {/* Stats placeholder */}
        <div className="hidden items-center gap-3 sm:flex">
          <Shimmer className="h-3 w-20 rounded" />
          <Shimmer className="h-3 w-16 rounded" />
        </div>
      </div>

      {/* Card rows */}
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <DomainCardSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  );
}
