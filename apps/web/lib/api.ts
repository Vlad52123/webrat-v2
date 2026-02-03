export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "";

type JsonObject = Record<string, unknown>;

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? String((data as { error: unknown }).error)
        : `HTTP_${res.status}`;

    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return data as T;
}

export async function postJson<T>(path: string, body: JsonObject): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? String((data as { error: unknown }).error)
        : `HTTP_${res.status}`;

    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return data as T;
}