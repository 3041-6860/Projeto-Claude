"use client";
import { useState, useEffect } from "react";
import {
  CircleDollarSign, TrendingUp, AlertCircle, CheckCircle2,
  Plus, X, Save, Edit2, Trash2,
} from "lucide-react";
import Link from "next/link";
import { listarHonorarios, salvarHonorario, removerHonorario, registrarPagamento } from "@/lib/datajuri/financeiro-storage";
import type { Honorario, StatusHonorario, TipoHonorario } from "@/lib/datajuri/financeiro-storage";
import { listarProcessos } from "@/lib/datajuri/processos-storage";
import type { Processo } from "@/lib/datajuri/mock-data";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<StatusHonorario, { label: string; bg: string; text: string }> = {
  pendente: { label: "Pendente", bg: "#fffbeb", text: "#d97706" },
  pago:     { label: "Pago",     bg: "#f0fdf4", text: "#16a34a" },
  vencido:  { label: "Vencido",  bg: "#fef2f2", text: "#dc2626" },
  parcial:  { label: "Parcial",  bg: "#eff6ff", text: "#2563eb" },
};

const TIPO_LABEL: Record<TipoHonorario, string> = {
  honorarios: "Honorários", despesas: "Despesas",
  custas: "Custas", acordo: "Acordo",
};

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function fmtCurrency(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

// ─── MODAL LANÇAMENTO ─────────────────────────────────────────────────────────

interface ModalLancProps {
  honorario?: Honorario | null;
  processos: Processo[];
  onSave: (h: Honorario) => void;
  onClose: () => void;
}

const FORM_VAZIO = {
  cliente: "", processoId: "", processoNumero: "",
  descricao: "", tipo: "honorarios" as TipoHonorario,
  valor: "", dataVencimento: "", observacao: "",
};

function ModalLancamento({ honorario, processos, onSave, onClose }: ModalLancProps) {
  const [form, setForm] = useState(() =>
    honorario
      ? { cliente: honorario.cliente, processoId: honorario.processoId ?? "",
          processoNumero: honorario.processoNumero ?? "", descricao: honorario.descricao,
          tipo: honorario.tipo, valor: String(honorario.valor),
          dataVencimento: honorario.dataVencimento, observacao: honorario.observacao ?? "" }
      : { ...FORM_VAZIO }
  );

  function upd(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleProcesso(e: React.ChangeEvent<HTMLSelectElement>) {
    const proc = processos.find((p) => p.id === e.target.value);
    if (proc) setForm((f) => ({ ...f, processoId: proc.id, processoNumero: proc.numero, cliente: proc.cliente }));
    else setForm((f) => ({ ...f, processoId: "", processoNumero: "" }));
  }

  function handleSave() {
    if (!form.cliente.trim() || !form.descricao.trim() || !form.valor || !form.dataVencimento) return;
    onSave({
      id: honorario?.id ?? `hon_${Date.now()}`,
      cliente: form.cliente.trim(),
      processoId: form.processoId || undefined,
      processoNumero: form.processoNumero || undefined,
      descricao: form.descricao.trim(),
      tipo: form.tipo,
      valor: parseFloat(form.valor) || 0,
      status: honorario?.status ?? "pendente",
      dataVencimento: form.dataVencimento,
      dataPagamento: honorario?.dataPagamento,
      valorPago: honorario?.valorPago,
      observacao: form.observacao.trim() || undefined,
      createdAt: honorario?.createdAt ?? new Date().toISOString(),
    });
  }

  const valido = form.cliente.trim() && form.descricao.trim() && form.valor && form.dataVencimento;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl" style={{ background: "#fff" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
          <h2 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
            {honorario ? "Editar Lançamento" : "Novo Lançamento"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-60">
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

          <div>
            <Label required>Cliente</Label>
            <Inp name="cliente" value={form.cliente} onChange={upd} placeholder="Nome do cliente" />
          </div>

          <div>
            <Label required>Descrição</Label>
            <Inp name="descricao" value={form.descricao} onChange={upd} placeholder="Ex: Honorários advocatícios — 1ª fase" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <Label required>Tipo</Label>
              <Sel name="tipo" value={form.tipo} onChange={upd}>
                <option value="honorarios">Honorários</option>
                <option value="despesas">Despesas</option>
                <option value="custas">Custas</option>
                <option value="acordo">Acordo</option>
              </Sel>
            </div>
            <div>
              <Label required>Valor (R$)</Label>
              <Inp type="number" min="0" step="0.01" name="valor" value={form.valor} onChange={upd} placeholder="0,00" />
            </div>
            <div>
              <Label required>Vencimento</Label>
              <Inp type="date" name="dataVencimento" value={form.dataVencimento} onChange={upd} />
            </div>
          </div>

          <div>
            <Label>Observação</Label>
            <textarea name="observacao" value={form.observacao} onChange={upd} rows={2}
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
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-40"
            style={{ background: "var(--gcj-red)", color: "#fff" }}>
            <Save className="h-3.5 w-3.5" />
            {honorario ? "Salvar" : "Criar lançamento"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL PAGAMENTO ──────────────────────────────────────────────────────────

function ModalPagamento({ honorario, onSave, onClose }: { honorario: Honorario; onSave: (valor: number, data: string) => void; onClose: () => void }) {
  const restante = honorario.valor - (honorario.valorPago ?? 0);
  const [valor, setValor] = useState(String(restante));
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: "#fff" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>Registrar Pagamento</h2>
          <button onClick={onClose}><X className="h-4 w-4" style={{ color: "var(--text-muted)" }} /></button>
        </div>
        <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>
          Valor total: <strong>{fmtCurrency(honorario.valor)}</strong> · Restante: <strong>{fmtCurrency(restante)}</strong>
        </p>
        <div className="space-y-3">
          <div>
            <Label required>Valor recebido (R$)</Label>
            <Inp type="number" min="0" step="0.01" max={restante} value={valor} onChange={(e) => setValor(e.target.value)} />
          </div>
          <div>
            <Label required>Data do pagamento</Label>
            <Inp type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] font-medium"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            Cancelar
          </button>
          <button onClick={() => onSave(parseFloat(valor) || 0, data)} disabled={!valor || !data}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-40"
            style={{ background: "#16a34a", color: "#fff" }}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

type Filtro = "todos" | StatusHonorario;

export default function FinanceiroPage() {
  const [honorarios, setHonorarios] = useState<Honorario[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [modalLanc, setModalLanc] = useState(false);
  const [lancEdit, setLancEdit] = useState<Honorario | null>(null);
  const [modalPag, setModalPag] = useState<Honorario | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function recarregar() { setHonorarios(listarHonorarios()); }

  useEffect(() => {
    recarregar();
    setProcessos(listarProcessos());
  }, []);

  function handleSave(h: Honorario) {
    salvarHonorario(h);
    recarregar();
    setModalLanc(false);
    setLancEdit(null);
  }

  function handleDelete(id: string) {
    removerHonorario(id);
    recarregar();
    setConfirmDelete(null);
  }

  function handlePagamento(valor: number, data: string) {
    if (!modalPag) return;
    registrarPagamento(modalPag.id, valor, data);
    recarregar();
    setModalPag(null);
  }

  const totalEmAberto = honorarios.filter((h) => h.status === "pendente" || h.status === "parcial" || h.status === "vencido")
    .reduce((acc, h) => acc + h.valor - (h.valorPago ?? 0), 0);
  const totalRecebido = honorarios.filter((h) => h.status === "pago" || h.status === "parcial")
    .reduce((acc, h) => acc + (h.valorPago ?? 0), 0);
  const totalVencido  = honorarios.filter((h) => h.status === "vencido").reduce((acc, h) => acc + h.valor - (h.valorPago ?? 0), 0);
  const totalPendente = honorarios.filter((h) => h.status === "pendente").reduce((acc, h) => acc + h.valor, 0);

  const lista = honorarios
    .filter((h) => filtro === "todos" || h.status === filtro)
    .sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento));

  const FILTROS: { value: Filtro; label: string }[] = [
    { value: "todos",    label: "Todos" },
    { value: "pendente", label: "Pendentes" },
    { value: "vencido",  label: "Vencidos" },
    { value: "parcial",  label: "Parciais" },
    { value: "pago",     label: "Pagos" },
  ];

  return (
    <div className="space-y-5">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Financeiro</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Honorários, despesas e recebimentos</p>
        </div>
        <button onClick={() => { setLancEdit(null); setModalLanc(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold"
          style={{ background: "var(--gcj-red)", color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" />
          Novo Lançamento
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Em aberto",  value: totalEmAberto, sub: "a receber",          bg: "#fef2f2", text: "var(--gcj-red)", icon: CircleDollarSign },
          { label: "Recebido",   value: totalRecebido, sub: "✓ confirmado",        bg: "#f0fdf4", text: "#16a34a",       icon: CheckCircle2 },
          { label: "Pendente",   value: totalPendente, sub: "aguardando vencimento",bg: "#fffbeb", text: "#d97706",      icon: TrendingUp },
          { label: "Vencido",    value: totalVencido,  sub: totalVencido > 0 ? "ação necessária" : "", bg: "#fef2f2", text: totalVencido > 0 ? "#dc2626" : "var(--text-secondary)", icon: AlertCircle },
        ].map(({ label, value, sub, bg, text, icon: Icon }) => (
          <div key={label} className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ background: bg }}>
            <div>
              <p className="text-[11px]" style={{ color: text }}>{label}</p>
              <p className="text-lg font-bold mt-0.5" style={{ color: text }}>{fmtCurrency(value)}</p>
              {sub && <p className="text-[10px] mt-0.5 font-medium" style={{ color: text }}>{sub}</p>}
            </div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.5)" }}>
              <Icon className="h-5 w-5" style={{ color: text }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2">
        {FILTROS.map((f) => (
          <button key={f.value} onClick={() => setFiltro(f.value)}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
            style={filtro === f.value
              ? { background: "var(--gcj-red)", color: "#fff" }
              : { background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <CircleDollarSign className="h-8 w-8 mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-[12px] font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
            {honorarios.length === 0 ? "Nenhum lançamento cadastrado" : "Nenhum lançamento encontrado"}
          </p>
          {honorarios.length === 0 && (
            <button onClick={() => { setLancEdit(null); setModalLanc(true); }}
              className="px-4 py-2 rounded-lg text-[11px] font-semibold"
              style={{ background: "var(--gcj-red)", color: "#fff" }}>
              Criar primeiro lançamento
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border-light)" }}>
                {["Cliente / Processo", "Descrição", "Tipo", "Valor", "Pago", "Vencimento", "Status", ""].map((h) => (
                  <th key={h} className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] ${h === "Valor" || h === "Pago" ? "text-right" : "text-left"}`}
                    style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((h, i) => {
                const sc = STATUS_CFG[h.status];
                const pendente = h.valor - (h.valorPago ?? 0);
                return (
                  <tr key={h.id} style={{ borderTop: i > 0 ? "1px solid var(--border-light)" : undefined }}>
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>{h.cliente}</p>
                      {h.processoNumero && (
                        <Link href={`/datajuri/processos/${h.processoId}`} className="text-[10px] font-mono hover:underline" style={{ color: "var(--gcj-red)" }}>
                          {h.processoNumero}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: "var(--text-secondary)" }}>{h.descricao}</td>
                    <td className="px-4 py-3 text-[11px]" style={{ color: "var(--text-muted)" }}>{TIPO_LABEL[h.tipo]}</td>
                    <td className="px-4 py-3 text-right text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{fmtCurrency(h.valor)}</td>
                    <td className="px-4 py-3 text-right">
                      {h.status === "pago" ? (
                        <span className="text-[12px] font-semibold" style={{ color: "#16a34a" }}>{fmtCurrency(h.valorPago ?? 0)}</span>
                      ) : h.status === "parcial" ? (
                        <div>
                          <span className="text-[12px] font-semibold" style={{ color: "#16a34a" }}>{fmtCurrency(h.valorPago ?? 0)}</span>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{fmtCurrency(pendente)} restante</p>
                        </div>
                      ) : (
                        <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px]" style={{ color: "var(--text-primary)" }}>{fmtDate(h.dataVencimento)}</p>
                      {h.dataPagamento && (
                        <p className="text-[10px]" style={{ color: "#16a34a" }}>Pago em {fmtDate(h.dataPagamento)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {(h.status === "pendente" || h.status === "vencido" || h.status === "parcial") && (
                          <button onClick={() => setModalPag(h)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                            style={{ background: "#f0fdf4", color: "#16a34a" }}>
                            Pagar
                          </button>
                        )}
                        <button onClick={() => { setLancEdit(h); setModalLanc(true); }}
                          className="p-1.5 rounded-lg hover:opacity-70"
                          style={{ background: "var(--bg)", color: "var(--text-secondary)" }}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setConfirmDelete(h.id)}
                          className="p-1.5 rounded-lg hover:opacity-70"
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

      {/* Modal lançamento */}
      {modalLanc && (
        <ModalLancamento
          honorario={lancEdit}
          processos={processos}
          onSave={handleSave}
          onClose={() => { setModalLanc(false); setLancEdit(null); }}
        />
      )}

      {/* Modal pagamento */}
      {modalPag && (
        <ModalPagamento
          honorario={modalPag}
          onSave={handlePagamento}
          onClose={() => setModalPag(null)}
        />
      )}

      {/* Confirmar exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: "#fff" }}>
            <p className="text-[13px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>Excluir lançamento?</p>
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
