"use client";

import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/kanban": {
    title: "Quadro Kanban",
    description: "Gerencie o pipeline de oportunidades comerciais",
  },
  "/timeline": {
    title: "Linha do Tempo",
    description: "Histórico completo de interações com clientes",
  },
  "/agenda": {
    title: "Agenda Semanal",
    description: "Planejado vs. Executado — controle de atividades",
  },
  "/dashboard": {
    title: "Dashboard Gerencial",
    description: "Indicadores de desempenho comercial",
  },
};

export function Header() {
  const pathname = usePathname();
  const page = pageTitles[pathname ?? ""] ?? {
    title: "Sistema de Indicadores Comerciais",
    description: "Painel de gestão de prospecção",
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-lg font-semibold leading-tight">{page.title}</h1>
          <p className="text-xs text-muted-foreground">{page.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          v1.0
        </Badge>
      </div>
    </header>
  );
}

