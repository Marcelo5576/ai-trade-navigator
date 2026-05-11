import { getServerRuntimeConfig, type ServerEnvSource } from "./env";
import { logError, logInfo } from "./logger";

export type QuantBridgeEnvelope<T> = {
  ok: boolean;
  source: "quant" | "fallback" | "disabled";
  upstream: string;
  warning: string | null;
  timestamp: string;
  data: T | null;
};

type JsonRecord = Record<string, unknown>;

type CacheEntry = {
  expiresAt: number;
  payload: QuantBridgeEnvelope<unknown>;
};

const quantCache = new Map<string, CacheEntry>();

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function parseMaybeJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function parseMaybeJsonRecord(value: unknown): JsonRecord {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonRecord;
  }

  if (typeof value !== "string" || !value.trim()) return {};

  try {
    const parsed = JSON.parse(value) as unknown;
    return asRecord(parsed);
  } catch {
    return {};
  }
}

function compactSignal(signal: unknown) {
  const item = asRecord(signal);
  const payload =
    asRecord(item.payload).symbol || asRecord(item.payload).confidence_score
      ? asRecord(item.payload)
      : parseMaybeJsonRecord(item.payload_json);

  return {
    id: asNumber(item.id),
    symbol: asString(item.symbol, "N/D"),
    direction: asString(item.direction, asString(payload.direction, "NEUTRO")),
    score: asNumber(item.score, asNumber(payload.confidence_score, 0)),
    price: asNumber(item.price, asNumber(payload.price, 0)),
    status: asString(item.status, asString(item.decision, "MONITORANDO")),
    timeframe: asString(item.timeframe, asString(payload.timeframe, "1h")),
    target_1r: asNumber(item.target_1r, asNumber(payload.target_1r, 0)),
    target_2r: asNumber(item.target_2r, asNumber(payload.target_2r, 0)),
    stop_loss: asNumber(
      item.stop_loss ?? item.stop,
      asNumber(payload.stop_loss ?? payload.stop, 0),
    ),
    reasons: parseMaybeJsonArray(item.reasons),
    blockers: parseMaybeJsonArray(item.blockers),
    payload: {
      confidence_score: asNumber(payload.confidence_score, 0),
      confidence_label: asString(payload.confidence_label, ""),
      risk_level: asString(payload.risk_level, ""),
      recommended_action: asString(payload.recommended_action, ""),
      market_flow_score: asNumber(payload.market_flow_score, 0),
      matrix_score: asNumber(payload.matrix_score, 0),
      data_mode: asString(payload.data_mode, ""),
      provider: asString(payload.provider, ""),
    },
  };
}

