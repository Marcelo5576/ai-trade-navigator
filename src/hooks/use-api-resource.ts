import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/client-api";

export function useApiResource<T>(url: string, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
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

    return () => {
      active = false;
    };
  }, [url]);

  return { data, loading, error };
}
