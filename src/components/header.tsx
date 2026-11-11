"use client";

import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ExportExcelButton } from "@/components/export-excel-button";

const pageTitles: Record<string, { title: string }> = {
  "/kanban": {
    title: "Quadro Kanban",
  },
  "/timeline": {
    title: "Linha do Tempo",
  },
  "/agenda": {
    title: "Agenda Semanal",
  },
  "/dashboard": {
    title: "Dashboard Gerencial",
  },
  "/segmentos": {
    title: "Configurações Comerciais",
  },
};

export function Header() {
  const pathname = usePathname();
  const page = pageTitles[pathname ?? ""] ?? {
    title: "Sistema de Indicadores Comerciais",
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold leading-tight tracking-tight">{page.title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <ExportExcelButton />
      </div>
    </header>
  );
}
