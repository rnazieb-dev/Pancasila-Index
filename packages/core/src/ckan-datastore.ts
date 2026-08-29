import { z } from "zod";

export const CkanDatastoreFieldSchema = z.object({
  id: z.string(),
  type: z.string().optional().default("text")
});

export const CkanDatastoreResultSchema = z.object({
  resource_id: z.string().optional().default(""),
  fields: z.array(CkanDatastoreFieldSchema).optional().default([]),
  records: z.array(z.record(z.any())).optional().default([]),
  total: z.number().optional().default(0),
  limit: z.number().optional().default(0),
  _links: z.any().optional()
});

export const CkanDatastoreResponseSchema = z.object({
  success: z.boolean(),
  help: z.string().optional(),
  error: z.any().optional(),
  result: CkanDatastoreResultSchema.optional()
});

export type CkanDatastoreField = z.infer<typeof CkanDatastoreFieldSchema>;
export type CkanDatastoreResponse<T = Record<string, any>> = {
  success: boolean;
  help?: string;
  error?: any;
  result?: {
    resource_id: string;
    fields: CkanDatastoreField[];
    records: T[];
    total: number;
    limit: number;
    _links: any;
  };
};

export interface CkanDatastoreSearchOptions {
  resourceId: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, any>;
  q?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export async function datastoreSearch<T = Record<string, any>>({
  resourceId,
  limit = 5,
  offset = 0,
  filters,
  q,
  baseUrl = "https://data.go.id",
  timeoutMs = 8000
}: CkanDatastoreSearchOptions): Promise<CkanDatastoreResponse<T>> {
  
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const url = new URL(`${cleanBase}/api/3/action/datastore_search`);
  url.searchParams.append("resource_id", resourceId);
  url.searchParams.append("limit", limit.toString());
  url.searchParams.append("offset", offset.toString());
  
  if (q) {
    url.searchParams.append("q", q);
  }
  
  if (filters) {
    url.searchParams.append("filters", JSON.stringify(filters));
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json"
      },
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!response.ok) {
      throw new Error(`Portal CKAN merespons dengan status HTTP ${response.status}`);
    }

    const rawJson = await response.json();
    const parsed = CkanDatastoreResponseSchema.safeParse(rawJson);

    if (!parsed.success) {
      throw new Error(`Format respons DataStore tidak valid: ${parsed.error.message}`);
    }

    return parsed.data as CkanDatastoreResponse<T>;
  } catch (err: any) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      throw new Error(`Koneksi ke portal ${baseUrl} mengalami batas waktu (timeout ${timeoutMs / 1000}s).`);
    }
    throw err;
  }
}
