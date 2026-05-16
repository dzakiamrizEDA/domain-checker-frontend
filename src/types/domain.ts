export interface DomainResult {
  domain: string;
  available: boolean;
  status: string;
}

export interface SearchResponse {
  keyword: string;
  results: DomainResult[];
}
