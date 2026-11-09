# Sistema de Painel de Indicadores e Gestão de Prospecção Comercial

**Versão:** 1.0  
**Status:** Aprovado para Desenvolvimento  
**Stack Principal:** React / Next.js, TypeScript, Tailwind CSS, shadcn/ui, PostgreSQL / Supabase, Recharts, SheetJS (xlsx).

---

## 1. Visão Geral do Produto

Aplicação web corporativa interna desenvolvida sob medida para substituir planilhas isoladas de planejamento semanal e controles estáticos da equipe comercial de engenharia/obras. O sistema centraliza a operação diária dos executivos de contas (input de prospecções, mapeamento de decisores, histórico de reuniões e contatos) e alimenta automaticamente uma visão executiva em tempo real para a Diretoria Comercial.

### 1.1. Dores e Problemas a Resolver
* **Perda de timing comercial:** Chegar ao lançamento de Cartas Convite (licitações) sem ter homologado a empresa na *Vendor List* ou sem mapear decisores técnicos e de compras.
* **Esforço mal direcionado:** Abordagens realizadas em áreas fora do escopo sem redirecionamento ágil.
* **Falta de continuidade no funil:** Perda de negócios por ausência de follow-up sistemático. Toda ação precisa disparar uma reação agendada.
* **Dificuldade de mensuração de desempenho:** Falta de clareza sobre o volume real de novos projetos inseridos no funil e taxa de atividades (ligações, reuniões virtuais e presenciais).

### 1.2. Declaração de Posicionamento
* **Para:** A Diretoria Comercial e a equipe de prospecção e vendas.
* **Que precisam:** Mapear decisores em grandes empresas/obras, homologar a empresa em *Vendor Lists* para receber Cartas Convite e acompanhar a evolução diária das tratativas.
* **O produto é:** Sistema web interno de gestão de pipeline comercial (Kanban) e dashboard analítico de produtividade.
* **Que:** Centraliza projetos e contatos, preserva linha do tempo imutável de tratativas, impõe a regra de Ação e Reação e gera indicadores consolidados.
* **Diferente de:** Planilhas desconectadas ou CRMs genéricos e engessados (ex: Ploomes).
* **Nosso produto:** É desenhado sob medida para o fluxo de engenharia civil/industrial, sem custos de licenciamento por usuário e com total portabilidade de dados em Excel.

---

## 2. Atores do Sistema

| Ator | Papel e Responsabilidades |
| :--- | :--- |
| **Diretor Comercial** | Gestor e prospector ativo. Acompanha indicadores consolidados por consultor, inspeciona o histórico completo de negociações, redistribui oportunidades e cadastra suas próprias prospecções. |
| **Executivos Comerciais** | Usuários de rotina (Antonio, Bia, Sérgio, Davi, Pocai). Cadastram empresas/projetos, registram tratativas, movimentam o Kanban e cumprem a agenda semanal planejada vs. executada. |
| **Gestão de Apoio / Operações** | Auditoria operacional, apoio aos dados de entrada e extração de relatórios gerenciais em planilhas Excel. |
| **Administrador / Tech Lead** | Responsável técnico pela infraestrutura, ajustes de categorias/segmentos e evolução contínua da aplicação. |

---

## 3. Regras de Negócio Inegociáveis (RN)

* **RN01 - Princípio da Ação e Reação:** Nenhum registro de contato com cliente ativo pode ser salvo sem o agendamento obrigatório de uma próxima ação (com data de retorno e objetivo da abordagem).
* **RN02 - Imutabilidade do Histórico:** Os registros de interações (`interaction_logs`) são estritamente cumulativos. O sistema deve evidenciar visualmente a "última tratativa" para leitura rápida, porém nenhuma interação prévia pode ser editada ou sobrescrita.
* **RN03 - Convergência para Projeto:** Mesmo que uma prospecção comece em nível institucional (ex: Cargill), todo o fluxo deve convergir e se vincular a **Projetos ou Obras específicas** com previsão orçamentária e de Carta Convite.
* **RN04 - Ownership Obrigatório:** Todo projeto, contato e interação deve conter o registro explícito de autoria e responsabilidade vinculado a um dos membros do time comercial.

