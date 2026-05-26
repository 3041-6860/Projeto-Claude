import { syncNuvem } from "./sync";

const KEY = "gcj_equipe";

export type Cargo = "socio" | "advogado" | "estagiario" | "administrativo";

export interface Membro {
  id: string;
  nome: string;
  cargo: Cargo;
  oab?: string;
  email?: string;
  telefone?: string;
  especialidade?: string;
  ativo: boolean;
}

const DEFAULTS: Membro[] = [
  {
    id: "m1",
    nome: "Rodrigo Gonçalves",
    cargo: "socio",
    oab: "OAB/SC 29322",
    email: "rodrigo@gcj.adv.br",
    especialidade: "Direito Civil, Seguros, Trânsito",
    ativo: true,
  },
  {
    id: "m2",
    nome: "Sandra Cristina Otto",
    cargo: "socio",
    oab: "OAB/SC 61984",
    email: "operacional@gcj.adv.br",
    especialidade: "Direito Trabalhista, Societário",
    ativo: true,
  },
];

export function listarEquipe(): Membro[] {
  if (typeof window === "undefined") return [...DEFAULTS];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Membro[]) : [...DEFAULTS];
  } catch { return [...DEFAULTS]; }
}

export function salvarMembro(m: Membro): void {
  if (typeof window === "undefined") return;
  try {
    const lista: Membro[] = listarEquipe();
    const idx = lista.findIndex((x) => x.id === m.id);
    if (idx >= 0) lista[idx] = m; else lista.push(m);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}

export function removerMembro(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const lista = listarEquipe().filter((x) => x.id !== id);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}

export function listarAdvogados(): Membro[] {
  return listarEquipe().filter((m) => m.ativo && m.cargo !== "administrativo");
}

export function labelAdvogado(m: Membro): string {
  return m.oab ? `${m.nome} — ${m.oab}` : m.nome;
}
