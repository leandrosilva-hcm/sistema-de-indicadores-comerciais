"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CreateUserInput = {
  name: string;
  email: string;
  role?: string;
};

export async function createUser(data: CreateUserInput) {
  try {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Nome do consultor é obrigatório." };
    }
    if (!data.email || !data.email.trim()) {
      return { success: false, error: "E-mail do consultor é obrigatório." };
    }

    const created = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role: data.role || "comercial",
      },
      include: {
        _count: {
          select: {
            ownedProjects: true,
            interactions: true,
            assignedTasks: true,
          },
        },
      },
    });

    try {
      revalidatePath("/segmentos");
      revalidatePath("/kanban");
      revalidatePath("/dashboard");
      revalidatePath("/agenda");
    } catch {
      // guard
    }

    return { success: true, user: created };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Já existe um consultor cadastrado com este e-mail." };
    }
    console.error("Erro ao cadastrar consultor:", error);
    return { success: false, error: "Falha ao cadastrar consultor comercial." };
  }
}

export type UpdateUserInput = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export async function updateUser(data: UpdateUserInput) {
  try {
    if (!data.id) {
      return { success: false, error: "ID do consultor é obrigatório." };
    }
    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Nome do consultor é obrigatório." };
    }
    if (!data.email || !data.email.trim()) {
      return { success: false, error: "E-mail do consultor é obrigatório." };
    }

    const updated = await prisma.user.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        ...(data.role && { role: data.role }),
      },
      include: {
        _count: {
          select: {
            ownedProjects: true,
            interactions: true,
            assignedTasks: true,
          },
        },
      },
    });

    try {
      revalidatePath("/segmentos");
      revalidatePath("/kanban");
      revalidatePath("/dashboard");
      revalidatePath("/agenda");
    } catch {
      // guard
    }

    return { success: true, user: updated };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Já existe outro consultor com este e-mail." };
    }
    console.error("Erro ao atualizar consultor:", error);
    return { success: false, error: "Falha ao atualizar dados do consultor." };
  }
}

export async function deleteUser(id: string) {
  try {
    if (!id) {
      return { success: false, error: "ID do consultor é obrigatório." };
    }

    // Verifica se possui projetos atribuídos
    const projectCount = await prisma.project.count({
      where: { ownerId: id },
    });

    if (projectCount > 0) {
      return {
        success: false,
        error: `Não é possível excluir este consultor pois ele é responsável por ${projectCount} projeto(s). Reatribua os projetos antes de excluir.`,
      };
    }

    await prisma.user.delete({
      where: { id },
    });

    try {
      revalidatePath("/segmentos");
      revalidatePath("/kanban");
      revalidatePath("/dashboard");
      revalidatePath("/agenda");
    } catch {
      // guard
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir consultor:", error);
    return { success: false, error: "Falha ao excluir consultor." };
  }
}

