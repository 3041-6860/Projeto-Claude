import { syncNuvem } from "./sync";

const KEY = "gcj_documentos";

export type TipoDocumento = "peticao" | "contrato" | "ata" | "laudo" | "decisao" | "recurso" | "procuracao" | "outros";

export interface Documento {
  id: string;
  nome: string;
  tipo: TipoDocumento;
  cliente: string;
  processoId?: string;
  processoNumero?: string;
  tamanho: string;
  autor: string;
  dataUpload: string;
  observacao?: string;
}

export function listarDocumentos(): Documento[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Documento[]) : [];
  } catch { return []; }
}

export function salvarDocumento(d: Documento): void {
  if (typeof window === "undefined") return;
  try {
    const lista: Documento[] = listarDocumentos();
    const idx = lista.findIndex((x) => x.id === d.id);
    if (idx >= 0) lista[idx] = d; else lista.push(d);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}

export function removerDocumento(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const lista = listarDocumentos().filter((x) => x.id !== id);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
