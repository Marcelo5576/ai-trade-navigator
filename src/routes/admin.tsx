import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/trading/PageShell";
import { useApiResource } from "@/hooks/use-api-resource";

type AdminSystemStatus = {
  ok: boolean;
  app: string;
  environment: string;
  version: string;
  uptime_seconds: number;
  db: { status: string; message: string };
  ai_provider: { status: string; message: string };
  payment: { provider: string; mock: boolean; subscription_status: string };
  auth: { demo_enabled: boolean; session_active: boolean };
};

const initialStatus: AdminSystemStatus = {
  ok: false,
  app: "AI Trade Navigator",
  environment: "development",
  version: "0.1.0",
  uptime_seconds: 0,
  db: { status: "loading", message: "Carregando" },
  ai_provider: { status: "loading", message: "Carregando" },
  payment: { provider: "mock", mock: true, subscription_status: "trial" },
  auth: { demo_enabled: false, session_active: false },
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — AI Trade Navigator" },
      { name: "description", content: "Área administrativa protegida do SaaS." },
    ],
  }),
  component: AdminHome,
});

function AdminHome() {
  const { data, loading, error } = useApiResource<AdminSystemStatus>(
    "/api/admin/system-status",
    initialStatus,
  );

  return (
    <PageShell
      eyebrow="Admin"
      title={
        <>
          Controle do <span className="gradient-text">SaaS em produção</span>
        </>
      }
      description="Painel reservado para operações administrativas, observabilidade, billing e gestão de usuários."
    >
      <section className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
        {error ? (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            ["Sistema", loading ? "..." : data.ok ? "online" : "offline"],
            ["Ambiente", loading ? "..." : data.environment],
            ["Versão", loading ? "..." : data.version],
            ["Uptime", loading ? "..." : `${data.uptime_seconds}s`],
          ].map(([label, value]) => (
            <div key={label} className="card-elevated rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="font-display text-2xl font-bold mt-2">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {[
            {
              title: "Usuários",
              href: "/admin/users",
              description: "Demo users, perfis e estrutura para onboarding futuro.",
            },
            {
              title: "Sistema",
              href: "/admin/system",
              description: "Health expandido, providers e status operacional.",
            },
            {
              title: "Billing",
              href: "/admin/billing",
              description: "Planos, limites, provider mock e readiness de cobrança.",
            },
          ].map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="card-elevated rounded-2xl p-5 hover:border-primary/40 transition-colors"
            >
              <div className="font-display text-xl font-bold">{card.title}</div>
              <p className="text-sm text-muted-foreground mt-2">{card.description}</p>
            </a>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
