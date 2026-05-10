import { getAppName } from "@/lib/app-config";
import {
  authenticateWithDemoCredentials,
  AuthError,
  clearSessionCookie,
  createSignedSessionCookie,
  getSessionFromRequest,
  requireAdmin,
} from "./auth";
import { getBillingStatus } from "./billing";
import { getDashboardSummary } from "./dashboard";
import { getPublicRuntimeConfig, getServerRuntimeConfig, type ServerEnvSource } from "./env";
import { jsonResponse } from "./http";
import { logError, logInfo } from "./logger";
import { listPlans } from "./plans";
import { getSystemStatus } from "./system";

async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function buildHealthPayload(env: ServerEnvSource, uptimeSeconds: number) {
  const config = getServerRuntimeConfig(env);
  return {
    ok: true,
    app: getAppName() || config.appName,
    environment: config.environment,
    version: config.version,
    timestamp: new Date().toISOString(),
    public_url: config.publicUrl,
  };
}

function unauthorizedPayload(error: unknown) {
  if (error instanceof AuthError) {
    return {
      ok: false,
      error: error.message,
    };
  }

  return {
    ok: false,
    error: "unauthorized",
  };
}

export async function handleCustomRequest(
  request: Request,
  env: ServerEnvSource,
  uptimeSeconds: number,
): Promise<Response | null> {
  const url = new URL(request.url);
  const { pathname } = url;

  if (pathname !== "/health" && pathname !== "/api/health" && !pathname.startsWith("/api/")) {
    return null;
  }

  if (pathname === "/health" || pathname === "/api/health") {
    return jsonResponse(buildHealthPayload(env, uptimeSeconds));
  }

  if (pathname === "/api/plans" && request.method === "GET") {
    return jsonResponse({
      ok: true,
      plans: listPlans(),
    });
  }

  if (pathname === "/api/auth/session" && request.method === "GET") {
    const session = await getSessionFromRequest(request, env);
    return jsonResponse({
      ok: true,
      session,
      app: getPublicRuntimeConfig(env),
    });
  }

  if (pathname === "/api/auth/login" && request.method === "POST") {
    const body = (await parseJsonBody(request)) as {
      email?: string;
      password?: string;
    } | null;

    if (!body?.email || !body?.password) {
      return jsonResponse(
        {
          ok: false,
          error: "invalid_credentials",
          message: "Informe email e senha.",
        },
        { status: 400 },
      );
    }

    const session = await authenticateWithDemoCredentials(body.email, body.password, env);
    if (!session) {
      return jsonResponse(
        {
          ok: false,
          error: "invalid_credentials",
          message: "Credenciais inválidas ou auth demo desativada.",
        },
        { status: 401 },
      );
    }

    const response = jsonResponse({
      ok: true,
      session,
    });
    response.headers.append("set-cookie", await createSignedSessionCookie(session, env, request));
    logInfo("demo login success", { email: session.email, role: session.role, plan: session.plan });
    return response;
  }

  if (pathname === "/api/auth/logout" && request.method === "POST") {
    const response = jsonResponse({ ok: true });
    response.headers.append("set-cookie", clearSessionCookie(request));
    return response;
  }

  if (pathname === "/api/billing/status" && request.method === "GET") {
    const session = await getSessionFromRequest(request, env);
    return jsonResponse(getBillingStatus(session, request, env));
  }

  if (pathname === "/api/dashboard/summary" && request.method === "GET") {
    const session = await getSessionFromRequest(request, env);
    return jsonResponse(getDashboardSummary(session, request));
  }

  if (pathname === "/api/admin/system-status" && request.method === "GET") {
    try {
      const session = await requireAdmin(request, env);
      return jsonResponse(getSystemStatus(request, env, uptimeSeconds, session));
    } catch (error) {
      return jsonResponse(unauthorizedPayload(error), {
        status: error instanceof AuthError ? error.status : 401,
      });
    }
  }

  logError("unknown api route", { pathname, method: request.method });
  return jsonResponse(
    {
      ok: false,
      error: "not_found",
      message: "Endpoint não encontrado.",
    },
    { status: 404 },
  );
}
