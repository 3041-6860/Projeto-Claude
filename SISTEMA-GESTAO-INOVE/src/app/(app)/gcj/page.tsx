"use client";
import { useState, useEffect } from "react";
import { listarProcessos } from "@/lib/datajuri/processos-storage";
import { listarPrazos } from "@/lib/datajuri/prazos-storage";
import { listarTarefas } from "@/lib/datajuri/tarefas-storage";
import { listarAudiencias } from "@/lib/datajuri/agenda-storage";
import { listarHonorarios } from "@/lib/datajuri/financeiro-storage";
import type { Prazo } from "@/lib/datajuri/prazos-storage";
import type { Tarefa } from "@/lib/datajuri/tarefas-storage";
import type { Audiencia } from "@/lib/datajuri/agenda-storage";
import { formatDate, formatCurrency, diasRestantes } from "@/lib/datajuri/utils";
import {
  FolderOpen, Users, Clock, AlertTriangle, TrendingUp, CheckCircle,
  ArrowRight, FileDown, Calendar, CheckSquare, CircleDollarSign,
} from "lucide-react";
import Link from "next/link";
import { DEFAULT_WIDGETS, WIDGETS_STORAGE_KEY, type WidgetKey } from "@/lib/datajuri/dashboard-widgets";

const statusLabel: Record<string, { label: string; color: string }> = {
  ativo:            { label: "Ativo",      color: "#16a34a" },
  suspenso:         { label: "Suspenso",   color: "#d97706" },
  arquivado:        { label: "Arquivado",  color: "#6b7280" },
  baixado:          { label: "Baixado",    color: "#6b7280" },
  aguardando_baixa: { label: "Ag. Baixa", color: "#d97706" },
};

const tipoAudienciaLabel: Record<string, string> = {
  instrucao: "Instrução", conciliacao: "Conciliação", julgamento: "Julgamento",
  despacho: "Despacho", pericia: "Perícia",
};

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
function MetricCard({
  label, value, sub, iconBg, icon: Icon,
}: {
  label: string; value: string | number; sub?: string;
  iconBg: string; icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: "#fff", border: "1px solid #e8dad3" }}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] truncate" style={{ color: "#555555" }}>{label}</p>
          <p className="text-xl font-bold mt-0.5 leading-none" style={{ color: "#111111" }}>{value}</p>
          {sub && <p className="text-[10px] mt-1 truncate" style={{ color: "#555555" }}>{sub}</p>}
        </div>
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18, color: "#8b2333" }} />
        </div>
      </div>
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
function Empty({ text }: { text: string }) {
  return (
    <p className="text-[11px] text-center py-6" style={{ color: "#555555" }}>{text}</p>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, href, linkLabel, children }: {
  title: string; icon: React.ElementType; href: string; linkLabel: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl" style={{ background: "#fff", border: "1px solid #e8dad3" }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "#f0e8e3" }}>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "#111111" }}>
          <Icon style={{ width: 13, height: 13, color: "#8b2333" }} />
          {title}
        </span>
        <Link href={href}>
          <span className="flex items-center gap-0.5 text-[10px] font-medium" style={{ color: "#8b2333" }}>
            {linkLabel} <ArrowRight style={{ width: 10, height: 10 }} />
          </span>
        </Link>
      </div>
      <div className="px-3 py-2 space-y-1">{children}</div>
    </div>
  );
}

