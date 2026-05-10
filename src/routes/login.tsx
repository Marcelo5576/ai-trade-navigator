import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageShell } from "@/components/trading/PageShell";
import { fetchJson } from "@/lib/client-api";
import { useApiResource } from "@/hooks/use-api-resource";
import type { SessionResponse } from "@/types/saas";
import { getPublicAppConfig } from "@/lib/app-config";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — AI Trade Navigator" },
      {
        name: "description",
        content: "Acesso seguro ao painel SaaS e à área administrativa.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const appConfig = getPublicAppConfig();
  const { data } = useApiResource<SessionResponse>("/api/auth/session", {
    ok: true,
    session: null,
    app: appConfig,
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await fetchJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const redirectUrl =
        new URLSearchParams(window.location.search).get("redirect") || "/dashboard";
      window.location.href = redirectUrl;
    } catch (reason) {
      const message =
        reason && typeof reason === "object" && "message" in reason
          ? String((reason as { message: unknown }).message)
          : "Não foi possível autenticar.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      eyebrow="Acesso"
      title={
        <>
          Entre no <span className="gradient-text">painel SaaS</span>
        </>
      }
      description="Login seguro para planos, billing mock e administração. Se nada estiver configurado no ambiente, o app continua navegável em modo público."
    >
      <section className="max-w-[1100px] mx-auto px-6 py-10 grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="card-elevated rounded-2xl p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Sessão atual
          </div>
          {data.session ? (
            <div className="space-y-3">
              <div className="text-2xl font-display font-bold">{data.session.name}</div>
              <div className="text-sm text-muted-foreground">{data.session.email}</div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-secondary/50 border border-border text-xs font-mono">
                  plano {data.session.plan.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary/50 border border-border text-xs font-mono">
                  perfil {data.session.role.toUpperCase()}
                </span>
              </div>
              <div className="pt-4">
                <a
                  href="/dashboard"
                  className="inline-flex px-4 py-2 rounded-lg font-medium text-sm text-primary-foreground glow"
                  style={{ background: "var(--gradient-neon)" }}
                >
                  Ir para o dashboard
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 outline-none focus:border-primary"
                  placeholder="voce@empresa.com"
                  required
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 outline-none focus:border-primary"
                  placeholder="Sua senha"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl px-4 py-3 font-semibold text-primary-foreground glow disabled:opacity-70"
                style={{ background: "var(--gradient-neon)" }}
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          )}
        </div>

        <div className="card-elevated rounded-2xl p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Segurança e operação
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              O {appConfig.appName} mantém rotas públicas existentes, mas protege a área admin e os
              endpoints sensíveis com sessão e verificação de plano.
            </p>
            <div className="grid gap-3">
              {[
                "Headers seguros sem quebrar assets",
                "Billing mock controlado por variável",
                "Planos Free, Pro, Elite e Admin",
                "Fallback quando auth ou cobrança não estiverem configurados",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-border bg-secondary/30 px-4 py-3"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border bg-secondary/20 px-4 py-3 text-xs">
              Análise informativa. Não é garantia de lucro.
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
