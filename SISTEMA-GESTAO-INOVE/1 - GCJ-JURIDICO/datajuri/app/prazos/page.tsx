"use client";
import { useState, useEffect } from "react";
import {
  Clock, Plus, Search, AlertTriangle, CheckCircle2, XCircle,
  Timer, Edit2, Trash2, X, Save, Check,
} from "lucide-react";
import { listarPrazos, salvarPrazo, removerPrazo, marcarCumprido } from "@/lib/prazos-storage";
import type { Prazo, StatusPrazo, TipoPrazo } from "@/lib/prazos-storage";
import { listarProcessos } from "@/lib/processos-storage";
import type { Processo } from "@/lib/mock-data";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const TIPO_LABEL: Record<TipoPrazo, string> = {
  audiencia: "Audiência", peticao: "Petição", recurso: "Recurso",
  pericia: "Perícia", outros: "Outros",
};

const STATUS_CFG: Record<StatusPrazo, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  urgente:  { label: "Urgente",  bg: "#fef2f2", text: "#dc2626", icon: AlertTriangle },
  vencido:  { label: "Vencido",  bg: "#fff7ed", text: "#ea580c", icon: XCircle },
  pendente: { label: "Pendente", bg: "#eff6ff", text: "#2563eb", icon: Timer },
  cumprido: { label: "Cumprido", bg: "#f0fdf4", text: "#16a34a", icon: CheckCircle2 },
};

function diasRestantes(dataVencimento: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(dataVencimento + "T00:00:00");
  return Math.ceil((venc.getTime() - hoje.getTime()) / 86400000);
}

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
    <input
      {...props}
      className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none transition-colors"
      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#111"; props.onFocus?.(e); }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; props.onBlur?.(e); }}
    />
  );
}

function Sel({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none"
      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
    >
      {children}
    </select>
  );
}

// ─── MODAL FORM ───────────────────────────────────────────────────────────────

interface ModalProps {
  prazo?: Prazo | null;
  processos: Processo[];
  onSave: (p: Prazo) => void;
  onClose: () => void;
}

const FORM_VAZIO = {
  processoId: "", numeroProcesso: "", cliente: "",
  descricao: "", tipo: "peticao" as TipoPrazo,
  dataVencimento: "", observacao: "",
};

