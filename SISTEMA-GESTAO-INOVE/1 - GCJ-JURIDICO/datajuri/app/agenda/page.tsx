"use client";
import { useState, useEffect } from "react";
import {
  Calendar, Clock, MapPin, Plus, X, Save, Edit2, Trash2,
  CheckCircle2, AlertCircle, XCircle, MinusCircle,
} from "lucide-react";
import Link from "next/link";
import { listarAudiencias, salvarAudiencia, removerAudiencia } from "@/lib/agenda-storage";
import type { Audiencia, TipoAudiencia, StatusAudiencia } from "@/lib/agenda-storage";
import { listarProcessos } from "@/lib/processos-storage";
import type { Processo } from "@/lib/mock-data";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const TIPO_LABEL: Record<TipoAudiencia, string> = {
  instrucao: "Instrução e Julgamento", conciliacao: "Conciliação",
  julgamento: "Julgamento", despacho: "Despacho", pericia: "Perícia",
};

const TIPO_COR: Record<TipoAudiencia, string> = {
  instrucao: "var(--gcj-red)", conciliacao: "#2563eb",
  julgamento: "#7c3aed", despacho: "#0891b2", pericia: "#d97706",
};

const STATUS_CFG: Record<StatusAudiencia, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  agendado:  { label: "Agendado",  bg: "#eff6ff", text: "#2563eb", icon: Clock },
  realizado: { label: "Realizado", bg: "#f0fdf4", text: "#16a34a", icon: CheckCircle2 },
  adiado:    { label: "Adiado",    bg: "#fffbeb", text: "#d97706", icon: AlertCircle },
  cancelado: { label: "Cancelado", bg: "#fef2f2", text: "#dc2626", icon: XCircle },
};

function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function diasPara(data: string): number {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(data + "T00:00:00").getTime() - hoje.getTime()) / 86400000);
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
    <select {...props}
      className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none"
      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
      {children}
    </select>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

interface ModalProps {
  audiencia?: Audiencia | null;
  processos: Processo[];
  onSave: (a: Audiencia) => void;
  onClose: () => void;
}

const FORM_VAZIO = {
  processoId: "", processoNumero: "", cliente: "",
  tipo: "conciliacao" as TipoAudiencia, data: "", hora: "09:00",
  local: "", sala: "", status: "agendado" as StatusAudiencia, observacao: "",
};

