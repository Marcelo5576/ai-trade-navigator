import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/trading/PageShell";
import { Sparkline } from "@/components/trading/Sparkline";
import { useApiResource } from "@/hooks/use-api-resource";
import { latestBacktestMetrics, latestBacktestRun } from "@/lib/quant-adapters";
import type { QuantBacktestRun, QuantBridgeEnvelope } from "@/types/quant";

export const Route = createFileRoute("/backtest")({
  head: () => ({
    meta: [
      { title: "Backtest — AI Trade Navigator" },
      {
        name: "description",
        content:
          "Histórico de backtests do ApexQuant exposto dentro do Navigator com fallback seguro.",
      },
    ],
  }),
  component: Backtest,
});

function Backtest() {
  const { data } = useApiResource<QuantBridgeEnvelope<{ backtests?: QuantBacktestRun[] }>>(
    "/api/quant/backtests",
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

  const latest = latestBacktestRun(data.data?.backtests || []);
  const metrics = latestBacktestMetrics(latest);
  const equity = metrics.equityCurve.length
    ? metrics.equityCurve
    : Array.from({ length: 20 }, (_, i) => 100 + i * 0.4);

  return (
    <PageShell
      eyebrow="Backtest"
      title={
        <>
          Valide antes de <span className="gradient-text">arriscar capital</span>
        </>
      }
      description="O Navigator exibe o último backtest do ApexQuant, com ROI, win rate, drawdown e curva de equity do resultado paper."
    >
      <section className="max-w-[1400px] mx-auto px-6 py-8 grid lg:grid-cols-3 gap-6">
        <div className="card-elevated rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Último run</h2>
          {[
            ["Estratégia", metrics.strategy],
            ["Ativo", metrics.symbol],
            ["Período", metrics.period],
            ["Run", latest?.created_at || "N/D"],
            ["Fonte", data.source === "quant" ? "ApexQuant" : "fallback"],
          ].map(([label, value]) => (
            <div key={label}>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                {label}
              </label>
              <div className="mt-1 px-3 py-2 rounded-lg bg-secondary/40 border border-border font-mono text-sm">
                {value}
              </div>
            </div>
          ))}
          <a
            href="https://trade.apexgol.com.br/backtesting"
            target="_blank"
            rel="noreferrer"
            className="block w-full text-center py-3 rounded-xl font-bold text-primary-foreground glow"
            style={{ background: "var(--gradient-neon)" }}
          >
            Abrir módulo completo
          </a>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card-elevated rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Curva de capital</h2>
              <span className="text-xs font-mono text-muted-foreground">
                {data.warning || "último resultado"}
              </span>
            </div>
            <div className="h-48">
              <Sparkline data={equity} positive={(metrics.roi || 0) >= 0} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                k: "Retorno total",
                v: `${metrics.roi.toFixed(2)}%`,
                c: metrics.roi >= 0 ? "text-bull" : "text-bear",
              },
              { k: "Win rate", v: `${metrics.winRate.toFixed(2)}%`, c: "text-foreground" },
              { k: "Max drawdown", v: `${metrics.drawdown.toFixed(2)}%`, c: "text-bear" },
              { k: "Trades", v: String(metrics.trades), c: "text-foreground" },
              { k: "Ativo", v: metrics.symbol, c: "text-bull" },
              { k: "Período", v: metrics.period, c: "text-foreground" },
            ].map((item) => (
              <div key={item.k} className="card-elevated rounded-xl p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {item.k}
                </div>
                <div className={`font-mono text-2xl font-bold mt-1 ${item.c}`}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
