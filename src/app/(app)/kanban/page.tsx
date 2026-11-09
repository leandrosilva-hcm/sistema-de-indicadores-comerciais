import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stages = [
  {
    id: "mapeamento_inicial",
    title: "Mapeamento Inicial / Prospecção",
    color: "bg-blue-500",
  },
  {
    id: "contato_engenharia",
    title: "Contato com Engenharia/Compras",
    color: "bg-yellow-500",
  },
  {
    id: "em_homologacao",
    title: "Em Homologação / Vendor List",
    color: "bg-orange-500",
  },
  {
    id: "aguardando_carta",
    title: "Aguardando Carta Convite",
    color: "bg-purple-500",
  },
  {
    id: "proposta_apresentada",
    title: "Proposta Apresentada",
    color: "bg-emerald-500",
  },
  {
    id: "fechado_declinado",
    title: "Fechado / Declinado",
    color: "bg-gray-500",
  },
];

export default function KanbanPage() {
  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <div key={stage.id} className="flex w-72 shrink-0 flex-col">
          {/* Column Header */}
          <div className="mb-3 flex items-center gap-2">
            <div className={`size-2.5 rounded-full ${stage.color}`} />
            <h3 className="text-sm font-semibold">{stage.title}</h3>
            <Badge variant="secondary" className="ml-auto text-xs">
              0
            </Badge>
          </div>

          {/* Column Content */}
          <div className="flex flex-1 flex-col gap-2 rounded-lg border border-dashed border-border bg-muted/50 p-2">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm">
                  Exemplo de Projeto
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <p className="text-xs text-muted-foreground">
                  Empresa Exemplo S.A.
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <Badge variant="outline" className="text-[10px]">
                    Logística
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <div className="flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

