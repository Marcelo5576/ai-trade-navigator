import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/trading/PageShell";
import { Zap, TrendingUp, Repeat, LineChart, Shield, Layers } from "lucide-react";
import { useApiResource } from "@/hooks/use-api-resource";
import { summarizeOpportunityBoard } from "@/lib/quant-adapters";
import type { QuantBridgeEnvelope, QuantOpportunityBoard } from "@/types/quant";

export const Route = createFileRoute("/estrategias")({
  head: () => ({
    meta: [
      { title: "Estratégias — AI Trade Navigator" },
      {
        name: "description",
        content:
          "Estratégias e oportunidades validadas pelo ApexQuant, preservadas no Navigator como cockpit SaaS.",
      },
    ],
  }),
  component: Estrategias,
});

const ICONS = [TrendingUp, Repeat, Zap, LineChart, Shield, Layers];

function Estrategias() {
  const { data } = useApiResource<
    QuantBridgeEnvelope<{ status?: string; board?: QuantOpportunityBoard }>
  >(
    "/api/quant/opportunities",
    {
      ok: false,
      source: "fallback",
      upstream: "",
      warning: null,
      timestamp: "",
      data: null,
    },
    { refreshMs: 20000 },
  );

  const board = summarizeOpportunityBoard(data.data?.board);
  const cards = [...(board.topPriority || []), ...(board.ranked || [])].slice(0, 6);

  return (
    <PageShell
      eyebrow="Estratégias"
      title={
        <>
          Biblioteca de <span className="gradient-text">oportunidades vivas</span>
        </>
      }
      description="Em vez de mock estático, o Navigator agora consome o ranking do Quant para destacar setups fortes, watch-only e ativos ignorados."
    >
      {data.warning ? (
        <section className="max-w-[1400px] mx-auto px-6 pt-6">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Ranking do Quant em fallback: {data.warning}
          </div>
        </section>
      ) : null}

      <section className="max-w-[1400px] mx-auto px-6 py-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((item, index) => {
          const Icon = ICONS[index % ICONS.length];
          const payload = (item.payload as Record<string, unknown> | undefined) || item;
          return (
            <div
              key={`${item.symbol || "asset"}-${index}`}
              className="card-elevated rounded-2xl p-6 hover:border-primary/40 transition hover:-translate-y-0.5"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--gradient-neon)" }}
              >
                <Icon className="w-5 h-5 text-background" />
              </div>
              <h3 className="font-display text-lg font-bold">{String(item.symbol || "Ativo")}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {String(
                  payload.opportunity_label ||
                    payload.status_label ||
                    "Setup quantitativo em observação",
                )}
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-secondary/40 rounded-lg p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">Score</div>
                  <div className="font-mono font-bold text-bull">
                    {String(payload.opportunity_score || payload.score || 0)}
                  </div>
                </div>
                <div className="bg-secondary/40 rounded-lg p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">Dir</div>
                  <div className="font-mono font-bold">{String(payload.direction || "NEUTRO")}</div>
                </div>
                <div className="bg-secondary/40 rounded-lg p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">Conf</div>
                  <div className="font-mono font-bold">{String(payload.confidence_score || 0)}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="https://trade.apexgol.com.br/oportunidades"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center text-xs font-medium py-2 rounded-lg text-primary-foreground"
                  style={{ background: "var(--gradient-neon)" }}
                >
                  Abrir Quant
                </a>
                <a
                  href="https://trade.apexgol.com.br/operacao"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center text-xs font-medium py-2 rounded-lg bg-secondary"
                >
                  Operação
                </a>
              </div>
            </div>
          );
        })}
      </section>
    </PageShell>
  );
}