function Modal({ audiencia, processos, onSave, onClose }: ModalProps) {
  const [form, setForm] = useState(() =>
    audiencia
      ? { processoId: audiencia.processoId, processoNumero: audiencia.processoNumero,
          cliente: audiencia.cliente, tipo: audiencia.tipo, data: audiencia.data,
          hora: audiencia.hora, local: audiencia.local, sala: audiencia.sala ?? "",
          status: audiencia.status, observacao: audiencia.observacao ?? "" }
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
    if (!form.data || !form.local.trim()) return;
    onSave({
      id: audiencia?.id ?? `aud_${Date.now()}`,
      processoId: form.processoId, processoNumero: form.processoNumero,
      cliente: form.cliente, tipo: form.tipo, data: form.data,
      hora: form.hora, local: form.local.trim(),
      sala: form.sala.trim() || undefined, status: form.status,
      observacao: form.observacao.trim() || undefined,
      createdAt: audiencia?.createdAt ?? new Date().toISOString(),
    });
  }

  const valido = form.data && form.local.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl" style={{ background: "#fff" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
          <h2 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
            {audiencia ? "Editar Audiência" : "Nova Audiência"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-60 transition-opacity">
            <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
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
              <Label required>Tipo</Label>
              <Sel name="tipo" value={form.tipo} onChange={upd}>
                <option value="conciliacao">Conciliação</option>
                <option value="instrucao">Instrução e Julgamento</option>
                <option value="julgamento">Julgamento</option>
                <option value="despacho">Despacho</option>
                <option value="pericia">Perícia</option>
              </Sel>
            </div>
            <div>
              <Label>Status</Label>
              <Sel name="status" value={form.status} onChange={upd}>
                <option value="agendado">Agendado</option>
                <option value="realizado">Realizado</option>
                <option value="adiado">Adiado</option>
                <option value="cancelado">Cancelado</option>
              </Sel>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Data</Label>
              <Inp type="date" name="data" value={form.data} onChange={upd} />
            </div>
            <div>
              <Label>Hora</Label>
              <Inp type="time" name="hora" value={form.hora} onChange={upd} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Local / Fórum</Label>
              <Inp name="local" value={form.local} onChange={upd} placeholder="Ex: Fórum de Blumenau" />
            </div>
            <div>
              <Label>Sala / Vara</Label>
              <Inp name="sala" value={form.sala} onChange={upd} placeholder="Ex: 1ª Vara Cível" />
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
            {audiencia ? "Salvar alterações" : "Criar audiência"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

type Filtro = "todos" | StatusAudiencia;

export default function AgendaPage() {
  const [audiencias, setAudiencias] = useState<Audiencia[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [audEdit, setAudEdit] = useState<Audiencia | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function recarregar() { setAudiencias(listarAudiencias()); }

  useEffect(() => {
    recarregar();
    setProcessos(listarProcessos());
  }, []);

  function handleSave(a: Audiencia) {
    salvarAudiencia(a);
    recarregar();
    setModalAberto(false);
    setAudEdit(null);
  }

  function handleDelete(id: string) {
    removerAudiencia(id);
    recarregar();
    setConfirmDelete(null);
  }

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);

  const proximas = audiencias
    .filter((a) => a.status === "agendado" && new Date(a.data + "T00:00:00") >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 4);

  const totalAgendadas  = audiencias.filter((a) => a.status === "agendado").length;
  const totalRealizadas = audiencias.filter((a) => a.status === "realizado").length;
  const totalProximas30 = audiencias.filter((a) => {
    if (a.status !== "agendado") return false;
    const diff = diasPara(a.data);
    return diff >= 0 && diff <= 30;
  }).length;

  const lista = audiencias
    .filter((a) => filtro === "todos" || a.status === filtro)
    .sort((a, b) => b.data.localeCompare(a.data));

  const FILTROS: { value: Filtro; label: string }[] = [
    { value: "todos", label: "Todas" },
    { value: "agendado", label: "Agendadas" },
    { value: "realizado", label: "Realizadas" },
    { value: "adiado", label: "Adiadas" },
    { value: "cancelado", label: "Canceladas" },
  ];

  return (
    <div className="space-y-5">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Agenda</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Audiências, despachos e perícias</p>
        </div>
        <button
          onClick={() => { setAudEdit(null); setModalAberto(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold"
          style={{ background: "var(--gcj-red)", color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" />
          Nova Audiência
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Agendadas",       count: totalAgendadas,  bg: "#eff6ff", text: "#2563eb", icon: Calendar },
          { label: "Realizadas",      count: totalRealizadas, bg: "#f0fdf4", text: "#16a34a", icon: CheckCircle2 },
          { label: "Próximas 30 dias",count: totalProximas30, bg: "#fef2f2", text: "var(--gcj-red)", icon: Clock },
        ].map(({ label, count, bg, text, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 px-5 py-4 rounded-xl" style={{ background: bg }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.6)" }}>
              <Icon className="h-5 w-5" style={{ color: text }} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none" style={{ color: text }}>{count}</p>
              <p className="text-[10px] mt-0.5 font-medium" style={{ color: text }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Próximas em destaque */}
      {proximas.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "var(--text-muted)" }}>Próximas audiências</p>
          <div className="grid grid-cols-2 gap-3">
            {proximas.map((a) => {
              const dias = diasPara(a.data);
              const cor = TIPO_COR[a.tipo];
              return (
                <div key={a.id} className="rounded-xl px-5 py-4 border-l-4" style={{ background: "#fff", border: "1px solid var(--border)", borderLeftColor: cor, borderLeftWidth: 4 }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1" style={{ color: cor }}>{TIPO_LABEL[a.tipo]}</p>
                      <p className="text-[12px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>{a.cliente || "Sem cliente"}</p>
                      <div className="flex items-center gap-1 mt-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(a.data)} às {a.hora}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{a.local}{a.sala ? ` — ${a.sala}` : ""}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xl font-bold" style={{ color: dias <= 7 ? "var(--gcj-red)" : "var(--text-secondary)" }}>{dias}</span>
                      <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>dias</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista completa */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>Todas as audiências</p>
          <div className="flex items-center gap-1.5">
            {FILTROS.map((f) => (
              <button key={f.value} onClick={() => setFiltro(f.value)}
                className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                style={filtro === f.value
                  ? { background: "var(--gcj-red)", color: "#fff" }
                  : { background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {lista.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <Calendar className="h-8 w-8 mb-3" style={{ color: "var(--text-muted)" }} />
            <p className="text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>
              {audiencias.length === 0 ? "Nenhuma audiência cadastrada" : "Nenhuma audiência encontrada"}
            </p>
            {audiencias.length === 0 && (
              <button onClick={() => { setAudEdit(null); setModalAberto(true); }}
                className="mt-3 px-4 py-2 rounded-lg text-[11px] font-semibold"
                style={{ background: "var(--gcj-red)", color: "#fff" }}>
                Criar primeira audiência
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border-light)" }}>
                  {["Data / Hora", "Tipo", "Cliente", "Local", "Processo", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((a, i) => {
                  const sc = STATUS_CFG[a.status];
                  const Icon = sc.icon;
                  return (
                    <tr key={a.id} style={{ borderTop: i > 0 ? "1px solid var(--border-light)" : undefined }}>
                      <td className="px-4 py-3">
                        <p className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{formatDate(a.data)}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{a.hora}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: TIPO_COR[a.tipo], background: `${TIPO_COR[a.tipo]}18` }}>
                          {TIPO_LABEL[a.tipo]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px]" style={{ color: "var(--text-primary)" }}>{a.cliente || "—"}</td>
                      <td className="px-4 py-3">
                        <p className="text-[12px]" style={{ color: "var(--text-primary)" }}>{a.local}</p>
                        {a.sala && <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{a.sala}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {a.processoId
                          ? <Link href={`/processos/${a.processoId}`} className="text-[11px] font-mono hover:underline" style={{ color: "var(--gcj-red)" }}>{a.processoNumero}</Link>
                          : <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit" style={{ background: sc.bg, color: sc.text }}>
                          <Icon className="h-3 w-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setAudEdit(a); setModalAberto(true); }} title="Editar"
                            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                            style={{ background: "var(--bg)", color: "var(--text-secondary)" }}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setConfirmDelete(a.id)} title="Excluir"
                            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                            style={{ background: "var(--bg)", color: "#dc2626" }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <Modal
          audiencia={audEdit}
          processos={processos}
          onSave={handleSave}
          onClose={() => { setModalAberto(false); setAudEdit(null); }}
        />
      )}

      {/* Confirmar exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: "#fff" }}>
            <p className="text-[13px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>Excluir audiência?</p>
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