function compactOperationPayload(payload: unknown) {
  const source = asRecord(payload);
  const watchlist = asArray(source.watchlist)
    .slice(0, 24)
    .map((item) => {
      const asset = asRecord(item);
      return {
        symbol: asString(asset.symbol, "N/D"),
        asset_type: asString(asset.asset_type, ""),
        provider: asString(asset.provider, ""),
        price: asNumber(asset.price, 0),
        variation: asNumber(asset.variation, 0),
        score: asNumber(asset.score, 0),
        status: asString(asset.status, "MONITORANDO"),
        direction: asString(asset.direction, "NEUTRO"),
        market_regime: asString(asset.market_regime, ""),
        confidence_score: asNumber(asset.confidence_score, 0),
        confidence_label: asString(asset.confidence_label, ""),
        risk_level: asString(asset.risk_level, ""),
        market_flow_score: asNumber(asset.market_flow_score, 0),
        matrix_score: asNumber(asset.matrix_score, 0),
        matrix_decision: asString(asset.matrix_decision, ""),
        pattern_score: asNumber(asset.pattern_score, 0),
        dominant_pattern: asString(asset.dominant_pattern, ""),
        top_priority: Boolean(asset.top_priority),
      };
    });

  return {
    product: asString(source.product, "ApexQuant Bridge"),
    selected_symbol: asString(source.selected_symbol, "BTCUSDT"),
    ticker: asRecord(source.ticker),
    watchlist,
    open_positions: asArray(source.open_positions)
      .slice(0, 12)
      .map((position) => {
        const item = asRecord(position);
        return {
          symbol: asString(item.symbol, "N/D"),
          direction: asString(item.direction, "NEUTRO"),
          quantity: asNumber(item.quantity, 1),
          entry_price: asNumber(item.entry_price, 0),
          current_price: asNumber(item.current_price, 0),
          result_r: asNumber(item.result_r, 0),
          status: asString(item.status, "OPEN"),
          stop_loss: asNumber(item.stop_loss, 0),
          target_1r: asNumber(item.target_1r, 0),
          target_2r: asNumber(item.target_2r, 0),
        };
      }),
    signals: asArray(source.signals).slice(0, 20).map(compactSignal),
    telegram_logs: asArray(source.telegram_logs)
      .slice(0, 12)
      .map((log) => {
        const item = asRecord(log);
        return {
          event_type: asString(item.event_type, ""),
          symbol: asString(item.symbol, ""),
          status: asString(item.status, ""),
          message: asString(item.message, ""),
          created_at: asString(item.created_at, ""),
        };
      }),
    bot_timeline: asArray(source.bot_timeline)
      .slice(0, 16)
      .map((event) => {
        const item = asRecord(event);
        return {
          time: asString(item.time, "--:--"),
          text: asString(item.text, ""),
        };
      }),
    metrics: asRecord(source.metrics),
    summary: asRecord(source.summary),
    last_alert: asRecord(source.last_alert),
    provider_health: asRecord(source.provider_health),
    telegram: asRecord(source.telegram),
    scheduler: asRecord(source.scheduler),
    portfolio: asRecord(source.portfolio),
    top_opportunities: asArray(source.top_opportunities).slice(0, 6).map(asRecord),
    safety: asRecord(source.safety),
  };
}

function compactNewsPayload(payload: unknown) {
  const source = asRecord(payload);
  const news = asRecord(source.news);
  return {
    status: asString(source.status, "warning"),
    selected_symbol: asString(source.selected_symbol, asString(news.symbol, "MERCADO")),
    news: {
      symbol: asString(news.symbol, "MERCADO"),
      provider: asString(news.provider, "fallback"),
      real_data: Boolean(news.real_data),
      headlines: asArray(news.headlines)
        .slice(0, 12)
        .map((headline) => {
          const item = asRecord(headline);
          return {
            title: asString(item.title, "Headline indisponível"),
            source: asString(item.source, "ApexQuant"),
            sentiment:
              typeof item.sentiment === "number" ? item.sentiment : asString(item.sentiment, ""),
            published_at: asString(item.published_at, ""),
            tickers: asArray(item.tickers)
              .filter((ticker): ticker is string => typeof ticker === "string")
              .slice(0, 5),
          };
        }),
      impact: asRecord(news.impact),
      macro: asRecord(news.macro),
    },
    events: asArray(source.events).slice(0, 8).map(asRecord),
    snapshots: asArray(source.snapshots).slice(0, 10).map(asRecord),
    blocks: asArray(source.blocks).slice(0, 10).map(asRecord),
  };
}

function compactOpportunityBoard(payload: unknown) {
  const source = asRecord(payload);
  const compactList = (value: unknown) =>
    asArray(value)
      .slice(0, 12)
      .map((item) => {
        const row = asRecord(item);
        return {
          symbol: asString(row.symbol, "N/D"),
          direction: asString(row.direction, "NEUTRO"),
          ranking: asNumber(row.ranking, 0),
          confidence_score: asNumber(row.confidence_score, 0),
          trade_score: asNumber(row.trade_score, 0),
          rr_ratio: asNumber(row.rr_ratio, 0),
          regime: asString(row.regime, ""),
          timeframe: asString(row.timeframe, ""),
          status: asString(row.status, ""),
          reasons: parseMaybeJsonArray(row.reasons),
          blockers: parseMaybeJsonArray(row.blockers),
        };
      });

  return {
    ranked: compactList(source.ranked),
    top_priority: compactList(source.top_priority),
    good_setup: compactList(source.good_setup),
    watch_only: compactList(source.watch_only),
    ignored: compactList(source.ignored),
  };
}

