import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/trading/PageShell";
import { NEWS } from "@/components/trading/mockData";
import { useApiResource } from "@/hooks/use-api-resource";
import { flattenQuantNews } from "@/lib/quant-adapters";
import type { QuantBridgeEnvelope, QuantNewsPayload } from "@/types/quant";

export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title: "Notícias — AI Trade Navigator" },
      {
        name: "description",
        content:
          "Feed do Navigator conectado ao news impact do ApexQuant com sentimento, recomendação e fallback seguro.",
      },
    ],
  }),
  component: Noticias,
});

const FILTERS = ["Todas", "Bullish", "Bearish", "Neutras"] as const;

function Noticias() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Todas");
  const { data } = useApiResource<QuantBridgeEnvelope<QuantNewsPayload>>(
    "/api/quant/news",
    {
      ok: false,
      source: "fallback",
      upstream: "",
      warning: null,
      timestamp: "",
      data: null,
    },
    { refreshMs: 60000 },
  );

  const newsFeed = flattenQuantNews(data.data || {});
  const listBase = newsFeed.length ? newsFeed : NEWS;
  const list = listBase.filter((item) => {
    if (filter === "Bullish") return item.sentiment === "bull";
    if (filter === "Bearish") return item.sentiment === "bear";
    if (filter === "Neutras") return item.sentiment === "neutral";
    return true;
  });

  const color = (sentiment: string) =>
    sentiment === "bull" ? "var(--bull)" : sentiment === "bear" ? "var(--bear)" : "var(--neon)";
  const impact = data.data?.news?.impact || {};
  const macro = data.data?.news?.macro || {};

  return (
    <PageShell
      eyebrow="Notícias"
      title={
        <>
          Mercado lido por <span className="gradient-text">IA de impacto</span>
        </>
      }
      description="O Navigator agora recebe o painel de notícias e impacto do ApexQuant, com contexto macro e recomendação operacional."
    >
      <section className="max-w-[1400px] mx-auto px-6 py-8 grid lg:grid-cols-3 gap-4">
        <div className="card-elevated rounded-2xl p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Impact score</div>
          <div className="font-display text-3xl font-bold mt-2">
            {String(impact.impact_score ?? 0)}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {String(impact.recommendation ?? "MONITOR")}
          </div>
        </div>
        <div className="card-elevated rounded-2xl p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Macro risk</div>
          <div className="font-display text-3xl font-bold mt-2">
            {String(macro.macro_risk_score ?? 0)}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {String(macro.recommendation ?? "NORMAL_OPERATION")}
          </div>
        </div>
        <div className="card-elevated rounded-2xl p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Provider</div>
          <div className="font-display text-2xl font-bold mt-2">
            {String(data.data?.news?.provider ?? "fallback")}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {data.data?.news?.real_data ? "Dados reais" : "Fallback seguro"}
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {FILTERS.map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                filter === value
                  ? "border-primary text-primary-foreground"
                  : "border-border bg-secondary/40 text-muted-foreground"
              }`}
              style={filter === value ? { background: "var(--gradient-neon)" } : {}}
            >
              {value}
            </button>
          ))}
        </div>

        {data.warning ? (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Feed do Quant em fallback: {data.warning}
          </div>
        ) : null}

        <div className="space-y-3">
          {list.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="card-elevated rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex items-center gap-3 md:w-48 shrink-0">
                <span className="text-xs font-mono text-muted-foreground">{item.time}</span>
                <span className="text-xs px-2 py-1 rounded-md bg-secondary font-mono">
                  {item.source}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium leading-snug">{item.title}</h3>
                <div className="flex gap-2 mt-2">
                  {item.tickers.map((ticker) => (
                    <span
                      key={ticker}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary/60"
                    >
                      {ticker}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 md:w-32 justify-end">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: color(item.sentiment) }}
                />
                <span
                  className="text-xs uppercase tracking-wider font-bold"
                  style={{ color: color(item.sentiment) }}
                >
                  {item.sentiment}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
