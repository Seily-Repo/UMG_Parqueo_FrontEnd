const DEFAULT_TIMEOUT_MS = 15000;

function parseTimeout(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

export const apiConfig = {
  baseUrl: (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, ""),
  timeoutMs: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS),
} as const;
