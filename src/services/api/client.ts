import { store } from "@/store";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiRequestOptions = {
    method?: HttpMethod;
    path: string;
    query?: Record<string, string | number | boolean | null | undefined>;
    body?: unknown;
    headers?: Record<string, string>;
    auth?: boolean;
};

export class ApiError extends Error {
    status: number;
    data?: unknown;
    
    constructor(status: number, message: string, data?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

function getBaseUrl() {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is not defined");
    }
    return baseUrl.replace(/\/+$/, "");
}

function buildUrl(path: string, query?: ApiRequestOptions["query"]) {
    const baseurl = getBaseUrl();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${baseurl}${normalizedPath}`);
    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (value === null || value === undefined) return;
            url.searchParams.set(key, String(value));
        });
    }
    return url.toString();
}

function getTokenFromStore(): string | null {
    return store.getState().auth.token;
}

async function parseResponse(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (isJson) {
    return response.json().catch(() => null);
  }
  return response.text().catch(() => null);
}

export async function apiRequest<T = unknown>(
  options: ApiRequestOptions,
): Promise<T> {
  const { method = "GET", path, query, body, headers, auth = true } = options;

  const url = buildUrl(path, query);

  const finalHeaders: Record<string, string> = {
    accept: "application/json",
    ...headers,
  };

  const hasBody = body !== undefined && body !== null;
  if (hasBody) {
    finalHeaders["content-type"] = "application/json";
  }

  if (auth) {
    const token = getTokenFromStore();
    if (token) {
      finalHeaders.authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    const message =
      (data as any)?.message ||
      (data as any)?.error ||
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}

export const api = {
  get: <T = unknown>(
    path: string,
    opts?: Omit<ApiRequestOptions, "method" | "path">,
  ) => apiRequest<T>({ method: "GET", path, ...opts }),

  post: <T = unknown>(
    path: string,
    body?: unknown,
    opts?: Omit<ApiRequestOptions, "method" | "path" | "body">,
  ) => apiRequest<T>({ method: "POST", path, body, ...opts }),

  put: <T = unknown>(
    path: string,
    body?: unknown,
    opts?: Omit<ApiRequestOptions, "method" | "path" | "body">,
  ) => apiRequest<T>({ method: "PUT", path, body, ...opts }),

  patch: <T = unknown>(
    path: string,
    body?: unknown,
    opts?: Omit<ApiRequestOptions, "method" | "path" | "body">,
  ) => apiRequest<T>({ method: "PATCH", path, body, ...opts }),

  delete: <T = unknown>(
    path: string,
    opts?: Omit<ApiRequestOptions, "method" | "path">,
  ) => apiRequest<T>({ method: "DELETE", path, ...opts }),
};