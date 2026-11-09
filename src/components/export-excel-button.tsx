"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2 } from "lucide-react";

interface ExportExcelButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "xs" | "lg";
  className?: string;
  label?: string;
}

export function ExportExcelButton({
  variant = "outline",
  size = "sm",
  className = "",
  label = "Exportar Dados (.xlsx)",
}: ExportExcelButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    try {
      setDownloading(true);
      const res = await fetch("/api/export-excel");
      if (!res.ok) throw new Error("Falha ao exportar planilha.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date().toISOString().split("T")[0];
      a.download = `painel_indicadores_comerciais_${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erro no download:", err);
      alert("Erro ao realizar o download da planilha Excel.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={downloading}
      className={`gap-1.5 font-medium cursor-pointer ${className}`}
      title="Exportar base completa para planilha Excel (.xlsx com 3 abas)"
    >
      {downloading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <FileSpreadsheet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
      )}
      <span>{downloading ? "Exportando..." : label}</span>
    </Button>
  );
}

