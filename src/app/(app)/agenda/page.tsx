import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { AgendaView } from "@/components/agenda/agenda-view";

async function AgendaDataLoader() {
  const [rawTasks, users] = await Promise.all([
    prisma.taskSchedule.findMany({
      orderBy: { dueDate: "asc" },
      include: {
        project: {
          select: {
            id: true,
            companyName: true,
            projectName: true,
            stage: true,
            segment: { select: { name: true } },
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    }),
  ]);

  // Serializa datas para componentes cliente
  const tasks = rawTasks.map((t) => ({
    ...t,
    dueDate: t.dueDate.toISOString(),
    completedAt: t.completedAt?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
  }));

  return <AgendaView initialTasks={tasks} users={users} />;
}

function AgendaSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-card rounded-xl border border-border" />
        ))}
      </div>
      <div className="h-14 bg-card rounded-xl border border-border" />
      <div className="h-[400px] bg-card rounded-xl border border-border" />
    </div>
  );
}

export default function AgendaPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <Suspense fallback={<AgendaSkeleton />}>
        <AgendaDataLoader />
      </Suspense>
    </div>
  );
}
