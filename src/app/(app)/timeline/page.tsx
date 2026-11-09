import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Phone,
  Video,
  Users,
  Building2,
  CalendarCheck2,
  User,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

async function TimelineDataLoader() {
  const interactions = await prisma.interactionLog.findMany({
    orderBy: { interactionDate: "desc" },
    include: {
      author: { select: { id: true, name: true, role: true } },
      contact: { select: { id: true, name: true, department: true, decisionRole: true } },
      project: {
        select: {
          id: true,
          projectName: true,
          companyName: true,
          stage: true,
          segment: { select: { name: true } },
        },
      },
      tasks: {
        select: {
          id: true,
          title: true,
          dueDate: true,
          completed: true,
          assignedUser: { select: { name: true } },
        },
      },
    },
  });

  const totalInteractions = interactions.length;
  const presencialCount = interactions.filter((i) => i.channel === "reuniao_presencial").length;
  const onlineCount = interactions.filter((i) => i.channel === "reuniao_online").length;
  const ligacoesCount = interactions.filter((i) => i.channel === "ligacao").length;

  const formatDate = (date: Date) => {
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
          <Badge className="bg-[#dc911b] text-black border-[#c47d12] font-semibold gap-1 text-xs">
            <Users className="size-3" /> Reunião Presencial / Café
          </Badge>
        );
      case "reuniao_online":
        return (
          <Badge className="bg-slate-900 text-white border-slate-700 gap-1 text-xs">
            <Video className="size-3" /> Reunião Online
          </Badge>
        );
      case "ligacao":
        return (
          <Badge className="bg-[#dc911b]/15 text-[#9a600a] dark:text-[#f3b558] border-[#dc911b]/30 gap-1 text-xs font-medium">
            <Phone className="size-3" /> Ligação Telefônica
          </Badge>
        );
      default:
        return <Badge variant="outline">{ch}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 bg-card border-border">
          <span className="text-[11px] text-muted-foreground font-medium">Total de Registros</span>
          <p className="text-xl font-bold text-foreground mt-0.5">{totalInteractions}</p>
        </Card>
        <Card className="p-3 bg-emerald-500/5 border-emerald-500/20">
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
            Presenciais
          </span>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
            {presencialCount}
          </p>
        </Card>
        <Card className="p-3 bg-blue-500/5 border-blue-500/20">
          <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
            Reuniões Online
          </span>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-0.5">
            {onlineCount}
          </p>
        </Card>
        <Card className="p-3 bg-amber-500/5 border-amber-500/20">
          <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
            Ligações Telefônicas
          </span>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-0.5">
            {ligacoesCount}
          </p>
        </Card>
      </div>

      {/* Timeline Card */}
      <Card>
        <CardHeader className="border-b border-border/80 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Linha do Tempo Cronológica (Imutável — RN02)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Histórico cumulativo completo de abordagens comerciais, reuniões e alinhamentos técnicos com decisores.
              </p>
            </div>
            <Link
              href="/kanban"
              className="text-xs text-[#dc911b] font-semibold hover:underline flex items-center gap-1"
            >
              Ir ao Kanban <ArrowRight className="size-3" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {interactions.map((interaction, idx) => (
              <div key={interaction.id} className="relative group">
                {/* Timeline node */}
                <div
                  className={`absolute -left-6 top-1.5 size-4 rounded-full border-2 border-background flex items-center justify-center ${
                    idx === 0
                      ? "bg-[#dc911b] ring-4 ring-[#dc911b]/25"
                      : "bg-muted-foreground/40"
                  }`}
                />

                <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3 shadow-xs">
                  {/* Top: Project Info & Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-xs font-bold text-foreground">
                        {interaction.project.companyName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        • {interaction.project.projectName}
                      </span>
                      {interaction.project.segment && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {interaction.project.segment.name}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium shrink-0">
                      {formatDate(interaction.interactionDate)}
                    </span>
                  </div>

                  {/* Channel & Contact */}
                  <div className="flex items-center gap-2">
                    {getChannelBadge(interaction.channel)}
                    {interaction.contact && (
                      <span className="text-xs text-foreground font-medium">
                        com <strong>{interaction.contact.name}</strong>{" "}
                        {interaction.contact.decisionRole && (
                          <span className="text-muted-foreground font-normal">
                            ({interaction.contact.decisionRole})
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Narrative */}
                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {interaction.summary}
                  </p>

                  {/* Footer: Author & Triggered Action */}
                  <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="size-3 text-primary/70" />
                      Registrado por:{" "}
                      <strong className="text-foreground">{interaction.author.name}</strong>
                    </span>

                    {/* Próxima Ação Agendada (RN01) */}
                    {interaction.tasks?.[0] && (
                      <span className="flex items-center gap-1.5 bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded text-[11px] font-medium">
                        <CalendarCheck2 className="size-3 shrink-0" />
                        Reação Agendada: {interaction.tasks[0].title} (
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
        </CardContent>
      </Card>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-pulse">
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-card rounded-xl border border-border" />
        ))}
      </div>
      <div className="h-[600px] bg-card rounded-xl border border-border" />
    </div>
  );
}

export default function TimelinePage() {
  return (
    <Suspense fallback={<TimelineSkeleton />}>
      <TimelineDataLoader />
    </Suspense>
  );
}
