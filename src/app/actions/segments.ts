"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSegment(name: string) {
  try {
    if (!name || !name.trim()) {
      return { success: false, error: "Nome do segmento é obrigatório." };
    }

    const created = await prisma.marketSegment.create({
      data: {
        name: name.trim(),
        active: true,
      },
    });

    try {
      revalidatePath("/segmentos");
      revalidatePath("/kanban");
      revalidatePath("/dashboard");
    } catch {
      // guard
    }

    return { success: true, segment: created };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Já existe um segmento com este nome." };
    }
    console.error("Erro ao criar segmento:", error);
    return { success: false, error: "Falha ao cadastrar o segmento." };
  }
}

export async function updateSegment(id: string, name: string, active: boolean) {
  try {
    if (!name || !name.trim()) {
      return { success: false, error: "Nome do segmento é obrigatório." };
    }

    const updated = await prisma.marketSegment.update({
      where: { id },
      data: {
        name: name.trim(),
        active,
      },
    });

    try {
      revalidatePath("/segmentos");
      revalidatePath("/kanban");
      revalidatePath("/dashboard");
    } catch {
      // guard
    }

    return { success: true, segment: updated };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Já existe outro segmento com este nome." };
    }
    console.error("Erro ao atualizar segmento:", error);
    return { success: false, error: "Falha ao atualizar o segmento." };
  }
}

export async function toggleSegmentActive(id: string, active: boolean) {
  try {
    const updated = await prisma.marketSegment.update({
      where: { id },
      data: { active },
    });

    try {
      revalidatePath("/segmentos");
      revalidatePath("/kanban");
      revalidatePath("/dashboard");
    } catch {
      // guard
    }

    return { success: true, segment: updated };
  } catch (error) {
    console.error("Erro ao alterar status do segmento:", error);
    return { success: false, error: "Falha ao alterar o status do segmento." };
  }
}

