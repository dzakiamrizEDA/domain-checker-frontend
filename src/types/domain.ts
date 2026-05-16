export interface DomainResult {
  domain: string;
  available: boolean;
  tld: string;
  status: string;
}

export type Tier = "core" | "secondary" | "extended" | "all";

export interface SearchResponse {
  keyword: string;
  tier: Tier;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: DomainResult[];
}
