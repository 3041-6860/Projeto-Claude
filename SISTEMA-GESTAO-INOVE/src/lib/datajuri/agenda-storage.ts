import { syncNuvem } from "./sync";

const KEY = "gcj_agenda";

export type TipoAudiencia = "instrucao" | "conciliacao" | "julgamento" | "despacho" | "pericia";
export type StatusAudiencia = "agendado" | "realizado" | "cancelado" | "adiado";

export interface Audiencia {
  id: string;
  processoId: string;
  processoNumero: string;
  cliente: string;
  tipo: TipoAudiencia;
  data: string;
  hora: string;
  local: string;
  sala?: string;
  status: StatusAudiencia;
  observacao?: string;
  createdAt: string;
}

export function listarAudiencias(): Audiencia[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Audiencia[]) : [];
  } catch { return []; }
}

export function salvarAudiencia(a: Audiencia): void {
  if (typeof window === "undefined") return;
  try {
    const lista: Audiencia[] = listarAudiencias();
    const idx = lista.findIndex((x) => x.id === a.id);
    if (idx >= 0) lista[idx] = a; else lista.push(a);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}

export function removerAudiencia(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const lista = listarAudiencias().filter((x) => x.id !== id);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}
