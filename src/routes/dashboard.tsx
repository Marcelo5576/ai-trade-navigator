import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/trading/PageShell";
import { Stats } from "@/components/trading/Stats";
import { Scanner } from "@/components/trading/Scanner";
import { ASSETS, AI_SIGNALS } from "@/components/trading/mockData";
import { Sparkline } from "@/components/trading/Sparkline";
import { useApiResource } from "@/hooks/use-api-resource";
import type { DashboardSummaryResponse } from "@/types/saas";
import type { QuantBridgeEnvelope, QuantOperationPayload, QuantSignal } from "@/types/quant";
import { fetchJson } from "@/lib/client-api";
import { mapQuantAssetToScannerAsset, mapQuantSignalToDecision } from "@/lib/quant-adapters";

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
  const [actionMessage, setActionMessage] = useState<string | null>(null);
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
  const { data: quantStatus } = useApiResource<
    QuantBridgeEnvelope<{
      health?: Record<string, unknown>;
      operation?: QuantBridgeEnvelope<QuantOperationPayload>;
      metrics?: QuantBridgeEnvelope<Record<string, unknown>>;
      urls?: { operationUrl?: string; godUrl?: string };
    }>
  >(
    "/api/quant/status?symbol=BTCUSDT",
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
  const { data: signalsBridge } = useApiResource<QuantBridgeEnvelope<{ signals?: QuantSignal[] }>>(
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

  const quantOperation = quantStatus.data?.operation?.data || null;
  const quantHealth = (quantStatus.data?.health?.data || {}) as Record<string, unknown>;
  const quantUrls = quantStatus.data?.urls || {};
  const watch =
    quantOperation?.watchlist?.slice(0, 6).map(mapQuantAssetToScannerAsset) || ASSETS.slice(0, 6);
  const positions = quantOperation?.open_positions?.slice(0, 8).map((position) => ({
    sym: String(position.symbol || "N/D"),
    side: String(position.direction || "NEUTRO"),
    qty: Number(position.quantity || 1),
    entry: Number(position.entry_price || 0),
    last: Number(position.current_price || position.entry_price || 0),
    pnl: Number(position.result_r || 0),
    status: String(position.status || "OPEN"),
  })) || [
    { sym: "NVDA", side: "LONG", qty: 120, entry: 132.4, last: 138.92, pnl: 782.4, status: "OPEN" },
    { sym: "PETR4", side: "LONG", qty: 800, entry: 36.8, last: 38.42, pnl: 1296.0, status: "OPEN" },
    { sym: "TSLA", side: "SHORT", qty: 50, entry: 420.1, last: 412.84, pnl: 363.0, status: "OPEN" },
  ];

  const liveSignals =
    signalsBridge.data?.signals?.slice(0, 4).map((signal) => mapQuantSignalToDecision(signal)) ||
    AI_SIGNALS.map((signal) => ({
      asset: signal.asset,
      signal: signal.label,
      decision: {
        confidence_score: signal.confidence,
        risk_level: "medium" as const,
        rationale: signal.label,
        recommended_action: "wait" as const,
        disclaimer: "Análise informativa. Não é garantia de lucro.",
      },
    }));

  async function handleBridgeAction(path: string, successMessage: string) {
    setActionMessage("Processando...");
    try {
      const response = await fetchJson<QuantBridgeEnvelope<Record<string, unknown>>>(path, {
        method: "POST",
      });
      setActionMessage(
        response.ok ? successMessage : response.warning || "Ação executada com aviso.",
      );
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "Falha ao acionar o motor do Quant.";
      setActionMessage(message);
    }
  }

  return (
    <PageShell
      eyebrow="Dashboard"
      title={
        <>
          Sua mesa de operações em <span className="gradient-text">tempo real</span>
        </>
      }
      description="Acompanhe P&L, exposição, ordens e sinais do ApexQuant com a camada SaaS do Navigator por cima."
    >
      <Stats />

      <section className="max-w-[1400px] mx-auto px-6 pt-2 pb-4">
        <div className="card-elevated rounded-2xl p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Bridge ApexQuant
            </div>
            <div className="font-display text-lg font-bold mt-1">
              {quantStatus.ok ? "Motor real conectado" : "Fallback seguro ativo"}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Telegram {String(quantHealth.telegram ?? "desconhecido")} · Binance{" "}
              {String(quantHealth.binance_realtime ?? "desconhecido")} · Modo{" "}
              {String(quantHealth.mode || "paper")}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                void handleBridgeAction(
                  "/api/quant/scanner/run-once",
                  "Scanner do Quant disparado.",
                )
              }
              className="px-4 py-2 rounded-lg font-medium text-sm text-primary-foreground"
              style={{ background: "var(--gradient-neon)" }}
            >
              Rodar scanner
            </button>
            <button
              onClick={() =>
                void handleBridgeAction(
                  "/api/quant/telegram/test",
                  "Teste do Telegram enviado pelo Quant.",
                )
              }
              className="px-4 py-2 rounded-lg font-medium text-sm border border-border bg-secondary/60 hover:bg-secondary transition-colors"
            >
              Testar Telegram
            </button>
            {quantUrls.operationUrl ? (
              <a
                href={quantUrls.operationUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg font-medium text-sm border border-border bg-secondary/60 hover:bg-secondary transition-colors"
              >
                Abrir terminal Quant
              </a>
            ) : null}
          </div>
        </div>
        {quantStatus.warning || actionMessage ? (
          <div className="mt-3 rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
            {actionMessage || quantStatus.warning}
          </div>
        ) : null}
      </section>

      <section className="max-w-[1400px] mx-auto px-6 grid xl:grid-cols-[1.4fr_0.95fr] gap-6 py-2">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            ["Status do sistema", quantStatus.ok ? "operational" : summary.system_status],
            ["Plano atual", loading ? "..." : summary.current_plan.label],
            [
              "Sinais disponíveis",
              String(quantOperation?.signals?.length ?? summary.signals_available),
            ],
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
            {quantUrls.godUrl ? (
              <a
                href={quantUrls.godUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm hover:border-primary/40 transition-colors"
              >
                Modo Deus
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 grid xl:grid-cols-[1.15fr_0.85fr] gap-6 py-6">
        <div className="card-elevated rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold mb-4">Últimas atividades</h2>
          <div className="space-y-3">
            {(
              quantOperation?.bot_timeline
                ?.slice(0, 5)
                .map((event) => `${event.time} · ${event.text}`) || summary.latest_activities
            ).map((activity) => (
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
            <span className="text-xs font-mono text-bull">
              {String(
                (quantOperation?.portfolio as Record<string, unknown> | undefined)
                  ?.daily_result_amount ?? "paper",
              )}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  {["Ativo", "Lado", "Qtd", "Entrada", "Atual", "P&L", "Status"].map((h) => (
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
                    <td className={p.pnl >= 0 ? "text-bull" : "text-bear"}>
                      {p.pnl >= 0 ? "+" : ""}
                      {p.pnl.toFixed(2)}
                    </td>
                    <td>
                      <span className="text-xs px-3 py-1 rounded-md bg-secondary inline-flex">
                        {p.status}
                      </span>
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
            {liveSignals.map((signal) => (
              <div
                key={signal.signal + signal.asset}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border"
              >
                <div>
                  <div className="font-bold text-sm">{signal.signal}</div>
                  <div className="text-xs text-muted-foreground">
                    {signal.asset} · {signal.decision.recommended_action}
                  </div>
                </div>
                <div className="font-mono text-sm" style={{ color: "var(--neon)" }}>
                  {signal.decision.confidence_score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 pb-8">
        <h2 className="font-display text-2xl font-bold mb-4">Watchlist</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {watch.map((asset) => (
            <div key={asset.symbol} className="card-elevated rounded-xl p-4">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold">{asset.symbol}</span>
                <span
                  className={`font-mono text-sm ${asset.change >= 0 ? "text-bull" : "text-bear"}`}
                >
                  {asset.change >= 0 ? "+" : ""}
                  {asset.change.toFixed(2)}%
                </span>
              </div>
              <Sparkline data={asset.spark} positive={asset.change >= 0} />
            </div>
          ))}
        </div>
      </section>

      <Scanner
        assets={quantOperation?.watchlist?.map(mapQuantAssetToScannerAsset)}
        warning={quantStatus.warning}
        actions={
          <div className="flex flex-wrap gap-2 justify-end">
            <span className="text-xs font-mono text-muted-foreground">
              Fonte: {quantStatus.source === "quant" ? "ApexQuant" : "fallback visual"}
            </span>
          </div>
        }
      />
    </PageShell>
  );
}
