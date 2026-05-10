import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/trading/PageShell";
import { Zap, TrendingUp, Repeat, LineChart, Shield, Layers } from "lucide-react";

export const Route = createFileRoute("/estrategias")({
  head: () => ({
    meta: [
      { title: "Estratégias — AI Trade Navigator" },
      {
        name: "description",
        content:
          "Biblioteca de estratégias prontas: trend following, mean reversion, breakout e mais.",
      },
    ],
  }),
  component: Estrategias,
});

const STRATS = [
  {
    icon: TrendingUp,
    name: "Trend Following EMA",
    desc: "Cruzamento EMA 9/21 com filtro ADX > 25",
    roi: "+184%",
    win: "67%",
    tf: "15m",
  },
  {
    icon: Repeat,
    name: "Mean Reversion",
    desc: "Entrada em RSI extremo com Bollinger 2σ",
    roi: "+92%",
    win: "71%",
    tf: "1h",
  },
  {
    icon: Zap,
    name: "Opening Range Breakout",
    desc: "Rompimento do range dos primeiros 30 minutos",
    roi: "+128%",
    win: "58%",
    tf: "5m",
  },
  {
    icon: LineChart,
    name: "Momentum Multi-Asset",
    desc: "Top 5 ativos por força relativa de 90 dias",
    roi: "+201%",
    win: "62%",
    tf: "1d",
  },
  {
    icon: Shield,
    name: "Volatility Hedge",
    desc: "Long VXX em sinais de risk-off da curva",
    roi: "+74%",
    win: "55%",
    tf: "1d",
  },
  {
    icon: Layers,
    name: "Pairs Trading",
    desc: "Long/short em pares cointegrados PETR4/VALE3",
    roi: "+108%",
    win: "69%",
    tf: "1h",
  },
];

function Estrategias() {
  return (
    <PageShell
      eyebrow="Estratégias"
      title={
        <>
          Biblioteca de <span className="gradient-text">edges quantitativos</span>
        </>
      }
      description="Estratégias auditadas, com código aberto e backtest reproduzível. Clone, adapte e implante."
    >
      <section className="max-w-[1400px] mx-auto px-6 py-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {STRATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.name}
              className="card-elevated rounded-2xl p-6 hover:border-primary/40 transition hover:-translate-y-0.5"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--gradient-neon)" }}
              >
                <Icon className="w-5 h-5 text-background" />
              </div>
              <h3 className="font-display text-lg font-bold">{s.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{s.desc}</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-secondary/40 rounded-lg p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">ROI</div>
                  <div className="font-mono font-bold text-bull">{s.roi}</div>
                </div>
                <div className="bg-secondary/40 rounded-lg p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">Win</div>
                  <div className="font-mono font-bold">{s.win}</div>
                </div>
                <div className="bg-secondary/40 rounded-lg p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">TF</div>
                  <div className="font-mono font-bold">{s.tf}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 text-xs font-medium py-2 rounded-lg text-primary-foreground"
                  style={{ background: "var(--gradient-neon)" }}
                >
                  Implantar
                </button>
                <button className="flex-1 text-xs font-medium py-2 rounded-lg bg-secondary">
                  Backtest
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </PageShell>
  );
}
