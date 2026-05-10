import { Activity } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { fetchJson } from "@/lib/client-api";
import { getPublicAppConfig } from "@/lib/app-config";
import { useApiResource } from "@/hooks/use-api-resource";
import type { SessionResponse } from "@/types/saas";

const NAV = [
  { label: "Dashboard", to: "/dashboard" as const },
  { label: "Scanner", to: "/scanner" as const },
  { label: "Sinais IA", to: "/sinais" as const },
  { label: "Notícias", to: "/noticias" as const },
  { label: "Backtest", to: "/backtest" as const },
  { label: "Estratégias", to: "/estrategias" as const },
];

export function Header() {
  const appConfig = getPublicAppConfig();
  const { data } = useApiResource<SessionResponse>("/api/auth/session", {
    ok: true,
    session: null,
    app: appConfig,
  });

  const session = data.session;

  async function handleLogout() {
    await fetchJson("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--gradient-neon)" }}
          >
            <Activity className="w-5 h-5 text-background" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-none">{appConfig.appName}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              saas trading intelligence
            </div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              activeProps={{ className: "px-3 py-2 rounded-lg text-foreground bg-secondary" }}
            >
              {n.label}
            </Link>
          ))}
          {session?.role === "admin" ? (
            <Link
              to="/admin"
              className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              activeProps={{ className: "px-3 py-2 rounded-lg text-foreground bg-secondary" }}
            >
              Admin
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border">
            <span className="live-dot" />
            <span className="text-xs font-mono">MERCADO ABERTO</span>
          </div>
          {session ? (
            <>
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/40">
                <span className="text-xs font-mono">{session.plan.toUpperCase()}</span>
                <span className="text-xs text-muted-foreground">{session.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-medium text-sm border border-border bg-secondary/60 hover:bg-secondary transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg font-medium text-sm border border-border bg-secondary/60 hover:bg-secondary transition-colors"
            >
              Login
            </Link>
          )}
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg font-medium text-sm text-primary-foreground glow"
            style={{ background: "var(--gradient-neon)" }}
          >
            Operar
          </Link>
        </div>
      </div>
    </header>
  );
}
