import type { Asset } from "@/components/trading/mockData";
import type {
  QuantBacktestRun,
  QuantNewsHeadline,
  QuantNewsPayload,
  QuantOperationPayload,
  QuantOpportunityBoard,
  QuantSignal,
  QuantWatchAsset,
} from "@/types/quant";
import type { DecisionEnvelope, RecommendedAction, RiskLevel } from "./trading-intelligence";

function seededSpark(seedText: string, trend = 0) {
  let seed = 0;
  for (const char of seedText) seed += char.charCodeAt(0);
  return Array.from({ length: 24 }, (_, i) => {
    const wave = Math.sin(seed * 0.17 + i * 0.65) * 7 + Math.cos(seed * 0.11 + i) * 3;
    return 52 + wave + i * trend;
  });
}

function normalizeType(assetType?: string): Asset["type"] {
  if (!assetType) return "Cripto";
  if (assetType.includes("ETF")) return "ETF";
  if (assetType.includes("Cripto")) return "Cripto";
  if (assetType.includes("Índice")) return "Índice";
  return "Ação";
}

function normalizeStatus(status?: string): Asset["status"] {
  const value = (status || "").toUpperCase();
  if (value.includes("APROVADO") || value.includes("CONFIRMADA") || value.includes("POSICAO")) {
    return "APROVADO";
  }
  if (value.includes("MONITOR")) return "MONITORAR";
  return "AGUARDAR";
}

function normalizeTrend(raw?: string, change = 0): Asset["trend"] {
  const value = (raw || "").toUpperCase();
  if (value.includes("BULL") || value.includes("ALTA")) return "ALTA";
  if (value.includes("BEAR") || value.includes("BAIXA")) return "BAIXA";
  if (change > 0.35) return "ALTA";
  if (change < -0.35) return "BAIXA";
  return "LATERAL";
}

function normalizeRisk(raw?: string): Asset["risk"] {
  const value = (raw || "").toLowerCase();
  if (value.includes("high") || value.includes("alto")) return "Alto";
  if (value.includes("medium") || value.includes("médio") || value.includes("medio"))
    return "Médio";
  return "Baixo";
}

export function mapQuantAssetToScannerAsset(item: QuantWatchAsset): Asset {
  const symbol = item.symbol || "N/A";
  const change = Number(item.variation ?? 0);
  const score = Math.max(0, Math.min(100, Number(item.score ?? item.confidence_score ?? 0)));
  const trend = normalizeTrend(item.market_regime, change);
  const direction =
    item.direction === "LONG" || item.direction === "SHORT" ? item.direction : "NEUTRO";
  return {
    symbol,
    name: symbol,
    type: normalizeType(item.asset_type),
    price: Number(item.price ?? 0),
    change,
    score,
    status: normalizeStatus(item.status),
    direction,
    trend,
    rsi: Number(item.confidence_score ?? score),
    volume: Number(item.market_flow_score ?? 1),
    risk: normalizeRisk(item.risk_level),
    atr: Number(item.matrix_score ?? 0) / 20,
    spark: seededSpark(symbol, change >= 0 ? 0.45 : -0.45),
  };
}

function scoreToRiskLevel(score: number, risk?: string): RiskLevel {
  if ((risk || "").toLowerCase().includes("alto")) return "high";
  if (score >= 85) return "low";
  if (score >= 70) return "medium";
  return "high";
}

function scoreToAction(signal: QuantSignal): RecommendedAction {
  const status = (signal.status || "").toUpperCase();
  if (status.includes("STOP") || status.includes("SAIDA")) return "exit";
  if (status.includes("APROVADO") || status.includes("CONFIRMADA") || status.includes("POSICAO")) {
    return "enter";
  }
  if ((signal.blockers || []).length) return "avoid";
  return "wait";
}

export function mapQuantSignalToDecision(signal: QuantSignal) {
  const payload = signal.payload || {};
  const score = Math.round(Number(payload.confidence_score ?? signal.score ?? 0));
  const reasons = Array.isArray(signal.reasons) ? signal.reasons : [];
  const blockers = Array.isArray(signal.blockers) ? signal.blockers : [];
  const decision: DecisionEnvelope = {
    confidence_score: score,
    risk_level: scoreToRiskLevel(score, String(payload.risk_level || "")),
    rationale: reasons[0] || blockers[0] || "Setup em acompanhamento estatístico.",
    recommended_action: scoreToAction(signal),
    disclaimer: "Análise informativa. Não é garantia de lucro.",
  };

  return {
    asset: signal.symbol,
    signal: signal.status || signal.direction || "MONITORANDO",
    decision,
  };
}

