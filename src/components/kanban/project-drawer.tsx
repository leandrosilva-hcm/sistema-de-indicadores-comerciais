"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getProjectDetails,
  createInteractionWithReaction,
  createClientContact,
} from "@/app/actions/projects";
import { FilterUser, KANBAN_STAGES } from "@/types/kanban";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  X,
  Building2,
  Calendar,
  DollarSign,
  User,
  Phone,
  Video,
  Users,
  Clock,
  Send,
  Plus,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Mail,
  UserCheck,
  CalendarCheck2,
  Sparkles,
} from "lucide-react";

interface ProjectDrawerProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
  users: FilterUser[];
  onProjectUpdated?: () => void;
}

export function ProjectDrawer({
  projectId,
  isOpen,
  onClose,
  users,
  onProjectUpdated,
}: ProjectDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formulário de Nova Interação
  const [channel, setChannel] = useState<string>("reuniao_online");
  const [authorId, setAuthorId] = useState<string>("");
  const [contactId, setContactId] = useState<string>("");
  const [summary, setSummary] = useState<string>("");

  // Formulário de Próxima Ação (RN01)
  const [nextActionTitle, setNextActionTitle] = useState<string>("");
  const [nextActionDueDate, setNextActionDueDate] = useState<string>("");
  const [nextActionAssignedTo, setNextActionAssignedTo] = useState<string>("");

  // Formulário de Novo Contato
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactDepartment, setNewContactDepartment] = useState("");
  const [newContactRole, setNewContactRole] = useState("");

  const [isPending, startTransition] = useTransition();

  // Carrega os detalhes completos do projeto
  const loadProject = async (id: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getProjectDetails(id);
      if (res.success && res.project) {
        setProjectData(res.project);
        setAuthorId(res.project.ownerId);
        setNextActionAssignedTo(res.project.ownerId);
      } else {
        setErrorMsg(res.error || "Erro ao carregar projeto.");
      }
    } catch (err) {
      setErrorMsg("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && isOpen) {
      loadProject(projectId);
      // Reset form states
      setSummary("");
      setNextActionTitle("");
      setNextActionDueDate("");
      setShowAddContact(false);
    } else {
      setProjectData(null);
    }
  }, [projectId, isOpen]);

  // Submissão da nova interação com reação obrigatória (RN01)
  const handleSubmitInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    if (!summary.trim()) {
      alert("Por favor, descreva o relato da tratativa realizada.");
      return;
    }

    if (!nextActionTitle.trim() || !nextActionDueDate) {
      alert(
        "RN01 - Ação e Reação: É estritamente obrigatório preencher a data de retorno e a descrição da próxima ação."
      );
      return;
    }

    startTransition(async () => {
      const res = await createInteractionWithReaction({
        projectId,
        authorId: authorId || projectData.ownerId,
        contactId: contactId || null,
        channel,
        summary,
        nextActionTitle,
        nextActionDueDate,
        nextActionAssignedTo: nextActionAssignedTo || authorId || projectData.ownerId,
      });

      if (res.success) {
        // Limpa o formulário
        setSummary("");
        setNextActionTitle("");
        setNextActionDueDate("");
        // Recarrega os dados do drawer
        await loadProject(projectId);
        onProjectUpdated?.();
      } else {
        alert(res.error || "Erro ao registrar tratativa.");
      }
    });
  };

  // Submissão de novo contato
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !newContactName.trim()) return;

    startTransition(async () => {
      const res = await createClientContact({
        projectId,
        name: newContactName,
        email: newContactEmail,
        phone: newContactPhone,
        department: newContactDepartment,
        decisionRole: newContactRole,
      });

      if (res.success) {
        setNewContactName("");
        setNewContactEmail("");
        setNewContactPhone("");
        setNewContactDepartment("");
        setNewContactRole("");
        setShowAddContact(false);
        await loadProject(projectId);
        onProjectUpdated?.();
      } else {
        alert(res.error || "Erro ao salvar contato.");
      }
    });
  };

  if (!isOpen) return null;

  const currentStage = KANBAN_STAGES.find((s) => s.id === projectData?.stage);
  const lastInteraction = projectData?.interactions?.[0];

  const formatCurrency = (val: number | null) => {
    if (!val) return "Não informado";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getChannelBadge = (ch: string) => {
    switch (ch) {
      case "reuniao_presencial":
        return (
          <Badge className="bg-[#dc911b] text-black border-[#c47d12] font-semibold gap-1">
            <Users className="size-3" /> Reunião Presencial
          </Badge>
        );
      case "reuniao_online":
        return (
          <Badge className="bg-slate-900 text-white border-slate-700 gap-1">
            <Video className="size-3" /> Reunião Online
          </Badge>
        );
      case "ligacao":
        return (
          <Badge className="bg-[#dc911b]/15 text-[#9a600a] dark:text-[#f3b558] border-[#dc911b]/30 gap-1 font-medium">
            <Phone className="size-3" /> Ligação Telefônica
          </Badge>
        );
      default:
        return <Badge variant="outline">{ch}</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-background border-l border-border shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="border-b border-border p-5 bg-card/60 backdrop-blur-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Building2 className="size-3.5 text-primary/70" />
                    {projectData?.companyName || "Carregando..."}
                  </span>
                  {projectData?.segment && (
                    <Badge variant="outline" className="text-[10px]">
                      {projectData.segment.name}
                    </Badge>
                  )}
                  {currentStage && (
                    <Badge
                      className={`${currentStage.badgeColor} border text-[11px] font-medium`}
                    >
                      {currentStage.shortTitle}
                    </Badge>
                  )}
                </div>
                <h2 className="text-lg font-bold text-foreground leading-snug line-clamp-2">
                  {projectData?.projectName || "Detalhes do Projeto"}
                </h2>
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="size-5" />
              </Button>
            </div>

            {/* Quick Metadata Bar */}
            {projectData && (
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/50 text-xs">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px]">Valor Estimado:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <DollarSign className="size-3 text-emerald-600" />
                    {formatCurrency(projectData.estimatedValue)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px]">Responsável:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <User className="size-3 text-primary" />
                    {projectData.owner.name}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px]">Previsão Edital/Carta:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="size-3 text-amber-600" />
                    {projectData.bidInvitationForecast
                      ? new Intl.DateTimeFormat("pt-BR").format(
                          new Date(projectData.bidInvitationForecast)
                        )
                      : "A definir"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-28 bg-muted rounded-xl" />
                <div className="h-44 bg-muted rounded-xl" />
                <div className="h-60 bg-muted rounded-xl" />
              </div>
            ) : errorMsg ? (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                <AlertCircle className="size-5" />
                <p>{errorMsg}</p>
              </div>
            ) : projectData ? (
              <>
                {/* 1. SEÇÃO DE DECISORES E STAKEHOLDERS (RF02) */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="size-4 text-primary" />
                      <h3 className="text-sm font-semibold">
                        Decisores & Stakeholders Mapeados ({projectData.contacts.length})
                      </h3>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setShowAddContact(!showAddContact)}
                      className="gap-1 text-xs"
                    >
                      <Plus className="size-3" />
                      {showAddContact ? "Cancelar" : "Novo Contato"}
                    </Button>
                  </div>

                  {/* Formulário Novo Contato */}
                  {showAddContact && (
                    <form
                      onSubmit={handleCreateContact}
                      className="p-3 bg-muted/40 rounded-lg border border-border/80 space-y-3 text-xs"
                    >
                      <p className="font-semibold text-foreground">
                        Cadastrar Novo Decisor no Projeto
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground font-medium">
                            Nome Completo *
                          </label>
                          <Input
                            required
                            placeholder="Ex: Roberto Meirelles"
                            value={newContactName}
                            onChange={(e) => setNewContactName(e.target.value)}
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-medium">
                            Papel na Decisão
                          </label>
                          <Input
                            placeholder="Ex: Decisor Técnico / Comprador"
                            value={newContactRole}
                            onChange={(e) => setNewContactRole(e.target.value)}
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-medium">
                            E-mail Corporativo
                          </label>
                          <Input
                            type="email"
                            placeholder="email@empresa.com"
                            value={newContactEmail}
                            onChange={(e) => setNewContactEmail(e.target.value)}
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-medium">
                            Telefone / WhatsApp
                          </label>
                          <Input
                            placeholder="(11) 99999-9999"
                            value={newContactPhone}
                            onChange={(e) => setNewContactPhone(e.target.value)}
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] text-muted-foreground font-medium">
                            Departamento / Setor
                          </label>
                          <Input
                            placeholder="Ex: Engenharia de Obras / Suprimentos"
                            value={newContactDepartment}
                            onChange={(e) => setNewContactDepartment(e.target.value)}
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => setShowAddContact(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" size="xs" disabled={isPending}>
                          Salvar Decisor
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Lista de Contatos */}
                  {projectData.contacts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {projectData.contacts.map((c: any) => (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-lg border border-border/70 bg-background flex flex-col gap-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground truncate">
                              {c.name}
                            </span>
                            {c.decisionRole && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0">
                                {c.decisionRole}
                              </Badge>
                            )}
                          </div>
                          {c.department && (
                            <span className="text-[11px] text-muted-foreground">
                              {c.department}
                            </span>
                          )}
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                            {c.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="size-2.5" />
                                {c.phone}
                              </span>
                            )}
                            {c.email && (
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="size-2.5" />
                                {c.email}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Nenhum decisor cadastrado ainda. Clique em "+ Novo Contato" acima.
                    </p>
                  )}
                </div>

                {/* 2. CARD DE DESTAQUE: ÚLTIMA TRATATIVA REALIZADA (RN02) - Acento Oficial HCM */}
                <Card className="border-l-4 border-l-[#dc911b] border-y border-r border-[#dc911b]/30 bg-[#dc911b]/5 shadow-xs">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="size-4 text-[#dc911b]" />
                        <CardTitle className="text-xs uppercase tracking-wider font-bold text-[#dc911b]">
                          Última Tratativa Realizada (RN02)
                        </CardTitle>
                      </div>
                      {lastInteraction && getChannelBadge(lastInteraction.channel)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-2">
                    {lastInteraction ? (
                      <>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {lastInteraction.summary}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#dc911b]/20 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium">
                            <User className="size-3 text-[#dc911b]" />
                            Registrado por:{" "}
                            <strong className="text-foreground">
                              {lastInteraction.author.name}
                            </strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDate(lastInteraction.interactionDate)}
                          </span>
                        </div>

                        {/* Próxima Ação Agendada vinculada */}
                        {lastInteraction.tasks?.[0] && (
                          <div className="mt-2 p-2.5 rounded-lg bg-background border border-[#dc911b]/30 flex items-start justify-between gap-2 text-xs">
                            <div className="flex items-start gap-1.5">
                              <CalendarCheck2 className="size-3.5 text-[#dc911b] shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-foreground text-xs block">
                                  Próxima Ação Agendada:
                                </span>
                                <span className="text-muted-foreground text-[11px]">
                                  {lastInteraction.tasks[0].title}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="shrink-0 text-[10px] bg-primary/10 border-primary/30"
                            >
                              Prazo:{" "}
                              {new Intl.DateTimeFormat("pt-BR").format(
                                new Date(lastInteraction.tasks[0].dueDate)
                              )}
                            </Badge>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Nenhuma tratativa registrada até o momento. Utilize o formulário abaixo para registrar a primeira interação.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* 3. FORMULÁRIO DE NOVA INTERAÇÃO COM REGRA RN01 */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-xs">
                  <div className="border-b border-border/80 pb-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Send className="size-4 text-primary" />
                      Registrar Nova Tratativa Comercial
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Relate o contato realizado com o cliente e obrigatoriamente agende o próximo passo (RN01).
                    </p>
                  </div>

                  {/* Alerta de Regra RN01 */}
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs">
                    <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <strong className="font-semibold block">
                        Regra RN01 — Princípio da Ação e Reação:
                      </strong>
                      <span>
                        Nenhum registro pode ser salvo sem o agendamento obrigatório de uma próxima ação futura com data de retorno.
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitInteraction} className="space-y-4">
                    {/* Canal, Responsável e Decisor */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground block mb-1">
                          Canal de Contato *
                        </label>
                        <select
                          value={channel}
                          onChange={(e) => setChannel(e.target.value)}
                          className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="ligacao">📞 Ligação Telefônica</option>
                          <option value="reuniao_online">💻 Reunião Online (Teams/Meet)</option>
                          <option value="reuniao_presencial">🤝 Reunião Presencial / Café</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground block mb-1">
                          Responsável Interno *
                        </label>
                        <select
                          value={authorId}
                          onChange={(e) => setAuthorId(e.target.value)}
                          className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                          Decisor Contatado
                        </label>
                        <select
                          value={contactId}
                          onChange={(e) => setContactId(e.target.value)}
                          className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Selecione o decisor...</option>
                          {projectData.contacts.map((c: any) => (
                            <option key={c.id} value={c.id}>
                              {c.name} {c.decisionRole ? `(${c.decisionRole})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Resumo da Tratativa */}
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Relato Descritivo da Tratativa *
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Descreva detalhadamente os pontos tratados, alinhamento técnico, objeções ou avanços comerciais..."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-[75px]"
                      />
                    </div>

                    {/* Motor Ação e Reação: Próxima Ação Obrigatória (RN01, RF04) */}
                    <div className="p-3.5 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                        <CalendarCheck2 className="size-4" />
                        <span>Próxima Ação Agendada (Gatilho Obrigatório — RN01)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-foreground block mb-1">
                            Data de Retorno / Follow-up *
                          </label>
                          <Input
                            type="date"
                            required
                            value={nextActionDueDate}
                            onChange={(e) => setNextActionDueDate(e.target.value)}
                            className="h-8 text-xs bg-background"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-foreground block mb-1">
                            Atribuir Ação Para *
                          </label>
                          <select
                            value={nextActionAssignedTo}
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
                            Objetivo e Descrição da Próxima Ação *
                          </label>
                          <Input
                            required
                            placeholder="Ex: Retornar para confirmar validação na Vendor List e agendar visita"
                            value={nextActionTitle}
                            onChange={(e) => setNextActionTitle(e.target.value)}
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botão de Envio com Validação Visual */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-muted-foreground">
                        {(!nextActionTitle || !nextActionDueDate) && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            Preencha data e objetivo da próxima ação para liberar
                          </span>
                        )}
                      </span>

                      <Button
                        type="submit"
                        disabled={
                          isPending ||
                          !summary.trim() ||
                          !nextActionTitle.trim() ||
                          !nextActionDueDate
                        }
                        className="gap-2 font-semibold text-xs h-9 px-4"
                      >
                        <Send className="size-3.5" />
                        {isPending ? "Salvando..." : "Registrar Tratativa & Reação"}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* 4. LINHA DO TEMPO CRONOLÓGICA (IMUTÁVEL - RN02) */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-xs">
                  <div className="border-b border-border/80 pb-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Clock className="size-4 text-primary" />
                      Histórico Completo de Interações ({projectData.interactions.length})
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Registros estritamente cumulativos e imutáveis preservando a rastreabilidade total (RN02).
                    </p>
                  </div>

                  {projectData.interactions.length > 0 ? (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                      {projectData.interactions.map((interaction: any, idx: number) => (
                        <div key={interaction.id} className="relative group">
                          {/* Timeline dot */}
                          <div
                            className={`absolute -left-6 top-1.5 size-4 rounded-full border-2 border-background flex items-center justify-center ${
                              idx === 0 ? "bg-primary ring-4 ring-primary/20" : "bg-muted-foreground/40"
                            }`}
                          />

                          <div className="rounded-lg border border-border/70 bg-background/80 p-3.5 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {getChannelBadge(interaction.channel)}
                                {interaction.contact && (
                                  <span className="text-xs text-foreground font-medium">
                                    c/ <strong>{interaction.contact.name}</strong>
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                {formatDate(interaction.interactionDate)}
                              </span>
                            </div>

                            <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                              {interaction.summary}
                            </p>

                            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1 font-medium">
                                <User className="size-3 text-primary/70" />
                                {interaction.author.name}
                              </span>

                              {/* Ação disparada */}
                              {interaction.tasks?.[0] && (
                                <span className="flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded text-foreground/80">
                                  <CalendarCheck2 className="size-3 text-primary" />
                                  Reação: {interaction.tasks[0].title} (
                                  {new Intl.DateTimeFormat("pt-BR").format(
                                    new Date(interaction.tasks[0].dueDate)
                                  )}
                                  )
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Nenhum histórico disponível.
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
