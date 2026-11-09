# Metodologia de Vibe Coding com Google Antigravity & Gemini

Este guia apresenta o passo a passo operacional para construir o **Sistema de Painel de Indicadores Comerciais** utilizando agentes autônomos no ambiente Google Antigravity.

---

## 1. Princípios do Vibe Coding com Agentes

1. **Você é o Arquiteto, o Agente é o Construtor:** Não escreva código manualmente. Especifique com clareza, inspecione as entregas e valide os requisitos.
2. **Fatias Verticais (Vertical Slices):** Nunca peça "crie o sistema completo". Peça uma funcionalidade completa de ponta a ponta (banco, rota e UI) por vez.
3. **Iteração por Checkpoint:** A cada funcionalidade testada e aprovada, faça um commit no Git antes de passar para a próxima. Se o agente quebrar o código depois, reverta com segurança.
4. **Alimentação de Contexto Constante:** Sempre referencie o arquivo `docs/PRD.md` nas instruções para que o agente mantenha fidelidade às regras de negócio.

---

## 2. Preparação do Ambiente no Antigravity

1. Abra o **Google Antigravity** e crie um novo Workspace apontando para a pasta raiz do seu projeto.
2. Certifique-se de que o arquivo `docs/PRD.md` está salvo na raiz.
3. Crie na raiz do repositório o arquivo de diretrizes para o agente (`AGENTS.md` ou `GEMINI_INSTRUCTIONS.md`).

---

## 3. Roteiro de Prompts Prontos (Passo a Passo)

Copie e cole os prompts abaixo em sequência no Antigravity, aguardando a conclusão e testando cada etapa.

### Etapa 1: Inicialização da Arquitetura e Monorepo
> **Prompt 1:**
> "Leia atentamente o arquivo `docs/PRD.md`. Crie a estrutura inicial de um projeto web moderno full-stack usando Next.js 14+ (App Router), TypeScript e Tailwind CSS. Configure os componentes do shadcn/ui (Button, Dialog, Drawer, Card, Badge, Table, Input, Select). Crie o layout principal com uma barra lateral de navegação contendo os links: Kanban, Linha do Tempo, Agenda Semanal e Dashboard Gerencial. Rode o servidor de desenvolvimento e garanta que não há erros de inicialização."

---

### Etapa 2: Banco de Dados e Carga Inicial (Seed)
> **Prompt 2:**
> "Com base na seção 6 do `docs/PRD.md`, configure o modelo de dados usando Prisma ORM com SQLite para desenvolvimento local (com schema compatível com PostgreSQL para produção futura). Gere as tabelas: `users`, `market_segments`, `projects`, `client_contacts`, `interaction_logs` e `tasks_schedule`.
> Em seguida, crie um script de seed que cadastre:
> 1. Os usuários comerciais: Antonio, Bia, Sérgio, Davi, Pocai e Diretor Comercial.
> 2. 4 segmentos de mercado (ex: Logística, Agronegócio, Infraestrutura, Shoppings).
> 3. 8 projetos distribuídos pelas etapas do funil com histórico de interações realistas e tarefas agendadas.
> Execute a migração e rode o seed."

---

### Etapa 3: Quadro Kanban de Oportunidades (RF05, PB05)
> **Prompt 3:**
> "Implemente a tela principal do Kanban em `/kanban`.
> Requisitos:
> - Exibir as colunas conforme o RF05 do `docs/PRD.md`.
> - Utilizar `@hello-pangea/dnd` ou biblioteca similar para permitir arrastar os cards entre as colunas, atualizando o estágio no banco de dados.
> - No card, exibir: Nome do Projeto, Empresa, Segmento, Responsável, Valor Estimado e a data da última interação.
> - Adicionar um filtro no topo da página por Consultor Comercial e por Segmento.
> Teste o drag and drop e valide no navegador."

---

### Etapa 4: Linha do Tempo e Regra de Ação e Reação (RF03, RF04, RN01, RN02)
> **Prompt 4:**
> "No Kanban, ao clicar em um card de projeto, abra um Drawer lateral interativo contendo:
> 1. Cabeçalho com dados resumidos do projeto e botão para cadastrar novos contatos (stakeholders).
> 2. Card de destaque no topo exibindo a 'Última Tratativa Realizada' (RN02).
> 3. Linha do tempo cronológica com todas as interações anteriores (imutáveis).
> 4. Formulário para adicionar nova interação: tipo de contato (Ligação, Reunião Online, Reunião Presencial), resumo do contato e decisor contatado.
> 5. **Validação Obrigatória (RN01):** O formulário só pode ser salvo se o usuário preencher a 'Próxima Ação' (Data de Retorno e Objetivo do Próximo Contato). Ao salvar, registre o log e crie o registro na tabela `tasks_schedule`."

---

### Etapa 5: Agenda Semanal (Planejado vs. Executado - RF06, PB07) <---
> **Prompt 5:**
> "Implemente a página de Agenda Semanal em `/agenda`.
> Requisitos:
> - Listar as tarefas de 'Reação' (`tasks_schedule`) agendadas para a semana corrente.
> - Filtro por comercial responsável.
> - Checkbox para marcar a tarefa como 'Concluída'.
> - Ao concluir a tarefa, atualizar a data de conclusão no banco e disparar um modal opcional sugerindo o registro do resultado dessa ação."

---

### Etapa 6: Dashboard Executivo de Indicadores (RF07, PB06, PB09)
> **Prompt 6:**
> "Construa a página de Dashboard Gerencial em `/dashboard` utilizando Recharts.
> Componentes visuais necessários:
> 1. Quatro Cards de KPI no topo: Total de Projetos Ativos, Novos Projetos no Mês, Total de Interações na Semana, Reuniões Presenciais Realizadas.
> 2. Gráfico de Barras: Produtividade por Comercial (distribuição de ligações vs. reuniões online vs. reuniões presenciais para Antonio, Bia, Sérgio, Davi e Pocai).
> 3. Gráfico de Pizza/Rosca: Distribuição de Projetos por Segmento de Mercado.
> 4. Filtro global no topo da página por Período (Esta Semana, Este Mês, Trimestre) e por Comercial."

---

### Etapa 7: Exportação para Planilha Excel (RF09, PB08)
> **Prompt 7:**
> "Adicione a funcionalidade de exportação de dados usando a biblioteca `xlsx` (SheetJS).
> Adicione um botão 'Exportar Dados (.xlsx)' no cabeçalho do Dashboard e da lista de projetos.
> O arquivo gerado deve conter 3 abas na mesma planilha:
> - Aba 1: Projetos e Status Atual.
> - Aba 2: Banco de Decisores e Contatos.
> - Aba 3: Histórico Completo de Interações e Agendamentos."

---

## 4. Como Tratar Erros Durante o Vibe Coding

* **Erro de compilação ou TypeScript:** Peça diretamente ao agente:  
  *"Leia o erro no terminal referente ao arquivo X e corrija a tipagem sem alterar a regra de negócio do PRD."*
* **Comportamento fora do especificado:** Aponte a regra de negócio violada:  
  *"O sistema permitiu salvar o contato sem preencher a próxima ação. Corrija o formulário e a Server Action para impor a regra RN01 do `docs/PRD.md`."*
* **Design inconsistente:**  
  *"Refatore os formulários e cards desta página usando exclusivamente classes do Tailwind e a paleta sóbria do shadcn/ui."*