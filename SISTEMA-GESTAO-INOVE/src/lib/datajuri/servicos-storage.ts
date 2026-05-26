import { syncNuvem } from "./sync";

const KEY = "gcj_servicos";

export type CategoriaServico = "contencioso" | "consultivo" | "preventivo" | "societario" | "trabalhista";

export interface Servico {
  id: string;
  nome: string;
  categoria: CategoriaServico;
  descricao: string;
  valorHora?: number;
  valorFixo?: number;
  ativo: boolean;
  createdAt: string;
}

export function listarServicos(): Servico[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Servico[]) : [];
  } catch { return []; }
}

export function salvarServico(s: Servico): void {
  if (typeof window === "undefined") return;
  try {
    const lista: Servico[] = listarServicos();
    const idx = lista.findIndex((x) => x.id === s.id);
    if (idx >= 0) lista[idx] = s; else lista.push(s);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}

export function removerServico(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const lista = listarServicos().filter((x) => x.id !== id);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}
