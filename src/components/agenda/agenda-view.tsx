"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilterUser } from "@/types/kanban";
import { toggleTaskCompletion } from "@/app/actions/tasks";
import { AgendaResultModal } from "./agenda-result-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Building2,
  User,
  Plus,
  Send,
  CalendarCheck,
  Check,
} from "lucide-react";

interface AgendaTask {
  id: string;
  projectId: string;
  assignedTo: string;
  interactionId: string | null;
  title: string;
  dueDate: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  project: {
    id: string;
    companyName: string;
    projectName: string;
    stage: string;
    segment: { name: string } | null;
  };
  assignedUser: {
    id: string;
    name: string;
  };
}

interface AgendaViewProps {
  initialTasks: AgendaTask[];
  users: FilterUser[];
}

export function AgendaView({
  initialTasks,
  users,
}: AgendaViewProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<AgendaTask[]>(initialTasks);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("semana"); // 'semana' | 'pendentes' | 'atrasadas' | 'concluidas' | 'todas'
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);

  // Modal de resultado após conclusão
  const [completedTaskForModal, setCompletedTaskForModal] = useState<AgendaTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Reference date: today
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const { wStartDate, wEndDate } = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const start = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { wStartDate: start, wEndDate: end };
  }, []);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Filtro por usuário
      if (selectedUser && task.assignedTo !== selectedUser) {
        return false;
      }

      // 2. Filtro por busca
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesProject = task.project.projectName.toLowerCase().includes(q);
        const matchesCompany = task.project.companyName.toLowerCase().includes(q);
        const matchesUser = task.assignedUser.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesProject && !matchesCompany && !matchesUser) {
          return false;
        }
      }

      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);

      // 3. Filtro por status / período
      if (statusFilter === "semana") {
        return taskDate >= wStartDate && taskDate <= wEndDate;
      }
      if (statusFilter === "pendentes") {
        return !task.completed;
      }
      if (statusFilter === "atrasadas") {
        return !task.completed && taskDate < today;
      }
      if (statusFilter === "concluidas") {
        return task.completed;
      }
      return true;
    });
  }, [tasks, selectedUser, searchQuery, statusFilter, wStartDate, wEndDate, today]);

  // KPIs
  const weekTasks = useMemo(() => {
    return tasks.filter((t) => {
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      return d >= wStartDate && d <= wEndDate;
    });
  }, [tasks, wStartDate, wEndDate]);

  const totalWeek = weekTasks.length;
  const completedWeek = weekTasks.filter((t) => t.completed).length;
  const pendingWeek = weekTasks.filter((t) => !t.completed).length;
  const delayedTotal = tasks.filter((t) => {
    const d = new Date(t.dueDate);
    d.setHours(0, 0, 0, 0);
    return !t.completed && d < today;
  }).length;

  const executionRate = totalWeek > 0 ? Math.round((completedWeek / totalWeek) * 100) : 0;

  // Toggle Checkbox
  const handleToggle = (task: AgendaTask) => {
    const nextCompleted = !task.completed;
    setPendingTaskId(task.id);

    // Atualização otimista
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : null,
            }
          : t
      )
    );

    startTransition(async () => {
      const res = await toggleTaskCompletion(task.id, nextCompleted);
      setPendingTaskId(null);

      if (res.success) {
        // Se a tarefa foi marcada como concluída, dispara o modal opcional sugerindo o registro do resultado
        if (nextCompleted) {
          setCompletedTaskForModal(task);
          setIsModalOpen(true);
        }
      } else {
        // Rollback em caso de erro
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t))
        );
        alert(res.error || "Erro ao atualizar status da tarefa.");
      }
    });
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(dateStr));
  };

  const isDelayed = (dateStr: string, completed: boolean) => {
    if (completed) return false;
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards: Planejado vs Executado */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4 bg-card border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Planejado na Semana
            </span>
            <CalendarDays className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">
            {totalWeek}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Metas comerciais da semana
          </p>
        </Card>

        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Taxa de Execução
            </span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
            {executionRate}%
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-0.5">
            {completedWeek} de {totalWeek} tarefas concluídas
          </p>
        </Card>

        <Card className="p-4 bg-[#dc911b]/8 border-[#dc911b]/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9a600a] dark:text-[#f3b558]">
              Ações a Executar
            </span>
            <Clock className="size-4 text-[#dc911b]" />
          </div>
          <div className="text-2xl font-bold text-[#dc911b] mt-1 tabular-nums">
            {pendingWeek}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Ações pendentes na semana corrente
          </p>
        </Card>

        <Card className="p-4 bg-amber-500/5 border-amber-500/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Ações em Atraso
            </span>
            <AlertTriangle className="size-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1 tabular-nums">
            {delayedTotal}
          </div>
          <p className="text-[11px] text-amber-600/80 mt-0.5">
            Exigem retorno imediato do comercial
          </p>
        </Card>
      </div>

      {/* Control Bar: Filters & Period */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border/80 bg-card shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar tarefa ou projeto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>

          {/* User Filter */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="h-8 rounded-lg border border-input bg-background px-3 py-1 text-xs text-foreground shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Filtrar por Responsável"
          >
            <option value="">Todos os Consultores</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Status Filter Tabs */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 text-xs">
            <button
              onClick={() => setStatusFilter("semana")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "semana"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semana Atual
            </button>
            <button
              onClick={() => setStatusFilter("pendentes")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "pendentes"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setStatusFilter("atrasadas")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "atrasadas"
                  ? "bg-background text-amber-700 dark:text-amber-300 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Atrasadas ({delayedTotal})
            </button>
            <button
              onClick={() => setStatusFilter("concluidas")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "concluidas"
                  ? "bg-background text-emerald-700 dark:text-emerald-300 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Concluídas
            </button>
            <button
              onClick={() => setStatusFilter("todas")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "todas"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todas
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs py-1 px-2.5 font-medium">
            Mostrando {filteredTasks.length} tarefas
          </Badge>
        </div>
      </div>

      {/* Tasks Table */}
      <Card className="border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-12 text-center">Status</TableHead>
              <TableHead className="min-w-[280px]">Próxima Ação Agendada (Reação)</TableHead>
              <TableHead>Empresa & Projeto</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="w-28 text-center">Prazo</TableHead>
              <TableHead className="w-24 text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const delayed = isDelayed(task.dueDate, task.completed);
                return (
                  <TableRow
                    key={task.id}
                    className={`transition-colors ${
                      task.completed ? "bg-muted/10 opacity-70" : delayed ? "bg-amber-500/5" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleToggle(task)}
                        disabled={pendingTaskId === task.id}
                        className={`size-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                          task.completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : delayed
                            ? "border-amber-500 bg-background hover:bg-amber-50"
                            : "border-muted-foreground/50 bg-background hover:border-primary"
                        }`}
                        title={task.completed ? "Marcar como pendente" : "Marcar como concluída"}
                      >
                        {task.completed && <Check className="size-3.5 stroke-[3]" />}
                      </button>
                    </TableCell>

                    {/* Task Title */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-semibold ${
                            task.completed
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </span>
                        {delayed && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="size-2.5" /> Ação com prazo expirado!
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Project & Company */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground truncate max-w-[240px]">
                          {task.project.companyName}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                          {task.project.projectName}
                        </span>
                      </div>
                    </TableCell>

                    {/* Assigned User */}
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-medium bg-muted/30">
                        <User className="size-2.5 mr-1 text-primary" />
                        {task.assignedUser.name.split(" ")[0]}
                      </Badge>
                    </TableCell>

                    {/* Due Date */}
                    <TableCell className="text-center">
                      <span
                        className={`text-xs font-medium tabular-nums ${
                          delayed
                            ? "text-amber-700 dark:text-amber-400 font-bold"
                            : task.completed
                            ? "text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {formatDate(task.dueDate)}
                      </span>
                    </TableCell>

                    {/* Action Button */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          setCompletedTaskForModal(task);
                          setIsModalOpen(true);
                        }}
                        className="text-xs text-primary hover:text-primary gap-1"
                      >
                        <Send className="size-3" />
                        Resultado
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                  Nenhuma tarefa encontrada com os filtros selecionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Opcional de Registro de Resultado (Prompt 5) */}
      <AgendaResultModal
        task={completedTaskForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
        onTaskUpdated={() => router.refresh()}
      />
    </div>
  );
}
