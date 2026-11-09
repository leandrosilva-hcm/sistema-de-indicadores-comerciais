"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createSegment,
  updateSegment,
  toggleSegmentActive,
} from "@/app/actions/segments";
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
  Check,
  X,
  Power,
  Building2,
  CheckCircle2,
} from "lucide-react";

interface SegmentItem {
  id: string;
  name: string;
  active: boolean;
  _count: {
    projects: number;
  };
}

interface SegmentsViewProps {
  initialSegments: SegmentItem[];
}

export function SegmentsView({ initialSegments }: SegmentsViewProps) {
  const router = useRouter();
  const [segments, setSegments] = useState<SegmentItem[]>(initialSegments);

  // Modal Novo / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<SegmentItem | null>(null);
  const [segmentName, setSegmentName] = useState("");
  const [segmentActive, setSegmentActive] = useState(true);

  const [isPending, startTransition] = useTransition();

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
        if (res.success) {
          setIsModalOpen(false);
          router.refresh();
        } else {
          alert(res.error || "Erro ao atualizar segmento.");
        }
      } else {
        const res = await createSegment(segmentName);
        if (res.success) {
          setIsModalOpen(false);
          router.refresh();
        } else {
          alert(res.error || "Erro ao criar segmento.");
        }
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card shadow-xs">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            Parametrização de Segmentos de Mercado (RF10)
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
            {segments.map((seg) => (
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
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Criar / Editar */}
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
    </div>
  );
}

