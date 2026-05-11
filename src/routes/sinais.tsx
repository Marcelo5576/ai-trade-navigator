import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/trading/PageShell";
import { Sparkles, TrendingUp, AlertCircle, Target } from "lucide-react";
import { useApiResource } from "@/hooks/use-api-resource";
import type { QuantBridgeEnvelope, QuantSignal } from "@/types/quant";
import { mapQuantSignalToDecision } from "@/lib/quant-adapters";
import { DECISION_DISCLAIMER } from "@/lib/trading-intelligence";
import { fetchJson } from "@/lib/client-api";
import { useState } from "react";

export const Route = createFileRoute("/sinais")({
  head: () => ({
    meta: [
      { title: "Sinais IA — AI Trade Navigator" },
      {
        name: "description",
        content:
          "Sinais quantitativos do ApexQuant com confiança, risco, racional, ação recomendada e integração de Telegram.",
      },
    ],
  }),
  component: Sinais,
});

const ICONS = [TrendingUp, Sparkles, Target, AlertCircle];

function Sinais() {
  const [message, setMessage] = useState<string | null>(null);
  const { data } = useApiResource<QuantBridgeEnvelope<{ signals?: QuantSignal[] }>>(
    "/api/quant/signals",
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

  const items = (data.data?.signals || []).slice(0, 8).map((signal, index) => ({
    ...mapQuantSignalToDecision(signal),
    raw: signal,
    Icon: ICONS[index % ICONS.length],
  }));

  async function handleTelegramTest() {
    setMessage("Disparando teste do Telegram...");
    try {
      const response = await fetchJson<QuantBridgeEnvelope<Record<string, unknown>>>(
        "/api/quant/telegram/test",
        {
          method: "POST",
        },
      );
      setMessage(
        response.ok
          ? "Teste encaminhado para o Telegram do Quant."
          : response.warning || "Teste executado com aviso.",
      );
    } catch (error) {
      setMessage(
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "Falha ao testar o Telegram.",
      );
    }
  }

  return (
    <PageShell
      eyebrow="Sinais IA"
      title={
        <>
          Decisões guiadas por <span className="gradient-text">algoritmos reais</span>
        </>
      }
      description="A mesma engine do ApexQuant alimenta o Navigator: setup aprovado, monitoramento, stops, alvos e Telegram em paper trading."
    >
      <section className="max-w-[1400px] mx-auto px-6 py-6 flex flex-wrap gap-3">
        <button
          onClick={() => void handleTelegramTest()}
          className="px-4 py-2 rounded-lg font-medium text-sm text-primary-foreground"
          style={{ background: "var(--gradient-neon)" }}
        >
          Testar Telegram
        </button>
        <a
          href="https://trade.apexgol.com.br/operacao"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-lg font-medium text-sm border border-border bg-secondary/60 hover:bg-secondary transition-colors"
        >
          Abrir operação Quant
        </a>
        {message || data.warning ? (
          <div className="rounded-xl border border-border bg-secondary/30 px-4 py-2 text-sm text-muted-foreground">
            {message || data.warning}
          </div>
        ) : null}
      </section>

      <section className="max-w-[1400px] mx-auto px-6 py-8 grid lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon = item.Icon;
          return (
            <div key={`${item.asset}-${item.signal}`} className="card-elevated rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--gradient-neon)" }}
                  >
                    <Icon className="w-4 h-4 text-background" />
                  </div>
                  <div>
                    <div className="font-bold">{item.signal}</div>
                    <div className="text-xs text-muted-foreground">{item.asset}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Confiança</div>
                  <div className="font-mono font-bold" style={{ color: "var(--neon)" }}>
                    {item.decision.confidence_score}%
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">{item.decision.rationale}</p>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="rounded-lg bg-secondary/40 px-3 py-2">
                  <div className="uppercase tracking-wider text-muted-foreground">Risco</div>
                  <div className="font-mono font-semibold">{item.decision.risk_level}</div>
                </div>
                <div className="rounded-lg bg-secondary/40 px-3 py-2">
                  <div className="uppercase tracking-wider text-muted-foreground">Ação</div>
                  <div className="font-mono font-semibold">{item.decision.recommended_action}</div>
                </div>
                <div className="rounded-lg bg-secondary/40 px-3 py-2 col-span-2">
                  <div className="uppercase tracking-wider text-muted-foreground">Status Quant</div>
                  <div className="mt-1 text-muted-foreground">
                    {item.raw.status || item.raw.direction || "monitorando"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="max-w-[1400px] mx-auto px-6 pb-12">
        <div className="rounded-xl border border-border bg-secondary/20 px-4 py-3 text-sm text-muted-foreground">
          {DECISION_DISCLAIMER}
        </div>
      </section>
    </PageShell>
  );
}
