import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/client-api";

export function useApiResource<T>(url: string, initialValue: T, options?: { refreshMs?: number }) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = (initial = false) => {
      if (initial) setLoading(true);
      fetchJson<T>(url)
        .then((payload) => {
          if (!active) return;
          setData(payload);
          setError(null);
        })
        .catch((reason: unknown) => {
          if (!active) return;
          const message =
            reason && typeof reason === "object" && "message" in reason
              ? String((reason as { message: unknown }).message)
              : "Falha ao carregar dados";
          setError(message);
        })
        .finally(() => {
          if (!active) return;
          setLoading(false);
        });
    };

    load(true);
    const refreshMs = options?.refreshMs ?? 0;
    const interval =
      refreshMs > 0
        ? window.setInterval(() => {
            load(false);
          }, refreshMs)
        : null;

    return () => {
      active = false;
      if (interval) window.clearInterval(interval);
    };
  }, [options?.refreshMs, url]);

  return { data, loading, error };
}
