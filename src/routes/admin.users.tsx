import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/trading/PageShell";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Admin Users — AI Trade Navigator" },
      { name: "description", content: "Usuários e perfis do SaaS." },
    ],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const users = [
    {
      name: "Admin Operator",
      email: "admin@example.com",
      role: "admin",
      plan: "admin",
      status: "demo",
    },
    {
      name: "Pro Analyst",
      email: "user@example.com",
      role: "member",
      plan: "pro",
      status: "demo",
    },
  ];

  return (
    <PageShell
      eyebrow="Admin / Users"
      title={
        <>
          Gestão inicial de <span className="gradient-text">usuários</span>
        </>
      }
      description="Como ainda não existe banco no projeto, esta tela mostra a estrutura compatível e os usuários demo configuráveis por ambiente."
    >
      <section className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="card-elevated rounded-2xl p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                {["Nome", "Email", "Role", "Plano", "Status"].map((header) => (
                  <th key={header} className="py-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email} className="border-b border-border/50">
                  <td className="py-3 font-medium">{user.name}</td>
                  <td className="py-3 font-mono">{user.email}</td>
                  <td className="py-3 uppercase">{user.role}</td>
                  <td className="py-3 uppercase">{user.plan}</td>
                  <td className="py-3">{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}