function compactBacktests(payload: unknown) {
  return asArray(payload)
    .slice(0, 10)
    .map((run) => {
      const item = asRecord(run);
      return {
        id: asNumber(item.id),
        name: asString(item.name, "Backtest"),
        period: asString(item.period, ""),
        strategy: asString(item.strategy, ""),
        created_at: asString(item.created_at, ""),
        results: asArray(item.results)
          .slice(0, 4)
          .map((result) => {
            const entry = asRecord(result);
            return {
              ...entry,
              payload: asRecord(entry.payload),
            };
          }),
      };
    });
}

function compactLogs(payload: unknown) {
  const source = asRecord(payload);
  return {
    telegram_logs: asArray(source.telegram_logs).slice(0, 20).map(asRecord),
    signals: asArray(source.signals).slice(0, 20).map(compactSignal),
    positions: asArray(source.positions).slice(0, 20).map(asRecord),
    bot_cycles: asArray(source.bot_cycles).slice(0, 20).map(asRecord),
    provider_logs: asArray(source.provider_logs).slice(0, 20).map(asRecord),
    errors: asArray(source.errors).slice(0, 20).map(asRecord),
  };
}

function buildUpstreamUrl(env: ServerEnvSource, path: string) {
  const { quantApiBaseUrl } = getServerRuntimeConfig(env);
  return `${quantApiBaseUrl.replace(/\/$/, "")}${path}`;
}

