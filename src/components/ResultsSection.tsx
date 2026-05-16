"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DomainCard } from "@/components/DomainCard";
import { TierSkeleton } from "@/components/DomainCardSkeleton";
import type { DomainResult } from "@/types/domain";

interface ResultsSectionProps {
  results: DomainResult[];
  isFetching: boolean;
  submittedQuery: string;
}

export function ResultsSection({ results, isFetching, submittedQuery }: ResultsSectionProps) {
  const isFullDomain = submittedQuery.includes(".");
  
  let topResult: DomainResult | undefined;
  let otherResults: DomainResult[] = [];

  if (isFullDomain) {
    const targetDomain = submittedQuery.toLowerCase();
    topResult = results.find((r) => r.domain === targetDomain);
    otherResults = results.filter((r) => r.domain !== targetDomain);
    
    // Sort alternatives: Available first
    otherResults.sort((a, b) => {
      if (a.available === b.available) return 0;
      return a.available ? -1 : 1;
    });
  } else {
    // If not a specific domain lookup, maybe just show them in the API order
    // But prioritize available ones at the top to be helpful
    otherResults = [...results].sort((a, b) => {
      if (a.available === b.available) return 0;
      return a.available ? -1 : 1;
    });
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {isFetching ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <TierSkeleton
              count={8}
              label="Checking domains..."
              badge="Search"
              badgeClass="bg-[--brand]/15 text-[--brand]"
            />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* EXACT MATCH */}
            {topResult && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Requested Domain
                </p>
                <DomainCard result={topResult} index={0} />
              </div>
            )}

            {/* OTHER RESULTS / ALTERNATIVES */}
            {otherResults.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {topResult ? "Suggested Alternatives" : "Search Results"}
                </p>
                <div className="space-y-2">
                  {otherResults.map((r, i) => (
                    // only render if it's available or we don't have a topResult
                    // "lalu bawahnyatampilkan tld yang umum dan avail" -> let's show all but sorted, or filter out taken ones if we have a topResult
                    <DomainCard key={r.domain} result={r} index={topResult ? i + 1 : i} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
