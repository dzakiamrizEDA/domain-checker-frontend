import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";
import type { SearchResponse } from "@/types/domain";

interface ApiEnvelope {
  success: boolean;
  data: SearchResponse;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90_000,
  headers: { 
    "Content-Type": "application/json",
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "supersecretkey",
  },
});

export interface SearchParams {
  keyword: string;
}

export async function searchDomains(params: SearchParams): Promise<SearchResponse> {
  const { data: envelope } = await apiClient.get<ApiEnvelope>("/api/search", {
    params,
  });
  return envelope.data;
}
