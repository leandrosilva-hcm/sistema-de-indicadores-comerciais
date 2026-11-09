import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { DashboardView } from "@/components/dashboard/dashboard-view";

async function DashboardDataLoader() {
  const [rawProjects, rawInteractions, users, segments] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true } },
        segment: { select: { id: true, name: true } },
      },
    }),
    prisma.interactionLog.findMany({
      orderBy: { interactionDate: "desc" },
      include: {
        author: { select: { id: true, name: true } },
      },
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

  // Serializa datas para componentes cliente
  const projects = rawProjects.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  const interactions = rawInteractions.map((i) => ({
    ...i,
    interactionDate: i.interactionDate.toISOString(),
  }));

  return (
    <DashboardView
      projects={projects}
      interactions={interactions}
      users={users}
      segments={segments}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-14 bg-card rounded-xl border border-border" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-card rounded-xl border border-border" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-80 bg-card rounded-xl border border-border" />
        <div className="h-80 bg-card rounded-xl border border-border" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardDataLoader />
      </Suspense>
    </div>
  );
}
