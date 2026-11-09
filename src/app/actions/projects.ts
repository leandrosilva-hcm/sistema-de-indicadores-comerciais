"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProjectStage(projectId: string, newStage: string) {
  try {
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        stage: newStage,
        updatedAt: new Date(),
      },
    });

    try {
      revalidatePath("/kanban");
      revalidatePath("/dashboard");
    } catch {
      // Ignora se invocado fora do contexto de requisição HTTP do Next.js
    }

    return { success: true, project: updated };
  } catch (error) {
    console.error("Erro ao atualizar estágio do projeto:", error);
    return { success: false, error: "Falha ao atualizar o estágio do projeto." };
  }
}
