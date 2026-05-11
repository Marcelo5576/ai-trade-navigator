import { Activity, Target, Eye, Gauge } from "lucide-react";
import { useApiResource } from "@/hooks/use-api-resource";
import { summarizeQuantStatus } from "@/lib/quant-adapters";
import type { QuantBridgeEnvelope, QuantOperationPayload } from "@/types/quant";

const fallbackStats = [
  { i: Activity, l: "Ativos analisados", v: "2.847", d: "+124 hoje", c: "var(--neon)" },
  { i: Target, l: "Setups aprovados", v: "47", d: "+8 última hora", c: "var(--bull)" },
  { i: Eye, l: "Em monitoramento", v: "126", d: "real-time", c: "var(--neon-2)" },
  { i: Gauge, l: "Score médio IA", v: "84.6", d: "alta confiança", c: "var(--accent)" },
];

export function Stats() {
  const { data } = useApiResource<
    QuantBridgeEnvelope<{
      health?: Record<string, unknown>;
      operation?: QuantBridgeEnvelope<QuantOperationPayload>;
      metrics?: QuantBridgeEnvelope<Record<string, unknown>>;
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
    { refreshMs: 30000 },
  );

  const quantStats = summarizeQuantStatus(
    data.data?.operation?.data || null,
    (data.data?.metrics?.data as Record<string, unknown> | null) || null,
  );
  const stats = quantStats.map((item, index) => ({
    i: [Activity, Target, Eye, Gauge][index] || Activity,
    l: item.label,
    v: item.value,
    d: item.detail,
    c: ["var(--neon)", "var(--bull)", "var(--neon-2)", "var(--accent)"][index] || "var(--neon)",
  }));

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
      {(stats.length ? stats : fallbackStats).map((s) => {
        const Icon = s.i;
        return (
          <div
            key={s.l}
            className="card-elevated rounded-2xl p-5 relative overflow-hidden group hover:border-primary/40 transition-colors"
          >
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl"
              style={{ background: s.c }}
            />
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-3">
              <Icon className="w-3.5 h-3.5" style={{ color: s.c }} />
              {s.l}
            </div>
            <div className="font-display text-3xl font-bold mb-1">{s.v}</div>
            <div className="text-xs font-mono text-muted-foreground">{s.d}</div>
          </div>
        );
      })}
    </div>
  );
}
