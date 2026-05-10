import { useState } from "react";
import { ASSETS, type Asset } from "./mockData";
import { Sparkline } from "./Sparkline";

const FILTERS = ["Todos", "Aprovados", "Monitorar", "Ações", "Cripto"] as const;

function statusColor(s: Asset["status"]) {
  if (s === "APROVADO") return "var(--bull)";
  if (s === "MONITORAR") return "var(--neon)";
  return "var(--bear)";
}

export function Scanner() {
  const [filter, setFilter] = useState<typeof FILTERS[number]>("Todos");
  const list = ASSETS.filter((a) => {
    if (filter === "Aprovados") return a.status === "APROVADO";
    if (filter === "Monitorar") return a.status === "MONITORAR";
    if (filter === "Ações") return a.type === "Ação" || a.type === "ETF";
    if (filter === "Cripto") return a.type === "Cripto";
    return true;
  });

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-3xl font-bold">Scanner de ativos</h2>
          <p className="text-muted-foreground text-sm mt-1">OHLCV, indicadores, TradeScore e gestão de risco em leitura única.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border transition-colors ${
                filter === f
                  ? "border-primary text-primary-foreground"
                  : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
              }`}
              style={filter === f ? { background: "var(--gradient-neon)" } : {}}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map((a) => {
          const positive = a.change >= 0;
          return (
            <div key={a.symbol} className="card-elevated rounded-2xl p-5 hover:border-primary/40 transition-all hover:-translate-y-0.5 group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-display font-bold text-xl">{a.symbol}</div>
                  <div className="text-xs text-muted-foreground">{a.name} · {a.type}</div>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider"
                  style={{ background: `color-mix(in oklab, ${statusColor(a.status)} 15%, transparent)`, color: statusColor(a.status) }}
                >
                  {a.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <div className="font-mono text-2xl font-bold">
                  {a.type === "Cripto" || a.symbol === "BTC" ? "$" : "R$"}{a.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`font-mono text-sm font-bold ${positive ? "text-bull" : "text-bear"}`}>
                  {positive ? "+" : ""}{a.change.toFixed(2)}%
                </div>
              </div>

              <Sparkline data={a.spark} positive={positive} />

              <div className="flex items-center justify-between text-xs mt-3 mb-3">
                <span className="text-muted-foreground">TradeScore</span>
                <span className="font-mono font-bold">{a.score}/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-4">
                <div className="h-full rounded-full" style={{ width: `${a.score}%`, background: "var(--gradient-neon)" }} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ["Direção", a.direction],
                  ["Tendência", a.trend],
                  ["RSI 14", a.rsi.toFixed(1)],
                  ["Volume", `${a.volume.toFixed(2)}x`],
                  ["Risco", a.risk],
                  ["ATR", `${a.atr.toFixed(2)}%`],
                ].map(([k, v]) => (
                  <div key={k} className="bg-secondary/40 rounded-lg px-2.5 py-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                    <div className="font-mono font-semibold">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
