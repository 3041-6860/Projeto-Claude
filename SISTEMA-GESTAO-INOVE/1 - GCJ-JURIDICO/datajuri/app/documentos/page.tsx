"use client";
import { useState, useEffect, useRef } from "react";
import {
  FileText, Search, Plus, Upload, FolderOpen,
  FileSignature, Clipboard, Microscope, Scale, ArrowUpRight,
  X, Save, Trash2, Edit2,
} from "lucide-react";
import Link from "next/link";
import { listarDocumentos, salvarDocumento, removerDocumento, formatarTamanho } from "@/lib/documentos-storage";
import type { Documento, TipoDocumento } from "@/lib/documentos-storage";
import { listarProcessos } from "@/lib/processos-storage";
import { listarAdvogados } from "@/lib/equipe-storage";
import type { Processo } from "@/lib/mock-data";
import type { Membro } from "@/lib/equipe-storage";

// ─── CONFIGS ─────────────────────────────────────────────────────────────────

type TipoIcone = React.ElementType;

const TIPO_CFG: Record<TipoDocumento, { label: string; icon: TipoIcone; color: string; bg: string }> = {
  peticao:    { label: "Petição",    icon: FileText,      color: "var(--gcj-red)", bg: "#fef2f2" },
  contrato:   { label: "Contrato",   icon: FileSignature, color: "#7c3aed",        bg: "#f5f3ff" },
  ata:        { label: "Ata",        icon: Clipboard,     color: "#0891b2",        bg: "#ecfeff" },
  laudo:      { label: "Laudo",      icon: Microscope,    color: "#d97706",        bg: "#fffbeb" },
  decisao:    { label: "Decisão",    icon: Scale,         color: "#dc2626",        bg: "#fef2f2" },
  recurso:    { label: "Recurso",    icon: ArrowUpRight,  color: "#0284c7",        bg: "#f0f9ff" },
  procuracao: { label: "Procuração", icon: FileText,      color: "#16a34a",        bg: "#f0fdf4" },
  outros:     { label: "Outros",     icon: FileText,      color: "#6b7280",        bg: "#f9fafb" },
};

