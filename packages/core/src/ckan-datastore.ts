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

/**
 * Parser CSV ringan bawaan untuk portal yang tidak mengaktifkan DataStore extension
 */
export async function fetchAndParseCsvResource<T = Record<string, any>>(
  csvUrl: string,
  limit = 10,
  offset = 0,
  q?: string,
  timeoutMs = 8000
): Promise<CkanDatastoreResponse<T>> {
  try {
    const res = await fetch(csvUrl, {
      headers: { "Accept": "text/csv, text/plain, */*" },
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!res.ok) {
      throw new Error(`Gagal mengunduh file CSV: HTTP ${res.status}`);
    }

    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length === 0) {
      return {
        success: true,
        result: {
          resource_id: csvUrl,
          fields: [],
          records: [],
          total: 0,
          limit,
          _links: null
        }
      };
    }

    // Parse header
    const firstLine = lines[0] || "";
    const headers = firstLine.split(",").map(h => h.replace(/^["']|["']$/g, "").trim());
    const fields: CkanDatastoreField[] = headers.map(h => ({ id: h, type: "text" }));

    // Parse all rows
    let allRecords: Record<string, any>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i] || "";
      const values = line.split(",").map(v => v.replace(/^["']|["']$/g, "").trim());
      const row: Record<string, any> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] ?? "";
      });

      // Filter query q jika ada
      if (q) {
        const queryLower = q.toLowerCase();
        const matches = Object.values(row).some(val => 
          String(val).toLowerCase().includes(queryLower)
        );
        if (!matches) continue;
      }

      allRecords.push(row);
    }

    const total = allRecords.length;
    const paginated = allRecords.slice(offset, offset + limit);

    return {
      success: true,
      result: {
        resource_id: csvUrl,
        fields,
        records: paginated as T[],
        total,
        limit,
        _links: null
      }
    };
  } catch (err: any) {
    throw new Error(`CSV Parser Fallback Error: ${err.message}`);
  }
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
  
  // Jika resourceId adalah tautan CSV langsung
  if (resourceId.startsWith("http://") || resourceId.startsWith("https://") || resourceId.endsWith(".csv")) {
    const targetUrl = resourceId.startsWith("http") ? resourceId : `${baseUrl.replace(/\/+$/, "")}/${resourceId}`;
    return fetchAndParseCsvResource<T>(targetUrl, limit, offset, q, timeoutMs);
  }

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

    // Jika gagal / tidak ada datastore, coba ambil metadata resource untuk mendapatkan CSV URL
    if (!response.ok) {
      if (response.status === 404 || response.status === 409) {
        try {
          const resShowUrl = new URL(`${cleanBase}/api/3/action/resource_show`);
          resShowUrl.searchParams.append("id", resourceId);
          const metaRes = await fetch(resShowUrl.toString(), {
            headers: { "Accept": "application/json" },
            signal: AbortSignal.timeout(4000)
          });
          if (metaRes.ok) {
            const metaJson = await metaRes.json() as any;
            if (metaJson.success && metaJson.result?.url) {
              return fetchAndParseCsvResource<T>(metaJson.result.url, limit, offset, q, timeoutMs);
            }
          }
        } catch {
          // Abaikan error resource_show dan teruskan error asli
        }
      }
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
