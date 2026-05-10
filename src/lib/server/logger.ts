const REDACT_KEYS = ["password", "token", "secret", "cookie", "authorization", "apiKey"];

export function sanitizeForLogs(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLogs(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => {
        const lowerKey = key.toLowerCase();
        if (REDACT_KEYS.some((candidate) => lowerKey.includes(candidate.toLowerCase()))) {
          return [key, "[redacted]"];
        }
        return [key, sanitizeForLogs(nested)];
      }),
    );
  }

  return value;
}

export function logInfo(message: string, payload?: unknown) {
  if (payload === undefined) {
    console.info(`[ai-trade-navigator] ${message}`);
    return;
  }
  console.info(`[ai-trade-navigator] ${message}`, sanitizeForLogs(payload));
}

export function logError(message: string, payload?: unknown) {
  if (payload === undefined) {
    console.error(`[ai-trade-navigator] ${message}`);
    return;
  }
  console.error(`[ai-trade-navigator] ${message}`, sanitizeForLogs(payload));
}
