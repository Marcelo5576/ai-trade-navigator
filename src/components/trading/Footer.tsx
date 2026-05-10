import { getPublicAppConfig } from "@/lib/app-config";

export function Footer() {
  const appConfig = getPublicAppConfig();

  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-[1400px] mx-auto px-6 py-10 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-display font-bold text-lg mb-2">{appConfig.appName}</div>
          <p className="text-muted-foreground text-xs">
            Ferramenta estatística de inteligência de mercado. Não constitui recomendação
            financeira.
          </p>
        </div>
        {[
          { t: "Plataforma", l: ["Dashboard", "Scanner", "Sinais IA", "Backtest"] },
          { t: "SaaS", l: ["Planos", "Billing mock", "Health", "Admin"] },
          { t: "Empresa", l: ["Deploy checklist", "Observabilidade", "Contato", "Termos"] },
        ].map((c) => (
          <div key={c.t}>
            <div className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">
              {c.t}
            </div>
            <ul className="space-y-2">
              {c.l.map((i) => (
                <li key={i}>
                  <a href="#" className="hover:text-primary transition-colors">
                    {i}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground font-mono">
        © 2026 {appConfig.appName} · Ambiente {appConfig.environment} · {appConfig.appDomain}
      </div>
    </footer>
  );
}
