import type { PlanId } from "@/lib/server/plans";
import type { DecisionEnvelope } from "@/lib/trading-intelligence";

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  plan: PlanId;
  role: "guest" | "member" | "admin";
  iat: number;
} | null;

export type SessionResponse = {
  ok: boolean;
  session: SessionPayload;
  app: {
    appName: string;
    appDomain: string;
    publicUrl: string;
    environment: string;
    version: string;
  };
};

export type DashboardSummaryResponse = {
  ok: boolean;
  system_status: string;
  current_plan: {
    id: string;
    label: string;
    description: string;
  };
  signals_available: number;
  analyses_available: number;
  usage_today: {
    dailyUsage: number;
    analysesPerDay: number;
    aiCallsPerDay: number;
  };
  usage_limits: {
    dailyUsage: number;
    analysesPerDay: number;
    aiCallsPerDay: number;
  };
  latest_activities: string[];
  quick_access: Array<{ label: string; href: string }>;
  plans: Array<{
    id: string;
    label: string;
    description: string;
    features: string[];
  }>;
};

export type HealthResponse = {
  ok: boolean;
  app: string;
  environment: string;
  version: string;
  timestamp: string;
  public_url?: string;
};

export type BillingStatusResponse = {
  ok: boolean;
  provider: string;
  mock: boolean;
  subscription_status: string;
  current_plan: string;
  limit_state?: {
    ok: boolean;
    error?: string | null;
    message?: string | null;
  };
  plan_limits: {
    dailyUsage: number;
    analysesPerDay: number;
    aiCallsPerDay: number;
  };
  usage_limits: {
    usage: {
      dailyUsage: number;
      analysesPerDay: number;
      aiCallsPerDay: number;
    };
    limits: {
      dailyUsage: number;
      analysesPerDay: number;
      aiCallsPerDay: number;
    };
    remaining: {
      dailyUsage: number;
      analysesPerDay: number;
      aiCallsPerDay: number;
    };
  };
  message?: string;
};

export type PlanSummary = {
  id: string;
  label: string;
  description: string;
  features: string[];
  priority?: number;
  limits?: {
    dailyUsage: number;
    analysesPerDay: number;
    aiCallsPerDay: number;
  };
};

export type PlansResponse = {
  ok: boolean;
  plans: PlanSummary[];
};

export type EnrichedSignal = DecisionEnvelope & {
  asset: string;
  signal: string;
};
