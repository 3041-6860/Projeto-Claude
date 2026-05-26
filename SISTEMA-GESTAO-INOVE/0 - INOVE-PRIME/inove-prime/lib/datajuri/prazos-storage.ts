import { syncNuvem } from "./sync";

const KEY = "gcj_prazos";

export type StatusPrazo = "pendente" | "urgente" | "vencido" | "cumprido";
export type TipoPrazo = "audiencia" | "peticao" | "recurso" | "pericia" | "outros";

export interface Prazo {
  id: string;
  processoId: string;
  numeroProcesso: string;
  cliente: string;
  descricao: string;
  tipo: TipoPrazo;
  dataVencimento: string;
  status: StatusPrazo;
  observacao?: string;
  createdAt: string;
}

export function calcularStatus(dataVencimento: string, statusAtual: StatusPrazo): StatusPrazo {
  if (statusAtual === "cumprido") return "cumprido";
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(dataVencimento + "T00:00:00");
  const diff = Math.ceil((venc.getTime() - hoje.getTime()) / 86400000);
  if (diff < 0) return "vencido";
  if (diff <= 7) return "urgente";
  return "pendente";
}

export function listarPrazos(): Prazo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Prazo[]).map((p) => ({
      ...p,
      status: calcularStatus(p.dataVencimento, p.status),
    }));
  } catch { return []; }
}

export function salvarPrazo(p: Prazo): void {
  if (typeof window === "undefined") return;
  try {
    const lista: Prazo[] = listarPrazos();
    const idx = lista.findIndex((x) => x.id === p.id);
    if (idx >= 0) lista[idx] = p; else lista.push(p);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}

export function removerPrazo(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const lista = listarPrazos().filter((x) => x.id !== id);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}

export function marcarCumprido(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const lista: Prazo[] = listarPrazos();
    const idx = lista.findIndex((x) => x.id === id);
    if (idx >= 0) lista[idx].status = "cumprido";
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}
