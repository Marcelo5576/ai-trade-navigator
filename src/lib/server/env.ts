import type { PublicAppConfig } from "@/lib/app-config";

export type ServerEnvSource = Record<string, unknown> | undefined | null;

export type ServerRuntimeConfig = PublicAppConfig & {
  corsOrigins: string[];
  paymentProvider: string;
  sessionSecret: string;
  demoAuthEnabled: boolean;
  demoAdminEmail: string;
  demoAdminPassword: string;
  demoAdminName: string;
  demoUserEmail: string;
  demoUserPassword: string;
  demoUserName: string;
  demoUserPlan: string;
};

const DEFAULTS: ServerRuntimeConfig = {
  appName: "AI Trade Navigator",
  appDomain: "localhost",
  publicUrl: "http://localhost:3000",
  environment: "development",
  version: "0.1.0",
  corsOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
  paymentProvider: "mock",
  sessionSecret: "change-me-session-secret",
  demoAuthEnabled: true,
  demoAdminEmail: "admin@example.com",
  demoAdminPassword: "change-me-admin",
  demoAdminName: "Admin Operator",
  demoUserEmail: "user@example.com",
  demoUserPassword: "change-me-user",
  demoUserName: "Pro Analyst",
  demoUserPlan: "pro",
};

function readNodeEnv(key: string): string | undefined {
  try {
    return process.env[key];
  } catch {
    return undefined;
  }
}

export function readEnvValue(env: ServerEnvSource, key: string): string | undefined {
  const value = env && typeof env === "object" ? env[key] : undefined;
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return readNodeEnv(key);
}

function readBoolean(env: ServerEnvSource, key: string, fallback: boolean) {
  const raw = readEnvValue(env, key);
  if (raw == null || raw === "") return fallback;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

function readList(env: ServerEnvSource, key: string, fallback: string[]) {
  const raw = readEnvValue(env, key);
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getServerRuntimeConfig(env: ServerEnvSource): ServerRuntimeConfig {
  const environment =
    readEnvValue(env, "ENVIRONMENT") || readEnvValue(env, "NODE_ENV") || DEFAULTS.environment;
  const publicUrl = readEnvValue(env, "PUBLIC_URL") || DEFAULTS.publicUrl;

  return {
    appName: readEnvValue(env, "APP_NAME") || DEFAULTS.appName,
    appDomain:
      readEnvValue(env, "APP_DOMAIN") || safeDomainFromUrl(publicUrl) || DEFAULTS.appDomain,
    publicUrl,
    environment,
    version: readEnvValue(env, "APP_VERSION") || DEFAULTS.version,
    corsOrigins: readList(env, "CORS_ORIGINS", DEFAULTS.corsOrigins),
    paymentProvider: readEnvValue(env, "PAYMENT_PROVIDER") || DEFAULTS.paymentProvider,
    sessionSecret: readEnvValue(env, "SESSION_SECRET") || DEFAULTS.sessionSecret,
    demoAuthEnabled: readBoolean(
      env,
      "DEMO_AUTH_ENABLED",
      environment !== "production" && DEFAULTS.demoAuthEnabled,
    ),
    demoAdminEmail: readEnvValue(env, "DEMO_ADMIN_EMAIL") || DEFAULTS.demoAdminEmail,
    demoAdminPassword: readEnvValue(env, "DEMO_ADMIN_PASSWORD") || DEFAULTS.demoAdminPassword,
    demoAdminName: readEnvValue(env, "DEMO_ADMIN_NAME") || DEFAULTS.demoAdminName,
    demoUserEmail: readEnvValue(env, "DEMO_USER_EMAIL") || DEFAULTS.demoUserEmail,
    demoUserPassword: readEnvValue(env, "DEMO_USER_PASSWORD") || DEFAULTS.demoUserPassword,
    demoUserName: readEnvValue(env, "DEMO_USER_NAME") || DEFAULTS.demoUserName,
    demoUserPlan: readEnvValue(env, "DEMO_USER_PLAN") || DEFAULTS.demoUserPlan,
  };
}

function safeDomainFromUrl(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

export function getPublicRuntimeConfig(env: ServerEnvSource): PublicAppConfig {
  const config = getServerRuntimeConfig(env);
  return {
    appName: config.appName,
    appDomain: config.appDomain,
    publicUrl: config.publicUrl,
    environment: config.environment,
    version: config.version,
  };
}
