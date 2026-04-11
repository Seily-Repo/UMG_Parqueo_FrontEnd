export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "TIMEOUT"
  | "NETWORK"
  | "SERVER"
  | "UNKNOWN";

export class ApiError extends Error {
  status: number | null;
  code: ApiErrorCode;
  details?: unknown;

  constructor(message: string, options?: { status?: number | null; code?: ApiErrorCode; details?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status ?? null;
    this.code = options?.code ?? "UNKNOWN";
    this.details = options?.details;
  }
}

export function getApiErrorCode(status: number | null): ApiErrorCode {
  if (status === 400) return "BAD_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 408) return "TIMEOUT";
  if (status !== null && status >= 500) return "SERVER";
  return "UNKNOWN";
}

export function getReadableApiError(error: unknown, fallback = "Ocurrio un error al procesar la solicitud.") {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
