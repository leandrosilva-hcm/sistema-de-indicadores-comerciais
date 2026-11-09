export const KANBAN_STAGES = [
  {
    id: "mapeamento_inicial",
    title: "Mapeamento Inicial / Prospecção",
    shortTitle: "Mapeamento Inicial",
    description: "Identificação do projeto e mapeamento de decisores",
    color: "border-t-slate-400",
    headerBg: "bg-slate-100 dark:bg-slate-900",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    dotColor: "bg-slate-400",
  },
  {
    id: "contato_engenharia",
    title: "Contato com Engenharia/Compras",
    shortTitle: "Contato Engenharia",
    description: "Abordagem com corpo técnico e suprimentos",
    color: "border-t-[#dc911b]/60",
    headerBg: "bg-[#dc911b]/10",
    badgeColor: "bg-[#dc911b]/15 text-[#9a600a] border-[#dc911b]/30 dark:bg-[#dc911b]/20 dark:text-[#f3b558] dark:border-[#dc911b]/40",
    dotColor: "bg-[#dc911b]",
  },
  {
    id: "em_homologacao",
    title: "Em Homologação / Vendor List",
    shortTitle: "Em Homologação",
    description: "Submissão de certidões, balanços e acervo técnico",
    color: "border-t-[#c47d12]",
    headerBg: "bg-[#c47d12]/15",
    badgeColor: "bg-[#c47d12]/20 text-[#834f05] border-[#c47d12]/40 dark:bg-[#c47d12]/30 dark:text-[#f3b558] dark:border-[#c47d12]/50",
    dotColor: "bg-[#c47d12]",
  },
  {
    id: "aguardando_carta",
    title: "Aguardando Carta Convite",
    shortTitle: "Aguardando Carta",
    description: "Homologado aguardando envio do edital/carta",
    color: "border-t-[#dc911b]",
    headerBg: "bg-[#dc911b]/20",
    badgeColor: "bg-[#dc911b] text-black border-[#c47d12] font-semibold",
    dotColor: "bg-black dark:bg-white",
  },
  {
    id: "proposta_apresentada",
    title: "Proposta Apresentada",
    shortTitle: "Proposta Apresentada",
    description: "Equalização técnica e negociação de margem/BDI",
    color: "border-t-black dark:border-t-white",
    headerBg: "bg-black/5 dark:bg-white/10",
    badgeColor: "bg-black text-white border-black font-semibold dark:bg-zinc-900 dark:text-white dark:border-zinc-700",
    dotColor: "bg-[#dc911b]",
  },
  {
    id: "fechado_declinado",
    title: "Fechado / Declinado",
    shortTitle: "Fechado / Declinado",
    description: "Negócio concluído ou declinado por margem/estratégia",
    color: "border-t-zinc-500",
    headerBg: "bg-zinc-100 dark:bg-zinc-900",
    badgeColor: "bg-zinc-200 text-zinc-800 border-zinc-400 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
    dotColor: "bg-zinc-500",
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

