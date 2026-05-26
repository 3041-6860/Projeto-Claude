import { syncNuvem } from "./sync";

const KEY = "gcj_tarefas";

export type PrioridadeTarefa = "alta" | "media" | "baixa";
export type StatusTarefa = "pendente" | "em_andamento" | "concluida";

export interface Tarefa {
  id: string;
  descricao: string;
  processoId?: string;
  processoNumero?: string;
  cliente?: string;
  advogado: string;
  prioridade: PrioridadeTarefa;
  status: StatusTarefa;
  dataVencimento: string;
  dataConclusao?: string;
  observacao?: string;
  createdAt: string;
}

export function listarTarefas(): Tarefa[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Tarefa[]) : [];
  } catch { return []; }
}

export function salvarTarefa(t: Tarefa): void {
  if (typeof window === "undefined") return;
  try {
    const lista: Tarefa[] = listarTarefas();
    const idx = lista.findIndex((x) => x.id === t.id);
    if (idx >= 0) lista[idx] = t; else lista.push(t);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}

export function removerTarefa(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const lista = listarTarefas().filter((x) => x.id !== id);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}

export function atualizarStatusTarefa(id: string, status: StatusTarefa): void {
  if (typeof window === "undefined") return;
  try {
    const lista: Tarefa[] = listarTarefas();
    const idx = lista.findIndex((x) => x.id === id);
    if (idx >= 0) {
      lista[idx].status = status;
      lista[idx].dataConclusao = status === "concluida" ? new Date().toISOString().split("T")[0] : undefined;
    }
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}
