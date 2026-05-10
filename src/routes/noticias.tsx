import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/trading/PageShell";
import { NEWS } from "@/components/trading/mockData";
import { useState } from "react";

export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title: "Notícias — Quantum.AI" },
      { name: "description", content: "Feed de notícias macro e de empresas com análise de sentimento por IA." },
    ],
  }),
  component: Noticias,
});

const FILTERS = ["Todas", "Bullish", "Bearish", "Neutras"] as const;

function Noticias() {
  const [f, setF] = useState<typeof FILTERS[number]>("Todas");
  const list = NEWS.filter(n => {
    if (f === "Bullish") return n.sentiment === "bull";
    if (f === "Bearish") return n.sentiment === "bear";
    if (f === "Neutras") return n.sentiment === "neutral";
    return true;
  });
  const color = (s: string) => s === "bull" ? "var(--bull)" : s === "bear" ? "var(--bear)" : "var(--neon)";
  return (
    <PageShell
      eyebrow="Notícias"
      title={<>Mercado lido por <span className="gradient-text">IA de sentimento</span></>}
      description="Manchetes de Bloomberg, Reuters, WSJ, Valor e CoinDesk com classificação automática e tickers afetados."
    >
      <section className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {FILTERS.map(x=>(
            <button key={x} onClick={()=>setF(x)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${f===x?"border-primary text-primary-foreground":"border-border bg-secondary/40 text-muted-foreground"}`} style={f===x?{background:"var(--gradient-neon)"}:{}}>{x}</button>
          ))}
        </div>
        <div className="space-y-3">
          {list.map((n, i) => (
            <article key={i} className="card-elevated rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3 md:w-48 shrink-0">
                <span className="text-xs font-mono text-muted-foreground">{n.time}</span>
                <span className="text-xs px-2 py-1 rounded-md bg-secondary font-mono">{n.source}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium leading-snug">{n.title}</h3>
                <div className="flex gap-2 mt-2">
                  {n.tickers.map(t=>(<span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary/60">{t}</span>))}
                </div>
              </div>
              <div className="flex items-center gap-2 md:w-32 justify-end">
                <span className="w-2 h-2 rounded-full" style={{background:color(n.sentiment)}} />
                <span className="text-xs uppercase tracking-wider font-bold" style={{color:color(n.sentiment)}}>{n.sentiment}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
