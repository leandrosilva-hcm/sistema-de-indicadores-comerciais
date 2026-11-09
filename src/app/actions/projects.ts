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

export async function getProjectDetails(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true, role: true } },
        segment: { select: { id: true, name: true } },
        contacts: {
          orderBy: { createdAt: "desc" },
        },
        interactions: {
          orderBy: { interactionDate: "desc" },
          include: {
            author: { select: { id: true, name: true, role: true } },
            contact: { select: { id: true, name: true, decisionRole: true } },
            tasks: {
              select: {
                id: true,
                title: true,
                dueDate: true,
                completed: true,
                completedAt: true,
                assignedUser: { select: { id: true, name: true } },
              },
            },
          },
        },
        tasks: {
          orderBy: { dueDate: "asc" },
          include: {
            assignedUser: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!project) {
      return { success: false, error: "Projeto não encontrado." };
    }

    return { success: true, project };
  } catch (error) {
    console.error("Erro ao carregar detalhes do projeto:", error);
    return { success: false, error: "Erro ao consultar o banco de dados." };
  }
}

export type CreateInteractionInput = {
  projectId: string;
  authorId: string;
  contactId?: string | null;
  channel: string;
  summary: string;
  nextActionTitle: string; // RN01
  nextActionDueDate: string; // RN01 YYYY-MM-DD
  nextActionAssignedTo?: string;
};

export async function createInteractionWithReaction(data: CreateInteractionInput) {
  try {
    // RN01 - Princípio da Ação e Reação: validação estrita
    if (!data.nextActionTitle || !data.nextActionTitle.trim()) {
      return {
        success: false,
        error: "RN01: O agendamento da próxima ação (título/objetivo) é estritamente obrigatório.",
      };
    }

    if (!data.nextActionDueDate || !data.nextActionDueDate.trim()) {
      return {
        success: false,
        error: "RN01: A data de retorno da próxima ação é estritamente obrigatória.",
      };
    }

    if (!data.summary || !data.summary.trim()) {
      return {
        success: false,
        error: "O relato descritivo da tratativa é obrigatório.",
      };
    }

    // Transação atômica: cria a interação e agenda a próxima tarefa simultaneamente
    const result = await prisma.$transaction(async (tx) => {
      // 1. Cria a interação cumulativa (imutável - RN02)
      const interaction = await tx.interactionLog.create({
        data: {
          projectId: data.projectId,
          authorId: data.authorId,
          contactId: data.contactId || null,
          channel: data.channel,
          summary: data.summary.trim(),
          interactionDate: new Date(),
        },
      });

      // 2. Cria a próxima ação agendada (RN01)
      const task = await tx.taskSchedule.create({
        data: {
          projectId: data.projectId,
          interactionId: interaction.id,
          assignedTo: data.nextActionAssignedTo || data.authorId,
          title: data.nextActionTitle.trim(),
          dueDate: new Date(data.nextActionDueDate + "T12:00:00Z"),
          completed: false,
        },
      });

      // 3. Atualiza timestamp do projeto
      await tx.project.update({
        where: { id: data.projectId },
        data: { updatedAt: new Date() },
      });

      return { interaction, task };
    });

    try {
      revalidatePath("/kanban");
      revalidatePath("/timeline");
      revalidatePath("/agenda");
      revalidatePath("/dashboard");
    } catch {
      // context guard
    }

    return { success: true, ...result };
  } catch (error) {
    console.error("Erro ao registrar tratativa e próxima ação:", error);
    return {
      success: false,
      error: "Falha ao salvar no banco de dados. Tente novamente.",
    };
  }
}

export type CreateContactInput = {
  projectId: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  decisionRole?: string;
};

export async function createClientContact(data: CreateContactInput) {
  try {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Nome do decisor/contato é obrigatório." };
    }

    const contact = await prisma.clientContact.create({
      data: {
        projectId: data.projectId,
        name: data.name.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        department: data.department?.trim() || null,
        decisionRole: data.decisionRole?.trim() || null,
      },
    });

    try {
      revalidatePath("/kanban");
    } catch {
      // context guard
    }

    return { success: true, contact };
  } catch (error) {
    console.error("Erro ao cadastrar contato:", error);
    return { success: false, error: "Falha ao cadastrar o contato do cliente." };
  }
}

export type CreateProjectInput = {
  companyName: string;
  projectName: string;
  segmentId?: string | null;
  ownerId: string;
  stage?: string;
  estimatedValue?: number | null;
  bidInvitationForecast?: string | null;
  initialContactName?: string | null;
  initialContactRole?: string | null;
  initialContactPhone?: string | null;
  initialContactEmail?: string | null;
};

export async function createProject(data: CreateProjectInput) {
  try {
    if (!data.companyName?.trim()) {
      return { success: false, error: "Nome da empresa contratante é obrigatório." };
    }
    if (!data.projectName?.trim()) {
      return { success: false, error: "Nome do projeto / obra é obrigatório." };
    }
    if (!data.ownerId) {
      return { success: false, error: "Responsável comercial é obrigatório (RN04)." };
    }

    const created = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          companyName: data.companyName.trim(),
          projectName: data.projectName.trim(),
          segmentId: data.segmentId || null,
          ownerId: data.ownerId,
          stage: data.stage || "mapeamento_inicial",
          estimatedValue: data.estimatedValue ? Number(data.estimatedValue) : null,
          bidInvitationForecast: data.bidInvitationForecast
            ? new Date(data.bidInvitationForecast)
            : null,
        },
      });

      if (data.initialContactName?.trim()) {
        await tx.clientContact.create({
          data: {
            projectId: project.id,
            name: data.initialContactName.trim(),
            decisionRole: data.initialContactRole?.trim() || "Decisor Principal",
            phone: data.initialContactPhone?.trim() || null,
            email: data.initialContactEmail?.trim() || null,
          },
        });
      }

      return project;
    });

    try {
      revalidatePath("/kanban");
      revalidatePath("/dashboard");
    } catch {
      // guard
    }

    return { success: true, project: created };
  } catch (error) {
    console.error("Erro ao cadastrar projeto:", error);
    return { success: false, error: "Falha ao criar o projeto no banco." };
  }
}