async function fetchQuantJson<T>(
  env: ServerEnvSource,
  path: string,
  init?: RequestInit,
  options?: {
    cacheTtlMs?: number;
    projector?: (body: unknown) => T;
  },
): Promise<QuantBridgeEnvelope<T>> {
  const config = getServerRuntimeConfig(env);
  const upstream = buildUpstreamUrl(env, path);
  const timestamp = new Date().toISOString();
  const cacheKey = `${init?.method || "GET"}:${upstream}`;
  const cacheTtlMs = Math.max(0, options?.cacheTtlMs ?? 0);

  if (!config.quantBridgeEnabled) {
    return {
      ok: false,
      source: "disabled",
      upstream,
      warning: "Quant bridge desativado por feature flag.",
      timestamp,
      data: null,
    };
  }

  if (cacheTtlMs > 0) {
    const cached = quantCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.payload as QuantBridgeEnvelope<T>;
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(1000, config.quantApiTimeoutMs));

  try {
    const response = await fetch(upstream, {
      ...init,
      headers: {
        accept: "application/json",
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    });

    const body = (await response.json()) as unknown;
    if (!response.ok) {
      throw new Error(`upstream ${response.status}`);
    }

    const projected = options?.projector ? options.projector(body) : (body as T);

    const envelope: QuantBridgeEnvelope<T> = {
      ok: true,
      source: "quant",
      upstream,
      warning: null,
      timestamp,
      data: projected,
    };

    if (cacheTtlMs > 0) {
      quantCache.set(cacheKey, {
        expiresAt: Date.now() + cacheTtlMs,
        payload: envelope,
      });
    }

    return envelope;
  } catch (error) {
    const warning = error instanceof Error ? error.message : "Falha ao consultar o ApexQuant.";
    logError("quant bridge request failed", { upstream, warning, method: init?.method ?? "GET" });
    return {
      ok: false,
      source: "fallback",
      upstream,
      warning,
      timestamp,
      data: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function getQuantPublicUrls(env: ServerEnvSource) {
  const config = getServerRuntimeConfig(env);
  return {
    apiBaseUrl: config.quantApiBaseUrl,
    godUrl: config.quantGodUrl,
    operationUrl: `${config.quantApiBaseUrl.replace(/\/$/, "")}/operacao`,
  };
}

export async function getQuantHealth(env: ServerEnvSource) {
  return fetchQuantJson<JsonRecord>(env, "/health", undefined, { cacheTtlMs: 5_000 });
}

export async function getQuantOperationState(env: ServerEnvSource, symbol = "BTCUSDT") {
  const query = encodeURIComponent(symbol || "BTCUSDT");
  return fetchQuantJson<JsonRecord>(env, `/api/operation/state?symbol=${query}`, undefined, {
    cacheTtlMs: 10_000,
    projector: compactOperationPayload,
  });
}

export async function getQuantSignals(env: ServerEnvSource) {
  const operation = await getQuantOperationState(env, "BTCUSDT");
  return {
    ok: operation.ok,
    source: operation.source,
    upstream: `${buildUpstreamUrl(env, "/api/operation/state")}?symbol=BTCUSDT`,
    warning: operation.warning,
    timestamp: operation.timestamp,
    data: {
      signals: asArray(asRecord(operation.data).signals).slice(0, 20).map(compactSignal),
    },
  };
}

export async function getQuantNews(env: ServerEnvSource) {
  return fetchQuantJson<JsonRecord>(env, "/api/news-impact", undefined, {
    cacheTtlMs: 60_000,
    projector: compactNewsPayload,
  });
}

export async function getQuantOpportunities(env: ServerEnvSource) {
  return fetchQuantJson<JsonRecord>(env, "/api/opportunities", undefined, {
    cacheTtlMs: 30_000,
    projector: compactOpportunityBoard,
  });
}

export async function getQuantBacktests(env: ServerEnvSource) {
  return fetchQuantJson<JsonRecord>(env, "/api/backtests", undefined, {
    cacheTtlMs: 60_000,
    projector: compactBacktests,
  });
}

export async function getQuantMetrics(env: ServerEnvSource) {
  return fetchQuantJson<JsonRecord>(env, "/api/metrics", undefined, {
    cacheTtlMs: 30_000,
    projector: (payload) => {
      const source = asRecord(payload);
      return {
        summary: asRecord(source.summary),
        safety: asRecord(source.safety),
        bot: asRecord(source.bot),
        providers: asRecord(source.providers),
      };
    },
  });
}

export async function getQuantLogs(env: ServerEnvSource) {
  return fetchQuantJson<JsonRecord>(env, "/api/logs", undefined, {
    cacheTtlMs: 15_000,
    projector: compactLogs,
  });
}

export async function runQuantScanner(env: ServerEnvSource) {
  logInfo("quant scanner trigger requested", {});
  return fetchQuantJson<JsonRecord>(env, "/api/scanner/run-once", {
    method: "POST",
  });
}

export async function sendQuantTelegramTest(env: ServerEnvSource) {
  logInfo("quant telegram test requested", {});
  return fetchQuantJson<JsonRecord>(env, "/api/telegram/test", {
    method: "POST",
  });
}

export async function getQuantStatusSnapshot(env: ServerEnvSource, symbol = "BTCUSDT") {
  const [health, operation] = await Promise.all([
    getQuantHealth(env),
    getQuantOperationState(env, symbol),
  ]);

  return {
    ok: health.ok || operation.ok,
    source:
      health.source === "quant" || operation.source === "quant"
        ? "quant"
        : health.source === "disabled" && operation.source === "disabled"
          ? "disabled"
          : "fallback",
    upstream: `${buildUpstreamUrl(env, "/health")} | ${buildUpstreamUrl(
      env,
      `/api/operation/state?symbol=${encodeURIComponent(symbol)}`,
    )}`,
    warning: [health.warning, operation.warning].filter(Boolean).join(" | ") || null,
    timestamp: new Date().toISOString(),
    data: {
      urls: getQuantPublicUrls(env),
      health,
      operation,
    },
  };
}
