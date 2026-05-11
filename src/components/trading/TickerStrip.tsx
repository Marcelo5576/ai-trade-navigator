import { useApiResource } from "@/hooks/use-api-resource";
import { mapQuantAssetToScannerAsset } from "@/lib/quant-adapters";
import type { QuantBridgeEnvelope, QuantOperationPayload } from "@/types/quant";
import { ASSETS } from "./mockData";

export function TickerStrip() {
  const { data } = useApiResource<QuantBridgeEnvelope<QuantOperationPayload>>(
    "/api/quant/operation?symbol=BTCUSDT",
    {
      ok: false,
      source: "fallback",
      upstream: "",
      warning: null,
      timestamp: "",
      data: null,
    },
    { refreshMs: 30000 },
  );

  const items = [
    ...(data.data?.watchlist?.slice(0, 8).map(mapQuantAssetToScannerAsset) || ASSETS),
    ...(data.data?.watchlist?.slice(0, 8).map(mapQuantAssetToScannerAsset) || ASSETS),
  ];
  return (
    <div className="border-y border-border bg-card/40 overflow-hidden">
      <div className="ticker-strip flex gap-8 py-3 whitespace-nowrap w-max">
        {items.map((a, i) => (
          <div key={i} className="flex items-center gap-2 font-mono text-sm">
            <span className="font-bold">{a.symbol}</span>
            <span className="text-muted-foreground">
              $
              {a.price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className={a.change >= 0 ? "text-bull" : "text-bear"}>
              {a.change >= 0 ? "▲" : "▼"} {Math.abs(a.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
