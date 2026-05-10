import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TickerStrip } from "./TickerStrip";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TickerStrip />
      <section className="border-b border-border bg-card/20">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{eyebrow}</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight max-w-3xl">{title}</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl">{description}</p>
        </div>
      </section>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
