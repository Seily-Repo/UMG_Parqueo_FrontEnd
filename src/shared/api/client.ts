import { apiConfig } from "./config";
import { ApiError, getApiErrorCode } from "./errors";

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeoutMs?: number;
  token?: string;
}

async function parseResponse<T>(response: Response): Promise<T | null> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return response.text() as Promise<T>;
}

function buildHeaders(headers: HeadersInit | undefined, hasBody: boolean, token?: string) {
  const nextHeaders = new Headers(headers);

  if (hasBody && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  if (!nextHeaders.has("Accept")) {
    nextHeaders.set("Accept", "application/json");
  }

  if (token && !nextHeaders.has("Authorization")) {
    nextHeaders.set("Authorization", `Bearer ${token}`);
  }

  return nextHeaders;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? apiConfig.timeoutMs;
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  const hasBody = options.body !== undefined;

  try {
    const response = await fetch(`${apiConfig.baseUrl}${path}`, {
      ...options,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      headers: buildHeaders(options.headers, hasBody, options.token),
      signal: options.signal ?? controller.signal,
    });

    const payload = await parseResponse<unknown>(response);

    if (!response.ok) {
      const message =
        typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string"
          ? payload.message
          : `La solicitud fallo con estado ${response.status}.`;

      throw new ApiError(message, {
        status: response.status,
        code: getApiErrorCode(response.status),
        details: payload,
      });
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("La solicitud excedio el tiempo de espera.", {
        status: 408,
        code: "TIMEOUT",
      });
    }

    throw new ApiError("No fue posible conectar con el servidor.", {
      status: null,
      code: "NETWORK",
      details: error,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}