---

## 4. Requisitos Funcionais (RF)

| ID | Requisito Funcional | Descrição Detalhada |
| :--- | :--- | :--- |
| **RF01** | **Cadastro de Projetos/Obras** | Cadastrar oportunidades por Empresa ou Obra específica (ex: "Shopping Iguatemi Brasília - R$ 200M"), com segmento de atuação, valor estimado e previsão de Carta Convite. |
| **RF02** | **Banco de Contatos por Projeto** | Vincular múltiplos decisores a uma empresa/projeto (nome, e-mail, telefone, setor técnico/compras e papel na tomada de decisão). |
| **RF03** | **Registro de Interações (Timeline)** | Registrar cada contato realizado: data, responsável interno, decisor contatado, canal (Ligação, Reunião Online, Reunião Presencial/Café) e relato descritivo detalhado. |
| **RF04** | **Gatilho de Agendamento Futuro** | Bloquear o envio da interação se os campos de "Próxima Ação" (Data de Follow-up e Descrição da Ação) não forem preenchidos (atendendo à RN01). |
| **RF05** | **Quadro Kanban de Estágios** | Visualização em colunas: *Mapeamento Inicial / Prospecção*, *Contato com Engenharia/Compras*, *Em Homologação / Vendor List*, *Aguardando Carta Convite*, *Proposta Apresentada*, *Fechado / Declinado*. |
| **RF06** | **Agenda Semanal (Planejado vs. Executado)** | Painel de controle individual onde o comercial visualiza as tarefas agendadas para a semana e marca o status de conclusão. |
| **RF07** | **Dashboard Executivo de Indicadores** | Exibir cartões de métricas: Total de Projetos Ativos, Taxa de Novos Projetos, Volume de Interações por Tipo (Gráficos), Distribuição por Segmento. Filtros por período e por comercial. |
| **RF08** | **Rastreabilidade e Autoria** | Identificar em cada registro o autor do input (Antonio, Bia, Sérgio, Davi, Pocai ou Diretor). |
| **RF09** | **Exportação para Excel** | Botão de exportação imediata das bases de projetos, contatos e interações para `.xlsx` e `.csv`. |
| **RF10** | **Parametrização de Segmentos** | Tela administrativa simples para inclusão e edição de segmentos de mercado (ex: Shoppings, Agronegócio, Galpões Logísticos). |

---

## 5. Requisitos Não Funcionais (RFN)

* **RFN01 - Simplicidade de Interface:** Design limpo, focado em agilidade operacional, sem formulários longos em páginas separadas (priorizar Drawers laterais e Modais).
* **RFN02 - Integridade Relacional:** Persistência estrita em banco de dados relacional com integridade referencial em cascata controlada.
* **RFN03 - Acesso Simultâneo e Nuvem:** Aplicação web responsiva, acessível via browser por múltiplos usuários simultâneos.
* **RFN04 - Arquitetura Desacoplada e Modular:** Código limpo e componentizado para facilitar alterações semanais de regras e colunas.

---

## 6. Modelo de Dados Relacional Sugerido

```sql
-- Tabela de Usuários / Comerciais
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'comercial', -- 'diretor', 'comercial', 'operacoes'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Segmentos de Mercado
CREATE TABLE market_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- Projetos e Obras
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(150) NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    segment_id UUID REFERENCES market_segments(id),
    owner_id UUID REFERENCES users(id) NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'mapeamento_inicial',
    estimated_value DECIMAL(14,2),
    bid_invitation_forecast DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contatos / Stakeholders do Cliente
CREATE TABLE client_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50),
    department VARCHAR(100),
    decision_role VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórico de Interações (Imutável)
CREATE TABLE interaction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) NOT NULL,
    contact_id UUID REFERENCES client_contacts(id),
    channel VARCHAR(50) NOT NULL, -- 'ligacao', 'reuniao_online', 'reuniao_presencial'
    summary TEXT NOT NULL,
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agenda de Próximas Ações (Motor Ação e Reação)
CREATE TABLE tasks_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) NOT NULL,
    interaction_id UUID REFERENCES interaction_logs(id),
    title VARCHAR(200) NOT NULL,
    due_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```