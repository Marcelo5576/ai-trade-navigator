import { Newspaper, Bot, Send } from "lucide-react";
import { NEWS } from "./mockData";

const sentimentColor = (s: string) =>
  s === "bull" ? "var(--bull)" : s === "bear" ? "var(--bear)" : "var(--muted-foreground)";

export function NewsAndAI() {
  return (
    <section className="max-w-[1400px] mx-auto px-6 py-12 grid lg:grid-cols-2 gap-6">
      <div className="card-elevated rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-xl">Notícias com IA</h3>
          </div>
          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
            <span className="live-dot" /> live feed
          </span>
        </div>
        <div className="space-y-3">
          {NEWS.map((n, i) => (
            <div key={i} className="p-4 rounded-xl bg-secondary/40 border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
                <span>{n.time}</span>
                <span>·</span>
                <span>{n.source}</span>
                <span className="ml-auto px-2 py-0.5 rounded-md uppercase font-bold" style={{ background: `color-mix(in oklab, ${sentimentColor(n.sentiment)} 15%, transparent)`, color: sentimentColor(n.sentiment) }}>
                  {n.sentiment === "bull" ? "↑ bullish" : n.sentiment === "bear" ? "↓ bearish" : "neutro"}
                </span>
              </div>
              <p className="text-sm leading-snug mb-2">{n.title}</p>
              <div className="flex gap-1.5">
                {n.tickers.map((t) => (
                  <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-background border border-border">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-elevated rounded-2xl p-6 flex flex-col gradient-border">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-xl">Assistente Quantum</h3>
          </div>
          <span className="text-xs font-mono text-muted-foreground">GPT-5 + Gemini 3</span>
        </div>
        <div className="flex-1 space-y-3 mb-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--gradient-neon)" }}>
              <Bot className="w-4 h-4 text-background" />
            </div>
            <div className="bg-secondary/60 rounded-2xl rounded-tl-sm p-3 text-sm">
              Olá! Sou seu copiloto de trading. Posso analisar ativos, fazer backtests, explicar setups ou resumir notícias. Por onde começamos?
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-sm p-3 text-sm max-w-xs">
              Analise PETR4 para day trade hoje
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--gradient-neon)" }}>
              <Bot className="w-4 h-4 text-background" />
            </div>
            <div className="bg-secondary/60 rounded-2xl rounded-tl-sm p-3 text-sm">
              <strong className="text-bull">PETR4 setup APROVADO (score 92).</strong> Rompimento de R$ 38,20 com volume 1,42x acima da média. RSI 64 saindo de zona neutra. <span className="font-mono">Stop R$ 37,80 · Alvo 1R R$ 38,80 · Alvo 2R R$ 39,40</span>. Catalisador: dividendos extraordinários divulgados às 13:48.
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-3 flex-wrap">
          {["Top 5 setups do dia", "Resumo macro", "Backtest VALE3", "Heatmap setor"].map((s) => (
            <button key={s} className="text-xs px-3 py-1.5 rounded-full bg-secondary/60 border border-border hover:border-primary/40 transition-colors">{s}</button>
          ))}
        </div>
        <div className="flex gap-2 p-2 rounded-xl bg-secondary/60 border border-border">
          <input
            placeholder="Pergunte algo sobre o mercado..."
            className="flex-1 bg-transparent outline-none text-sm px-2"
          />
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-background" style={{ background: "var(--gradient-neon)" }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
