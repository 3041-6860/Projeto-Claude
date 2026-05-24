import { syncNuvem } from "./sync";

const KEY = "gcj_contratos";

export type StatusContrato = "vigente" | "encerrado" | "suspenso" | "renovacao";
export type TipoContrato = "honorarios_fixos" | "honorarios_exito" | "retainer" | "consulta_avulsa" | "prestacao_servicos";

export interface Contrato {
  id: string;
  cliente: string;
  titulo: string;
  tipo: TipoContrato;
  valorMensal?: number;
  valorTotal?: number;
  dataInicio: string;
  dataFim?: string;
  status: StatusContrato;
  advogadoResponsavel: string;
  observacao?: string;
  renovacaoAutomatica?: boolean;
  createdAt: string;
}

export function listarContratos(): Contrato[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Contrato[]) : [];
  } catch { return []; }
}

export function salvarContrato(c: Contrato): void {
  if (typeof window === "undefined") return;
  try {
    const lista: Contrato[] = listarContratos();
    const idx = lista.findIndex((x) => x.id === c.id);
    if (idx >= 0) lista[idx] = c; else lista.push(c);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}

export function removerContrato(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const lista = listarContratos().filter((x) => x.id !== id);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}
