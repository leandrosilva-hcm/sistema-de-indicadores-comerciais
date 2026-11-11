"use client";

import { Droppable } from "@hello-pangea/dnd";
import { KANBAN_STAGES, KanbanProject } from "@/types/kanban";
import { KanbanCard } from "./kanban-card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen } from "lucide-react";

interface KanbanColumnProps {
  stage: (typeof KANBAN_STAGES)[number];
  projects: KanbanProject[];
  onCardClick?: (project: KanbanProject) => void;
}

export function KanbanColumn({
  stage,
  projects,
  onCardClick,
}: KanbanColumnProps) {
  const totalValue = projects.reduce(
    (acc, curr) => acc + (curr.estimatedValue || 0),
    0
  );

  const formatTotalValue = (val: number) => {
    if (val === 0) return "R$ 0";
    if (val >= 1_000_000) {
      return `R$ ${(val / 1_000_000).toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
      })}M`;
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex w-80 shrink-0 flex-col rounded-xl border border-border/80 bg-slate-100/70 dark:bg-zinc-900/50 shadow-xs h-fit min-h-[550px] transition-all duration-200">
      {/* Column Header */}
      <div
        className={`flex flex-col gap-1.5 border-b border-border/70 p-3.5 border-t-4 rounded-t-xl ${stage.color} bg-background/90 backdrop-blur-xs sticky top-0 z-10`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`size-2.5 rounded-full shrink-0 ${stage.dotColor}`} />
            <h3
              className="font-semibold text-sm text-foreground truncate"
              title={stage.title}
            >
              {stage.shortTitle}
            </h3>
          </div>
          <Badge
            variant="secondary"
            className="h-5 px-1.5 text-xs font-semibold tabular-nums shrink-0"
          >
            {projects.length}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
          <span className="truncate">{stage.description}</span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40 font-medium">
          <span className="text-muted-foreground text-[11px]">Total da etapa:</span>
          <span className="text-foreground font-semibold text-xs tabular-nums">
            {formatTotalValue(totalValue)}
          </span>
        </div>
      </div>

      {/* Droppable Card List */}
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-3 p-3 min-h-[460px] transition-colors duration-200 ${
              snapshot.isDraggingOver
                ? "bg-[#dc911b]/10 ring-2 ring-[#dc911b]/30 ring-inset rounded-b-xl"
                : ""
            }`}
          >
            {projects.map((project, index) => (
              <KanbanCard
                key={project.id}
                project={project}
                index={index}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}

            {projects.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-40 border border-dashed border-border/70 rounded-lg text-center p-4 text-muted-foreground/70">
                <FolderOpen className="size-6 mb-1.5 stroke-[1.5]" />
                <p className="text-xs font-medium">Nenhum projeto nesta etapa</p>
                <p className="text-[10px] mt-0.5">Arraste um card para mover</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

