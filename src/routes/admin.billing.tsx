import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/trading/PageShell";
import { useApiResource } from "@/hooks/use-api-resource";
import type { BillingStatusResponse, PlansResponse } from "@/types/saas";

export const Route = createFileRoute("/admin/billing")({
  head: () => ({
    meta: [
      { title: "Admin Billing — AI Trade Navigator" },
      { name: "description", content: "Status de billing e planos do SaaS." },
    ],
  }),
  component: AdminBillingPage,
});

function AdminBillingPage() {
  const { data: billing, loading: billingLoading } = useApiResource<BillingStatusResponse>(
    "/api/billing/status",
    {
      ok: true,
      provider: "mock",
      mock: true,
      subscription_status: "trial",
      current_plan: "free",
      plan_limits: {
        dailyUsage: 0,
        analysesPerDay: 0,
        aiCallsPerDay: 0,
      },
      usage_limits: {
        usage: {
          dailyUsage: 0,
          analysesPerDay: 0,
          aiCallsPerDay: 0,
        },
        limits: {
          dailyUsage: 0,
          analysesPerDay: 0,
          aiCallsPerDay: 0,
        },
        remaining: {
          dailyUsage: 0,
          analysesPerDay: 0,
          aiCallsPerDay: 0,
        },
      },
    },
  );
  const { data: plans } = useApiResource<PlansResponse>("/api/plans", {
    ok: true,
    plans: [],
  });

  return (
    <PageShell
      eyebrow="Admin / Billing"
      title={
        <>
          Estrutura de <span className="gradient-text">planos e cobrança</span>
        </>
      }
      description="Camada preparada para Stripe ou Mercado Pago, mantendo mock seguro enquanto não houver credenciais reais."
    >
      <section className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            ["Provider", billing.provider],
            ["Mock", billing.mock ? "ativo" : "desligado"],
            ["Plano atual", billing.current_plan],
            ["Status", billing.subscription_status],
          ].map(([label, value]) => (
            <div key={label} className="card-elevated rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="font-display text-2xl font-bold mt-2">
                {billingLoading ? "..." : value}
              </div>
            </div>
          ))}
        </div>

        <div className="card-elevated rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold mb-4">Planos disponíveis</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {plans.plans.map((plan) => (
              <div key={plan.id} className="rounded-xl border border-border bg-secondary/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{plan.label}</div>
                  <div className="text-xs font-mono uppercase">{plan.id}</div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
