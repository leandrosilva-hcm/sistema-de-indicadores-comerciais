import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockTasks = [
  {
    id: "1",
    title: "Retornar ligação para João (Cargill)",
    project: "Planta Cargill Uberlândia",
    assignedTo: "Antonio",
    dueDate: "2026-11-10",
    completed: false,
  },
  {
    id: "2",
    title: "Enviar proposta técnica revisada",
    project: "Shopping Iguatemi Brasília",
    assignedTo: "Bia",
    dueDate: "2026-11-11",
    completed: false,
  },
  {
    id: "3",
    title: "Agendar reunião presencial com engenharia",
    project: "Galpão Logístico GLP Cajamar",
    assignedTo: "Sérgio",
    dueDate: "2026-11-12",
    completed: true,
  },
  {
    id: "4",
    title: "Verificar status de homologação na Vendor List",
    project: "Ambev - Nova Linha de Produção",
    assignedTo: "Davi",
    dueDate: "2026-11-13",
    completed: false,
  },
];

export default function AgendaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Semana Atual</h2>
          <p className="text-sm text-muted-foreground">
            10/11/2026 — 14/11/2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {mockTasks.filter((t) => t.completed).length}/{mockTasks.length}{" "}
            concluídas
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tarefas Agendadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Tarefa</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Prazo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div
                      className={`size-4 rounded-full border-2 ${
                        task.completed
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-muted-foreground"
                      }`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.project}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{task.assignedTo}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

