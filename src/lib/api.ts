import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";
import type { SearchResponse, Tier } from "@/types/domain";

interface ApiEnvelope {
  success: boolean;
  data: SearchResponse;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90_000,
  headers: { "Content-Type": "application/json" },
});

export interface SearchParams {
  keyword: string;
  tier?: Tier;
  page?: number;
  limit?: number;
}

export async function searchDomains(params: SearchParams): Promise<SearchResponse> {
  const { data: envelope } = await apiClient.get<ApiEnvelope>("/api/v1/search", {
    params,
  });
  return envelope.data;
}
