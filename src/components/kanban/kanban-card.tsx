"use client";

import { Draggable } from "@hello-pangea/dnd";
import { KanbanProject } from "@/types/kanban";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  User,
  Calendar,
  DollarSign,
  Phone,
  Video,
  Users,
  Clock,
  Briefcase,
} from "lucide-react";

interface KanbanCardProps {
  project: KanbanProject;
  index: number;
  onClick?: (project: KanbanProject) => void;
}

export function KanbanCard({ project, index, onClick }: KanbanCardProps) {
  const lastInteraction = project.interactions?.[0];

  const formatCurrency = (val: number | null) => {
    if (!val) return "Não informado";
    if (val >= 1_000_000) {
      const millions = val / 1_000_000;
      return `R$ ${millions.toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
      })}M`;
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return null;
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const getChannelIcon = (channel?: string) => {
    switch (channel) {
      case "reuniao_presencial":
        return <Users className="size-3 text-emerald-600 dark:text-emerald-400" />;
      case "reuniao_online":
        return <Video className="size-3 text-blue-600 dark:text-blue-400" />;
      case "ligacao":
        return <Phone className="size-3 text-amber-600 dark:text-amber-400" />;
      default:
        return <Clock className="size-3 text-muted-foreground" />;
    }
  };

  const getChannelLabel = (channel?: string) => {
    switch (channel) {
      case "reuniao_presencial":
        return "Presencial";
      case "reuniao_online":
        return "Online";
      case "ligacao":
        return "Ligação";
      default:
        return "Contato";
    }
  };

  return (
    <Draggable draggableId={project.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick?.(project)}
          className="outline-none"
        >
          <Card
            className={`group cursor-grab active:cursor-grabbing border border-border/80 bg-card transition-all duration-200 select-none ${
              snapshot.isDragging
                ? "shadow-xl ring-2 ring-primary/40 rotate-1 scale-[1.02] bg-card/95"
                : "hover:shadow-md hover:border-primary/40"
            }`}
          >
            <CardContent className="p-3.5 space-y-3">
              {/* Top row: Empresa & Segmento */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate text-xs font-semibold text-muted-foreground tracking-tight">
                    {project.companyName}
                  </span>
                </div>
                {project.segment && (
                  <Badge
                    variant="outline"
                    className="shrink-0 text-[10px] px-1.5 py-0 font-medium bg-muted/50 border-border"
                  >
                    {project.segment.name}
                  </Badge>
                )}
              </div>

              {/* Project Name */}
              <div>
                <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {project.projectName}
                </h4>
              </div>

              {/* Key Metrics: Valor Estimado & Responsável */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-foreground truncate">
                    {formatCurrency(project.estimatedValue)}
                  </span>
                </div>

                <div className="flex items-center gap-1 justify-end text-muted-foreground">
                  <User className="size-3.5 shrink-0 text-primary/70" />
                  <span className="truncate max-w-[100px] font-medium text-foreground">
                    {project.owner.name.split(" ")[0]}
                  </span>
                </div>
              </div>

              {/* Bottom row: Última Interação / Previsão */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
                {lastInteraction ? (
                  <div
                    className="flex items-center gap-1.5 truncate"
                    title={lastInteraction.summary}
                  >
                    <span className="flex items-center gap-1 shrink-0">
                      {getChannelIcon(lastInteraction.channel)}
                      <span className="font-medium text-foreground/80">
                        {getChannelLabel(lastInteraction.channel)}:
                      </span>
                    </span>
                    <span className="truncate text-muted-foreground">
                      {formatDate(lastInteraction.interactionDate)}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground/70 italic flex items-center gap-1">
                    <Clock className="size-3 shrink-0" />
                    Sem interação
                  </span>
                )}

                {project.bidInvitationForecast && (
                  <span
                    className="shrink-0 flex items-center gap-1 text-[10px] text-muted-foreground/80 bg-muted/40 px-1.5 py-0.5 rounded"
                    title="Previsão de Carta Convite"
                  >
                    <Calendar className="size-2.5" />
                    {formatDate(project.bidInvitationForecast)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

