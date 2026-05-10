import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/trading/PageShell";
import { Scanner } from "@/components/trading/Scanner";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Scanner — Quantum.AI" },
      { name: "description", content: "Filtre milhares de ativos por TradeScore, RSI, volume, volatilidade e setups técnicos." },
    ],
  }),
  component: () => (
    <PageShell
      eyebrow="Scanner"
      title={<>Encontre setups em <span className="gradient-text">segundos</span></>}
      description="Filtros multifator com indicadores clássicos e TradeScore proprietário em todos os mercados."
    >
      <Scanner />
    </PageShell>
  ),
});
