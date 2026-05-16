export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const RECENT_SEARCHES_KEY = "dc_recent_searches";
export const MAX_RECENT_SEARCHES = 8;

export const TIER_LABELS = {
  core: "Core",
  secondary: "Professional",
  extended: "Extended",
} as const;

export const TIER_ORDER = ["core", "secondary", "extended"] as const;
