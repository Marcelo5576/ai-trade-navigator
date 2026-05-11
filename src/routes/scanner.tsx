import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/trading/PageShell";
import { Scanner } from "@/components/trading/Scanner";
import { fetchJson } from "@/lib/client-api";
import { useApiResource } from "@/hooks/use-api-resource";
import { mapQuantAssetToScannerAsset } from "@/lib/quant-adapters";
import type { QuantBridgeEnvelope, QuantOperationPayload } from "@/types/quant";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Scanner — AI Trade Navigator" },
      {
        name: "description",
        content:
          "Scanner SaaS conectado ao ApexQuant com TradeScore, confiança, risco, matrix score e filtros de mercado.",
      },
    ],
  }),
  component: ScannerRoute,
});

function ScannerRoute() {
  const [message, setMessage] = useState<string | null>(null);
  const { data } = useApiResource<QuantBridgeEnvelope<QuantOperationPayload>>(
    "/api/quant/operation?symbol=BTCUSDT",
    {
      ok: false,
      source: "fallback",
      upstream: "",
      warning: null,
      timestamp: "",
      data: null,
    },
    { refreshMs: 15000 },
  );

  async function runScanner() {
    setMessage("Disparando scanner do Quant...");
    try {
      const response = await fetchJson<QuantBridgeEnvelope<Record<string, unknown>>>(
        "/api/quant/scanner/run-once",
        {
          method: "POST",
        },
      );
      setMessage(
        response.ok
          ? "Scanner executado com sucesso."
          : response.warning || "Scanner executado com aviso.",
      );
    } catch (error) {
      setMessage(
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "Falha ao rodar scanner.",
      );
    }
  }

  return (
    <PageShell
      eyebrow="Scanner"
      title={
        <>
          Encontre setups em <span className="gradient-text">tempo real</span>
        </>
      }
      description="O Navigator agora consome o scanner do ApexQuant, preservando a mesma lógica estatística e os alertas do Telegram."
    >
      <Scanner
        assets={data.data?.watchlist?.map(mapQuantAssetToScannerAsset)}
        warning={message || data.warning}
        actions={
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => void runScanner()}
              className="px-4 py-2 rounded-lg font-medium text-sm text-primary-foreground"
              style={{ background: "var(--gradient-neon)" }}
            >
              Rodar scanner agora
            </button>
            <span className="text-xs font-mono text-muted-foreground">
              Fonte: {data.source === "quant" ? "ApexQuant" : "fallback visual"}
            </span>
          </div>
        }
      />
    </PageShell>
  );
}
