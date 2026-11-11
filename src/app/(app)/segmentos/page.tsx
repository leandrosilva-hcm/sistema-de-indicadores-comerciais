import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { SegmentsView } from "@/components/segments/segments-view";

async function SegmentsDataLoader() {
  const [segments, users] = await Promise.all([
    prisma.marketSegment.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            ownedProjects: true,
            interactions: true,
            assignedTasks: true,
          },
        },
      },
    }),
  ]);

  return <SegmentsView initialSegments={segments} initialUsers={users} />;
}

function SegmentsSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-16 bg-card rounded-xl border border-border" />
      <div className="h-64 bg-card rounded-xl border border-border" />
    </div>
  );
}

export default function SegmentsPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <Suspense fallback={<SegmentsSkeleton />}>
        <SegmentsDataLoader />
      </Suspense>
    </div>
  );
}

