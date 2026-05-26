import { syncNuvem } from "./sync";

const KEY = "gcj_financeiro";

export type StatusHonorario = "pendente" | "pago" | "vencido" | "parcial";
export type TipoHonorario = "honorarios" | "despesas" | "custas" | "acordo";

export interface Honorario {
  id: string;
  cliente: string;
  processoId?: string;
  processoNumero?: string;
  descricao: string;
  tipo: TipoHonorario;
  valor: number;
  status: StatusHonorario;
  dataVencimento: string;
  dataPagamento?: string;
  valorPago?: number;
  observacao?: string;
  createdAt: string;
}

export function calcularStatusHonorario(h: Honorario): StatusHonorario {
  if (h.status === "pago") return "pago";
  if (h.status === "parcial") return "parcial";
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const venc = new Date(h.dataVencimento + "T00:00:00");
  return venc < hoje ? "vencido" : "pendente";
}

export function listarHonorarios(): Honorario[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Honorario[]).map((h) => ({ ...h, status: calcularStatusHonorario(h) }));
  } catch { return []; }
}

export function salvarHonorario(h: Honorario): void {
  if (typeof window === "undefined") return;
  try {
    const lista: Honorario[] = listarHonorarios();
    const idx = lista.findIndex((x) => x.id === h.id);
    if (idx >= 0) lista[idx] = h; else lista.push(h);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}

export function removerHonorario(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const lista = listarHonorarios().filter((x) => x.id !== id);
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}

export function registrarPagamento(id: string, valorPago: number, dataPagamento: string): void {
  if (typeof window === "undefined") return;
  try {
    const lista: Honorario[] = listarHonorarios();
    const idx = lista.findIndex((x) => x.id === id);
    if (idx < 0) return;
    const h = lista[idx];
    const totalPago = (h.valorPago ?? 0) + valorPago;
    lista[idx] = { ...h, valorPago: totalPago, dataPagamento, status: totalPago >= h.valor ? "pago" : "parcial" };
    localStorage.setItem(KEY, JSON.stringify(lista));
    syncNuvem(KEY, lista);
  } catch { /* ignore */ }
}
