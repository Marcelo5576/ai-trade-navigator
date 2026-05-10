import { Brain, Zap, TrendingUp, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="max-w-[1400px] mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 border border-border mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono uppercase tracking-wider">v2.0 · Powered by GPT-5 + Gemini 3</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.95] mb-6">
            Inteligência<br />
            <span className="gradient-text">quantitativa</span><br />
            em tempo real
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mb-8">
            Central completa para o operador moderno: scanner de setups, sinais de IA, notícias com sentimento, backtesting e execução — tudo em uma só tela.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-3 rounded-xl font-semibold text-primary-foreground glow" style={{ background: "var(--gradient-neon)" }}>
              Abrir Dashboard
            </button>
            <button className="px-6 py-3 rounded-xl font-semibold border border-border bg-secondary/60 hover:bg-secondary">
              Ver demo ao vivo
            </button>
          </div>
          <div className="flex gap-8 mt-10 pt-8 border-t border-border">
            {[
              { v: "12k+", l: "Operadores ativos" },
              { v: "94%", l: "Precisão IA" },
              { v: "<50ms", l: "Latência" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-2xl font-bold gradient-text">{s.v}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 via-accent/10 to-transparent blur-3xl" />
          <div className="relative card-elevated rounded-2xl p-6 gradient-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <span className="font-display font-semibold">Cérebro IA</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">analisando 2.847 ativos</span>
            </div>
            <div className="space-y-3">
              {[
                { i: Zap, t: "Breakout detectado em NVDA", s: "94%", c: "var(--bull)" },
                { i: TrendingUp, t: "Reversão bullish em PETR4", s: "88%", c: "var(--bull)" },
                { i: Brain, t: "Acumulação em BTC > $98k", s: "91%", c: "var(--neon)" },
                { i: Zap, t: "Distribuição em TSLA", s: "76%", c: "var(--bear)" },
              ].map((sig, i) => {
                const Icon = sig.i;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in oklab, ${sig.c} 15%, transparent)` }}>
                      <Icon className="w-4 h-4" style={{ color: sig.c }} />
                    </div>
                    <div className="flex-1 text-sm">{sig.t}</div>
                    <div className="font-mono text-sm font-bold" style={{ color: sig.c }}>{sig.s}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
