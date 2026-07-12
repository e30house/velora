import { API_BASE } from "./apiBase";

export interface AuthResponse {
  token: string;
  email: string;
}

async function parseJsonOrThrow(response: Response): Promise<unknown> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body === "object" && body && "error" in body ? String((body as { error: unknown }).error) : `Request failed: ${response.status}`;
    throw new Error(message);
  }
  return body;
}

export async function signup(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return (await parseJsonOrThrow(res)) as AuthResponse;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return (await parseJsonOrThrow(res)) as AuthResponse;
}

export async function fetchUserData(token: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/api/user/data`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await parseJsonOrThrow(res)) as { payload?: Record<string, unknown> };
  return body.payload ?? {};
}

export async function pushUserData(token: string, payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${API_BASE}/api/user/data`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ payload }),
  });
  await parseJsonOrThrow(res);
}
