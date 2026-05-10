import type { AuthSession } from "./auth";
import { getBillingStatus } from "./billing";
import { getServerRuntimeConfig, type ServerEnvSource } from "./env";

export function getSystemStatus(
  request: Request,
  env: ServerEnvSource,
  uptimeSeconds: number,
  session: AuthSession | null = null,
) {
  const config = getServerRuntimeConfig(env);
  const billing = getBillingStatus(session, request, env);

  return {
    ok: true,
    app: config.appName,
    environment: config.environment,
    version: config.version,
    uptime_seconds: uptimeSeconds,
    db: {
      status: "not_configured",
      message: "Nenhum banco persistente configurado neste build.",
    },
    ai_provider: {
      status: "mock",
      message: "Camada de IA preparada para conexão futura.",
    },
    payment: {
      provider: billing.provider,
      mock: billing.mock,
      subscription_status: billing.subscription_status,
    },
    auth: {
      demo_enabled: config.demoAuthEnabled,
      session_active: Boolean(session),
    },
  };
}
