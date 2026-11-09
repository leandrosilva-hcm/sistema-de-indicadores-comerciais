import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { KANBAN_STAGES } from "@/types/kanban";

export async function GET() {
  try {
    // 1. Consulta completa aos dados do banco
    const [projects, contacts, interactions] = await Promise.all([
      prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          owner: { select: { name: true, email: true } },
          segment: { select: { name: true } },
          _count: { select: { contacts: true, interactions: true, tasks: true } },
        },
      }),
      prisma.clientContact.findMany({
        orderBy: { name: "asc" },
        include: {
          project: { select: { companyName: true, projectName: true } },
        },
      }),
      prisma.interactionLog.findMany({
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
      }),
    ]);

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

    // 2. Montagem da Aba 1: Projetos e Status Atual
    const sheet1Data = projects.map((p) => ({
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

    // 3. Montagem da Aba 2: Banco de Decisores e Contatos
    const sheet2Data = contacts.map((c) => ({
      "Nome do Decisor": c.name,
      "Empresa": c.project.companyName,
      "Projeto Vinculado": c.project.projectName,
      "Departamento / Setor": c.department || "Não informado",
      "Papel na Decisão": c.decisionRole || "Stakeholder",
      "E-mail": c.email || "Não informado",
      "Telefone / WhatsApp": c.phone || "Não informado",
      "Data de Cadastro": formatDate(c.createdAt),
    }));

    // 4. Montagem da Aba 3: Histórico Completo de Interações e Agendamentos
    const sheet3Data = interactions.map((i) => {
      const linkedTask = i.tasks?.[0];
      return {
        "Data da Tratativa": formatDateTime(i.interactionDate),
        "Empresa": i.project.companyName,
        "Projeto / Obra": i.project.projectName,
        "Consultor Comercial": i.author.name,
        "Decisor Contatado": i.contact ? `${i.contact.name} (${i.contact.decisionRole || ""})` : "Geral",
        "Canal Utilizado": getChannelName(i.channel),
        "Relato Descritivo da Tratativa": i.summary,
        "Próxima Ação Agendada (RN01)": linkedTask?.title || "Sem ação vinculada",
        "Prazo da Reação": formatDate(linkedTask?.dueDate),
        "Responsável pela Reação": linkedTask?.assignedUser?.name || i.author.name,
        "Status da Reação": linkedTask ? (linkedTask.completed ? "Concluída" : "Pendente") : "-",
        "Conclusão da Reação": formatDateTime(linkedTask?.completedAt),
      };
    });

    // 5. Criação do Workbook XLSX com SheetJS
    const wb = XLSX.utils.book_new();

    const wsProjects = XLSX.utils.json_to_sheet(sheet1Data);
    const wsContacts = XLSX.utils.json_to_sheet(sheet2Data);
    const wsInteractions = XLSX.utils.json_to_sheet(sheet3Data);

    // Configuração de largura das colunas
    wsProjects["!cols"] = [
      { wch: 38 }, // ID
      { wch: 30 }, // Empresa
      { wch: 45 }, // Projeto
      { wch: 20 }, // Segmento
      { wch: 22 }, // Responsável
      { wch: 28 }, // Email
      { wch: 32 }, // Estágio
      { wch: 20 }, // Valor
      { wch: 22 }, // Previsão
      { wch: 16 }, // Contatos
      { wch: 18 }, // Interações
      { wch: 18 }, // Tarefas
      { wch: 16 }, // Criação
      { wch: 20 }, // Atualização
    ];

    wsContacts["!cols"] = [
      { wch: 26 }, // Nome
      { wch: 30 }, // Empresa
      { wch: 45 }, // Projeto
      { wch: 28 }, // Departamento
      { wch: 22 }, // Papel
      { wch: 30 }, // Email
      { wch: 20 }, // Telefone
      { wch: 16 }, // Cadastro
    ];

    wsInteractions["!cols"] = [
      { wch: 20 }, // Data
      { wch: 30 }, // Empresa
      { wch: 45 }, // Projeto
      { wch: 22 }, // Consultor
      { wch: 28 }, // Decisor
      { wch: 22 }, // Canal
      { wch: 60 }, // Relato
      { wch: 45 }, // Próxima Ação
      { wch: 16 }, // Prazo
      { wch: 22 }, // Responsável Reação
      { wch: 18 }, // Status
      { wch: 20 }, // Conclusão
    ];

    // Adiciona as 3 abas na mesma planilha
    // Nota: O limite do padrão Excel/SheetJS para nome de abas é de 31 caracteres
    XLSX.utils.book_append_sheet(wb, wsProjects, "Projetos e Status Atual");
    XLSX.utils.book_append_sheet(wb, wsContacts, "Banco de Decisores e Contatos");
    XLSX.utils.book_append_sheet(wb, wsInteractions, "Histórico e Agendamentos");

    // Gera o buffer binário
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const fileName = `painel_indicadores_comerciais_${dateStr}.xlsx`;

    return new Response(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Erro na exportação Excel:", error);
    return NextResponse.json(
      { error: "Erro ao gerar arquivo Excel." },
      { status: 500 }
    );
  }
}

