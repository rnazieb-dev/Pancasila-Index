export interface CkanPackage {
  id: string;
  name: string;
  title: string;
  notes: string;
  metadata_modified: string;
  organization?: {
    title: string;
  };
  resources: Array<{
    id: string;
    name: string;
    format: string;
    datastore_active: boolean;
    url?: string;
  }>;
}

export interface CkanWatcherResult {
  success: boolean;
  result: {
    count: number;
    results: CkanPackage[];
  };
}

export async function fetchLatestDatasets(
  baseUrl = "https://data.go.id",
  keywords: string[] = ["kemiskinan", "ekonomi", "hutang", "kehutanan", "pengangguran", "anggaran", "sosial"],
  limit = 8
): Promise<CkanPackage[]> {
  const query = keywords.join(" OR ");
  const url = new URL(`${baseUrl}/api/3/action/package_search`);
  url.searchParams.append("q", query);
  url.searchParams.append("sort", "metadata_modified desc");
  url.searchParams.append("rows", limit.toString());

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000)
    });
    
    if (!res.ok) return [];

    const data = await res.json() as CkanWatcherResult;
    if (data.success && data.result) {
      return data.result.results;
    }
  } catch (e) {
    console.warn("CKAN Watcher Warning (timeout/unreachable):", e);
  }
  
  return [];
}