function fmtDate(iso: string): string {
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

// ─── MODAL ────────────────────────────────────────────────────────────────────

interface ModalProps {
  documento?: Documento | null;
  processos: Processo[];
  advogados: Membro[];
  onSave: (d: Documento) => void;
  onClose: () => void;
}

const FORM_VAZIO = {
  nome: "", tipo: "peticao" as TipoDocumento, cliente: "",
  processoId: "", processoNumero: "", tamanho: "",
  autor: "", observacao: "",
};

function Modal({ documento, processos, advogados, onSave, onClose }: ModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(() =>
    documento
      ? { nome: documento.nome, tipo: documento.tipo, cliente: documento.cliente,
          processoId: documento.processoId ?? "", processoNumero: documento.processoNumero ?? "",
          tamanho: documento.tamanho, autor: documento.autor, observacao: documento.observacao ?? "" }
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

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, nome: f.nome || file.name, tamanho: formatarTamanho(file.size) }));
  }

  function handleSave() {
    if (!form.nome.trim() || !form.autor.trim()) return;
    onSave({
      id: documento?.id ?? `doc_${Date.now()}`,
      nome: form.nome.trim(),
      tipo: form.tipo,
      cliente: form.cliente.trim(),
      processoId: form.processoId || undefined,
      processoNumero: form.processoNumero || undefined,
      tamanho: form.tamanho || "—",
      autor: form.autor.trim(),
      dataUpload: documento?.dataUpload ?? new Date().toISOString().split("T")[0],
      observacao: form.observacao.trim() || undefined,
    });
  }

  const valido = form.nome.trim() && form.autor.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl" style={{ background: "#fff" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
          <h2 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
            {documento ? "Editar Documento" : "Registrar Documento"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-60">
            <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Selecionar arquivo */}
          {!documento && (
            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center py-5 rounded-xl cursor-pointer transition-colors"
              style={{ background: "var(--bg)", border: "2px dashed var(--border)" }}>
              <Upload className="h-6 w-6 mb-2" style={{ color: "var(--text-muted)" }} />
              <p className="text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                {form.tamanho ? `Arquivo selecionado (${form.tamanho})` : "Clique para selecionar arquivo"}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>PDF, DOCX, XLSX, JPG, PNG...</p>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFile}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt" />
            </div>
          )}

          <div>
            <Label required>Nome do documento</Label>
            <Inp name="nome" value={form.nome} onChange={upd} placeholder="Ex: Petição inicial — João Silva" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Tipo</Label>
              <Sel name="tipo" value={form.tipo} onChange={upd}>
                {(Object.keys(TIPO_CFG) as TipoDocumento[]).map((t) => (
                  <option key={t} value={t}>{TIPO_CFG[t].label}</option>
                ))}
              </Sel>
            </div>
            <div>
              <Label required>Autor / Responsável</Label>
              <Sel name="autor" value={form.autor} onChange={(e) => setForm((f) => ({ ...f, autor: e.target.value }))}>
                <option value="">Selecione...</option>
                {advogados.map((m) => (
                  <option key={m.id} value={m.nome}>{m.nome}</option>
                ))}
              </Sel>
            </div>
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

          {!form.processoId && (
            <div>
              <Label>Cliente</Label>
              <Inp name="cliente" value={form.cliente} onChange={upd} placeholder="Nome do cliente" />
            </div>
          )}

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
            {documento ? "Salvar" : "Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [advogados, setAdvogados] = useState<Membro[]>([]);
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | TipoDocumento>("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [docEdit, setDocEdit] = useState<Documento | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function recarregar() { setDocumentos(listarDocumentos()); }

  useEffect(() => {
    recarregar();
    setProcessos(listarProcessos());
    setAdvogados(listarAdvogados());
  }, []);

  function handleSave(d: Documento) {
    salvarDocumento(d);
    recarregar();
    setModalAberto(false);
    setDocEdit(null);
  }

  function handleDelete(id: string) {
    removerDocumento(id);
    recarregar();
    setConfirmDelete(null);
  }

  const filtrados = documentos
    .filter((d) => {
      const q = busca.toLowerCase();
      const matchBusca = !busca || d.nome.toLowerCase().includes(q) ||
        d.cliente.toLowerCase().includes(q) || (d.processoNumero ?? "").toLowerCase().includes(q);
      const matchTipo = tipoFiltro === "todos" || d.tipo === tipoFiltro;
      return matchBusca && matchTipo;
    })
    .sort((a, b) => b.dataUpload.localeCompare(a.dataUpload));

  const TIPOS_KPI: TipoDocumento[] = ["peticao", "decisao", "laudo", "contrato"];

  return (
    <div className="space-y-5">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Documentos</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {filtrados.length} documento{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => { setDocEdit(null); setModalAberto(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold"
          style={{ background: "var(--gcj-red)", color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" />
          Registrar Documento
        </button>
      </div>

      {/* KPIs por tipo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TIPOS_KPI.map((tipo) => {
          const t = TIPO_CFG[tipo];
          const Icon = t.icon;
          const count = documentos.filter((d) => d.tipo === tipo).length;
          const ativo = tipoFiltro === tipo;
          return (
            <button key={tipo} onClick={() => setTipoFiltro(ativo ? "todos" : tipo)}
              className="text-left px-4 py-3 rounded-xl transition-all"
              style={{ background: ativo ? t.bg : "#fff", border: `1px solid ${ativo ? t.color : "var(--border)"}` }}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: t.bg, color: t.color }}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{t.label}s</p>
                  <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{count}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filtros + busca */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
          <input placeholder="Buscar por nome, cliente, processo..."
            value={busca} onChange={(e) => setBusca(e.target.value)}
            className="h-8 pl-8 pr-3 text-[12px] rounded-lg w-72 focus:outline-none"
            style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        <button onClick={() => setTipoFiltro("todos")}
          className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
          style={tipoFiltro === "todos"
            ? { background: "var(--gcj-red)", color: "#fff" }
            : { background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
          Todos
        </button>
        {(Object.keys(TIPO_CFG) as TipoDocumento[]).map((tipo) => (
          <button key={tipo} onClick={() => setTipoFiltro(tipoFiltro === tipo ? "todos" : tipo)}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
            style={tipoFiltro === tipo
              ? { background: "var(--gcj-red)", color: "#fff" }
              : { background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            {TIPO_CFG[tipo].label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <FolderOpen className="h-8 w-8 mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-[12px] font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
            {documentos.length === 0 ? "Nenhum documento registrado" : "Nenhum documento encontrado"}
          </p>
          {documentos.length === 0 && (
            <button onClick={() => { setDocEdit(null); setModalAberto(true); }}
              className="px-4 py-2 rounded-lg text-[11px] font-semibold"
              style={{ background: "var(--gcj-red)", color: "#fff" }}>
              Registrar primeiro documento
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          {filtrados.map((doc, i) => {
            const t = TIPO_CFG[doc.tipo];
            const Icon = t.icon;
            return (
              <div key={doc.id}
                className="flex items-center gap-4 px-5 py-3.5"
                style={{ borderTop: i > 0 ? "1px solid var(--border-light)" : undefined }}>
                <div className="h-10 w-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: t.bg, color: t.color }}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{doc.nome}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{doc.cliente || "—"}</span>
                    {doc.processoNumero && (
                      <>
                        <span style={{ color: "var(--border)" }}>•</span>
                        <Link href={`/processos/${doc.processoId}`}
                          className="font-mono text-[10px] hover:underline" style={{ color: "var(--gcj-red)" }}>
                          {doc.processoNumero}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: t.color, background: t.bg }}>
                    {t.label}
                  </span>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{doc.tamanho}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{fmtDate(doc.dataUpload)}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{doc.autor}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setDocEdit(doc); setModalAberto(true); }}
                    className="p-1.5 rounded-lg hover:opacity-70"
                    style={{ background: "var(--bg)", color: "var(--text-secondary)" }}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setConfirmDelete(doc.id)}
                    className="p-1.5 rounded-lg hover:opacity-70"
                    style={{ background: "var(--bg)", color: "#dc2626" }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <Modal
          documento={docEdit}
          processos={processos}
          advogados={advogados}
          onSave={handleSave}
          onClose={() => { setModalAberto(false); setDocEdit(null); }}
        />
      )}

      {/* Confirmar exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: "#fff" }}>
            <p className="text-[13px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>Excluir documento?</p>
            <p className="text-[11px] mb-5" style={{ color: "var(--text-muted)" }}>O registro será removido. Esta ação não pode ser desfeita.</p>
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
