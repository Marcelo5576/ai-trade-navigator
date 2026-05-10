import { AI_SIGNALS } from "@/components/trading/mockData";
import { PLAN_CONFIGS, listPlans, normalizePlan } from "./plans";
import { getUsageSnapshot } from "./usage";
import type { AuthSession } from "./auth";

export function getDashboardSummary(session: AuthSession | null, request: Request) {
  const plan = normalizePlan(session?.plan);
  const usage = getUsageSnapshot(session, request, plan);

  return {
    ok: true,
    system_status: "operational",
    current_plan: {
      id: plan,
      label: PLAN_CONFIGS[plan].label,
      description: PLAN_CONFIGS[plan].description,
    },
    signals_available: AI_SIGNALS.length,
    analyses_available: usage.remaining.analysesPerDay,
    usage_today: usage.usage,
    usage_limits: usage.limits,
    latest_activities: [
      "Scanner multi-timeframe sincronizado",
      "Backtest pronto para execução",
      "Feed de notícias com sentimento disponível",
      "Camada SaaS protegida para billing e planos",
    ],
    quick_access: [
      { label: "Scanner", href: "/scanner" },
      { label: "Estratégias", href: "/estrategias" },
      { label: "Backtesting", href: "/backtest" },
      { label: "Configurações", href: "/admin/system" },
      ...(session?.role === "admin" ? [{ label: "Admin", href: "/admin" }] : []),
    ],
    plans: listPlans(),
  };
}
