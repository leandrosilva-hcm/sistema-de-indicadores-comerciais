import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Kanban,
  TrendingUp,
  Phone,
  Users,
} from "lucide-react";

const kpis = [
  {
    title: "Projetos Ativos",
    value: "24",
    change: "+3 este mês",
    icon: Kanban,
  },
  {
    title: "Novos Projetos (Mês)",
    value: "7",
    change: "+16% vs. anterior",
    icon: TrendingUp,
  },
  {
    title: "Interações na Semana",
    value: "42",
    change: "Meta: 50",
    icon: Phone,
  },
  {
    title: "Reuniões Presenciais",
    value: "8",
    change: "+2 vs. semana anterior",
    icon: Users,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Produtividade por Comercial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Gráfico de Barras — Recharts
                </p>
                <Badge variant="secondary" className="mt-2">
                  Será implementado na Etapa 6
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Projetos por Segmento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Gráfico de Rosca — Recharts
                </p>
                <Badge variant="secondary" className="mt-2">
                  Será implementado na Etapa 6
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

