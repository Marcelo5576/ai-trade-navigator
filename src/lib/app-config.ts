export type PublicAppConfig = {
  appName: string;
  appDomain: string;
  publicUrl: string;
  environment: string;
  version: string;
};

declare global {
  interface Window {
    __AITN_CONFIG__?: Partial<PublicAppConfig>;
  }
}

const DEFAULT_PUBLIC_CONFIG: PublicAppConfig = {
  appName: "AI Trade Navigator",
  appDomain: "localhost",
  publicUrl: "http://localhost:3000",
  environment: "development",
  version: "0.1.0",
};

function readClientEnv(key: string): string | undefined {
  const env = import.meta.env as Record<string, string | undefined>;
  return env[key];
}

export function getPublicAppConfig(): PublicAppConfig {
  if (typeof window !== "undefined" && window.__AITN_CONFIG__) {
    return {
      ...DEFAULT_PUBLIC_CONFIG,
      ...window.__AITN_CONFIG__,
    };
  }

  return {
    appName: readClientEnv("VITE_APP_NAME") || DEFAULT_PUBLIC_CONFIG.appName,
    appDomain: readClientEnv("VITE_APP_DOMAIN") || DEFAULT_PUBLIC_CONFIG.appDomain,
    publicUrl: readClientEnv("VITE_PUBLIC_URL") || DEFAULT_PUBLIC_CONFIG.publicUrl,
    environment:
      readClientEnv("VITE_ENVIRONMENT") ||
      readClientEnv("MODE") ||
      DEFAULT_PUBLIC_CONFIG.environment,
    version: readClientEnv("VITE_APP_VERSION") || DEFAULT_PUBLIC_CONFIG.version,
  };
}

export function getAppName() {
  return getPublicAppConfig().appName;
}
