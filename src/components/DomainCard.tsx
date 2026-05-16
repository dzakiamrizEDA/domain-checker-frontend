"use client";

import { motion } from "framer-motion";
import { Copy, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
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
  const { domain, available, tld, status } = result;

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
        "group flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-all duration-200",
        "hover:-translate-y-px hover:shadow-md",
        isGreen
          ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
          : isNeutral
          ? "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30"
          : "border-rose-500/15 bg-rose-500/5 hover:border-rose-500/30"
      )}
    >
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Status icon */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            isGreen
              ? "bg-emerald-500/15"
              : isNeutral
              ? "bg-amber-500/15"
              : "bg-rose-500/15"
          )}
        >
          {isGreen ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <XCircle
              className={cn(
                "h-4 w-4",
                isNeutral ? "text-amber-400" : "text-rose-400"
              )}
            />
          )}
        </div>

        {/* Domain + meta */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
              {domain}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                isGreen
                  ? "bg-emerald-500/20 text-emerald-400"
                  : isNeutral
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-rose-500/20 text-rose-400"
              )}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            .{tld}
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        {available ? (
          <>
            <button
              onClick={copyDomain}
              title="Copy domain"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-7 w-7 rounded-lg p-0 text-muted-foreground hover:text-foreground"
              )}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </>
        ) : status === "taken" ? (
          <a
            href={`https://lookup.icann.org/en/lookup?name=${domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-7 gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground"
            )}
          >
            <ExternalLink className="h-3 w-3" />
            WHOIS
          </a>
        ) : null}
      </div>
    </motion.div>
  );
}
