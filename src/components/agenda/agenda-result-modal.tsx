"use client";

import { useState, useTransition } from "react";
import { recordTaskResultAndNextAction } from "@/app/actions/tasks";
import { getTodayDateString } from "@/lib/masks";
import { FilterUser } from "@/types/kanban";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CalendarCheck2,
  Send,
  Building2,
  Clock,
  Sparkles,
  AlertCircle,
  X,
} from "lucide-react";

interface AgendaResultModalProps {
  task: any | null;
  isOpen: boolean;
  onClose: () => void;
  users: FilterUser[];
  onTaskUpdated?: () => void;
}

export function AgendaResultModal({
  task,
  isOpen,
  onClose,
  users,
  onTaskUpdated,
}: AgendaResultModalProps) {
  const [channel, setChannel] = useState<string>("ligacao");
  const [summary, setSummary] = useState("");
  const [nextActionTitle, setNextActionTitle] = useState("");
  const [nextActionDueDate, setNextActionDueDate] = useState("");
  const [nextActionAssignedTo, setNextActionAssignedTo] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!summary.trim()) {
      alert("Por favor, descreva o resultado obtido na ação executada.");
      return;
    }

    if (!nextActionTitle.trim() || !nextActionDueDate) {
      alert(
        "RN01 - Ação e Reação: Toda ação concluída exige o agendamento da próxima ação."
      );
      return;
    }

    const todayStr = getTodayDateString();
    if (nextActionDueDate < todayStr) {
      alert("A data de retorno / follow-up não pode ser retroativa. Selecione a data de hoje ou uma data futura.");
      return;
    }

    startTransition(async () => {
      const res = await recordTaskResultAndNextAction({
        taskId: task.id,
        projectId: task.projectId,
        authorId: task.assignedTo,
        channel,
        summary,
        nextActionTitle,
        nextActionDueDate,
        nextActionAssignedTo: nextActionAssignedTo || task.assignedTo,
      });

      if (res.success) {
        setSummary("");
        setNextActionTitle("");
        setNextActionDueDate("");
        onClose();
        onTaskUpdated?.();
      } else {
        alert(res.error || "Erro ao registrar resultado da ação.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-emerald-600" />
            <DialogTitle className="text-base font-bold text-foreground">
              Registrar Resultado da Ação Concluída
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Esta ação foi marcada como executada. Registre o que foi alinhado com o cliente e defina o próximo passo (RN01).
          </DialogDescription>
        </DialogHeader>

        {/* Task Summary Card */}
        <div className="p-3 bg-muted/40 rounded-lg border border-border/70 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <CalendarCheck2 className="size-3.5 text-emerald-600" />
              {task.title}
            </span>
            <Badge variant="outline" className="text-[10px]">
              Prazo: {new Intl.DateTimeFormat("pt-BR").format(new Date(task.dueDate))}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
            <Building2 className="size-3" />
            <span>
              {task.project?.companyName} — {task.project?.projectName}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Channel & Author */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Canal Utilizado *
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="ligacao">📞 Ligação Telefônica</option>
                <option value="reuniao_online">💻 Reunião Online</option>
                <option value="reuniao_presencial">🤝 Reunião Presencial / Café</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Responsável pelo Registro
              </label>
              <select
                value={task.assignedTo}
                disabled
                className="w-full h-8 rounded-lg border border-input bg-muted/50 px-2.5 text-xs text-foreground cursor-not-allowed opacity-80"
              >
                <option value={task.assignedTo}>{task.assignedUser?.name}</option>
              </select>
            </div>
          </div>

          {/* Summary of What Was Done */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Resultado / Relato do Contato *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Descreva o retorno do decisor, se a reunião foi proveitosa, quais foram os próximos passos solicitados..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-[70px]"
            />
          </div>

          {/* RN01: Mandatory Next Reaction */}
          <div className="p-3.5 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <CalendarCheck2 className="size-4" />
              <span>Próxima Ação Obrigatória (Ação e Reação — RN01)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1">
                  Data de Retorno / Follow-up *
                </label>
                <Input
                  type="date"
                  required
                  min={getTodayDateString()}
                  value={nextActionDueDate}
                  onChange={(e) => setNextActionDueDate(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1">
                  Atribuir Próxima Ação Para
                </label>
                <select
                  value={nextActionAssignedTo || task.assignedTo}
                  onChange={(e) => setNextActionAssignedTo(e.target.value)}
                  className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-full">
                <label className="text-[11px] font-semibold text-foreground block mb-1">
                  Objetivo / Descrição da Próxima Ação *
                </label>
                <Input
                  required
                  placeholder="Ex: Cobrar retorno da análise jurídica da homologação"
                  value={nextActionTitle}
                  onChange={(e) => setNextActionTitle(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border/80">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Pular Registro Detalhado
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isPending || !summary.trim() || !nextActionTitle.trim() || !nextActionDueDate}
              className="gap-1.5 text-xs font-semibold"
            >
              <Send className="size-3.5" />
              {isPending ? "Gravando..." : "Salvar Tratativa & Agendar Reação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

