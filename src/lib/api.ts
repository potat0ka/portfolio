// Centralised fetch helper for `/api/*` endpoints with safe error handling.

const API_BASE = "/api";

export async function fetchJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("API error:", response.status, path);
      throw new Error(`API error ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      console.error("Non-JSON response from API:", path, contentType);
      throw new Error("Non-JSON response from API");
    }

    return (await response.json()) as T;
  } catch (err) {
    console.error("Network error:", err);
    throw err;
  }
}

