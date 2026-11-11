"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FilterUser, FilterSegment, KANBAN_STAGES } from "@/types/kanban";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  TrendingUp,
  Phone,
  Users,
  Video,
  Layers,
  DollarSign,
  Calendar,
  Filter,
  RotateCcw,
  PieChart as PieIcon,
  BarChart3,
  Briefcase,
} from "lucide-react";

interface DashboardProject {
  id: string;
  projectName: string;
  companyName: string;
  stage: string;
  estimatedValue: number | null;
  createdAt: string;
  ownerId: string;
  owner: { id: string; name: string };
  segmentId: string | null;
  segment: { id: string; name: string } | null;
}

interface DashboardInteraction {
  id: string;
  projectId: string;
  authorId: string;
  channel: string;
  interactionDate: string;
  author: { id: string; name: string };
}

interface DashboardViewProps {
  projects: DashboardProject[];
  interactions: DashboardInteraction[];
  users: FilterUser[];
  segments: FilterSegment[];
}

const SEGMENT_COLORS = [
  "#dc911b", // Brand Primary (Ocre HCM)
  "#0f172a", // Preto Slate
  "#334155", // Cinza Escuro Slate 700
  "#64748b", // Cinza Médio Slate 500
  "#c47d12", // Ocre Escuro Hover
  "#94a3b8", // Cinza Claro Slate 400
];

