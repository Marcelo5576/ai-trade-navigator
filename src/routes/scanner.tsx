import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/trading/PageShell";
import { Scanner } from "@/components/trading/Scanner";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Scanner — AI Trade Navigator" },
      {
        name: "description",
        content:
          "Filtre ativos por TradeScore, RSI, volume, volatilidade, setups técnicos e contexto SaaS.",
      },
    ],
  }),
  component: () => (
    <PageShell
      eyebrow="Scanner"
      title={
        <>
          Encontre setups em <span className="gradient-text">segundos</span>
        </>
      }
      description="Filtros multifator com indicadores clássicos e TradeScore proprietário em todos os mercados."
    >
      <Scanner />
    </PageShell>
  ),
});
