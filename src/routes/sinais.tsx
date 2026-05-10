import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/trading/PageShell";
import { AI_SIGNALS, ASSETS } from "@/components/trading/mockData";
import { Sparkline } from "@/components/trading/Sparkline";
import { Sparkles, TrendingUp, AlertCircle, Target } from "lucide-react";

export const Route = createFileRoute("/sinais")({
  head: () => ({
    meta: [
      { title: "Sinais IA — Quantum.AI" },
      { name: "description", content: "Sinais quantitativos gerados por IA com confiança, contexto e gestão de risco." },
    ],
  }),
  component: Sinais,
});

const FEED = [
  { type: "Breakout", asset: "NVDA", conf: 94, note: "Rompimento de máxima de 20 dias com volume 2.1x", icon: TrendingUp },
  { type: "Reversão Bullish", asset: "PETR4", conf: 88, note: "Divergência altista no RSI e suporte testado 3x", icon: Sparkles },
  { type: "Acumulação", asset: "BTC", conf: 91, note: "Volume institucional crescente, OBV em alta", icon: Target },
  { type: "Distribuição", asset: "TSLA", conf: 76, note: "Topo duplo com volume decrescente", icon: AlertCircle },
  { type: "Pullback", asset: "ETH", conf: 84, note: "Recuo até EMA 21 em tendência primária de alta", icon: TrendingUp },
  { type: "Squeeze", asset: "MGLU3", conf: 81, note: "Bandas de Bollinger comprimidas há 12 candles", icon: Sparkles },
];

function Sinais() {
  return (
    <PageShell
      eyebrow="Sinais IA"
      title={<>Decisões guiadas por <span className="gradient-text">algoritmos</span></>}
      description="Modelos treinados em milhões de candles classificam setups e atribuem score de confiança."
    >
      <section className="max-w-[1400px] mx-auto px-6 py-8 grid lg:grid-cols-3 gap-4">
        {FEED.map(s => {
          const asset = ASSETS.find(a=>a.symbol===s.asset);
          const Icon = s.icon;
          return (
            <div key={s.type+s.asset} className="card-elevated rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background:"var(--gradient-neon)"}}>
                    <Icon className="w-4 h-4 text-background" />
                  </div>
                  <div>
                    <div className="font-bold">{s.type}</div>
                    <div className="text-xs text-muted-foreground">{s.asset}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Confiança</div>
                  <div className="font-mono font-bold" style={{color:"var(--neon)"}}>{s.conf}%</div>
                </div>
              </div>
              {asset && <Sparkline data={asset.spark} positive={asset.change>=0} />}
              <p className="text-sm text-muted-foreground mt-3">{s.note}</p>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 text-xs font-medium py-2 rounded-lg text-primary-foreground" style={{background:"var(--gradient-neon)"}}>Operar</button>
                <button className="flex-1 text-xs font-medium py-2 rounded-lg bg-secondary">Detalhes</button>
              </div>
            </div>
          );
        })}
      </section>

      <section className="max-w-[1400px] mx-auto px-6 pb-12">
        <div className="card-elevated rounded-2xl p-6">
          <h2 className="font-display text-2xl font-bold mb-4">Histórico recente</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AI_SIGNALS.map(s=>(
              <div key={s.label+s.asset} className="bg-secondary/40 rounded-xl p-4">
                <div className="text-xs text-muted-foreground">{s.time}</div>
                <div className="font-bold mt-1">{s.label}</div>
                <div className="text-sm font-mono">{s.asset}</div>
                <div className="text-xs mt-2" style={{color:"var(--neon)"}}>conf {s.confidence}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
