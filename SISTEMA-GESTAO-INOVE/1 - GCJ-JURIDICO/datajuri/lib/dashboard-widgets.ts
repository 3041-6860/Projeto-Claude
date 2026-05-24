export type WidgetKey =
  | "metricas_processos" | "metricas_clientes" | "metricas_honorarios" | "metricas_valor"
  | "prazos_urgentes" | "tarefas_pendentes" | "audiencias_count"
  | "lista_prazos" | "lista_audiencias" | "lista_processos" | "lista_tarefas"
  | "alerta_baixa";

export const WIDGET_LABELS: Record<WidgetKey, string> = {
  metricas_processos:  "Card — Processos Ativos",
  metricas_clientes:   "Card — Clientes Ativos",
  metricas_honorarios: "Card — Honorários em Aberto",
  metricas_valor:      "Card — Valor em Causa",
  prazos_urgentes:     "Card — Prazos Urgentes",
  tarefas_pendentes:   "Card — Tarefas Pendentes",
  audiencias_count:    "Card — Próximas Audiências",
  lista_prazos:        "Lista — Prazos Próximos",
  lista_audiencias:    "Lista — Agenda de Audiências",
  lista_processos:     "Lista — Processos Recentes",
  lista_tarefas:       "Lista — Tarefas Prioritárias",
  alerta_baixa:        "Alerta — Processos p/ Baixa",
};

export const WIDGET_GROUPS: { title: string; keys: WidgetKey[] }[] = [
  {
    title: "Cards de métricas",
    keys: ["metricas_processos", "metricas_clientes", "metricas_honorarios", "metricas_valor"],
  },
  {
    title: "Cards de resumo",
    keys: ["prazos_urgentes", "tarefas_pendentes", "audiencias_count"],
  },
  {
    title: "Listas detalhadas",
    keys: ["lista_prazos", "lista_audiencias", "lista_processos", "lista_tarefas"],
  },
  {
    title: "Alertas",
    keys: ["alerta_baixa"],
  },
];

export const DEFAULT_WIDGETS: Record<WidgetKey, boolean> = {
  metricas_processos: true, metricas_clientes: true,
  metricas_honorarios: true, metricas_valor: true,
  prazos_urgentes: true, tarefas_pendentes: true, audiencias_count: true,
  lista_prazos: true, lista_audiencias: true,
  lista_processos: true, lista_tarefas: true,
  alerta_baixa: true,
};

export const WIDGETS_STORAGE_KEY = "datajuri_dashboard_widgets";
