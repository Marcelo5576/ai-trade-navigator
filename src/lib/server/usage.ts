import { PLAN_CONFIGS, type PlanId } from "./plans";
import type { AuthSession } from "./auth";

type UsageBucket = {
  dateKey: string;
  usageToday: number;
  analysesToday: number;
  aiCallsToday: number;
};

const usageStore = new Map<string, UsageBucket>();

export type UsageDimension = "dailyUsage" | "analysesPerDay" | "aiCallsPerDay";

export function getUsageKey(session: AuthSession | null, request: Request) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for");
  return session?.sub || `guest:${ip || "local"}`;
}

function getCurrentDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function ensureBucket(key: string) {
  const dateKey = getCurrentDateKey();
  const current = usageStore.get(key);
  if (!current || current.dateKey !== dateKey) {
    const fresh = {
      dateKey,
      usageToday: 0,
      analysesToday: 0,
      aiCallsToday: 0,
    };
    usageStore.set(key, fresh);
    return fresh;
  }
  return current;
}

export function getUsageSnapshot(session: AuthSession | null, request: Request, plan: PlanId) {
  const key = getUsageKey(session, request);
  const bucket = ensureBucket(key);
  const limits = PLAN_CONFIGS[plan].limits;

  return {
    usage: {
      dailyUsage: bucket.usageToday,
      analysesPerDay: bucket.analysesToday,
      aiCallsPerDay: bucket.aiCallsToday,
    },
    limits,
    remaining: {
      dailyUsage: Math.max(limits.dailyUsage - bucket.usageToday, 0),
      analysesPerDay: Math.max(limits.analysesPerDay - bucket.analysesToday, 0),
      aiCallsPerDay: Math.max(limits.aiCallsPerDay - bucket.aiCallsToday, 0),
    },
  };
}

export function trackUsage(
  session: AuthSession | null,
  request: Request,
  kind: UsageDimension,
  amount = 1,
) {
  const key = getUsageKey(session, request);
  const bucket = ensureBucket(key);

  if (kind === "dailyUsage") bucket.usageToday += amount;
  if (kind === "analysesPerDay") bucket.analysesToday += amount;
  if (kind === "aiCallsPerDay") bucket.aiCallsToday += amount;

  return bucket;
}

export function checkUsageLimit(
  session: AuthSession | null,
  request: Request,
  plan: PlanId,
  kind: UsageDimension,
  amount = 1,
) {
  const snapshot = getUsageSnapshot(session, request, plan);
  const currentValue =
    kind === "dailyUsage"
      ? snapshot.usage.dailyUsage
      : kind === "analysesPerDay"
        ? snapshot.usage.analysesPerDay
        : snapshot.usage.aiCallsPerDay;
  const limitValue =
    kind === "dailyUsage"
      ? snapshot.limits.dailyUsage
      : kind === "analysesPerDay"
        ? snapshot.limits.analysesPerDay
        : snapshot.limits.aiCallsPerDay;

  const allowed = currentValue + amount <= limitValue;
  return {
    ok: allowed,
    error: allowed ? null : "limit_exceeded",
    message: allowed ? null : "Limite do plano atingido",
    snapshot,
  };
}
