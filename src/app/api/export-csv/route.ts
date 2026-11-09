import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { KANBAN_STAGES } from "@/types/kanban";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "projects"; // 'projects', 'contacts', 'interactions'

    const getStageTitle = (stageId: string) => {
      const found = KANBAN_STAGES.find((s) => s.id === stageId);
      return found ? found.title : stageId;
    };

    const getChannelName = (ch: string) => {
      switch (ch) {
        case "ligacao":
          return "Ligação Telefônica";
        case "reuniao_online":
          return "Reunião Online";
        case "reuniao_presencial":
          return "Reunião Presencial / Café";
        default:
          return ch;
      }
    };

    const formatDate = (d: Date | null | undefined) => {
      if (!d) return "";
      return new Intl.DateTimeFormat("pt-BR").format(new Date(d));
    };

    const formatDateTime = (d: Date | null | undefined) => {
      if (!d) return "";
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(d));
    };

    let csvContent = "";
    const dateStr = new Date().toISOString().split("T")[0];
    let filename = `projetos_${dateStr}.csv`;

    if (type === "contacts") {
      filename = `decisores_contatos_${dateStr}.csv`;
      const contacts = await prisma.clientContact.findMany({
        orderBy: { name: "asc" },
        include: {
          project: { select: { companyName: true, projectName: true } },
        },
      });

      const data = contacts.map((c) => ({
        "Nome do Decisor": c.name,
        "Empresa": c.project.companyName,
        "Projeto Vinculado": c.project.projectName,
        "Departamento / Setor": c.department || "Não informado",
        "Papel na Decisão": c.decisionRole || "Stakeholder",
        "E-mail": c.email || "Não informado",
        "Telefone / WhatsApp": c.phone || "Não informado",
        "Data de Cadastro": formatDate(c.createdAt),
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      csvContent = XLSX.utils.sheet_to_csv(ws, { FS: ";" });
    } else if (type === "interactions") {
      filename = `historico_interacoes_${dateStr}.csv`;
      const interactions = await prisma.interactionLog.findMany({
        orderBy: { interactionDate: "desc" },
        include: {
          author: { select: { name: true } },
          contact: { select: { name: true, decisionRole: true } },
          project: { select: { companyName: true, projectName: true } },
          tasks: {
            select: {
              title: true,
              dueDate: true,
              completed: true,
              completedAt: true,
              assignedUser: { select: { name: true } },
            },
          },
        },
      });

      const data = interactions.map((i) => {
        const linkedTask = i.tasks?.[0];
        return {
          "Data da Tratativa": formatDateTime(i.interactionDate),
          "Empresa": i.project.companyName,
          "Projeto / Obra": i.project.projectName,
          "Consultor Comercial": i.author.name,
          "Decisor Contatado": i.contact ? `${i.contact.name} (${i.contact.decisionRole || ""})` : "Geral",
          "Canal Utilizado": getChannelName(i.channel),
          "Relato Descritivo": i.summary.replace(/[\r\n]+/g, " "),
          "Próxima Ação Agendada (RN01)": linkedTask?.title || "Sem ação vinculada",
          "Prazo da Reação": formatDate(linkedTask?.dueDate),
          "Responsável pela Reação": linkedTask?.assignedUser?.name || i.author.name,
          "Status da Reação": linkedTask ? (linkedTask.completed ? "Concluída" : "Pendente") : "-",
          "Conclusão da Reação": formatDateTime(linkedTask?.completedAt),
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      csvContent = XLSX.utils.sheet_to_csv(ws, { FS: ";" });
    } else {
      // Default: Projects
      filename = `projetos_status_${dateStr}.csv`;
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          owner: { select: { name: true, email: true } },
          segment: { select: { name: true } },
          _count: { select: { contacts: true, interactions: true, tasks: true } },
        },
      });

      const data = projects.map((p) => ({
        "ID do Projeto": p.id,
        "Empresa Contratante": p.companyName,
        "Nome do Projeto / Obra": p.projectName,
        "Segmento de Mercado": p.segment?.name || "Geral",
        "Consultor Responsável": p.owner.name,
        "E-mail do Responsável": p.owner.email,
        "Estágio no Funil": getStageTitle(p.stage),
        "Valor Estimado (R$)": p.estimatedValue || 0,
        "Previsão Carta Convite": formatDate(p.bidInvitationForecast),
        "Total de Contatos": p._count.contacts,
        "Total de Interações": p._count.interactions,
        "Tarefas Agendadas": p._count.tasks,
        "Data de Criação": formatDate(p.createdAt),
        "Última Atualização": formatDateTime(p.updatedAt),
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      csvContent = XLSX.utils.sheet_to_csv(ws, { FS: ";" });
    }

    // Prepend UTF-8 BOM so Excel opens accented characters cleanly
    const bomCsv = "\uFEFF" + csvContent;

    return new Response(bomCsv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erro na exportação CSV:", error);
    return NextResponse.json(
      { error: "Erro ao gerar arquivo CSV." },
      { status: 500 }
    );
  }
}