export function DashboardView({
  projects,
  interactions,
  users,
  segments,
}: DashboardViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("mes"); // 'semana' | 'mes' | 'trimestre' | 'todos'
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Determina janela de data com base no período selecionado
  const dateThreshold = useMemo(() => {
    const now = new Date();
    if (selectedPeriod === "semana") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
      return startOfWeek;
    }
    if (selectedPeriod === "mes") {
      return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    }
    if (selectedPeriod === "trimestre") {
      return new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0);
    }
    return null; // todos
  }, [selectedPeriod]);

  // Filtra projetos
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedUser && p.ownerId !== selectedUser) {
        return false;
      }
      return true;
    });
  }, [projects, selectedUser]);

  // Filtra interações pelo período e pelo comercial
  const filteredInteractions = useMemo(() => {
    return interactions.filter((i) => {
      if (selectedUser && i.authorId !== selectedUser) {
        return false;
      }
      if (dateThreshold) {
        const iDate = new Date(i.interactionDate);
        if (iDate < dateThreshold) return false;
      }
      return true;
    });
  }, [interactions, selectedUser, dateThreshold]);

  // 1. Quatro Cards de KPI no Topo (RF07)
  const kpis = useMemo(() => {
    // Total de Projetos Ativos (estágio diferente de fechado_declinado)
    const activeProjects = filteredProjects.filter((p) => p.stage !== "fechado_declinado");
    const activeTotalValue = activeProjects.reduce((acc, p) => acc + (p.estimatedValue || 0), 0);

    // Novos Projetos no Mês / Período
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newProjectsMonth = filteredProjects.filter((p) => {
      const pDate = new Date(p.createdAt);
      return pDate >= firstDayOfMonth;
    }).length;

    // Total de Interações na Semana (e no período)
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
    const weekInteractionsCount = filteredInteractions.filter((i) => {
      const iDate = new Date(i.interactionDate);
      return iDate >= startOfWeek;
    }).length;

    const totalInteractionsCount = filteredInteractions.length;

    // Reuniões Presenciais Realizadas no período
    const presencialCount = filteredInteractions.filter(
      (i) => i.channel === "reuniao_presencial"
    ).length;

    return {
      activeProjectsCount: activeProjects.length,
      activeTotalValue,
      newProjectsMonth,
      weekInteractionsCount,
      totalInteractionsCount,
      presencialCount,
    };
  }, [filteredProjects, filteredInteractions]);

  // 2. Gráfico de Barras: Produtividade por Comercial
  // Distribuição de ligações vs reuniões online vs reuniões presenciais para cada comercial
  const productivityData = useMemo(() => {
    const commercialUsers = users.filter((u) => u.role === "comercial" || u.role === "diretor");

    return commercialUsers.map((user) => {
      const userInteractions = filteredInteractions.filter((i) => i.authorId === user.id);
      const ligacoes = userInteractions.filter((i) => i.channel === "ligacao").length;
      const reunioesOnline = userInteractions.filter((i) => i.channel === "reuniao_online").length;
      const reunioesPresenciais = userInteractions.filter(
        (i) => i.channel === "reuniao_presencial"
      ).length;

      return {
        name: user.name.split(" ")[0], // Antonio, Bia, Sérgio, Davi, Lucas/Pocai, Diretor
        fullName: user.name,
        ligacoes,
        reunioesOnline,
        reunioesPresenciais,
        total: ligacoes + reunioesOnline + reunioesPresenciais,
      };
    });
  }, [users, filteredInteractions]);

  // 3. Gráfico de Pizza/Rosca: Distribuição por Segmento de Mercado
  const segmentData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const seg of segments) {
      counts[seg.name] = 0;
    }

    for (const proj of filteredProjects) {
      const segName = proj.segment?.name || "Outros";
      counts[segName] = (counts[segName] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);
  }, [segments, filteredProjects]);

  // 4. Distribuição do Funil por Estágio (Valores e Contagem)
  const funnelData = useMemo(() => {
    return KANBAN_STAGES.map((stage) => {
      const stageProjects = filteredProjects.filter((p) => p.stage === stage.id);
      const val = stageProjects.reduce((acc, p) => acc + (p.estimatedValue || 0), 0);
      return {
        stage: stage.shortTitle,
        count: stageProjects.length,
        value: val / 1_000_000, // em Milhões de R$
      };
    });
  }, [filteredProjects]);

  const formatCurrencyMillions = (val: number) => {
    if (val >= 1_000_000_000) {
      return `R$ ${(val / 1_000_000_000).toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
      })}B`;
    }
    return `R$ ${(val / 1_000_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })}M`;
  };

  const handleResetFilters = () => {
    setSelectedPeriod("mes");
    setSelectedUser("");
  };

  return (
    <div className="space-y-6">
      {/* Global Filter Bar (Prompt 6) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border/80 bg-card shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Período */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3.5" />
              Período:
            </span>
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 text-xs">
              <button
                onClick={() => setSelectedPeriod("semana")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  selectedPeriod === "semana"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Esta Semana
              </button>
              <button
                onClick={() => setSelectedPeriod("mes")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  selectedPeriod === "mes"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Este Mês
              </button>
              <button
                onClick={() => setSelectedPeriod("trimestre")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  selectedPeriod === "trimestre"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Trimestre
              </button>
              <button
                onClick={() => setSelectedPeriod("todos")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  selectedPeriod === "todos"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Geral
              </button>
            </div>
          </div>

          {/* Filtro por Comercial */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Users className="size-3.5" />
              Comercial:
            </span>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-3 py-1 text-xs text-foreground shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todos os Comerciais</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {(selectedUser || selectedPeriod !== "mes") && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleResetFilters}
              className="gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3" /> Limpar
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="outline" className="text-xs py-1 px-3">
            Visão Executiva
          </Badge>
        </div>
      </div>

      {/* 1. Quatro Cards de KPI no Topo (RF07) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Projetos Ativos */}
        <Card className="p-4 border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total de Projetos Ativos
            </CardTitle>
            <div className="p-2 bg-[#dc911b]/15 text-[#dc911b] rounded-lg">
              <Layers className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {kpis.activeProjectsCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <span className="font-semibold text-foreground">
                {formatCurrencyMillions(kpis.activeTotalValue)}
              </span>{" "}
              em pipeline
            </p>
          </CardContent>
        </Card>

        {/* KPI 2: Novos Projetos no Mês */}
        <Card className="p-4 border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Novos Projetos no Mês
            </CardTitle>
            <div className="p-2 bg-black/10 text-black dark:text-white dark:bg-white/10 rounded-lg">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {kpis.newProjectsMonth}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Cadastrados no mês corrente
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Total de Interações na Semana */}
        <Card className="p-4 border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total de Interações na Semana
            </CardTitle>
            <div className="p-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg">
              <Phone className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {kpis.weekInteractionsCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {kpis.totalInteractionsCount} interações acumuladas
            </p>
          </CardContent>
        </Card>

        {/* KPI 4: Reuniões Presenciais Realizadas */}
        <Card className="p-4 border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Reuniões Presenciais Realizadas
            </CardTitle>
            <div className="p-2 bg-[#dc911b] text-black font-semibold rounded-lg shadow-xs">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-[#dc911b] tabular-nums">
              {kpis.presencialCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Visitas a canteiros, cafés e diretorias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2 Gráficos Centrais (Barras e Rosca) */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Gráfico de Barras: Produtividade por Comercial */}
        <Card className="border border-border/80 shadow-xs">
          <CardHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 className="size-4 text-primary" />
                  Produtividade por Comercial
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Distribuição de ligações vs. reuniões online vs. reuniões presenciais
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 pb-2">
            <div className="h-80 w-full">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivityData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                        color: "#1e293b",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                      formatter={(val) => {
                        if (val === "ligacoes") return "Ligações Telefônicas";
                        if (val === "reunioesOnline") return "Reuniões Online";
                        if (val === "reunioesPresenciais") return "Reuniões Presenciais";
                        return val;
                      }}
                    />
                    <Bar dataKey="reunioesPresenciais" name="reunioesPresenciais" fill="#dc911b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="reunioesOnline" name="reunioesOnline" fill="#334155" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ligacoes" name="ligacoes" fill="#64748b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-muted/20 animate-pulse rounded-lg" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza/Rosca: Distribuição por Segmento */}
        <Card className="border border-border/80 shadow-xs">
          <CardHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <PieIcon className="size-4 text-primary" />
                  Distribuição de Projetos por Segmento
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Concentração de oportunidades por nicho de engenharia
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 pb-2">
            <div className="h-80 w-full flex items-center justify-center">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }: any) =>
                        `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {segmentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                        color: "#1e293b",
                      }}
                      formatter={(val: any, name: any) => [`${val} projeto(s)`, name]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-muted/20 animate-pulse rounded-lg" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visão de Pipeline por Estágio */}
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Briefcase className="size-4 text-primary" />
                Pipeline por Estágio do Funil Comercial
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Volume financeiro estimado acumulado em cada etapa
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 pb-4">
          <div className="h-64 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `R$ ${val}M`}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    width={140}
                  />
                  <Tooltip
                    formatter={(val: any) => [`R$ ${Number(val).toFixed(1)}M`, "Valor Estimado"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      color: "#1e293b",
                    }}
                  />
                  <Bar dataKey="value" fill="#dc911b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-muted/20 animate-pulse rounded-lg" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
