import { Activity } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-neon)" }}>
            <Activity className="w-5 h-5 text-background" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-none">QUANTUM<span className="gradient-text">.AI</span></div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">trading intelligence</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {["Dashboard", "Scanner", "Sinais IA", "Notícias", "Backtest", "Estratégias"].map((n) => (
            <a key={n} href="#" className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">{n}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border">
            <span className="live-dot" />
            <span className="text-xs font-mono">MERCADO ABERTO</span>
          </div>
          <button className="px-4 py-2 rounded-lg font-medium text-sm text-primary-foreground glow" style={{ background: "var(--gradient-neon)" }}>
            Operar
          </button>
        </div>
      </div>
    </header>
  );
}
