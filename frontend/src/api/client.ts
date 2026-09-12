const TOKEN_KEY = "mc_access_token";

export interface ApiErrorBody {
  code?: string;
  detail?: string;
  title?: string;
  errors?: unknown[];
}

export class ApiError extends Error {
  status: number;
  code: string;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.detail || body.title || `Error ${status}`);
    this.status = status;
    this.code = body.code ?? "unknown";
    this.body = body;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  authed?: boolean;
}

export async function api<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, authed = false } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authed) {
    const token = getToken();
    if (!token) throw new ApiError(401, { code: "no_token", detail: "No has iniciado sesión." });
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data as T;
}