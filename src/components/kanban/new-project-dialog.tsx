"use client";

import { useState, useTransition } from "react";
import { createProject } from "@/app/actions/projects";
import { FilterUser, FilterSegment, KANBAN_STAGES } from "@/types/kanban";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Building2, Briefcase, DollarSign, Calendar, User, Sparkles } from "lucide-react";

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  users: FilterUser[];
  segments: FilterSegment[];
  onProjectCreated?: () => void;
}

export function NewProjectDialog({
  isOpen,
  onClose,
  users,
  segments,
  onProjectCreated,
}: NewProjectDialogProps) {
  const [companyName, setCompanyName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [ownerId, setOwnerId] = useState(users[0]?.id || "");
  const [stage, setStage] = useState("mapeamento_inicial");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [bidInvitationForecast, setBidInvitationForecast] = useState("");

  // Decisor Inicial (Opcional)
  const [initialContactName, setInitialContactName] = useState("");
  const [initialContactRole, setInitialContactRole] = useState("");
  const [initialContactPhone, setInitialContactPhone] = useState("");
  const [initialContactEmail, setInitialContactEmail] = useState("");

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !projectName.trim()) {
      alert("Por favor, preencha o nome da empresa e o nome do projeto.");
      return;
    }

    startTransition(async () => {
      const res = await createProject({
        companyName,
        projectName,
        segmentId: segmentId || null,
        ownerId: ownerId || users[0]?.id,
        stage,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        bidInvitationForecast: bidInvitationForecast || null,
        initialContactName: initialContactName || null,
        initialContactRole: initialContactRole || null,
        initialContactPhone: initialContactPhone || null,
        initialContactEmail: initialContactEmail || null,
      });

      if (res.success) {
        // Reset form
        setCompanyName("");
        setProjectName("");
        setEstimatedValue("");
        setBidInvitationForecast("");
        setInitialContactName("");
        setInitialContactRole("");
        setInitialContactPhone("");
        setInitialContactEmail("");
        onClose();
        onProjectCreated?.();
      } else {
        alert(res.error || "Erro ao cadastrar projeto.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <DialogTitle className="text-base font-bold text-foreground">
              Cadastrar Nova Oportunidade / Obra
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Cadastre a empresa e a obra específica para alimentar o pipeline comercial.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Empresa & Nome da Obra */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Empresa Contratante *
              </label>
              <Input
                required
                placeholder="Ex: Cargill Agrícola S.A."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Nome do Projeto / Obra *
              </label>
              <Input
                required
                placeholder="Ex: Expansão Planta Uberlândia"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>

          {/* Segmento, Responsável e Estágio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Segmento de Mercado
              </label>
              <select
                value={segmentId}
                onChange={(e) => setSegmentId(e.target.value)}
                className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione...</option>
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Responsável Comercial *
              </label>
              <select
                required
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Estágio Inicial
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {KANBAN_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shortTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Valor Estimado & Previsão de Carta Convite */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Valor Estimado da Obra (R$)
              </label>
              <Input
                type="number"
                placeholder="Ex: 45000000"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Previsão de Carta Convite (Edital)
              </label>
              <Input
                type="date"
                value={bidInvitationForecast}
                onChange={(e) => setBidInvitationForecast(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>

          {/* Decisor Inicial (Opcional - RF02) */}
          <div className="p-3 bg-muted/30 rounded-lg border border-border/70 space-y-2.5">
            <span className="text-xs font-semibold text-foreground block">
              Primeiro Decisor Mapeado (Opcional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <Input
                placeholder="Nome do Decisor (ex: Eng. Carlos)"
                value={initialContactName}
                onChange={(e) => setInitialContactName(e.target.value)}
                className="h-8 text-xs bg-background"
              />
              <Input
                placeholder="Papel (ex: Decisor Técnico)"
                value={initialContactRole}
                onChange={(e) => setInitialContactRole(e.target.value)}
                className="h-8 text-xs bg-background"
              />
              <Input
                placeholder="Telefone / WhatsApp"
                value={initialContactPhone}
                onChange={(e) => setInitialContactPhone(e.target.value)}
                className="h-8 text-xs bg-background"
              />
              <Input
                type="email"
                placeholder="E-mail Corporativo"
                value={initialContactEmail}
                onChange={(e) => setInitialContactEmail(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="gap-1.5 text-xs font-semibold">
              <Plus className="size-3.5" />
              {isPending ? "Cadastrando..." : "Cadastrar Projeto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

