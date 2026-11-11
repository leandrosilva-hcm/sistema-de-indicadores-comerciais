"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleTaskCompletion(taskId: string, completed: boolean) {
  try {
    const updated = await prisma.taskSchedule.update({
      where: { id: taskId },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            companyName: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    try {
      revalidatePath("/agenda");
      revalidatePath("/kanban");
      revalidatePath("/dashboard");
    } catch {
      // context guard
    }

    return { success: true, task: updated };
  } catch (error) {
    console.error("Erro ao atualizar status da tarefa:", error);
    return { success: false, error: "Falha ao atualizar o status da tarefa no banco." };
  }
}

export type RecordTaskResultInput = {
  taskId: string;
  projectId: string;
  authorId: string;
  channel: string;
  summary: string;
  nextActionTitle: string; // RN01
  nextActionDueDate: string; // RN01
  nextActionAssignedTo?: string;
};

export async function recordTaskResultAndNextAction(data: RecordTaskResultInput) {
  try {
    if (!data.nextActionTitle || !data.nextActionTitle.trim()) {
      return {
        success: false,
        error: "RN01: O agendamento da próxima ação é estritamente obrigatório.",
      };
    }

    if (!data.nextActionDueDate || !data.nextActionDueDate.trim()) {
      return {
        success: false,
        error: "RN01: A data de retorno da próxima ação é estritamente obrigatória.",
      };
    }

    // Impede agendamento de data de retorno retroativa (datas passadas)
    const todayStr = new Intl.DateTimeFormat("fr-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
    if (data.nextActionDueDate.trim() < todayStr) {
      return {
        success: false,
        error: "A data de retorno / follow-up não pode ser retroativa. Selecione a data de hoje ou uma data futura.",
      };
    }

    if (!data.summary || !data.summary.trim()) {
      return {
        success: false,
        error: "O relato do resultado obtido é obrigatório.",
      };
    }

    // Transação: garante que a tarefa original seja concluída, a interação seja gravada e a nova reação seja agendada
    const result = await prisma.$transaction(async (tx) => {
      // 1. Marca a tarefa original como concluída se ainda não estiver
      await tx.taskSchedule.update({
        where: { id: data.taskId },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      });

      // 2. Grava a nova interação na linha do tempo (RN02)
      const interaction = await tx.interactionLog.create({
        data: {
          projectId: data.projectId,
          authorId: data.authorId,
          channel: data.channel,
          summary: data.summary.trim(),
          interactionDate: new Date(),
        },
      });

      // 3. Agenda a nova reação obrigatória (RN01)
      const nextTask = await tx.taskSchedule.create({
        data: {
          projectId: data.projectId,
          interactionId: interaction.id,
          assignedTo: data.nextActionAssignedTo || data.authorId,
          title: data.nextActionTitle.trim(),
          dueDate: new Date(data.nextActionDueDate + "T12:00:00Z"),
          completed: false,
        },
      });

      // 4. Atualiza timestamp do projeto
      await tx.project.update({
        where: { id: data.projectId },
        data: { updatedAt: new Date() },
      });

      return { interaction, nextTask };
    });

    try {
      revalidatePath("/agenda");
      revalidatePath("/kanban");
      revalidatePath("/timeline");
      revalidatePath("/dashboard");
    } catch {
      // context guard
    }

    return { success: true, ...result };
  } catch (error) {
    console.error("Erro ao registrar resultado da ação:", error);
    return {
      success: false,
      error: "Falha ao registrar resultado e próxima reação.",
    };
  }
}

