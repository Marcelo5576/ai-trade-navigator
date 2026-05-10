import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/trading/PageShell";
import { useState } from "react";
import { Sparkline } from "@/components/trading/Sparkline";

export const Route = createFileRoute("/backtest")({
  head: () => ({
    meta: [
      { title: "Backtest — Quantum.AI" },
      { name: "description", content: "Valide estratégias com dados históricos de 10+ anos em segundos." },
    ],
  }),
  component: Backtest,
});

function Backtest() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(true);
  const equity = Array.from({length: 60}, (_,i) => 10000 + Math.sin(i*0.3)*400 + i*120 + Math.cos(i*0.7)*200);
  const metrics = [
    { k: "Retorno total", v: "+184.2%", c: "text-bull" },
    { k: "Sharpe ratio", v: "2.34", c: "text-foreground" },
    { k: "Max drawdown", v: "-12.4%", c: "text-bear" },
    { k: "Win rate", v: "67.8%", c: "text-bull" },
    { k: "Trades", v: "342", c: "text-foreground" },
    { k: "Profit factor", v: "2.18", c: "text-bull" },
  ];
  return (
    <PageShell
      eyebrow="Backtest"
      title={<>Teste antes de <span className="gradient-text">arriscar capital</span></>}
      description="Engine de backtest vetorizada com slippage, custos e modelo de execução realista."
    >
      <section className="max-w-[1400px] mx-auto px-6 py-8 grid lg:grid-cols-3 gap-6">
        <div className="card-elevated rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Parâmetros</h2>
          {[
            ["Estratégia", "Cruzamento EMA 9/21"],
            ["Ativo", "PETR4"],
            ["Timeframe", "15m"],
            ["Período", "2020 — 2026"],
            ["Capital inicial", "R$ 10.000"],
            ["Risco por trade", "1%"],
          ].map(([k,v])=>(
            <div key={k}>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">{k}</label>
              <div className="mt-1 px-3 py-2 rounded-lg bg-secondary/40 border border-border font-mono text-sm">{v}</div>
            </div>
          ))}
          <button
            onClick={()=>{setRunning(true); setTimeout(()=>{setRunning(false); setDone(true);}, 1200);}}
            className="w-full py-3 rounded-xl font-bold text-primary-foreground glow"
            style={{background:"var(--gradient-neon)"}}
          >
            {running ? "Executando..." : "Rodar backtest"}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card-elevated rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Curva de capital</h2>
              <span className="text-xs font-mono text-muted-foreground">{done?"último resultado":"-"}</span>
            </div>
            <div className="h-48"><Sparkline data={equity} positive /></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {metrics.map(m=>(
              <div key={m.k} className="card-elevated rounded-xl p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.k}</div>
                <div className={`font-mono text-2xl font-bold mt-1 ${m.c}`}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
