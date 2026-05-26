// ─── STATUS / TIPO TYPES ────────────────────────────────────────────────────
export type StatusProcesso = "ativo" | "suspenso" | "arquivado" | "baixado" | "aguardando_baixa";
export type TipoProcesso = "civil" | "trabalhista" | "criminal" | "tributario" | "previdenciario" | "administrativo";
export type StatusPrazo = "pendente" | "cumprido" | "vencido" | "urgente";
export type TipoAudiencia = "instrucao" | "conciliacao" | "julgamento" | "despacho" | "pericia";
export type StatusAudiencia = "agendado" | "realizado" | "cancelado" | "adiado";
export type TipoHonorario = "honorarios" | "despesas" | "custas" | "acordo";
export type StatusHonorario = "pendente" | "pago" | "vencido" | "parcial";
export type TipoDocumento = "peticao" | "contrato" | "ata" | "laudo" | "decisao" | "recurso" | "procuracao" | "outros";
export type PrioridadeTarefa = "alta" | "media" | "baixa";
export type StatusTarefa = "pendente" | "em_andamento" | "concluida";
export type StatusCaso = "ativo" | "concluido" | "suspenso" | "arquivado";
export type TipoCaso = "consultoria" | "pre_contencioso" | "acordo" | "administrativo" | "trabalhista" | "societario";
export type StatusContrato = "vigente" | "encerrado" | "suspenso" | "renovacao";
export type TipoContrato = "honorarios_fixos" | "honorarios_exito" | "retainer" | "consulta_avulsa" | "prestacao_servicos";

// ─── INTERFACES ─────────────────────────────────────────────────────────────
export interface Cliente {
  id: string; nome: string; cpfCnpj: string; tipo: "pf" | "pj";
  email: string; telefone: string; celular?: string; whatsapp?: string;
  endereco: string; cep?: string; cidade?: string; estado?: string;
  segmento?: string; contato?: string; ativo: boolean; createdAt: string;
  observacao?: string;
}

export interface Processo {
  id: string; numero: string; clienteId: string; cliente: string;
  tribunal: string; vara: string; juiz?: string; tipo: TipoProcesso;
  status: StatusProcesso; fase: string; parteContraria: string;
  advogadoContrario?: string; advogadoResponsavel: string;
  dataDistribuicao: string; dataBaixa?: string;
  valorCausa: number; valorAcordado?: number; descricao: string; createdAt: string;
  comarca?: string;
  instancia?: string;
  classeProcessual?: string;
  parteAtiva?: string;
  advogadoAtivo?: string;
  movimentacoes?: { data: string; descricao: string }[];
  monitorar?: boolean;
}

export interface Prazo {
  id: string; processoId: string; numeroProcesso: string; cliente: string;
  descricao: string; tipo: "audiencia" | "peticao" | "recurso" | "pericia" | "outros";
  dataVencimento: string; status: StatusPrazo; observacao?: string; createdAt: string;
}

export interface Audiencia {
  id: string; processoId: string; processoNumero: string; cliente: string;
  tipo: TipoAudiencia; data: string; hora: string; local: string;
  sala?: string; status: StatusAudiencia; observacao?: string;
}

export interface Honorario {
  id: string; clienteId: string; cliente: string;
  processoId?: string; processoNumero?: string;
  descricao: string; tipo: TipoHonorario; valor: number;
  status: StatusHonorario; dataVencimento: string;
  dataPagamento?: string; valorPago?: number;
}

export interface Documento {
  id: string; nome: string; processoId?: string; processoNumero?: string;
  cliente: string; tipo: TipoDocumento; dataUpload: string; tamanho: string; autor: string;
}

export interface Tarefa {
  id: string; descricao: string; processoId?: string; processoNumero?: string;
  cliente?: string; advogado: string; prioridade: PrioridadeTarefa;
  status: StatusTarefa; dataVencimento: string; dataConclusao?: string; observacao?: string;
}

export interface Caso {
  id: string; titulo: string; clienteId: string; cliente: string;
  tipo: TipoCaso; status: StatusCaso; advogadoResponsavel: string;
  descricao: string; valorEstimado?: number; createdAt: string; dataFechamento?: string;
  resultado?: string;
}

export interface Contrato {
  id: string; clienteId: string; cliente: string; titulo: string;
  tipo: TipoContrato; valorMensal?: number; valorTotal?: number;
  dataInicio: string; dataFim?: string; status: StatusContrato;
  advogadoResponsavel: string; observacao?: string; renovacaoAutomatica?: boolean;
}

export interface Servico {
  id: string; nome: string; categoria: "contencioso" | "consultivo" | "preventivo" | "societario" | "trabalhista";
  descricao: string; valorHora?: number; valorFixo?: number; ativo: boolean;
}

// ─── DADOS ───────────────────────────────────────────────────────────────────
export const clientes: Cliente[] = [];
export const processos: Processo[] = [];
export const prazos: Prazo[] = [];
export const audiencias: Audiencia[] = [];
export const honorarios: Honorario[] = [];
export const documentos: Documento[] = [];
export const tarefas: Tarefa[] = [];
export const casos: Caso[] = [];
export const contratos: Contrato[] = [];
export const servicos: Servico[] = [];
