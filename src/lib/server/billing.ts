import { PLAN_CONFIGS, normalizePlan } from "./plans";
import { getServerRuntimeConfig, type ServerEnvSource } from "./env";
import { getUsageSnapshot } from "./usage";
import type { AuthSession } from "./auth";

export function getBillingStatus(
  session: AuthSession | null,
  request: Request,
  env: ServerEnvSource,
) {
  const config = getServerRuntimeConfig(env);
  const currentPlan = normalizePlan(session?.plan);
  const usage = getUsageSnapshot(session, request, currentPlan);

  const limitState =
    usage.remaining.dailyUsage <= 0 ||
    usage.remaining.analysesPerDay <= 0 ||
    usage.remaining.aiCallsPerDay <= 0
      ? {
          ok: false,
          error: "limit_exceeded",
          message: "Limite do plano atingido",
        }
      : {
          ok: true,
        };

  if (config.paymentProvider !== "mock") {
    return {
      ok: true,
      provider: config.paymentProvider,
      mock: false,
      subscription_status: "unconfigured",
      current_plan: currentPlan,
      plan_limits: PLAN_CONFIGS[currentPlan].limits,
      usage_limits: usage,
      limit_state: limitState,
      message: "Billing provider preparado, aguardando credenciais reais.",
    };
  }

  return {
    ok: true,
    provider: "mock",
    mock: true,
    subscription_status: currentPlan === "free" ? "trial" : "active",
    current_plan: currentPlan,
    plan_limits: PLAN_CONFIGS[currentPlan].limits,
    usage_limits: usage,
    limit_state: limitState,
  };
}
