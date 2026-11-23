"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/kanban");
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
        Carregando Quadro Kanban...
      </div>
    </div>
  );
}