// ─── ROW ITEM ─────────────────────────────────────────────────────────────────
function RowItem({ dotColor, main, sub, right, right2 }: {
  dotColor: string; main: string; sub?: string; right?: string; right2?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg" style={{ background: "#faf8f6" }}>
      <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium truncate" style={{ color: "#111111" }}>{main}</p>
        {sub && <p className="text-[10px] truncate" style={{ color: "#555555" }}>{sub}</p>}
      </div>
      <div className="text-right shrink-0">
        {right && <p className="text-[10px] font-medium" style={{ color: "#222222" }}>{right}</p>}
        {right2 && <p className="text-[10px] font-semibold" style={{ color: "#8b2333" }}>{right2}</p>}
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [widgets, setWidgets] = useState<Record<WidgetKey, boolean>>(DEFAULT_WIDGETS);
  const [processos, setProcessos] = useState<ReturnType<typeof listarProcessos>>([]);
  const [prazos, setPrazos] = useState<Prazo[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [audiencias, setAudiencias] = useState<Audiencia[]>([]);
  const [honorariosEmAberto, setHonorariosEmAberto] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WIDGETS_STORAGE_KEY);
      if (saved) setWidgets({ ...DEFAULT_WIDGETS, ...JSON.parse(saved) });
    } catch { /* ignore */ }
    setProcessos(listarProcessos());
    setPrazos(listarPrazos());
    setTarefas(listarTarefas());
    setAudiencias(listarAudiencias());
    const hon = listarHonorarios();
    setHonorariosEmAberto(
      hon.filter((h) => h.status === "pendente" || h.status === "vencido" || h.status === "parcial")
         .reduce((s, h) => s + (h.valor - (h.valorPago ?? 0)), 0)
    );
  }, []);

  const w = (key: WidgetKey) => widgets[key];

  // ── métricas ──
  const totalProcessos = processos.length;
  const processosAtivos = processos.filter((p) => p.status === "ativo").length;
  const processosAguardandoBaixa = processos.filter((p) => p.status === "aguardando_baixa").length;
  const totalClientes = new Set(processos.map((p) => p.cliente?.trim()).filter(Boolean)).size;
  const prazosUrgentes = prazos.filter((p) => p.status === "urgente").length;
  const prazosVencidos = prazos.filter((p) => p.status === "vencido").length;
  const tarefasPendentes = tarefas.filter((t) => t.status === "pendente" || t.status === "em_andamento").length;
  const tarefasAtrasadas = tarefas.filter((t) => t.status !== "concluida" && new Date(t.dataVencimento + "T00:00:00") < hoje).length;
  const proximasAudiencias = audiencias
    .filter((a) => a.status === "agendado" && a.data >= hoje.toISOString().split("T")[0])
    .sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora))
    .slice(0, 5);
  const totalValorCausa = processos
    .filter((p) => p.status === "ativo")
    .reduce((acc, p) => acc + (p.valorCausa ?? 0), 0);
  const recentesProcessos = [...processos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const metricsRow1 = [
    w("metricas_processos"), w("metricas_clientes"), w("metricas_honorarios"), w("metricas_valor"),
  ].filter(Boolean).length;
  const metricsRow2 = [w("prazos_urgentes"), w("tarefas_pendentes"), w("audiencias_count")].filter(Boolean).length;

  return (
    <div className="space-y-4 max-w-[1200px]">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-base font-bold" style={{ color: "#111111" }}>Dashboard</h1>
        <p className="text-[10px] mt-0.5" style={{ color: "#555555" }}>Gonçalves Consultoria Jurídica</p>
      </div>

      {/* Linha 1 — métricas principais */}
      {metricsRow1 > 0 && (
        <div className="grid gap-3 grid-cols-2" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))` }}>
          {w("metricas_processos") && (
            <MetricCard label="Processos Ativos" value={processosAtivos}
              sub={`${totalProcessos} total`} iconBg="#fef2f2" icon={FolderOpen} />
          )}
          {w("metricas_clientes") && (
            <MetricCard label="Clientes Ativos" value={totalClientes}
              sub={`${totalClientes} cadastrados`} iconBg="#eff6ff" icon={Users} />
          )}
          {w("metricas_honorarios") && (
            <MetricCard label="Honorários em Aberto" value={formatCurrency(honorariosEmAberto)}
              sub="a receber" iconBg="#fffbeb" icon={CircleDollarSign} />
          )}
          {w("metricas_valor") && (
            <MetricCard label="Valor em Causa" value={formatCurrency(totalValorCausa)}
              sub="processos ativos" iconBg="#f5f3ff" icon={TrendingUp} />
          )}
        </div>
      )}

      {/* Linha 2 — métricas secundárias */}
      {metricsRow2 > 0 && (
        <div className="grid gap-3 grid-cols-1" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))` }}>
          {w("prazos_urgentes") && (
            <MetricCard label="Prazos Urgentes" value={prazosUrgentes}
              sub={prazosVencidos > 0 ? `${prazosVencidos} vencido${prazosVencidos > 1 ? "s" : ""}` : undefined}
              iconBg="#fffbeb" icon={Clock} />
          )}
          {w("tarefas_pendentes") && (
            <MetricCard label="Tarefas Pendentes" value={tarefasPendentes}
              sub={tarefasAtrasadas > 0 ? `${tarefasAtrasadas} atrasada${tarefasAtrasadas > 1 ? "s" : ""}` : undefined}
              iconBg="#eef2ff" icon={CheckSquare} />
          )}
          {w("audiencias_count") && (
            <MetricCard label="Próximas Audiências" value={proximasAudiencias.length}
              sub="agendadas" iconBg="#f0f9ff" icon={Calendar} />
          )}
        </div>
      )}

      {/* Linha 3 — listas */}
      {(w("lista_prazos") || w("lista_audiencias")) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {w("lista_prazos") && (
            <SectionCard title="Prazos Próximos" icon={AlertTriangle} href="/gcj/prazos" linkLabel="Ver todos">
              {prazos.filter((p) => p.status !== "cumprido").length === 0
                ? <Empty text="Nenhum prazo cadastrado" />
                : prazos
                    .filter((p) => p.status !== "cumprido")
                    .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
                    .slice(0, 5)
                    .map((prazo) => {
                      const dias = diasRestantes(prazo.dataVencimento);
                      const cor = prazo.status === "vencido" ? "#dc2626" : prazo.status === "urgente" || dias <= 7 ? "#f59e0b" : "#8b2333";
                      return (
                        <RowItem key={prazo.id} dotColor={cor}
                          main={prazo.descricao} sub={prazo.cliente}
                          right={formatDate(prazo.dataVencimento)}
                          right2={prazo.status === "vencido" ? "Vencido" : dias === 0 ? "Hoje" : `${dias}d`}
                        />
                      );
                    })
              }
            </SectionCard>
          )}
          {w("lista_audiencias") && (
            <SectionCard title="Próximas Audiências" icon={Calendar} href="/gcj/agenda" linkLabel="Ver agenda">
              {proximasAudiencias.length === 0
                ? <Empty text="Nenhuma audiência agendada" />
                : proximasAudiencias.map((a) => {
                    const dias = Math.ceil((new Date(a.data).getTime() - hoje.getTime()) / 86400000);
                    return (
                      <RowItem key={a.id} dotColor={dias <= 3 ? "#8b2333" : "#0891b2"}
                        main={a.cliente} sub={`${tipoAudienciaLabel[a.tipo]} · ${a.local}`}
                        right={formatDate(a.data)}
                        right2={`${dias === 0 ? "Hoje" : `${dias}d`} · ${a.hora}`}
                      />
                    );
                  })
              }
            </SectionCard>
          )}
        </div>
      )}

      {/* Linha 4 — processos + tarefas */}
      {(w("lista_processos") || w("lista_tarefas")) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {w("lista_processos") && (
            <SectionCard title="Processos Recentes" icon={FolderOpen} href="/gcj/processos" linkLabel="Ver todos">
              {recentesProcessos.length === 0
                ? <Empty text="Nenhum processo cadastrado" />
                : recentesProcessos.map((processo) => {
                    const s = statusLabel[processo.status];
                    return (
                      <Link key={processo.id} href={`/datajuri/processos/${processo.id}`}>
                        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:opacity-80 transition-opacity" style={{ background: "#faf8f6" }}>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-mono truncate" style={{ color: "#8b2333" }}>{processo.numero}</p>
                            <p className="text-[11px] font-medium truncate" style={{ color: "#111111" }}>{processo.cliente}</p>
                          </div>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md shrink-0" style={{ background: "#fef2f2", color: s.color }}>
                            {s.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })
              }
            </SectionCard>
          )}
          {w("lista_tarefas") && (
            <SectionCard title="Tarefas Prioritárias" icon={CheckSquare} href="/gcj/tarefas" linkLabel="Ver todas">
              {tarefas.filter((t) => t.status !== "concluida").length === 0
                ? <Empty text="Nenhuma tarefa pendente" />
                : tarefas
                    .filter((t) => t.status !== "concluida")
                    .sort((a, b) => {
                      const p = { alta: 0, media: 1, baixa: 2 };
                      return p[a.prioridade] - p[b.prioridade] || new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime();
                    })
                    .slice(0, 5)
                    .map((t) => {
                      const dias = Math.ceil((new Date(t.dataVencimento).getTime() - hoje.getTime()) / 86400000);
                      const atrasada = dias < 0;
                      const prioColors = { alta: "#8b2333", media: "#d97706", baixa: "#6b7280" };
                      return (
                        <RowItem key={t.id} dotColor={prioColors[t.prioridade]}
                          main={t.descricao} sub={`${t.advogado}${t.cliente ? ` · ${t.cliente}` : ""}`}
                          right2={atrasada ? `${Math.abs(dias)}d atraso` : dias === 0 ? "Hoje" : `${dias}d`}
                        />
                      );
                    })
              }
            </SectionCard>
          )}
        </div>
      )}

      {/* Alerta baixa */}
      {w("alerta_baixa") && processosAguardandoBaixa > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "#fef3c7" }}>
              <FileDown style={{ width: 16, height: 16, color: "#b45309" }} />
            </div>
            <div>
              <p className="text-[11px] font-semibold" style={{ color: "#92400e" }}>
                {processosAguardandoBaixa} processo{processosAguardandoBaixa > 1 ? "s" : ""} aguardando baixa
              </p>
              <p className="text-[10px]" style={{ color: "#b45309" }}>Processos encerrados que precisam ser baixados no sistema</p>
            </div>
          </div>
          <Link href="/gcj/baixa">
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold" style={{ background: "#b45309", color: "#fff" }}>
              <CheckCircle style={{ width: 13, height: 13 }} />
              Realizar Baixa
            </button>
          </Link>
        </div>
      )}

      {/* Estado vazio geral */}
      {totalProcessos === 0 && totalClientes === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: "#fff", border: "1px dashed #e8dad3" }}>
          <FolderOpen style={{ width: 40, height: 40, color: "#e8dad3", marginBottom: 12 }} />
          <p className="text-sm font-semibold" style={{ color: "#222222" }}>Nenhum dado cadastrado</p>
          <p className="text-[11px] mt-1" style={{ color: "#555555" }}>Comece adicionando clientes e processos</p>
          <div className="flex gap-2 mt-4">
            <Link href="/gcj/clientes/novo">
              <button type="button" className="px-4 py-2 rounded-xl text-[11px] font-semibold" style={{ background: "#8b2333", color: "#fff" }}>
                Novo Cliente
              </button>
            </Link>
            <Link href="/gcj/processos/novo">
              <button type="button" className="px-4 py-2 rounded-xl text-[11px] font-semibold" style={{ background: "#faf8f6", color: "#4a3a34", border: "1px solid #e8dad3" }}>
                Novo Processo
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