export function flattenQuantNews(payload: QuantNewsPayload) {
  const headlines = payload.news?.headlines || [];
  return headlines.map((headline) =>
    mapHeadline(payload.selected_symbol || payload.news?.symbol || "MERCADO", headline),
  );
}

function mapHeadline(symbol: string, headline: QuantNewsHeadline) {
  const sentimentValue =
    typeof headline.sentiment === "number"
      ? headline.sentiment
      : String(headline.sentiment || "")
            .toLowerCase()
            .includes("bear")
        ? -1
        : String(headline.sentiment || "")
              .toLowerCase()
              .includes("bull")
          ? 1
          : 0;

  return {
    time: headline.published_at
      ? new Date(headline.published_at).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--",
    source: headline.source || "ApexQuant",
    title: headline.title || "Headline indisponível",
    sentiment: sentimentValue > 0 ? "bull" : sentimentValue < 0 ? "bear" : "neutral",
    tickers: headline.tickers?.length ? headline.tickers : [symbol],
  };
}

export function summarizeOpportunityBoard(board?: QuantOpportunityBoard | null) {
  const ranked = board?.ranked || [];
  const topPriority = board?.top_priority || [];
  const watchOnly = board?.watch_only || [];
  return {
    ranked,
    topPriority,
    watchOnly,
    primary: topPriority[0] ?? ranked[0] ?? watchOnly[0] ?? null,
  };
}

export function latestBacktestRun(runs: QuantBacktestRun[]) {
  return runs[0] || null;
}

export function latestBacktestMetrics(run: QuantBacktestRun | null) {
  const result = (run?.results?.[0] || {}) as Record<string, unknown>;
  const payload = (result.payload as Record<string, unknown> | undefined) || result;
  const equity = Array.isArray(payload.equity_curve) ? payload.equity_curve.map(Number) : [];
  return {
    name: run?.name || "Backtest ApexQuant",
    strategy: run?.strategy || "Sem estratégia",
    period: run?.period || "N/D",
    symbol: String(payload.symbol || "N/D"),
    roi: Number(payload.roi_simulated ?? 0),
    winRate: Number(payload.win_rate ?? 0),
    drawdown: Number(payload.max_drawdown ?? 0),
    trades: Number(payload.total_trades ?? 0),
    equityCurve: equity,
  };
}

export function summarizeQuantStatus(
  operation: QuantOperationPayload | null,
  health: Record<string, unknown> | null,
  metrics: Record<string, unknown> | null = null,
) {
  const summary = (operation?.summary || operation?.metrics || metrics || {}) as Record<
    string,
    unknown
  >;
  const operationMetrics = (operation?.metrics || metrics || {}) as Record<string, unknown>;
  const scheduler = (operation?.scheduler || {}) as Record<string, unknown>;
  const botRunning = Boolean(
    health?.bot_running ?? scheduler.bot_running ?? operationMetrics.bot_running ?? false,
  );
  const confidenceScore = Number(
    operationMetrics.confidence_score ?? summary.confidence_score ?? 0,
  );
  const confidenceLabel = String(
    operationMetrics.confidence_label ?? summary.confidence_label ?? "monitorando",
  );
  return [
    {
      label: "Ativos analisados",
      value: String(operation?.watchlist?.length || 0),
      detail: `bot ${botRunning ? "ativo" : "monitorando"}`,
    },
    {
      label: "Setups aprovados",
      value: String(summary.approved_now ?? 0),
      detail: `${summary.telegram_alerts ?? 0} alertas`,
    },
    {
      label: "Posições paper",
      value: String(summary.open_positions ?? operation?.open_positions?.length ?? 0),
      detail: `resultado R ${summary.result_r ?? 0}`,
    },
    {
      label: "Score médio IA",
      value: String(confidenceScore),
      detail: confidenceLabel,
    },
  ];
}
