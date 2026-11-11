"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createSegment,
  updateSegment,
  toggleSegmentActive,
} from "@/app/actions/segments";
import {
  createUser,
  updateUser,
  deleteUser,
} from "@/app/actions/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Power,
  Users,
  Mail,
  UserCheck,
  AlertTriangle,
  Briefcase,
} from "lucide-react";

export interface SegmentItem {
  id: string;
  name: string;
  active: boolean;
  _count: {
    projects: number;
  };
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  _count?: {
    ownedProjects: number;
    interactions?: number;
    assignedTasks?: number;
  };
}

interface SegmentsViewProps {
  initialSegments: SegmentItem[];
  initialUsers?: UserItem[];
}

const ROLE_LABELS: Record<string, { label: string; badgeClass: string }> = {
  comercial: {
    label: "Consultor Comercial",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200",
  },
  diretor: {
    label: "Diretor Comercial",
    badgeClass: "bg-[#dc911b]/15 text-[#9a6109] dark:text-[#f3ab3b] border-[#dc911b]/30 font-semibold",
  },
  operacoes: {
    label: "Operações / Engenharia",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200",
  },
};

export function SegmentsView({ initialSegments, initialUsers = [] }: SegmentsViewProps) {
  const router = useRouter();

  // Estado dos Segmentos
  const [segments, setSegments] = useState<SegmentItem[]>(initialSegments);

  // Sincroniza estado de segmentos
  useEffect(() => {
    setSegments(initialSegments);
  }, [initialSegments]);

  // Modal Novo / Editar Segmento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<SegmentItem | null>(null);
  const [segmentName, setSegmentName] = useState("");
  const [segmentActive, setSegmentActive] = useState(true);

  const [isPending, startTransition] = useTransition();

  // Estado dos Consultores / Usuários
  const [users, setUsers] = useState<UserItem[]>(initialUsers);

  // Sincroniza estado de usuários
  useEffect(() => {
    if (initialUsers) {
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  // Modal Novo / Editar Consultor
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("comercial");
  const [userFormError, setUserFormError] = useState<string | null>(null);

  const [isUserPending, startUserTransition] = useTransition();

  // Handlers para Segmentos
  const handleOpenCreate = () => {
    setEditingSegment(null);
    setSegmentName("");
    setSegmentActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (seg: SegmentItem) => {
    setEditingSegment(seg);
    setSegmentName(seg.name);
    setSegmentActive(seg.active);
    setIsModalOpen(true);
  };

  const handleToggle = (seg: SegmentItem) => {
    const nextActive = !seg.active;
    setSegments((prev) =>
      prev.map((s) => (s.id === seg.id ? { ...s, active: nextActive } : s))
    );

    startTransition(async () => {
      const res = await toggleSegmentActive(seg.id, nextActive);
      if (!res.success) {
        setSegments((prev) =>
          prev.map((s) => (s.id === seg.id ? { ...s, active: seg.active } : s))
        );
        alert(res.error || "Erro ao alterar status do segmento.");
      } else {
        router.refresh();
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!segmentName.trim()) return;

    startTransition(async () => {
      if (editingSegment) {
        const res = await updateSegment(editingSegment.id, segmentName, segmentActive);
        if (res.success && res.segment) {
          setSegments((prev) =>
            prev.map((s) =>
              s.id === editingSegment.id
                ? { ...s, name: res.segment.name, active: res.segment.active }
                : s
            )
          );
          setIsModalOpen(false);
          router.refresh();
        } else {
          alert(res.error || "Erro ao atualizar segmento.");
        }
      } else {
        const res = await createSegment(segmentName);
        if (res.success && res.segment) {
          const newSegment: SegmentItem = {
            id: res.segment.id,
            name: res.segment.name,
            active: res.segment.active,
            _count: { projects: 0 },
          };
          setSegments((prev) =>
            [...prev, newSegment].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
          );
          setIsModalOpen(false);
          router.refresh();
        } else {
          alert(res.error || "Erro ao criar segmento.");
        }
      }
    });
  };

  // Handlers para Consultores
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserName("");
    setUserEmail("");
    setUserRole("comercial");
    setUserFormError(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: UserItem) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserRole(user.role || "comercial");
    setUserFormError(null);
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);

    if (!userName.trim()) {
      setUserFormError("O nome do consultor é obrigatório.");
      return;
    }
    if (!userEmail.trim()) {
      setUserFormError("O e-mail institucional é obrigatório.");
      return;
    }

    startUserTransition(async () => {
      if (editingUser) {
        const res = await updateUser({
          id: editingUser.id,
          name: userName,
          email: userEmail,
          role: userRole,
        });

        if (res.success && res.user) {
          setUsers((prev) =>
            prev
              .map((u) =>
                u.id === editingUser.id
                  ? {
                      ...u,
                      name: res.user.name,
                      email: res.user.email,
                      role: res.user.role,
                    }
                  : u
              )
              .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
          );
          setIsUserModalOpen(false);
          router.refresh();
        } else {
          setUserFormError(res.error || "Erro ao atualizar dados do consultor.");
        }
      } else {
        const res = await createUser({
          name: userName,
          email: userEmail,
          role: userRole,
        });

        if (res.success && res.user) {
          const newUser: UserItem = {
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            role: res.user.role,
            _count: {
              ownedProjects: 0,
              interactions: 0,
              assignedTasks: 0,
            },
          };
          setUsers((prev) =>
            [...prev, newUser].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
          );
          setIsUserModalOpen(false);
          router.refresh();
        } else {
          setUserFormError(res.error || "Erro ao cadastrar novo consultor.");
        }
      }
    });
  };

  const handleDeleteUser = (user: UserItem) => {
    const projectCount = user._count?.ownedProjects || 0;
    if (projectCount > 0) {
      alert(
        `Não é possível excluir o consultor "${user.name}" pois ele possui ${projectCount} projeto(s) sob sua responsabilidade.\n\nPara excluir este cadastro, reatribua os projetos a outro membro da equipe no Quadro Kanban.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Deseja realmente remover o consultor "${user.name}" da equipe comercial?`
    );
    if (!confirmed) return;

    startUserTransition(async () => {
      const res = await deleteUser(user.id);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        router.refresh();
      } else {
        alert(res.error || "Erro ao remover consultor.");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* ======================================================== */}
      {/* SEÇÃO 1: SEGMENTOS DE MERCADO                           */}
      {/* ======================================================== */}
      <section className="space-y-4">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card shadow-xs">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              Parametrização de Segmentos de Mercado
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gerencie os nichos de atuação da engenharia civil e industrial para categorização dos projetos.
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="gap-1.5 font-semibold text-xs"
          >
            <Plus className="size-3.5" />
            Novo Segmento
          </Button>
        </div>

        {/* Segments Table */}
        <Card className="border border-border shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="min-w-[220px]">Segmento de Mercado</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
                <TableHead className="w-36 text-center">Projetos Vinculados</TableHead>
                <TableHead className="w-32 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                    Nenhum segmento cadastrado até o momento.
                  </TableCell>
                </TableRow>
              ) : (
                segments.map((seg) => (
                  <TableRow key={seg.id}>
                    <TableCell className="font-semibold text-xs text-foreground">
                      <div className="flex items-center gap-2">
                        <div
                          className={`size-2.5 rounded-full ${
                            seg.active ? "bg-emerald-500" : "bg-muted-foreground"
                          }`}
                        />
                        <span>{seg.name}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      {seg.active ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 text-[10px]">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[10px]">
                          Inativo
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-center text-xs text-muted-foreground font-medium tabular-nums">
                      {seg._count.projects} projeto(s)
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleToggle(seg)}
                          title={seg.active ? "Desativar segmento" : "Ativar segmento"}
                          className={seg.active ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"}
                        >
                          <Power className="size-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleOpenEdit(seg)}
                          title="Editar segmento"
                        >
                          <Edit2 className="size-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </section>

      {/* ======================================================== */}
      {/* SEÇÃO 2: EQUIPE COMERCIAL E CONSULTORES                  */}
      {/* ======================================================== */}
      <section className="space-y-4">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card shadow-xs">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="size-4 text-primary" />
              Equipe Comercial e Consultores
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cadastre e gerencie consultores, diretores e membros da equipe responsáveis pela prospecção de projetos.
            </p>
          </div>

          <Button
            onClick={handleOpenCreateUser}
            size="sm"
            className="gap-1.5 font-semibold text-xs"
          >
            <Plus className="size-3.5" />
            Novo Consultor
          </Button>
        </div>

        {/* Users Table */}
        <Card className="border border-border shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="min-w-[200px]">Nome do Consultor</TableHead>
                <TableHead className="min-w-[200px]">E-mail Corporativo</TableHead>
                <TableHead className="w-44 text-center">Função / Cargo</TableHead>
                <TableHead className="w-36 text-center">Projetos Atribuídos</TableHead>
                <TableHead className="w-28 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                    Nenhum consultor cadastrado no momento.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const roleConfig = ROLE_LABELS[user.role] || {
                    label: user.role,
                    badgeClass: "bg-muted text-foreground border-border",
                  };
                  const initials = user.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0].toUpperCase())
                    .join("");

                  return (
                    <TableRow key={user.id}>
                      {/* Nome + Avatar Inicial */}
                      <TableCell className="font-semibold text-xs text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                            {initials || "U"}
                          </div>
                          <span className="truncate">{user.name}</span>
                        </div>
                      </TableCell>

                      {/* E-mail */}
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </TableCell>

                      {/* Função / Papel */}
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 border ${roleConfig.badgeClass}`}
                        >
                          {roleConfig.label}
                        </Badge>
                      </TableCell>

                      {/* Projetos Atribuídos */}
                      <TableCell className="text-center text-xs text-muted-foreground font-medium tabular-nums">
                        {user._count?.ownedProjects ?? 0} projeto(s)
                      </TableCell>

                      {/* Ações */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleOpenEditUser(user)}
                            title="Editar dados do consultor"
                          >
                            <Edit2 className="size-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDeleteUser(user)}
                            title="Remover consultor"
                            className="text-muted-foreground hover:text-red-600"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </section>

      {/* ======================================================== */}
      {/* MODAL CRIAR / EDITAR SEGMENTO                            */}
      {/* ======================================================== */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold text-foreground">
              {editingSegment ? "Editar Segmento de Mercado" : "Novo Segmento de Mercado"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {editingSegment
                ? "Atualize o nome ou a visibilidade deste nicho no funil."
                : "Cadastre um novo nicho para classificação de projetos no Kanban e Dashboard."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Nome do Segmento *
              </label>
              <Input
                required
                placeholder="Ex: Galpões Logísticos, Mineração, Energia Solar..."
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>

            {editingSegment && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={segmentActive}
                  onChange={(e) => setSegmentActive(e.target.checked)}
                  className="rounded border-input size-4 text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="activeCheck" className="text-xs font-medium text-foreground cursor-pointer">
                  Segmento ativo para novas prospecções
                </label>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isPending} className="text-xs font-semibold">
                {isPending ? "Salvando..." : editingSegment ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL CRIAR / EDITAR CONSULTOR                          */}
      {/* ======================================================== */}
      <Dialog open={isUserModalOpen} onOpenChange={(open) => !open && setIsUserModalOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="size-4 text-primary" />
              {editingUser ? "Editar Consultor Comercial" : "Novo Membro da Equipe Comercial"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {editingUser
                ? "Altere o nome, e-mail institucional ou função do consultor."
                : "Cadastre um novo consultor para ser atribuído a projetos e reuniões na plataforma."}
            </DialogDescription>
          </DialogHeader>

          {userFormError && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>{userFormError}</span>
            </div>
          )}

          <form onSubmit={handleUserSubmit} className="space-y-4 pt-1">
            {/* Nome Completo */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Nome Completo *
              </label>
              <Input
                required
                placeholder="Ex: Davi Silva, Beatriz Santos..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>

            {/* E-mail Corporativo */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                E-mail Corporativo *
              </label>
              <Input
                required
                type="email"
                placeholder="Ex: consultor@hcm.eng.br"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>

            {/* Cargo / Papel */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Função no Sistema *
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              >
                <option value="comercial">Consultor Comercial</option>
                <option value="diretor">Diretor Comercial</option>
                <option value="operacoes">Operações / Engenharia</option>
              </select>
              <span className="text-[11px] text-muted-foreground block mt-1">
                Define a alçada de visualização e atribuição nos filtros e relatórios.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsUserModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isUserPending}
                className="text-xs font-semibold"
              >
                {isUserPending ? "Salvando..." : editingUser ? "Atualizar Consultor" : "Cadastrar Consultor"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
