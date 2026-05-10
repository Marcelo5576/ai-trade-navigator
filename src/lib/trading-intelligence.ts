import type { Asset } from "@/components/trading/mockData";

export type RecommendedAction = "enter" | "wait" | "exit" | "avoid";
export type RiskLevel = "low" | "medium" | "high";

export type DecisionEnvelope = {
  confidence_score: number;
  risk_level: RiskLevel;
  rationale: string;
  recommended_action: RecommendedAction;
  disclaimer: string;
};

const DISCLAIMER = "Análise informativa. Não é garantia de lucro.";

export function buildDecisionEnvelope(asset: Asset): DecisionEnvelope {
  const confidence = Math.max(35, Math.min(99, Math.round(asset.score)));
  const riskLevel: RiskLevel =
    asset.risk === "Baixo" ? "low" : asset.risk === "Médio" ? "medium" : "high";

  const recommendedAction: RecommendedAction =
    asset.status === "APROVADO"
      ? asset.direction === "NEUTRO"
        ? "wait"
        : "enter"
      : asset.status === "MONITORAR"
        ? "wait"
        : asset.direction === "SHORT"
          ? "avoid"
          : "exit";

  return {
    confidence_score: confidence,
    risk_level: riskLevel,
    rationale: `${asset.symbol} em ${asset.trend.toLowerCase()} com RSI ${asset.rsi.toFixed(1)} e score ${asset.score}.`,
    recommended_action: recommendedAction,
    disclaimer: DISCLAIMER,
  };
}

export const DECISION_DISCLAIMER = DISCLAIMER;
