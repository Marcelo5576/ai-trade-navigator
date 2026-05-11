export type QuantBridgeEnvelope<T> = {
  ok: boolean;
  source: "quant" | "fallback" | "disabled";
  upstream: string;
  warning: string | null;
  timestamp: string;
  data: T | null;
};

export type QuantWatchAsset = {
  symbol: string;
  asset_type?: string;
  provider?: string;
  price?: number;
  variation?: number;
  score?: number;
  status?: string;
  direction?: string;
  market_regime?: string;
  confidence_score?: number;
  confidence_label?: string;
  risk_level?: string;
  market_flow_score?: number;
  matrix_score?: number;
  matrix_decision?: string;
  pattern_score?: number;
  dominant_pattern?: string;
  top_priority?: boolean;
};

export type QuantSignal = {
  id: number;
  symbol: string;
  direction?: string;
  score?: number;
  price?: number;
  status?: string;
  timeframe?: string;
  target_1r?: number;
  target_2r?: number;
  stop_loss?: number;
  reasons?: string[];
  blockers?: string[];
  payload?: Record<string, unknown>;
};

export type QuantOperationPayload = {
  product?: string;
  selected_symbol?: string;
  watchlist?: QuantWatchAsset[];
  open_positions?: Array<Record<string, unknown>>;
  signals?: QuantSignal[];
  telegram_logs?: Array<Record<string, unknown>>;
  bot_timeline?: Array<{ time: string; text: string }>;
  metrics?: Record<string, unknown>;
  summary?: Record<string, unknown>;
  last_alert?: Record<string, unknown> | null;
  provider_health?: Record<string, unknown>;
  telegram?: Record<string, unknown>;
  scheduler?: Record<string, unknown>;
  portfolio?: Record<string, unknown>;
  top_opportunities?: Array<Record<string, unknown>>;
};

export type QuantNewsHeadline = {
  title?: string;
  source?: string;
  sentiment?: number | string;
  published_at?: string;
  tickers?: string[];
};

export type QuantNewsPayload = {
  status?: string;
  selected_symbol?: string;
  news?: {
    symbol?: string;
    provider?: string;
    real_data?: boolean;
    headlines?: QuantNewsHeadline[];
    impact?: Record<string, unknown>;
    macro?: Record<string, unknown>;
  };
  events?: Array<Record<string, unknown>>;
  snapshots?: Array<Record<string, unknown>>;
  blocks?: Array<Record<string, unknown>>;
};

export type QuantOpportunityBoard = {
  ranked?: Array<Record<string, unknown>>;
  top_priority?: Array<Record<string, unknown>>;
  good_setup?: Array<Record<string, unknown>>;
  watch_only?: Array<Record<string, unknown>>;
  ignored?: Array<Record<string, unknown>>;
};

export type QuantBacktestRun = {
  id: number;
  name?: string;
  period?: string;
  strategy?: string;
  created_at?: string;
  results?: Array<Record<string, unknown>>;
};
