"use client";
import { useState, useEffect } from "react";
import {
  Plus, CheckSquare, Clock, Circle, User, AlertCircle,
  Settings2, X, ChevronRight, FolderOpen, FileText,
  Save, Trash2, Edit2,
} from "lucide-react";
import Link from "next/link";
import { listarTarefas, salvarTarefa, removerTarefa, atualizarStatusTarefa } from "@/lib/datajuri/tarefas-storage";
import type { Tarefa, PrioridadeTarefa, StatusTarefa } from "@/lib/datajuri/tarefas-storage";
import { listarProcessos } from "@/lib/datajuri/processos-storage";
import { listarAdvogados, labelAdvogado } from "@/lib/datajuri/equipe-storage";
import type { Processo } from "@/lib/datajuri/mock-data";
import type { Membro } from "@/lib/datajuri/equipe-storage";

// ─── CONFIGS ─────────────────────────────────────────────────────────────────

const PRIO_CFG: Record<PrioridadeTarefa, { label: string; color: string; bg: string }> = {
  alta:  { label: "Alta",  color: "var(--gcj-red)", bg: "#fef2f4" },
  media: { label: "Média", color: "#d97706", bg: "#fffbeb" },
  baixa: { label: "Baixa", color: "#6b7280", bg: "#f3f4f6" },
};

const STATUS_CFG: Record<StatusTarefa, { label: string; icon: React.ElementType; color: string }> = {
  pendente:     { label: "Pendente",     icon: Circle,      color: "#d97706" },
  em_andamento: { label: "Em andamento", icon: Clock,       color: "#2563eb" },
  concluida:    { label: "Concluída",    icon: CheckSquare, color: "#16a34a" },
};

type ColKey = "prioridade" | "status" | "advogado" | "cliente" | "processo" | "vencimento" | "observacao";
const COLUNAS: { key: ColKey; label: string }[] = [
  { key: "prioridade", label: "Prioridade" }, { key: "status",    label: "Status" },
  { key: "advogado",   label: "Advogado" },   { key: "cliente",   label: "Cliente" },
  { key: "processo",   label: "Processo" },   { key: "vencimento",label: "Vencimento" },
  { key: "observacao", label: "Observação" },
];

function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] mb-1.5" style={{ color: "var(--text-muted)" }}>
      {children}{required && <span className="ml-0.5" style={{ color: "var(--gcj-red)" }}>*</span>}
    </label>
  );
}

function Inp(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none transition-colors"
      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#111"; props.onFocus?.(e); }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; props.onBlur?.(e); }}
    />
  );
}

function Sel({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select {...props}
      className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none"
      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
      {children}
    </select>
  );
}

// ─── MODAL FORM ───────────────────────────────────────────────────────────────

interface ModalProps {
  tarefa?: Tarefa | null;
  processos: Processo[];
  advogados: Membro[];
  onSave: (t: Tarefa) => void;
  onClose: () => void;
}

const FORM_VAZIO = {
  descricao: "", processoId: "", processoNumero: "", cliente: "",
  advogado: "", prioridade: "media" as PrioridadeTarefa,
  status: "pendente" as StatusTarefa, dataVencimento: "", observacao: "",
};

