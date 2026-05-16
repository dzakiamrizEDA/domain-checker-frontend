"use client";

import { motion } from "framer-motion";
import { Copy, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import type { DomainResult } from "@/types/domain";
import { cn } from "@/lib/utils";

interface DomainCardProps {
  result: DomainResult;
  index: number;
}

const STATUS_LABELS: Record<string, string> = {
  taken: "Taken",
  available: "Available",
  rate_limited: "Rate Limited",
  registry_error: "Registry Error",
  unsupported_tld: "Unsupported",
  timeout: "Timeout",
  network_error: "Network Error",
  unknown: "Unknown",
};

export function DomainCard({ result, index }: DomainCardProps) {
  const { domain, available, status } = result;

  const isGreen = available;
  const isNeutral = !available && status !== "taken";

  const copyDomain = () => {
    navigator.clipboard.writeText(domain);
    toast.success("Copied to clipboard", { description: domain });
  };

  const statusLabel = STATUS_LABELS[status] ?? status;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.4), ease: "easeOut" }}
      className={cn(
        "group flex items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3 transition-all duration-200",
        "border-border/50 hover:border-border hover:shadow-sm"
      )}
    >
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Status icon */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            isGreen
              ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"
              : isNeutral
              ? "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400"
              : "bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400"
          )}
        >
          {isGreen ? (
            <CheckCircle2 className="h-4.5 w-4.5" />
          ) : (
            <XCircle className="h-4.5 w-4.5" />
          )}
        </div>

        {/* Domain + meta */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5">
            <span className="font-mono text-sm font-medium text-foreground">
              {domain}
            </span>
            <span
              className={cn(
                "shrink-0 text-[11px] font-semibold tracking-wide",
                isGreen
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isNeutral
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Right: actions (only for available) */}
      {available && (
        <div className="flex shrink-0 items-center">
          <button
            onClick={copyDomain}
            title="Copy domain"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 w-8 rounded-full p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
