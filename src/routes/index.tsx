import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/trading/Header";
import { TickerStrip } from "@/components/trading/TickerStrip";
import { Hero } from "@/components/trading/Hero";
import { Stats } from "@/components/trading/Stats";
import { Scanner } from "@/components/trading/Scanner";
import { NewsAndAI } from "@/components/trading/NewsAndAI";
import { Features } from "@/components/trading/Features";
import { Footer } from "@/components/trading/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quantum.AI — Inteligência quantitativa para traders" },
      { name: "description", content: "Central completa para o operador moderno: scanner de setups, sinais de IA, notícias com sentimento e backtesting em tempo real." },
      { property: "og:title", content: "Quantum.AI — Trading com IA" },
      { property: "og:description", content: "Scanner, sinais IA, notícias e backtest em uma só plataforma." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <TickerStrip />
      <Hero />
      <Stats />
      <Scanner />
      <NewsAndAI />
      <Features />
      <Footer />
    </div>
  );
}
