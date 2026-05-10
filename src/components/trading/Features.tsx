import { LineChart, Layers, Search, Radio, FlaskConical, Network, ShieldCheck, Workflow } from "lucide-react";

const FEATURES = [
  { i: LineChart, t: "Heatmap multi-timeframe", d: "Visualize força relativa de centenas de ativos em segundos." },
  { i: Layers, t: "Matriz de correlação", d: "Diversifique posições evitando exposição duplicada." },
  { i: Search, t: "Padrões IA", d: "Detecção de figuras gráficas com visão computacional." },
  { i: Radio, t: "Sinais ao vivo", d: "Push em tempo real via Telegram, e-mail e webhook." },
  { i: FlaskConical, t: "Backtesting & Walk-forward", d: "Valide estratégias com dados de 10 anos." },
  { i: Network, t: "Replay de mercado", d: "Treine sua execução com candles históricos." },
  { i: ShieldCheck, t: "Gestão de risco", d: "Position sizing automático por volatilidade." },
  { i: Workflow, t: "Execução conectada", d: "Brokers integrados via FIX, REST e sandbox." },
];

export function Features() {
  return (
    <section className="max-w-[1400px] mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="font-display text-4xl font-bold mb-3">
          Tudo que o operador <span className="gradient-text">moderno</span> precisa
        </h2>
        <p className="text-muted-foreground">
          Da análise quantitativa à execução, em uma plataforma desenhada para quem opera com dados.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f) => {
          const Icon = f.i;
          return (
            <div key={f.t} className="card-elevated rounded-2xl p-6 hover:border-primary/40 hover:-translate-y-1 transition-all group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:glow transition-all" style={{ background: "var(--gradient-neon)" }}>
                <Icon className="w-5 h-5 text-background" strokeWidth={2.2} />
              </div>
              <h3 className="font-display font-bold text-lg mb-1">{f.t}</h3>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