function Modal({ tarefa, processos, advogados, onSave, onClose }: ModalProps) {
  const [form, setForm] = useState(() =>
    tarefa
      ? { descricao: tarefa.descricao, processoId: tarefa.processoId ?? "",
          processoNumero: tarefa.processoNumero ?? "", cliente: tarefa.cliente ?? "",
          advogado: tarefa.advogado, prioridade: tarefa.prioridade, status: tarefa.status,
          dataVencimento: tarefa.dataVencimento, observacao: tarefa.observacao ?? "" }
      : { ...FORM_VAZIO }
  );

  function upd(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleProcesso(e: React.ChangeEvent<HTMLSelectElement>) {
    const proc = processos.find((p) => p.id === e.target.value);
    if (proc) setForm((f) => ({ ...f, processoId: proc.id, processoNumero: proc.numero, cliente: proc.cliente }));
    else setForm((f) => ({ ...f, processoId: "", processoNumero: "", cliente: "" }));
  }

  function handleSave() {
    if (!form.descricao.trim() || !form.dataVencimento) return;
    onSave({
      id: tarefa?.id ?? `tar_${Date.now()}`,
      descricao: form.descricao.trim(),
      processoId: form.processoId || undefined,
      processoNumero: form.processoNumero || undefined,
      cliente: form.cliente || undefined,
      advogado: form.advogado,
      prioridade: form.prioridade,
      status: form.status,
      dataVencimento: form.dataVencimento,
      dataConclusao: tarefa?.dataConclusao,
      observacao: form.observacao.trim() || undefined,
      createdAt: tarefa?.createdAt ?? new Date().toISOString(),
    });
  }

  const valido = form.descricao.trim() && form.dataVencimento;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl" style={{ background: "#fff" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
          <h2 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
            {tarefa ? "Editar Tarefa" : "Nova Tarefa"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-60 transition-opacity">
            <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <Label required>Descrição</Label>
            <Inp name="descricao" value={form.descricao} onChange={upd} placeholder="Descreva a tarefa..." />
          </div>

          <div>
            <Label>Processo vinculado</Label>
            <Sel name="processoId" value={form.processoId} onChange={handleProcesso}>
              <option value="">Sem processo vinculado</option>
              {processos.map((p) => (
                <option key={p.id} value={p.id}>{p.numero} — {p.cliente}</option>
              ))}
            </Sel>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Advogado responsável</Label>
              <Sel name="advogado" value={form.advogado} onChange={upd}>
                <option value="">Selecione...</option>
                {advogados.map((m) => (
                  <option key={m.id} value={m.nome}>{labelAdvogado(m)}</option>
                ))}
              </Sel>
            </div>
            <div>
              <Label required>Vencimento</Label>
              <Inp type="date" name="dataVencimento" value={form.dataVencimento} onChange={upd} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Prioridade</Label>
              <Sel name="prioridade" value={form.prioridade} onChange={upd}>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </Sel>
            </div>
            <div>
              <Label>Status</Label>
              <Sel name="status" value={form.status} onChange={upd}>
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em andamento</option>
                <option value="concluida">Concluída</option>
              </Sel>
            </div>
          </div>

          <div>
            <Label>Observação</Label>
            <textarea name="observacao" value={form.observacao} onChange={upd} rows={2}
              placeholder="Informações adicionais..."
              className="w-full px-3 py-2 text-[12px] rounded-lg resize-none focus:outline-none transition-colors"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#111"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: "var(--border-light)" }}>
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] font-medium"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!valido}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-semibold transition-opacity disabled:opacity-40"
            style={{ background: "var(--gcj-red)", color: "#fff" }}>
            <Save className="h-3.5 w-3.5" />
            {tarefa ? "Salvar alterações" : "Criar tarefa"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAINEL DE DETALHE ────────────────────────────────────────────────────────

function DetalhePanel({ tarefa, onClose, onStatusChange, onEdit, onDelete }: {
  tarefa: Tarefa;
  onClose: () => void;
  onStatusChange: (id: string, s: StatusTarefa) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const p = PRIO_CFG[tarefa.prioridade];
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dias = Math.ceil((new Date(tarefa.dataVencimento + "T00:00:00").getTime() - hoje.getTime()) / 86400000);
  const atrasada = tarefa.status !== "concluida" && dias < 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--border-light)" }}>
        <p className="text-[12px] font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>{tarefa.descricao}</p>
        <button onClick={onClose} className="p-1 rounded hover:opacity-60 transition-opacity shrink-0">
          <X className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Status</p>
          <div className="flex gap-1.5 flex-wrap">
            {(Object.entries(STATUS_CFG) as [StatusTarefa, typeof STATUS_CFG[StatusTarefa]][]).map(([key, cfg]) => (
              <button key={key} onClick={() => onStatusChange(tarefa.id, key)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                style={tarefa.status === key
                  ? { background: cfg.color, color: "#fff" }
                  : { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                <cfg.icon className="h-3 w-3" />
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Prioridade</p>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ color: p.color, background: p.bg }}>{p.label}</span>
        </div>

        {tarefa.advogado && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Advogado responsável</p>
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-primary)" }}>
              <User className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
              {tarefa.advogado}
            </div>
          </div>
        )}

        {tarefa.cliente && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Cliente</p>
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-primary)" }}>
              <User className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
              {tarefa.cliente}
            </div>
          </div>
        )}

        {tarefa.processoNumero && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Processo</p>
            <Link href={`/datajuri/processos/${tarefa.processoId}`}
              className="flex items-center gap-1.5 text-[11px] hover:underline" style={{ color: "var(--gcj-red)" }}>
              <FolderOpen className="h-3.5 w-3.5" />
              {tarefa.processoNumero}
            </Link>
          </div>
        )}

        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Vencimento</p>
          <p className="text-[11px] font-medium" style={{ color: atrasada ? "var(--gcj-red)" : "var(--text-primary)" }}>
            {atrasada
              ? `⚠ Atrasada ${Math.abs(dias)} dia${Math.abs(dias) !== 1 ? "s" : ""}`
              : dias === 0 ? "Vence hoje"
              : `${formatDate(tarefa.dataVencimento)} (${dias}d)`}
          </p>
        </div>

        {tarefa.dataConclusao && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Concluída em</p>
            <p className="text-[11px] font-medium" style={{ color: "#16a34a" }}>{formatDate(tarefa.dataConclusao)}</p>
          </div>
        )}

        {tarefa.observacao && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Observações</p>
            <div className="flex items-start gap-1.5">
              <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }} />
              <p className="text-[11px] italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>{tarefa.observacao}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t flex gap-2" style={{ borderColor: "var(--border-light)" }}>
        <button onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-[11px] font-medium"
          style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
          <Edit2 className="h-3.5 w-3.5" />Editar
        </button>
        <button onClick={onDelete}
          className="h-7 px-3 rounded-lg text-[11px] font-medium"
          style={{ background: "#fef2f2", color: "#dc2626" }}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        {tarefa.status !== "concluida" && (
          <button onClick={() => onStatusChange(tarefa.id, "concluida")}
            className="flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-[11px] font-semibold"
            style={{ background: "var(--gcj-red)", color: "#fff" }}>
            <CheckSquare className="h-3.5 w-3.5" />Concluir
          </button>
        )}
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [advogados, setAdvogados] = useState<Membro[]>([]);
  const [selecionada, setSelecionada] = useState<Tarefa | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<"todos" | StatusTarefa>("todos");
  const [filtroPrio, setFiltroPrio] = useState<"todas" | PrioridadeTarefa>("todas");
  const [colunasVisiveis, setColunasVisiveis] = useState<Set<ColKey>>(
    new Set(["prioridade", "status", "advogado", "cliente", "vencimento"])
  );
  const [showColPicker, setShowColPicker] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEdit, setTarefaEdit] = useState<Tarefa | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function recarregar() { setTarefas(listarTarefas()); }

  useEffect(() => {
    recarregar();
    setProcessos(listarProcessos());
    setAdvogados(listarAdvogados());
  }, []);

  function handleSave(t: Tarefa) {
    salvarTarefa(t);
    recarregar();
    setModalAberto(false);
    setTarefaEdit(null);
  }

  function handleDelete(id: string) {
    removerTarefa(id);
    recarregar();
    setSelecionada(null);
    setConfirmDelete(null);
  }

  function mudarStatus(id: string, novoStatus: StatusTarefa) {
    atualizarStatusTarefa(id, novoStatus);
    recarregar();
    setSelecionada((prev) => prev?.id === id ? { ...prev, status: novoStatus } : prev);
  }

  function toggleCol(key: ColKey) {
    setColunasVisiveis((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const atrasadas = tarefas.filter((t) => t.status !== "concluida" && new Date(t.dataVencimento + "T00:00:00") < hoje).length;

  const filtradas = tarefas
    .filter((t) => {
      const okStatus = filtroStatus === "todos" || t.status === filtroStatus;
      const okPrio   = filtroPrio === "todas" || t.prioridade === filtroPrio;
      return okStatus && okPrio;
    })
    .sort((a, b) => {
      const ord: Record<PrioridadeTarefa, number> = { alta: 0, media: 1, baixa: 2 };
      return ord[a.prioridade] - ord[b.prioridade];
    });

  return (
    <div className="flex gap-4" style={{ height: "calc(100vh - 112px)" }}>

      {/* Lista */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Filtros */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1">
            {(["todos", "pendente", "em_andamento", "concluida"] as const).map((f) => (
              <button key={f} onClick={() => setFiltroStatus(f)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
                style={filtroStatus === f
                  ? { background: "var(--gcj-red)", color: "#fff" }
                  : { background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                {f === "todos" ? "Todas" : STATUS_CFG[f as StatusTarefa].label}
              </button>
            ))}
          </div>
          <div className="w-px h-4" style={{ background: "var(--border)" }} />
          <div className="flex items-center gap-1">
            {(["todas", "alta", "media", "baixa"] as const).map((f) => (
              <button key={f} onClick={() => setFiltroPrio(f)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
                style={filtroPrio === f
                  ? { background: "var(--gcj-red)", color: "#fff" }
                  : { background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                {f === "todas" ? "Todas prior." : PRIO_CFG[f as PrioridadeTarefa].label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {atrasadas > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "var(--gcj-red)" }}>
                <AlertCircle className="h-3.5 w-3.5" />
                {atrasadas} atrasada{atrasadas !== 1 ? "s" : ""}
              </span>
            )}
            <div className="relative">
              <button onClick={() => setShowColPicker((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
                style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                <Settings2 className="h-3.5 w-3.5" />Colunas
              </button>
              {showColPicker && (
                <div className="absolute right-0 top-8 z-30 rounded-xl shadow-lg p-3 w-44"
                  style={{ background: "#fff", border: "1px solid var(--border)" }}>
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Exibir colunas</p>
                  {COLUNAS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 py-1 cursor-pointer">
                      <input type="checkbox" checked={colunasVisiveis.has(key)} onChange={() => toggleCol(key)}
                        className="rounded" style={{ accentColor: "var(--gcj-red)" }} />
                      <span className="text-[11px]" style={{ color: "var(--text-primary)" }}>{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { setTarefaEdit(null); setModalAberto(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
              style={{ background: "var(--gcj-red)", color: "#fff" }}>
              <Plus className="h-3.5 w-3.5" />Nova Tarefa
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 overflow-auto rounded-xl" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          {tarefas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <CheckSquare className="h-8 w-8 mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-[12px] font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Nenhuma tarefa cadastrada</p>
              <button onClick={() => { setTarefaEdit(null); setModalAberto(true); }}
                className="px-4 py-2 rounded-lg text-[11px] font-semibold"
                style={{ background: "var(--gcj-red)", color: "#fff" }}>
                Criar primeira tarefa
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0" style={{ background: "var(--bg)" }}>
                <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <th className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>Descrição</th>
                  {colunasVisiveis.has("prioridade") && <th className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>Prior.</th>}
                  {colunasVisiveis.has("status") && <th className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>Status</th>}
                  {colunasVisiveis.has("advogado") && <th className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>Advogado</th>}
                  {colunasVisiveis.has("cliente") && <th className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>Cliente</th>}
                  {colunasVisiveis.has("processo") && <th className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>Processo</th>}
                  {colunasVisiveis.has("vencimento") && <th className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>Vencimento</th>}
                  {colunasVisiveis.has("observacao") && <th className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>Obs.</th>}
                  <th className="py-2.5 px-2" />
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>Nenhuma tarefa encontrada</p>
                    </td>
                  </tr>
                ) : filtradas.map((t, i) => {
                  const s = STATUS_CFG[t.status];
                  const p = PRIO_CFG[t.prioridade];
                  const dias = Math.ceil((new Date(t.dataVencimento + "T00:00:00").getTime() - hoje.getTime()) / 86400000);
                  const atrasada = t.status !== "concluida" && dias < 0;
                  const selected = selecionada?.id === t.id;

                  return (
                    <tr key={t.id} onClick={() => setSelecionada(selected ? null : t)}
                      className="cursor-pointer transition-colors"
                      style={{ background: selected ? "#fef2f4" : undefined, borderTop: i > 0 ? "1px solid var(--border-light)" : undefined }}>
                      <td className="py-2 px-3">
                        <span className="text-[12px] font-medium"
                          style={{ color: t.status === "concluida" ? "var(--text-muted)" : "var(--text-primary)",
                            textDecoration: t.status === "concluida" ? "line-through" : undefined }}>
                          {t.descricao}
                        </span>
                      </td>
                      {colunasVisiveis.has("prioridade") && (
                        <td className="py-2 px-3">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ color: p.color, background: p.bg }}>{p.label}</span>
                        </td>
                      )}
                      {colunasVisiveis.has("status") && (
                        <td className="py-2 px-3">
                          <span className="flex items-center gap-1 text-[11px]" style={{ color: s.color }}>
                            <s.icon className="h-3 w-3" />{s.label}
                          </span>
                        </td>
                      )}
                      {colunasVisiveis.has("advogado") && <td className="py-2 px-3 text-[11px]" style={{ color: "var(--text-secondary)" }}>{t.advogado || "—"}</td>}
                      {colunasVisiveis.has("cliente") && <td className="py-2 px-3 text-[11px]" style={{ color: "var(--text-secondary)" }}>{t.cliente ?? "—"}</td>}
                      {colunasVisiveis.has("processo") && (
                        <td className="py-2 px-3">
                          {t.processoNumero
                            ? <span className="font-mono text-[10px]" style={{ color: "var(--gcj-red)" }}>{t.processoNumero.slice(0, 15)}…</span>
                            : <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>—</span>}
                        </td>
                      )}
                      {colunasVisiveis.has("vencimento") && (
                        <td className="py-2 px-3 text-[11px] font-medium" style={{ color: atrasada ? "var(--gcj-red)" : "var(--text-secondary)" }}>
                          {atrasada ? `⚠ ${Math.abs(dias)}d` : dias === 0 ? "Hoje" : formatDate(t.dataVencimento)}
                        </td>
                      )}
                      {colunasVisiveis.has("observacao") && (
                        <td className="py-2 px-3 text-[11px] max-w-[120px] truncate" style={{ color: "var(--text-muted)" }}>{t.observacao ?? "—"}</td>
                      )}
                      <td className="py-2 px-2">
                        <ChevronRight className="h-3.5 w-3.5" style={{ color: selected ? "var(--gcj-red)" : "var(--text-muted)" }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Painel de detalhe */}
      {selecionada && (
        <div className="w-72 shrink-0 rounded-xl overflow-hidden flex flex-col" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <DetalhePanel
            tarefa={selecionada}
            onClose={() => setSelecionada(null)}
            onStatusChange={mudarStatus}
            onEdit={() => { setTarefaEdit(selecionada); setModalAberto(true); }}
            onDelete={() => setConfirmDelete(selecionada.id)}
          />
        </div>
      )}

      {/* Modal add/edit */}
      {modalAberto && (
        <Modal
          tarefa={tarefaEdit}
          processos={processos}
          advogados={advogados}
          onSave={handleSave}
          onClose={() => { setModalAberto(false); setTarefaEdit(null); }}
        />
      )}

      {/* Confirmar exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: "#fff" }}>
            <p className="text-[13px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>Excluir tarefa?</p>
            <p className="text-[11px] mb-5" style={{ color: "var(--text-muted)" }}>Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-[12px] font-medium"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 rounded-lg text-[12px] font-semibold"
                style={{ background: "#dc2626", color: "#fff" }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
