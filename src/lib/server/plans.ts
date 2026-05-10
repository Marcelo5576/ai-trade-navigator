export type PlanId = "free" | "pro" | "elite" | "admin";

export type PlanConfig = {
  id: PlanId;
  label: string;
  description: string;
  priority: number;
  features: string[];
  limits: {
    dailyUsage: number;
    analysesPerDay: number;
    aiCallsPerDay: number;
  };
};

export const PLAN_CONFIGS: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    label: "Free",
    description: "Acesso inicial ao scanner e ao dashboard.",
    priority: 0,
    features: ["Dashboard", "Scanner básico", "Notícias", "Backtesting de leitura"],
    limits: {
      dailyUsage: 25,
      analysesPerDay: 10,
      aiCallsPerDay: 5,
    },
  },
  pro: {
    id: "pro",
    label: "Pro",
    description: "Fluxo profissional com mais análises e uso diário.",
    priority: 1,
    features: [
      "Tudo do Free",
      "Sinais IA avançados",
      "Backtesting expandido",
      "Estratégias favoritas",
    ],
    limits: {
      dailyUsage: 250,
      analysesPerDay: 80,
      aiCallsPerDay: 40,
    },
  },
  elite: {
    id: "elite",
    label: "Elite",
    description: "Capacidade alta para times e operadores intensivos.",
    priority: 2,
    features: [
      "Tudo do Pro",
      "Análises prioritárias",
      "Relatórios completos",
      "Fluxos operacionais estendidos",
    ],
    limits: {
      dailyUsage: 1500,
      analysesPerDay: 400,
      aiCallsPerDay: 250,
    },
  },
  admin: {
    id: "admin",
    label: "Admin",
    description: "Acesso administrativo e limites expandidos.",
    priority: 3,
    features: ["Tudo do Elite", "Área admin", "Billing interno", "Status do sistema"],
    limits: {
      dailyUsage: 100000,
      analysesPerDay: 100000,
      aiCallsPerDay: 100000,
    },
  },
};

export function normalizePlan(plan?: string): PlanId {
  if (!plan) return "free";
  if (plan in PLAN_CONFIGS) return plan as PlanId;
  return "free";
}

export function canAccessPlan(currentPlan: PlanId, requiredPlan: PlanId) {
  return PLAN_CONFIGS[currentPlan].priority >= PLAN_CONFIGS[requiredPlan].priority;
}

export function listPlans() {
  return Object.values(PLAN_CONFIGS);
}
