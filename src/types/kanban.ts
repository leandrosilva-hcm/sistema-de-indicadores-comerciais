export const KANBAN_STAGES = [
  {
    id: "mapeamento_inicial",
    title: "Mapeamento Inicial / Prospecção",
    shortTitle: "Mapeamento Inicial",
    description: "Identificação do projeto e mapeamento de decisores",
    color: "border-t-blue-500",
    headerBg: "bg-blue-500/10",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    dotColor: "bg-blue-500",
  },
  {
    id: "contato_engenharia",
    title: "Contato com Engenharia/Compras",
    shortTitle: "Contato Engenharia",
    description: "Abordagem com corpo técnico e suprimentos",
    color: "border-t-amber-500",
    headerBg: "bg-amber-500/10",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    dotColor: "bg-amber-500",
  },
  {
    id: "em_homologacao",
    title: "Em Homologação / Vendor List",
    shortTitle: "Em Homologação",
    description: "Submissão de certidões, balanços e acervo técnico",
    color: "border-t-orange-500",
    headerBg: "bg-orange-500/10",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
    dotColor: "bg-orange-500",
  },
  {
    id: "aguardando_carta",
    title: "Aguardando Carta Convite",
    shortTitle: "Aguardando Carta",
    description: "Homologado aguardando envio do edital/carta",
    color: "border-t-purple-500",
    headerBg: "bg-purple-500/10",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
    dotColor: "bg-purple-500",
  },
  {
    id: "proposta_apresentada",
    title: "Proposta Apresentada",
    shortTitle: "Proposta Apresentada",
    description: "Equalização técnica e negociação de margem/BDI",
    color: "border-t-emerald-500",
    headerBg: "bg-emerald-500/10",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    dotColor: "bg-emerald-500",
  },
  {
    id: "fechado_declinado",
    title: "Fechado / Declinado",
    shortTitle: "Fechado / Declinado",
    description: "Negócio concluído ou declinado por margem/estratégia",
    color: "border-t-slate-500",
    headerBg: "bg-slate-500/10",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    dotColor: "bg-slate-500",
  },
] as const;

export type StageId = (typeof KANBAN_STAGES)[number]["id"];

export type ProjectInteraction = {
  id: string;
  channel: string;
  summary: string;
  interactionDate: string | Date;
};

export type KanbanProject = {
  id: string;
  companyName: string;
  projectName: string;
  stage: string;
  estimatedValue: number | null;
  bidInvitationForecast: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  segment: {
    id: string;
    name: string;
  } | null;
  interactions: ProjectInteraction[];
  _count?: {
    interactions: number;
    tasks: number;
    contacts: number;
  };
};

export type FilterUser = {
  id: string;
  name: string;
  role: string;
};

export type FilterSegment = {
  id: string;
  name: string;
};

