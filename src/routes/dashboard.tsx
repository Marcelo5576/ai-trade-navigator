import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/trading/PageShell";
import { Stats } from "@/components/trading/Stats";
import { Scanner } from "@/components/trading/Scanner";
import { ASSETS, AI_SIGNALS } from "@/components/trading/mockData";
import { Sparkline } from "@/components/trading/Sparkline";
import { useApiResource } from "@/hooks/use-api-resource";
import type { DashboardSummaryResponse } from "@/types/saas";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Trade Navigator" },
      {
        name: "description",
        content:
          "Painel completo do operador: posições, P&L, sinais ao vivo, plano atual e observabilidade SaaS.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: summary, loading } = useApiResource<DashboardSummaryResponse>(
    "/api/dashboard/summary",
    {
      ok: true,
      system_status: "loading",
      current_plan: {
        id: "free",
        label: "Free",
        description: "Carregando",
      },
      signals_available: 0,
      analyses_available: 0,
      usage_today: {
        dailyUsage: 0,
        analysesPerDay: 0,
        aiCallsPerDay: 0,
      },
      usage_limits: {
        dailyUsage: 0,
        analysesPerDay: 0,
        aiCallsPerDay: 0,
      },
      latest_activities: [],
      quick_access: [],
      plans: [],
    },
  );

  const watch = ASSETS.slice(0, 6);
  const positions = [
    { sym: "NVDA", side: "LONG", qty: 120, entry: 132.4, last: 138.92, pnl: 782.4 },
    { sym: "PETR4", side: "LONG", qty: 800, entry: 36.8, last: 38.42, pnl: 1296.0 },
    { sym: "TSLA", side: "SHORT", qty: 50, entry: 420.1, last: 412.84, pnl: 363.0 },
  ];
  return (
    <PageShell
      eyebrow="Dashboard"
      title={
        <>
          Sua mesa de operações em <span className="gradient-text">tempo real</span>
        </>
      }
      description="Acompanhe P&L, exposição, ordens e sinais de IA em uma única tela densa de informação."
    >
      <Stats />

      <section className="max-w-[1400px] mx-auto px-6 grid xl:grid-cols-[1.4fr_0.95fr] gap-6 py-2">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            ["Status do sistema", loading ? "..." : summary.system_status],
            ["Plano atual", loading ? "..." : summary.current_plan.label],
            ["Sinais disponíveis", loading ? "..." : String(summary.signals_available)],
            [
              "Uso do dia",
              loading
                ? "..."
                : `${summary.usage_today.dailyUsage}/${summary.usage_limits.dailyUsage}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="card-elevated rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="font-display text-2xl font-bold mt-2">{value}</div>
            </div>
          ))}
        </div>

        <div className="card-elevated rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Acesso rápido</h2>
            <span className="text-xs font-mono text-muted-foreground">
              {summary.current_plan.id.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {summary.quick_access.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm hover:border-primary/40 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 grid xl:grid-cols-[1.15fr_0.85fr] gap-6 py-6">
        <div className="card-elevated rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold mb-4">Últimas atividades</h2>
          <div className="space-y-3">
            {summary.latest_activities.map((activity) => (
              <div
                key={activity}
                className="rounded-xl border border-border bg-secondary/25 px-4 py-3 text-sm text-muted-foreground"
              >
                {activity}
              </div>
            ))}
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold mb-4">Plano e limites</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-border bg-secondary/25 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Plano</div>
              <div className="font-semibold mt-1">{summary.current_plan.label}</div>
              <div className="text-muted-foreground mt-1">{summary.current_plan.description}</div>
            </div>
            {[
              ["Análises", summary.usage_today.analysesPerDay, summary.usage_limits.analysesPerDay],
              [
                "Chamadas IA",
                summary.usage_today.aiCallsPerDay,
                summary.usage_limits.aiCallsPerDay,
              ],
            ].map(([label, current, limit]) => (
              <div
                key={String(label)}
                className="rounded-xl border border-border bg-secondary/25 px-4 py-3"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                  <span>{label}</span>
                  <span className="font-mono">
                    {String(current)}/{String(limit)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-3 gap-6 py-8">
        <div className="lg:col-span-2 card-elevated rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Posições abertas</h2>
            <span className="text-xs font-mono text-bull">P&L total +R$ 2.441,40</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  {["Ativo", "Lado", "Qtd", "Entrada", "Atual", "P&L", "Ação"].map((h) => (
                    <th key={h} className="text-left py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {positions.map((p) => (
                  <tr key={p.sym} className="border-b border-border/50">
                    <td className="py-3 font-bold">{p.sym}</td>
                    <td className={p.side === "LONG" ? "text-bull" : "text-bear"}>{p.side}</td>
                    <td>{p.qty}</td>
                    <td>{p.entry.toFixed(2)}</td>
                    <td>{p.last.toFixed(2)}</td>
                    <td className={p.pnl >= 0 ? "text-bull" : "text-bear"}>+{p.pnl.toFixed(2)}</td>
                    <td>
                      <button className="text-xs px-3 py-1 rounded-md bg-secondary hover:bg-secondary/70">
                        Encerrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold mb-4">Sinais IA ao vivo</h2>
          <div className="space-y-3">
            {AI_SIGNALS.map((s) => (
              <div
                key={s.label + s.asset}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border"
              >
                <div>
                  <div className="font-bold text-sm">{s.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.asset} · {s.time}
                  </div>
                </div>
                <div className="font-mono text-sm" style={{ color: "var(--neon)" }}>
                  {s.confidence}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 pb-8">
        <h2 className="font-display text-2xl font-bold mb-4">Watchlist</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {watch.map((a) => (
            <div key={a.symbol} className="card-elevated rounded-xl p-4">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold">{a.symbol}</span>
                <span className={`font-mono text-sm ${a.change >= 0 ? "text-bull" : "text-bear"}`}>
                  {a.change >= 0 ? "+" : ""}
                  {a.change.toFixed(2)}%
                </span>
              </div>
              <Sparkline data={a.spark} positive={a.change >= 0} />
            </div>
          ))}
        </div>
      </section>

      <Scanner />
    </PageShell>
  );
}
