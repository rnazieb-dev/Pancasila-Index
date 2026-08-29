export interface CkanDatastoreSearchOptions {
  resourceId: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, any>;
  q?: string;
  baseUrl?: string;
}

export interface CkanDatastoreField {
  id: string;
  type: string;
}

export interface CkanDatastoreResponse<T = Record<string, any>> {
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
}

export async function datastoreSearch<T = Record<string, any>>({
  resourceId,
  limit = 5,
  offset = 0,
  filters,
  q,
  baseUrl = "https://data.go.id" // Fallback example
}: CkanDatastoreSearchOptions): Promise<CkanDatastoreResponse<T>> {
  
  const url = new URL(`${baseUrl}/api/3/action/datastore_search`);
  url.searchParams.append("resource_id", resourceId);
  url.searchParams.append("limit", limit.toString());
  url.searchParams.append("offset", offset.toString());
  
  if (q) {
    url.searchParams.append("q", q);
  }
  
  if (filters) {
    url.searchParams.append("filters", JSON.stringify(filters));
  }

  const response = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`CKAN Datastore API responded with status ${response.status}`);
  }

  return response.json() as Promise<CkanDatastoreResponse<T>>;
}
