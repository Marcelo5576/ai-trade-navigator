import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/trading/PageShell";
import { useApiResource } from "@/hooks/use-api-resource";

export const Route = createFileRoute("/admin/system")({
  head: () => ({
    meta: [
      { title: "Admin System — AI Trade Navigator" },
      { name: "description", content: "Observabilidade e status do sistema." },
    ],
  }),
  component: AdminSystemPage,
});

function AdminSystemPage() {
  const { data, loading, error } = useApiResource("/api/admin/system-status", {
    ok: false,
  });

  return (
    <PageShell
      eyebrow="Admin / System"
      title={
        <>
          Observabilidade do <span className="gradient-text">sistema</span>
        </>
      }
      description="Status centralizado para uptime, environment, auth, billing e readiness operacional."
    >
      <section className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="card-elevated rounded-2xl p-6">
          {error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          <pre className="overflow-auto text-xs font-mono whitespace-pre-wrap text-muted-foreground">
            {loading ? "Carregando..." : JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </section>
    </PageShell>
  );
}
