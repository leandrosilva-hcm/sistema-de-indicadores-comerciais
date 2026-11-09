import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { KanbanProject } from "@/types/kanban";

async function KanbanDataLoader() {
  const [rawProjects, users, segments] = await Promise.all([
    prisma.project.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true } },
        segment: { select: { id: true, name: true } },
        interactions: {
          orderBy: { interactionDate: "desc" },
          take: 1,
          select: {
            id: true,
            channel: true,
            interactionDate: true,
            summary: true,
          },
        },
        _count: {
          select: {
            interactions: true,
            tasks: true,
            contacts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    }),
    prisma.marketSegment.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const projects: KanbanProject[] = rawProjects.map((p) => ({
    ...p,
    bidInvitationForecast: p.bidInvitationForecast?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    interactions: p.interactions.map((i) => ({
      ...i,
      interactionDate: i.interactionDate.toISOString(),
    })),
  }));

  return (
    <KanbanBoard
      initialProjects={projects}
      users={users}
      segments={segments}
    />
  );
}

function KanbanSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-16 w-full rounded-xl bg-card border border-border" />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-[550px] w-80 shrink-0 rounded-xl bg-muted/30 border border-border"
          />
        ))}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  return (
    <div className="h-full flex flex-col">
      <Suspense fallback={<KanbanSkeleton />}>
        <KanbanDataLoader />
      </Suspense>
    </div>
  );
}
