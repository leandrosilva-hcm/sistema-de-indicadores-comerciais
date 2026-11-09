import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados...");

  // 1. Limpeza prévia para garantir idempotência
  await prisma.taskSchedule.deleteMany();
  await prisma.interactionLog.deleteMany();
  await prisma.clientContact.deleteMany();
  await prisma.project.deleteMany();
  await prisma.marketSegment.deleteMany();
  await prisma.user.deleteMany();

  console.log("Banco limpo. Criando usuários...");

  // 2. Cadastro dos usuários comerciais e diretoria (PRD Seção 2 e RN04)
  const usersData = [
    {
      name: "Diretor Comercial",
      email: "diretor@empresa.com.br",
      role: "diretor",
    },
    {
      name: "Antonio Silva",
      email: "antonio@empresa.com.br",
      role: "comercial",
    },
    {
      name: "Bia Mendes",
      email: "bia@empresa.com.br",
      role: "comercial",
    },
    {
      name: "Sérgio Oliveira",
      email: "sergio@empresa.com.br",
      role: "comercial",
    },
    {
      name: "Davi Santos",
      email: "davi@empresa.com.br",
      role: "comercial",
    },
    {
      name: "Lucas Pocai",
      email: "pocai@empresa.com.br",
      role: "comercial",
    },
  ];

  const users: Record<string, { id: string; name: string }> = {};
  for (const u of usersData) {
    const created = await prisma.user.create({
      data: u,
    });
    users[u.name.split(" ")[0]] = created;
    if (u.name === "Diretor Comercial") {
      users["Diretor"] = created;
    }
  }

  console.log(`✓ ${Object.keys(users).length} usuários criados.`);

  // 3. Segmentos de mercado (PRD Seção 4 - RF10)
  const segmentsData = [
    { name: "Logística" },
    { name: "Agronegócio" },
    { name: "Infraestrutura" },
    { name: "Shoppings & Varejo" },
  ];

  const segments: Record<string, { id: string; name: string }> = {};
  for (const s of segmentsData) {
    const created = await prisma.marketSegment.create({
      data: s,
    });
    segments[s.name] = created;
  }

  console.log(`✓ ${Object.keys(segments).length} segmentos criados.`);

  // 4. Projetos, Contatos, Interações e Agenda (RN01, RN02, RN03, RN04)
  const projectsData = [
    {
      companyName: "Cargill Agrícola S.A.",
      projectName: "Planta Cargill Uberlândia - Expansão de Processamento",
      segmentId: segments["Agronegócio"].id,
      ownerId: users["Antonio"].id,
      stage: "mapeamento_inicial",
      estimatedValue: 45000000,
      bidInvitationForecast: new Date("2027-02-15"),
      contacts: [
        {
          name: "Carlos Eduardo Rezende",
          email: "carlos.rezende@cargill.com",
          phone: "(34) 99876-1122",
          department: "Engenharia e Novos Projetos",
          decisionRole: "Decisor Técnico",
        },
      ],
      interactions: [
        {
          authorId: users["Antonio"].id,
          channel: "ligacao",
          summary:
            "Primeiro contato telefônico com a equipe de Capex da Cargill. Carlos confirmou que o projeto executivo de expansão de moagem em Uberlândia foi aprovado e a fase de qualificação de fornecedores civis terá início em 60 dias.",
          interactionDate: new Date("2026-11-04T10:30:00Z"),
          task: {
            title:
              "Enviar portfólio de obras industriais e agendar reunião virtual com equipe de engenharia da Cargill",
            dueDate: new Date("2026-11-14"),
            assignedTo: users["Antonio"].id,
            completed: false,
          },
        },
      ],
    },
    {
      companyName: "Rumo Logística Operadora",
      projectName: "Terminal Graneleiro Rumo - Berço 4 Porto de Santos",
      segmentId: segments["Logística"].id,
      ownerId: users["Lucas"].id,
      stage: "contato_engenharia",
      estimatedValue: 85000000,
      bidInvitationForecast: new Date("2027-01-20"),
      contacts: [
        {
          name: "Mariana Albuquerque",
          email: "mariana.albuquerque@rumolog.com",
          phone: "(13) 98122-3344",
          department: "Suprimentos Técnicos",
          decisionRole: "Comprador Líder",
        },
        {
          name: "Eng. Paulo Roberto Teles",
          email: "paulo.teles@rumolog.com",
          phone: "(13) 98122-5566",
          department: "Engenharia Portuária",
          decisionRole: "Aprovador Técnico",
        },
      ],
      interactions: [
        {
          authorId: users["Lucas"].id,
          channel: "ligacao",
          summary:
            "Alinhamento com Mariana para mapear pré-requisitos de acervo técnico em obras marítimas e portuárias.",
          interactionDate: new Date("2026-10-28T14:00:00Z"),
          task: {
            title: "Reunir certidões de acervo técnico (CATs) de fundações e píeres",
            dueDate: new Date("2026-11-03"),
            assignedTo: users["Lucas"].id,
            completed: true,
            completedAt: new Date("2026-11-03T16:00:00Z"),
          },
        },
        {
          authorId: users["Lucas"].id,
          channel: "reuniao_online",
          summary:
            "Reunião por videoconferência com Mariana e Eng. Paulo Teles. Apresentamos casos de execução em ambientes portuários sob regime de maré. O cliente solicitou envio da documentação societária para inclusão no sistema de pré-qualificação.",
          interactionDate: new Date("2026-11-06T15:30:00Z"),
          task: {
            title:
              "Protocolar balanços auditados e documentação societária no portal de suprimentos da Rumo",
            dueDate: new Date("2026-11-12"),
            assignedTo: users["Lucas"].id,
            completed: false,
          },
        },
      ],
    },
    {
      companyName: "Iguatemi Empresa de Shopping Centers",
      projectName: "Shopping Iguatemi Brasília - Expansão Ala Sul",
      segmentId: segments["Shoppings & Varejo"].id,
      ownerId: users["Bia"].id,
      stage: "em_homologacao",
      estimatedValue: 62000000,
      bidInvitationForecast: new Date("2026-12-10"),
      contacts: [
        {
          name: "Roberto Meirelles",
          email: "rmeirelles@iguatemi.com.br",
          phone: "(61) 99101-7788",
          department: "Diretoria de Obras e Engenharia Corporativa",
          decisionRole: "Decisor Final",
        },
        {
          name: "Patrícia Lins",
          email: "plins@iguatemi.com.br",
          phone: "(11) 98765-4321",
          department: "Homologação e Governança de Terceiros",
          decisionRole: "Homologador",
        },
      ],
      interactions: [
        {
          authorId: users["Bia"].id,
          channel: "reuniao_presencial",
          summary:
            "Reunião presencial e café com Roberto Meirelles no escritório do shopping em Brasília. Apresentado histórico de cumprimento de prazos em obras com shopping center em operação e sem interrupção de fluxo de clientes.",
          interactionDate: new Date("2026-10-25T11:00:00Z"),
          task: {
            title: "Submeter questionário de compliance ESG e segurança do trabalho",
            dueDate: new Date("2026-11-01"),
            assignedTo: users["Bia"].id,
            completed: true,
            completedAt: new Date("2026-11-01T09:30:00Z"),
          },
        },
        {
          authorId: users["Bia"].id,
          channel: "ligacao",
          summary:
            "Contato com Patrícia Lins de Suprimentos para checar status da análise financeira e certidões negativas.",
          interactionDate: new Date("2026-11-05T16:00:00Z"),
          task: {
            title:
              "Confirmar aprovação do status na Vendor List com Patrícia Lins para garantir recebimento da Carta Convite",
            dueDate: new Date("2026-11-11"),
            assignedTo: users["Bia"].id,
            completed: false,
          },
        },
      ],
    },
    {
      companyName: "Mercado Livre Brasil",
      projectName: "Centro de Distribuição Cajamar III - 85.000m²",
      segmentId: segments["Logística"].id,
      ownerId: users["Sérgio"].id,
      stage: "aguardando_carta",
      estimatedValue: 120000000,
      bidInvitationForecast: new Date("2026-11-28"),
      contacts: [
        {
          name: "Fernando Takahashi",
          email: "f.takahashi@mercadolivre.com",
          phone: "(11) 97654-8899",
          department: "Real Estate & Capex Expansion Latam",
          decisionRole: "Gerente Geral de Obras",
        },
      ],
      interactions: [
        {
          authorId: users["Sérgio"].id,
          channel: "reuniao_presencial",
          summary:
            "Visita presencial à Melicidade em Osasco com Fernando Takahashi. Demonstramos capacidade produtiva de piso de alta resistência com nivelamento a laser (FF/FL) e estruturas pré-moldadas de grande vão.",
          interactionDate: new Date("2026-10-18T14:30:00Z"),
          task: {
            title: "Concluir homologação técnica de piso industrial e certificação LEED",
            dueDate: new Date("2026-10-30"),
            assignedTo: users["Sérgio"].id,
            completed: true,
            completedAt: new Date("2026-10-30T17:00:00Z"),
          },
        },
        {
          authorId: users["Sérgio"].id,
          channel: "reuniao_online",
          summary:
            "Reunião de alinhamento pré-bid. Homologação homologada e confirmada no portal Coupa da Meli. O edital de concorrência com projetos executivos em BIM será emitido até o fim do mês.",
          interactionDate: new Date("2026-11-07T10:00:00Z"),
          task: {
            title:
              "Monitorar publicação da Carta Convite no Coupa e mobilizar equipe de orçamentos para visita obrigatória ao canteiro",
            dueDate: new Date("2026-11-20"),
            assignedTo: users["Sérgio"].id,
            completed: false,
          },
        },
      ],
    },
    {
      companyName: "Santos Brasil Participações",
      projectName: "Terminal Tecon Santos - Reforço Estrutural Berço 3",
      segmentId: segments["Infraestrutura"].id,
      ownerId: users["Davi"].id,
      stage: "proposta_apresentada",
      estimatedValue: 190000000,
      bidInvitationForecast: new Date("2026-10-15"),
      contacts: [
        {
          name: "Gustavo Barreto",
          email: "gustavo.barreto@santosbrasil.com.br",
          phone: "(13) 99761-0011",
          department: "Gerência Executiva de Contratos de Engenharia",
          decisionRole: "Presidente da Comissão de Licitação",
        },
      ],
      interactions: [
        {
          authorId: users["Davi"].id,
          channel: "reuniao_presencial",
          summary:
            "Entrega solene e protocolo da proposta comercial lacrada e do book técnico com metodologia executiva, cronograma físico-financeiro detalhado e matriz de riscos geológicos.",
          interactionDate: new Date("2026-10-29T15:00:00Z"),
          task: {
            title: "Responder aos pedidos de esclarecimento da comissão técnica da Santos Brasil",
            dueDate: new Date("2026-11-06"),
            assignedTo: users["Davi"].id,
            completed: true,
            completedAt: new Date("2026-11-06T18:00:00Z"),
          },
        },
        {
          authorId: users["Davi"].id,
          channel: "reuniao_online",
          summary:
            "Sessão de equalização de escopo com Gustavo Barreto e auditores externos. Esclarecidas dúvidas sobre produtividade das bate-estacas marítimas e bota-fora de dragagem ambiental.",
          interactionDate: new Date("2026-11-08T11:00:00Z"),
          task: {
            title:
              "Enviar planilha de BDI revisada e proposta final equalizada para a rodada final de negociação",
            dueDate: new Date("2026-11-18"),
            assignedTo: users["Davi"].id,
            completed: false,
          },
        },
      ],
    },
    {
      companyName: "Yara Brasil Fertilizantes",
      projectName: "Complexo Industrial Paulínia - Nova Unidade de Mistura",
      segmentId: segments["Agronegócio"].id,
      ownerId: users["Antonio"].id,
      stage: "fechado_declinado",
      estimatedValue: 78000000,
      bidInvitationForecast: new Date("2026-09-30"),
      contacts: [
        {
          name: "Marcelo Fontes",
          email: "marcelo.fontes@yara.com",
          phone: "(19) 98322-9900",
          department: "Capex & Procurement Industrial",
          decisionRole: "Gestor do Projeto",
        },
      ],
      interactions: [
        {
          authorId: users["Antonio"].id,
          channel: "reuniao_presencial",
          summary:
            "Reunião presencial em Paulínia para apresentação de defesa técnica da nossa proposta de estruturas em concreto protendido e fundações profundas.",
          interactionDate: new Date("2026-10-10T14:00:00Z"),
          task: {
            title: "Equalização comercial preliminar com departamento de compras",
            dueDate: new Date("2026-10-17"),
            assignedTo: users["Antonio"].id,
            completed: true,
            completedAt: new Date("2026-10-17T11:00:00Z"),
          },
        },
        {
          authorId: users["Antonio"].id,
          channel: "ligacao",
          summary:
            "Feedback formal de encerramento da concorrência: o consórcio concorrente ofertou valor 12% abaixo da nossa margem mínima aceitável. Decisão estratégica de não cobrir preço para preservar a rentabilidade contratual.",
          interactionDate: new Date("2026-11-03T16:30:00Z"),
          task: {
            title:
              "Conduzir reunião de debriefing de lições aprendidas com a engenharia interna e registrar parâmetros de custo do concorrente",
            dueDate: new Date("2026-11-05"),
            assignedTo: users["Antonio"].id,
            completed: true,
            completedAt: new Date("2026-11-05T14:00:00Z"),
          },
        },
      ],
    },
    {
      companyName: "CCR Infraestrutura",
      projectName: "Duplicação e Obras de Arte Rodovia SP-330",
      segmentId: segments["Infraestrutura"].id,
      ownerId: users["Diretor"].id,
      stage: "contato_engenharia",
      estimatedValue: 150000000,
      bidInvitationForecast: new Date("2027-03-01"),
      contacts: [
        {
          name: "Dr. Henrique Viana",
          email: "henrique.viana@grupoccr.com.br",
          phone: "(11) 99912-3344",
          department: "Diretoria de Engenharia e Concessões Rodoviárias",
          decisionRole: "Diretor Responsável",
        },
      ],
      interactions: [
        {
          authorId: users["Diretor"].id,
          channel: "reuniao_presencial",
          summary:
            "Almoço executivo institucional com Dr. Henrique Viana. Tratamos dos planos de investimento do novo ciclo regulatório da concessionária para o lote rodoviário do interior paulista.",
          interactionDate: new Date("2026-11-06T12:30:00Z"),
          task: {
            title:
              "Encaminhar memorial de capacidade técnica em pontes e viadutos esconsos e agendar workshop técnico",
            dueDate: new Date("2026-11-17"),
            assignedTo: users["Diretor"].id,
            completed: false,
          },
        },
      ],
    },
    {
      companyName: "JHSF Participações",
      projectName: "Complexo Multiuso Parque da Cidade - Torre B e Mall",
      segmentId: segments["Shoppings & Varejo"].id,
      ownerId: users["Bia"].id,
      stage: "em_homologacao",
      estimatedValue: 95000000,
      bidInvitationForecast: new Date("2027-01-10"),
      contacts: [
        {
          name: "Juliana Paes",
          email: "jpaes@jhsf.com.br",
          phone: "(11) 98844-5566",
          department: "Suprimentos Estratégicos e Qualidade",
          decisionRole: "Compradora Sênior",
        },
      ],
      interactions: [
        {
          authorId: users["Bia"].id,
          channel: "reuniao_online",
          summary:
            "Apresentação corporativa online para a equipe de suprimentos da JHSF. Ênfase no padrão de acabamento refinado de áreas comuns e certificação ambiental Aqua.",
          interactionDate: new Date("2026-10-22T10:00:00Z"),
          task: {
            title: "Submeter documentação jurídica e fichas de acervo técnico",
            dueDate: new Date("2026-10-29"),
            assignedTo: users["Bia"].id,
            completed: true,
            completedAt: new Date("2026-10-29T15:00:00Z"),
          },
        },
        {
          authorId: users["Bia"].id,
          channel: "ligacao",
          summary:
            "Follow-up de homologação: documentos aprovados na área jurídica, pendente apenas validação final do comitê financeiro.",
          interactionDate: new Date("2026-11-07T14:15:00Z"),
          task: {
            title:
              "Checar parecer do comitê financeiro e obter número de registro ativo no cadastro de fornecedores JHSF",
            dueDate: new Date("2026-11-13"),
            assignedTo: users["Bia"].id,
            completed: false,
          },
        },
      ],
    },
  ];

  for (const pData of projectsData) {
    const { contacts, interactions, ...projectFields } = pData;

    // Criar o projeto
    const project = await prisma.project.create({
      data: projectFields,
    });

    // Criar os contatos do projeto
    const createdContacts: Record<string, string> = {};
    for (const c of contacts) {
      const contact = await prisma.clientContact.create({
        data: {
          ...c,
          projectId: project.id,
        },
      });
      createdContacts[c.name] = contact.id;
    }

    // Criar as interações e as respectivas tarefas agendadas (RN01)
    for (const inter of interactions) {
      const { task, ...interactionFields } = inter;

      const firstContactId = Object.values(createdContacts)[0] ?? null;

      const createdInter = await prisma.interactionLog.create({
        data: {
          ...interactionFields,
          projectId: project.id,
          contactId: firstContactId,
        },
      });

      // Toda interação gera obrigatoriamente a próxima ação agendada (RN01)
      if (task) {
        await prisma.taskSchedule.create({
          data: {
            ...task,
            projectId: project.id,
            interactionId: createdInter.id,
          },
        });
      }
    }

    console.log(`✓ Projeto criado: ${project.projectName} (${project.stage})`);
  }

  const totalUsers = await prisma.user.count();
  const totalSegments = await prisma.marketSegment.count();
  const totalProjects = await prisma.project.count();
  const totalContacts = await prisma.clientContact.count();
  const totalInteractions = await prisma.interactionLog.count();
  const totalTasks = await prisma.taskSchedule.count();

  console.log("\n================ SEED RESUMO ================");
  console.log(`Usuários: ${totalUsers}`);
  console.log(`Segmentos de Mercado: ${totalSegments}`);
  console.log(`Projetos / Obras: ${totalProjects}`);
  console.log(`Contatos / Stakeholders: ${totalContacts}`);
  console.log(`Interações Registradas: ${totalInteractions}`);
  console.log(`Tarefas Agendadas: ${totalTasks}`);
  console.log("=============================================\n");
  console.log("Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

