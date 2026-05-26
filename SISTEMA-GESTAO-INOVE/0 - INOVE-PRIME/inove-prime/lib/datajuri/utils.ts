export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
export function diasRestantes(dataFim: string): number {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const fim = new Date(dataFim); fim.setHours(0,0,0,0);
  return Math.ceil((fim.getTime() - hoje.getTime()) / (1000*60*60*24));
}
