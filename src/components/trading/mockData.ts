export type Asset = {
  symbol: string;
  name: string;
  type: "Ação" | "ETF" | "Cripto" | "Índice";
  price: number;
  change: number;
  score: number;
  status: "APROVADO" | "AGUARDAR" | "MONITORAR";
  direction: "LONG" | "SHORT" | "NEUTRO";
  trend: "ALTA" | "BAIXA" | "LATERAL";
  rsi: number;
  volume: number;
  risk: "Baixo" | "Médio" | "Alto";
  atr: number;
  spark: number[];
};

const spark = (seed: number, trend: number) =>
  Array.from({ length: 24 }, (_, i) => {
    const n = Math.sin(seed + i * 0.7) * 8 + Math.cos(seed * 0.3 + i) * 4;
    return 50 + n + i * trend;
  });

export const ASSETS: Asset[] = [
  { symbol: "PETR4", name: "Petrobras", type: "Ação", price: 38.42, change: 2.14, score: 92, status: "APROVADO", direction: "LONG", trend: "ALTA", rsi: 64.3, volume: 1.42, risk: "Baixo", atr: 1.18, spark: spark(1, 0.6) },
  { symbol: "VALE3", name: "Vale", type: "Ação", price: 67.85, change: -0.92, score: 78, status: "MONITORAR", direction: "NEUTRO", trend: "LATERAL", rsi: 52.1, volume: 0.94, risk: "Médio", atr: 1.65, spark: spark(2, 0.1) },
  { symbol: "BTC", name: "Bitcoin", type: "Cripto", price: 98432.5, change: 3.78, score: 95, status: "APROVADO", direction: "LONG", trend: "ALTA", rsi: 71.2, volume: 1.88, risk: "Médio", atr: 2.41, spark: spark(3, 0.9) },
  { symbol: "ETH", name: "Ethereum", type: "Cripto", price: 3784.21, change: 1.92, score: 87, status: "APROVADO", direction: "LONG", trend: "ALTA", rsi: 66.8, volume: 1.55, risk: "Médio", atr: 2.12, spark: spark(4, 0.7) },
  { symbol: "AAPL", name: "Apple", type: "Ação", price: 234.18, change: 0.75, score: 82, status: "MONITORAR", direction: "NEUTRO", trend: "ALTA", rsi: 58.4, volume: 0.85, risk: "Baixo", atr: 1.26, spark: spark(5, 0.4) },
  { symbol: "TSLA", name: "Tesla", type: "Ação", price: 412.84, change: -1.91, score: 64, status: "AGUARDAR", direction: "SHORT", trend: "BAIXA", rsi: 32.7, volume: 1.61, risk: "Alto", atr: 3.18, spark: spark(6, -0.8) },
  { symbol: "NVDA", name: "NVIDIA", type: "Ação", price: 138.92, change: 4.21, score: 96, status: "APROVADO", direction: "LONG", trend: "ALTA", rsi: 74.5, volume: 2.14, risk: "Médio", atr: 2.62, spark: spark(7, 1.1) },
  { symbol: "IBOV", name: "Ibovespa", type: "Índice", price: 132845, change: 0.42, score: 71, status: "MONITORAR", direction: "NEUTRO", trend: "LATERAL", rsi: 49.8, volume: 1.02, risk: "Baixo", atr: 0.92, spark: spark(8, 0.2) },
  { symbol: "SOL", name: "Solana", type: "Cripto", price: 218.45, change: -2.34, score: 58, status: "AGUARDAR", direction: "SHORT", trend: "BAIXA", rsi: 28.4, volume: 1.78, risk: "Alto", atr: 4.12, spark: spark(9, -0.6) },
  { symbol: "MGLU3", name: "Magazine Luiza", type: "Ação", price: 8.94, change: 5.67, score: 89, status: "APROVADO", direction: "LONG", trend: "ALTA", rsi: 68.2, volume: 2.84, risk: "Alto", atr: 3.85, spark: spark(10, 1.4) },
];

export const NEWS = [
  { time: "14:32", source: "Bloomberg", title: "Fed sinaliza corte de juros em dezembro após dados de inflação", sentiment: "bull", tickers: ["SPY", "QQQ"] },
  { time: "13:48", source: "Reuters", title: "Petrobras anuncia dividendos extraordinários de R$ 8,2 bi", sentiment: "bull", tickers: ["PETR4"] },
  { time: "12:15", source: "CoinDesk", title: "Bitcoin rompe US$ 98k com fluxo recorde em ETFs spot", sentiment: "bull", tickers: ["BTC"] },
  { time: "11:02", source: "Valor", title: "Vale revisa guidance de produção de minério para 2026", sentiment: "neutral", tickers: ["VALE3"] },
  { time: "09:45", source: "WSJ", title: "Tesla enfrenta investigação da NHTSA sobre piloto automático", sentiment: "bear", tickers: ["TSLA"] },
] as const;

export const AI_SIGNALS = [
  { label: "Setup Breakout", asset: "NVDA", confidence: 94, time: "agora" },
  { label: "Reversão Bullish", asset: "PETR4", confidence: 88, time: "2min" },
  { label: "Acumulação", asset: "BTC", confidence: 91, time: "5min" },
  { label: "Distribuição", asset: "TSLA", confidence: 76, time: "8min" },
];
