import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TimelinePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Linha do Tempo de Interações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Selecione um projeto no Kanban para visualizar o histórico completo
            de interações. Cada registro é imutável e preserva a rastreabilidade
            de todas as tratativas realizadas com decisores.
          </p>

          {/* Placeholder timeline */}
          <div className="mt-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="size-3 rounded-full bg-primary" />
                <div className="w-px flex-1 bg-border" />
              </div>
              <div className="pb-6">
                <p className="text-sm font-medium">Reunião Presencial</p>
                <p className="text-xs text-muted-foreground">
                  09/11/2026 — Antonio
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Reunião com o setor de compras para apresentação da empresa e
                  capacitação técnica.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="size-3 rounded-full bg-primary" />
                <div className="w-px flex-1 bg-border" />
              </div>
              <div className="pb-6">
                <p className="text-sm font-medium">Ligação</p>
                <p className="text-xs text-muted-foreground">
                  05/11/2026 — Bia
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Contato telefônico para agendar visita técnica ao canteiro de
                  obras.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