function Modal({ prazo, processos, onSave, onClose }: ModalProps) {
  const [form, setForm] = useState(() =>
    prazo
      ? { processoId: prazo.processoId, numeroProcesso: prazo.numeroProcesso, cliente: prazo.cliente,
          descricao: prazo.descricao, tipo: prazo.tipo, dataVencimento: prazo.dataVencimento, observacao: prazo.observacao ?? "" }
      : { ...FORM_VAZIO }
  );

  function updForm(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleProcessoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const proc = processos.find((p) => p.id === e.target.value);
    if (proc) {
      setForm((f) => ({ ...f, processoId: proc.id, numeroProcesso: proc.numero, cliente: proc.cliente }));
    } else {
      setForm((f) => ({ ...f, processoId: "", numeroProcesso: "", cliente: "" }));
    }
  }

  function handleSave() {
    if (!form.descricao.trim() || !form.dataVencimento) return;
    const now = new Date().toISOString();
    onSave({
      id: prazo?.id ?? `pz_${Date.now()}`,
      processoId: form.processoId,
      numeroProcesso: form.numeroProcesso,
      cliente: form.cliente,
      descricao: form.descricao.trim(),
      tipo: form.tipo,
      dataVencimento: form.dataVencimento,
      status: prazo?.status === "cumprido" ? "cumprido" : "pendente",
      observacao: form.observacao.trim() || undefined,
      createdAt: prazo?.createdAt ?? now,
    });
  }

  const valido = form.descricao.trim() && form.dataVencimento;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl" style={{ background: "#fff" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
          <h2 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
            {prazo ? "Editar Prazo" : "Novo Prazo"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-60 transition-opacity">
            <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <Label>Processo vinculado</Label>
            <Sel name="processoId" value={form.processoId} onChange={handleProcessoChange}>
              <option value="">Sem processo vinculado</option>
              {processos.map((p) => (
                <option key={p.id} value={p.id}>{p.numero} — {p.cliente}</option>
              ))}
            </Sel>
          </div>

          <div>
            <Label required>Descrição do prazo</Label>
            <Inp name="descricao" value={form.descricao} onChange={updForm} placeholder="Ex: Apresentar contestação" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Tipo</Label>
              <Sel name="tipo" value={form.tipo} onChange={updForm}>
                <option value="peticao">Petição</option>
                <option value="audiencia">Audiência</option>
                <option value="recurso">Recurso</option>
                <option value="pericia">Perícia</option>
                <option value="outros">Outros</option>
              </Sel>
            </div>
            <div>
              <Label required>Data de vencimento</Label>
              <Inp type="date" name="dataVencimento" value={form.dataVencimento} onChange={updForm} />
            </div>
          </div>

          <div>
            <Label>Observação</Label>
            <textarea
              name="observacao" value={form.observacao} onChange={updForm} rows={2}
              placeholder="Informações adicionais..."
              className="w-full px-3 py-2 text-[12px] rounded-lg resize-none focus:outline-none transition-colors"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#111"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            />
          </div>
        </div>

        {/* Footer */}
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
            {prazo ? "Salvar alterações" : "Criar prazo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

type Filtro = "todos" | StatusPrazo;

export default function PrazosPage() {
  const [prazos, setPrazos] = useState<Prazo[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [prazoEdit, setPrazoEdit] = useState<Prazo | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function recarregar() { setPrazos(listarPrazos()); }

  useEffect(() => {
    recarregar();
    setProcessos(listarProcessos());
  }, []);

  function handleSave(p: Prazo) {
    salvarPrazo(p);
    recarregar();
    setModalAberto(false);
    setPrazoEdit(null);
  }

  function handleDelete(id: string) {
    removerPrazo(id);
    recarregar();
    setConfirmDelete(null);
  }

  function handleCumprido(id: string) {
    marcarCumprido(id);
    recarregar();
  }

  const counts = {
    urgente:  prazos.filter((p) => p.status === "urgente").length,
    vencido:  prazos.filter((p) => p.status === "vencido").length,
    pendente: prazos.filter((p) => p.status === "pendente").length,
    cumprido: prazos.filter((p) => p.status === "cumprido").length,
  };

  const lista = prazos
    .filter((p) => {
      const q = busca.toLowerCase();
      const matchBusca = !busca || p.descricao.toLowerCase().includes(q) ||
        p.cliente.toLowerCase().includes(q) || p.numeroProcesso.toLowerCase().includes(q);
      const matchFiltro = filtro === "todos" || p.status === filtro;
      return matchBusca && matchFiltro;
    })
    .sort((a, b) => {
      const ord: Record<StatusPrazo, number> = { vencido: 0, urgente: 1, pendente: 2, cumprido: 3 };
      if (ord[a.status] !== ord[b.status]) return ord[a.status] - ord[b.status];
      return a.dataVencimento.localeCompare(b.dataVencimento);
    });

  const FILTROS: { value: Filtro; label: string; count: number }[] = [
    { value: "todos",    label: "Todos",    count: prazos.length },
    { value: "urgente",  label: "Urgentes", count: counts.urgente },
    { value: "vencido",  label: "Vencidos", count: counts.vencido },
    { value: "pendente", label: "Pendentes",count: counts.pendente },
    { value: "cumprido", label: "Cumpridos",count: counts.cumprido },
  ];

  return (
    <div className="space-y-5">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Prazos e Alertas</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Controle de prazos processuais</p>
        </div>
        <button
          onClick={() => { setPrazoEdit(null); setModalAberto(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold"
          style={{ background: "var(--gcj-red)", color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" />
          Novo Prazo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Urgentes",  count: counts.urgente,  bg: "#fef2f2", text: "#dc2626", icon: AlertTriangle },
          { label: "Vencidos",  count: counts.vencido,  bg: "#fff7ed", text: "#ea580c", icon: XCircle },
          { label: "Pendentes", count: counts.pendente, bg: "#eff6ff", text: "#2563eb", icon: Clock },
          { label: "Cumpridos", count: counts.cumprido, bg: "#f0fdf4", text: "#16a34a", icon: CheckCircle2 },
        ].map(({ label, count, bg, text, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: bg, border: `1px solid ${bg}` }}>
            <Icon className="h-5 w-5 shrink-0" style={{ color: text }} />
            <div>
              <p className="text-xl font-bold leading-none" style={{ color: text }}>{count}</p>
              <p className="text-[10px] mt-0.5 font-medium" style={{ color: text }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros + busca */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
          <input
            placeholder="Buscar prazo, cliente ou processo..."
            value={busca} onChange={(e) => setBusca(e.target.value)}
            className="h-8 pl-8 pr-3 text-[12px] rounded-lg w-64 focus:outline-none"
            style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        {FILTROS.map((f) => (
          <button key={f.value} onClick={() => setFiltro(f.value)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
            style={filtro === f.value
              ? { background: "var(--gcj-red)", color: "#fff" }
              : { background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            {f.label}
            <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full text-[10px] px-1"
              style={{ background: filtro === f.value ? "rgba(255,255,255,0.25)" : "var(--bg)" }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <Clock className="h-8 w-8 mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>
            {prazos.length === 0 ? "Nenhum prazo cadastrado" : "Nenhum prazo encontrado"}
          </p>
          {prazos.length === 0 && (
            <button onClick={() => { setPrazoEdit(null); setModalAberto(true); }}
              className="mt-3 px-4 py-2 rounded-lg text-[11px] font-semibold"
              style={{ background: "var(--gcj-red)", color: "#fff" }}>
              Criar primeiro prazo
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {lista.map((prazo) => {
            const sc = STATUS_CFG[prazo.status];
            const Icon = sc.icon;
            const dias = diasRestantes(prazo.dataVencimento);
            return (
              <div key={prazo.id} className="rounded-xl px-5 py-4 flex items-center gap-4"
                style={{ background: "#fff", border: `1px solid ${prazo.status === "vencido" || prazo.status === "urgente" ? "#fca5a5" : "var(--border)"}` }}>

                {/* Ícone status */}
                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: sc.bg }}>
                  <Icon className="h-4 w-4" style={{ color: sc.text }} />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{prazo.descricao}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: sc.bg, color: sc.text }}>
                      {sc.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: "var(--bg)", color: "var(--text-muted)" }}>
                      {TIPO_LABEL[prazo.tipo]}
                    </span>
                  </div>
                  {prazo.cliente && (
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{prazo.cliente}</p>
                  )}
                  {prazo.numeroProcesso && (
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: "var(--gcj-red)" }}>{prazo.numeroProcesso}</p>
                  )}
                  {prazo.observacao && (
                    <p className="text-[10px] italic mt-0.5" style={{ color: "var(--text-muted)" }}>{prazo.observacao}</p>
                  )}
                </div>

                {/* Data + ações */}
                <div className="text-right shrink-0 space-y-1">
                  <p className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{formatDate(prazo.dataVencimento)}</p>
                  {prazo.status !== "cumprido" && (
                    <p className="text-[11px] font-bold" style={{ color: sc.text }}>
                      {prazo.status === "vencido"
                        ? `${Math.abs(dias)}d atrasado`
                        : dias === 0 ? "Vence hoje"
                        : `${dias} dias`}
                    </p>
                  )}
                </div>

                {/* Botões */}
                <div className="flex items-center gap-1 shrink-0">
                  {prazo.status !== "cumprido" && (
                    <button onClick={() => handleCumprido(prazo.id)} title="Marcar cumprido"
                      className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                      style={{ background: "#f0fdf4", color: "#16a34a" }}>
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button onClick={() => { setPrazoEdit(prazo); setModalAberto(true); }} title="Editar"
                    className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                    style={{ background: "var(--bg)", color: "var(--text-secondary)" }}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setConfirmDelete(prazo.id)} title="Excluir"
                    className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                    style={{ background: "var(--bg)", color: "#dc2626" }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal add/edit */}
      {modalAberto && (
        <Modal
          prazo={prazoEdit}
          processos={processos}
          onSave={handleSave}
          onClose={() => { setModalAberto(false); setPrazoEdit(null); }}
        />
      )}

      {/* Confirmar exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: "#fff" }}>
            <p className="text-[13px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>Excluir prazo?</p>
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
