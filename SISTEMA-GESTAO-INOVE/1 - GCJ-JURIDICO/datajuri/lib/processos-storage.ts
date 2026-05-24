import type { Processo } from "./mock-data";
import { syncNuvem } from "./sync";

export const PROCESSOS_STORAGE_KEY = "datajuri_processos_lista";

export function listarProcessos(): Processo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROCESSOS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Processo[]) : [];
  } catch { return []; }
}

export function salvarProcesso(p: Processo): void {
  const lista = listarProcessos();
  const idx = lista.findIndex((x) => x.id === p.id);
  if (idx >= 0) { lista[idx] = p; } else { lista.push(p); }
  try {
    localStorage.setItem(PROCESSOS_STORAGE_KEY, JSON.stringify(lista));
    syncNuvem(PROCESSOS_STORAGE_KEY, lista);
  } catch { /* ignore */ }
}

export function removerProcesso(id: string): void {
  const lista = listarProcessos().filter((x) => x.id !== id);
  try {
    localStorage.setItem(PROCESSOS_STORAGE_KEY, JSON.stringify(lista));
    syncNuvem(PROCESSOS_STORAGE_KEY, lista);
  } catch { /* ignore */ }
}
