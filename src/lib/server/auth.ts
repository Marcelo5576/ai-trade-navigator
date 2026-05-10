import { canAccessPlan, normalizePlan, type PlanId } from "./plans";
import { getServerRuntimeConfig, type ServerEnvSource } from "./env";
import { parseCookies } from "./http";

export type SessionRole = "guest" | "member" | "admin";

export type AuthSession = {
  sub: string;
  email: string;
  name: string;
  plan: PlanId;
  role: SessionRole;
  iat: number;
};

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

const SESSION_COOKIE = "aitn_session";

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const padding = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/") + padding;
  return Buffer.from(normalized, "base64").toString("utf-8");
}

async function signPayload(payload: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Buffer.from(signature)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function createSignedSessionCookie(
  session: AuthSession,
  env: ServerEnvSource,
  request: Request,
) {
  const config = getServerRuntimeConfig(env);
  const payload = base64UrlEncode(JSON.stringify(session));
  const signature = await signPayload(payload, config.sessionSecret);
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";

  return `${SESSION_COOKIE}=${payload}.${signature}; Path=/; HttpOnly; SameSite=Lax${secure}`;
}

export function clearSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}

export async function getSessionFromRequest(
  request: Request,
  env: ServerEnvSource,
): Promise<AuthSession | null> {
  const config = getServerRuntimeConfig(env);
  const cookies = parseCookies(request);
  const raw = cookies[SESSION_COOKIE];
  if (!raw) return null;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = await signPayload(payload, config.sessionSecret);
  if (signature !== expectedSignature) return null;

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as AuthSession;
    return {
      ...parsed,
      plan: normalizePlan(parsed.plan),
      role: parsed.role === "admin" ? "admin" : parsed.role === "member" ? "member" : "guest",
    };
  } catch {
    return null;
  }
}

export async function authenticateWithDemoCredentials(
  email: string,
  password: string,
  env: ServerEnvSource,
): Promise<AuthSession | null> {
  const config = getServerRuntimeConfig(env);
  if (!config.demoAuthEnabled) return null;

  if (email === config.demoAdminEmail && password === config.demoAdminPassword) {
    return {
      sub: "admin-1",
      email,
      name: config.demoAdminName,
      plan: "admin",
      role: "admin",
      iat: Date.now(),
    };
  }

  if (email === config.demoUserEmail && password === config.demoUserPassword) {
    return {
      sub: "user-1",
      email,
      name: config.demoUserName,
      plan: normalizePlan(config.demoUserPlan),
      role: "member",
      iat: Date.now(),
    };
  }

  return null;
}

export async function requireAuth(request: Request, env: ServerEnvSource) {
  const session = await getSessionFromRequest(request, env);
  if (!session) {
    throw new AuthError("authentication_required", 401);
  }
  return session;
}

export async function requirePlan(request: Request, env: ServerEnvSource, requiredPlan: PlanId) {
  const session = await requireAuth(request, env);
  if (!canAccessPlan(session.plan, requiredPlan)) {
    throw new AuthError("insufficient_plan", 403);
  }
  return session;
}

export async function requireAdmin(request: Request, env: ServerEnvSource) {
  const session = await requireAuth(request, env);
  if (session.role !== "admin") {
    throw new AuthError("admin_required", 403);
  }
  return session;
}
