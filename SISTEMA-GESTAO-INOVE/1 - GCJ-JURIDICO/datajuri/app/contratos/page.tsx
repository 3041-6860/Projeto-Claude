"use client";
import { useState, useEffect } from "react";
import {
  FileSignature, Search, Plus, RefreshCw, X, Save, Edit2, Trash2,
} from "lucide-react";
import { listarContratos, salvarContrato, removerContrato } from "@/lib/contratos-storage";
import type { Contrato, StatusContrato, TipoContrato } from "@/lib/contratos-storage";
import { listarAdvogados, labelAdvogado } from "@/lib/equipe-storage";
import type { Membro } from "@/lib/equipe-storage";

// ─── CONFIGS ─────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<StatusContrato, { label: string; bg: string; text: string }> = {
  vigente:   { label: "Vigente",       bg: "#f0fdf4", text: "#16a34a" },
  renovacao: { label: "Em Renovação",  bg: "#eff6ff", text: "#2563eb" },
  suspenso:  { label: "Suspenso",      bg: "#fffbeb", text: "#d97706" },
  encerrado: { label: "Encerrado",     bg: "#f3f4f6", text: "#6b7280" },
};

const TIPO_LABEL: Record<TipoContrato, string> = {
  honorarios_fixos:  "Honorários Fixos",
  honorarios_exito:  "Êxito",
  retainer:          "Retainer",
  consulta_avulsa:   "Consulta Avulsa",
  prestacao_servicos:"Prestação de Serviços",
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

// ─── MODAL ────────────────────────────────────────────────────────────────────

interface ModalProps {
  contrato?: Contrato | null;
  advogados: Membro[];
  onSave: (c: Contrato) => void;
  onClose: () => void;
}

const FORM_VAZIO = {
  cliente: "", titulo: "", tipo: "honorarios_fixos" as TipoContrato,
  valorMensal: "", valorTotal: "", dataInicio: "", dataFim: "",
  status: "vigente" as StatusContrato, advogadoResponsavel: "",
  observacao: "", renovacaoAutomatica: false,
};

function Modal({ contrato, advogados, onSave, onClose }: ModalProps) {
  const [form, setForm] = useState(() =>
    contrato
      ? { cliente: contrato.cliente, titulo: contrato.titulo, tipo: contrato.tipo,
          valorMensal: contrato.valorMensal ? String(contrato.valorMensal) : "",
          valorTotal: contrato.valorTotal ? String(contrato.valorTotal) : "",
          dataInicio: contrato.dataInicio, dataFim: contrato.dataFim ?? "",
          status: contrato.status, advogadoResponsavel: contrato.advogadoResponsavel,
          observacao: contrato.observacao ?? "", renovacaoAutomatica: contrato.renovacaoAutomatica ?? false }
      : { ...FORM_VAZIO }
  );

  function upd(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((p) => ({ ...p, [e.target.name]: val }));
  }

  function handleSave() {
    if (!form.cliente.trim() || !form.titulo.trim() || !form.dataInicio) return;
    onSave({
      id: contrato?.id ?? `ct_${Date.now()}`,
      cliente: form.cliente.trim(),
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      valorMensal: form.valorMensal ? parseFloat(form.valorMensal) : undefined,
      valorTotal: form.valorTotal ? parseFloat(form.valorTotal) : undefined,
      dataInicio: form.dataInicio,
      dataFim: form.dataFim || undefined,
      status: form.status,
      advogadoResponsavel: form.advogadoResponsavel,
      observacao: form.observacao.trim() || undefined,
      renovacaoAutomatica: form.renovacaoAutomatica,
      createdAt: contrato?.createdAt ?? new Date().toISOString(),
    });
  }

  const valido = form.cliente.trim() && form.titulo.trim() && form.dataInicio;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl" style={{ background: "#fff" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
          <h2 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
            {contrato ? "Editar Contrato" : "Novo Contrato"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-60">
            <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <Label required>Cliente</Label>
            <Inp name="cliente" value={form.cliente} onChange={upd} placeholder="Nome do cliente" />
          </div>
          <div>
            <Label required>Título / Objeto</Label>
            <Inp name="titulo" value={form.titulo} onChange={upd} placeholder="Ex: Contrato de Honorários — Fase Recursal" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Tipo</Label>
              <Sel name="tipo" value={form.tipo} onChange={upd}>
                {(Object.keys(TIPO_LABEL) as TipoContrato[]).map((t) => (
                  <option key={t} value={t}>{TIPO_LABEL[t]}</option>
                ))}
              </Sel>
            </div>
            <div>
              <Label>Status</Label>
              <Sel name="status" value={form.status} onChange={upd}>
                <option value="vigente">Vigente</option>
                <option value="renovacao">Em Renovação</option>
                <option value="suspenso">Suspenso</option>
                <option value="encerrado">Encerrado</option>
              </Sel>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor mensal (R$)</Label>
              <Inp type="number" min="0" step="0.01" name="valorMensal" value={form.valorMensal} onChange={upd} placeholder="0,00" />
            </div>
            <div>
              <Label>Valor total (R$)</Label>
              <Inp type="number" min="0" step="0.01" name="valorTotal" value={form.valorTotal} onChange={upd} placeholder="0,00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Data de início</Label>
              <Inp type="date" name="dataInicio" value={form.dataInicio} onChange={upd} />
            </div>
            <div>
              <Label>Data de encerramento</Label>
              <Inp type="date" name="dataFim" value={form.dataFim} onChange={upd} />
            </div>
          </div>

          <div>
            <Label>Advogado responsável</Label>
            <Sel name="advogadoResponsavel" value={form.advogadoResponsavel} onChange={upd}>
              <option value="">Selecione...</option>
              {advogados.map((m) => (
                <option key={m.id} value={m.nome}>{labelAdvogado(m)}</option>
              ))}
            </Sel>
          </div>

          <div className="flex items-center gap-2.5">
            <input type="checkbox" id="renovAuto" name="renovacaoAutomatica"
              checked={form.renovacaoAutomatica}
              onChange={upd}
              className="h-3.5 w-3.5 rounded" style={{ accentColor: "var(--gcj-red)" }} />
            <label htmlFor="renovAuto" className="text-[11px] cursor-pointer" style={{ color: "var(--text-primary)" }}>
              Renovação automática
            </label>
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
            {contrato ? "Salvar" : "Criar contrato"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

type Filtro = "todos" | StatusContrato;

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [advogados, setAdvogados] = useState<Membro[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [contratoEdit, setContratoEdit] = useState<Contrato | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function recarregar() { setContratos(listarContratos()); }

  useEffect(() => {
    recarregar();
    setAdvogados(listarAdvogados());
  }, []);

  function handleSave(c: Contrato) {
    salvarContrato(c);
    recarregar();
    setModalAberto(false);
    setContratoEdit(null);
  }

  function handleDelete(id: string) {
    removerContrato(id);
    recarregar();
    setConfirmDelete(null);
  }

  const vigentes   = contratos.filter((c) => c.status === "vigente");
  const mrr        = vigentes.reduce((s, c) => s + (c.valorMensal ?? 0), 0);
  const arr        = vigentes.reduce((s, c) => s + (c.valorMensal ? c.valorMensal * 12 : (c.valorTotal ?? 0)), 0);
  const renovacao  = contratos.filter((c) => c.status === "renovacao").length;

  const lista = contratos
    .filter((c) => {
      const q = busca.toLowerCase();
      const matchBusca = !busca || c.titulo.toLowerCase().includes(q) || c.cliente.toLowerCase().includes(q);
      const matchFiltro = filtro === "todos" || c.status === filtro;
      return matchBusca && matchFiltro;
    })
    .sort((a, b) => b.dataInicio.localeCompare(a.dataInicio));

  const FILTROS: { value: Filtro; label: string }[] = [
    { value: "todos",    label: "Todos" },
    { value: "vigente",  label: "Vigentes" },
    { value: "renovacao",label: "Em Renovação" },
    { value: "suspenso", label: "Suspensos" },
    { value: "encerrado",label: "Encerrados" },
  ];

  return (
    <div className="space-y-5">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Contratos</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {lista.length} contrato{lista.length !== 1 ? "s" : ""} encontrado{lista.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => { setContratoEdit(null); setModalAberto(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold"
          style={{ background: "var(--gcj-red)", color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" />
          Novo Contrato
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Contratos Vigentes", value: `${vigentes.length}`,     text: "#16a34a" },
          { label: "MRR (Mensal)",       value: fmtCurrency(mrr),          text: "var(--text-primary)" },
          { label: "ARR (Anual)",        value: fmtCurrency(arr),          text: "var(--text-primary)" },
          { label: "Em Renovação",       value: `${renovacao}`,            text: "#d97706" },
        ].map(({ label, value, text }) => (
          <div key={label} className="px-5 py-4 rounded-xl" style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-lg font-bold mt-0.5" style={{ color: text }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
          <input placeholder="Buscar por título, cliente..."
            value={busca} onChange={(e) => setBusca(e.target.value)}
            className="h-8 pl-8 pr-3 text-[12px] rounded-lg w-60 focus:outline-none"
            style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>
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
          <FileSignature className="h-8 w-8 mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-[12px] font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
            {contratos.length === 0 ? "Nenhum contrato cadastrado" : "Nenhum contrato encontrado"}
          </p>
          {contratos.length === 0 && (
            <button onClick={() => { setContratoEdit(null); setModalAberto(true); }}
              className="px-4 py-2 rounded-lg text-[11px] font-semibold"
              style={{ background: "var(--gcj-red)", color: "#fff" }}>
              Criar primeiro contrato
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border-light)" }}>
                {["Título", "Cliente", "Tipo", "Advogado", "Valor", "Vigência", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((c, i) => {
                const sc = STATUS_CFG[c.status];
                return (
                  <tr key={c.id} style={{ borderTop: i > 0 ? "1px solid var(--border-light)" : undefined }}>
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>{c.titulo}</p>
                      {c.renovacaoAutomatica && (
                        <span className="inline-flex items-center gap-1 text-[10px] mt-0.5" style={{ color: "#2563eb" }}>
                          <RefreshCw className="h-2.5 w-2.5" /> Auto-renovação
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: "var(--text-secondary)" }}>{c.cliente}</td>
                    <td className="px-4 py-3 text-[11px]" style={{ color: "var(--text-muted)" }}>{TIPO_LABEL[c.tipo]}</td>
                    <td className="px-4 py-3 text-[11px]" style={{ color: "var(--text-secondary)" }}>{c.advogadoResponsavel || "—"}</td>
                    <td className="px-4 py-3 text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                      {c.valorMensal ? `${fmtCurrency(c.valorMensal)}/mês` : c.valorTotal ? fmtCurrency(c.valorTotal) : "—"}
                    </td>
                    <td className="px-4 py-3 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      {fmtDate(c.dataInicio)}{c.dataFim ? ` → ${fmtDate(c.dataFim)}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setContratoEdit(c); setModalAberto(true); }}
                          className="p-1.5 rounded-lg hover:opacity-70"
                          style={{ background: "var(--bg)", color: "var(--text-secondary)" }}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setConfirmDelete(c.id)}
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

      {modalAberto && (
        <Modal
          contrato={contratoEdit}
          advogados={advogados}
          onSave={handleSave}
          onClose={() => { setModalAberto(false); setContratoEdit(null); }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: "#fff" }}>
            <p className="text-[13px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>Excluir contrato?</p>
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
