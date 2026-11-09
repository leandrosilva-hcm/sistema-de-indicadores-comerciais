"use client";

import { FilterUser, FilterSegment } from "@/types/kanban";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, RotateCcw, User, Layers, DollarSign } from "lucide-react";

interface KanbanFiltersProps {
  users: FilterUser[];
  segments: FilterSegment[];
  selectedUser: string;
  selectedSegment: string;
  searchQuery: string;
  onUserChange: (userId: string) => void;
  onSegmentChange: (segmentId: string) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  totalProjects: number;
  filteredCount: number;
  totalPipelineValue: number;
}

export function KanbanFilters({
  users,
  segments,
  selectedUser,
  selectedSegment,
  searchQuery,
  onUserChange,
  onSegmentChange,
  onSearchChange,
  onReset,
  totalProjects,
  filteredCount,
  totalPipelineValue,
}: KanbanFiltersProps) {
  const hasActiveFilters =
    Boolean(selectedUser) || Boolean(selectedSegment) || Boolean(searchQuery);

  const formatTotal = (val: number) => {
    if (val >= 1_000_000_000) {
      return `R$ ${(val / 1_000_000_000).toLocaleString("pt-BR", {
        maximumFractionDigits: 2,
      })}B`;
    }
    return `R$ ${(val / 1_000_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })}M`;
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left side: Controls */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar por projeto ou empresa..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-9 text-xs bg-background"
            />
          </div>

          {/* User Filter */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <select
                value={selectedUser}
                onChange={(e) => onUserChange(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                title="Filtrar por Consultor Comercial"
              >
                <option value="">Todos os Consultores</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Segment Filter */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <select
                value={selectedSegment}
                onChange={(e) => onSegmentChange(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                title="Filtrar por Segmento de Mercado"
              >
                <option value="">Todos os Segmentos</option>
                {segments.map((seg) => (
                  <option key={seg.id} value={seg.id}>
                    {seg.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Right side: Pipeline Totals */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/60">
            <Layers className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Projetos:</span>
            <span className="text-xs font-bold text-foreground">
              {filteredCount} {filteredCount !== totalProjects && `de ${totalProjects}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <DollarSign className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              Pipeline Total:
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
              {formatTotal(totalPipelineValue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

