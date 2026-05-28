"use client";
import { useState, useEffect } from "react";
import {
  listarEquipe, salvarMembro, removerMembro,
  type Membro, type Cargo,
} from "@/lib/datajuri/equipe-storage";
import {
  Plus, UserCog, Mail, Phone, FileText,
  Edit3, Trash2, X, Save, AlertCircle,
} from "lucide-react";

const cargoConfig: Record<Cargo, { label: string; color: string; bg: string }> = {
  socio:          { label: "Sócio(a)",       color: "#8b2333", bg: "#fef2f4" },
  advogado:       { label: "Advogado(a)",    color: "#2563eb", bg: "#eff6ff" },
  estagiario:     { label: "Estagiário(a)",  color: "#7c3aed", bg: "#f5f3ff" },
  administrativo: { label: "Administrativo", color: "#6b7280", bg: "#f3f4f6" },
};

const VAZIO: Omit<Membro, "id"> = {
  nome: "", cargo: "advogado", oab: "", email: "",
  telefone: "", especialidade: "", ativo: true,
};

function Iniciais({ nome }: { nome: string }) {
  const parts = nome.trim().split(" ");
  const ini = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].substring(0, 2);
  return (
    <div
      className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
      style={{ background: "var(--gcj-red)" }}
    >
      {ini.toUpperCase()}
    </div>
  );
}

function Inp({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none"
        style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#111")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function Modal({
  membro, onSave, onClose,
}: {
  membro: Membro | null;
  onSave: (m: Membro) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Membro, "id">>(
    membro ? { ...membro } : { ...VAZIO }
  );
  const [erro, setErro] = useState("");

  function upd<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleSave() {
    if (!form.nome.trim()) { setErro("Nome é obrigatório."); return; }
    if ((form.cargo === "socio" || form.cargo === "advogado") && !form.oab?.trim()) {
      setErro("OAB é obrigatória para sócios e advogados."); return;
    }
    onSave({ ...form, id: membro?.id ?? `m_${Date.now()}` });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl" style={{ background: "#fff" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <UserCog className="h-4 w-4" style={{ color: "var(--gcj-red)" }} />
            <span className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
              {membro ? "Editar Membro" : "Novo Membro"}
            </span>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <Inp label="Nome completo *" value={form.nome} onChange={(v) => upd("nome", v)} placeholder="Nome do membro" />

          {/* Cargo */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: "var(--text-muted)" }}>
              Cargo *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(cargoConfig) as [Cargo, typeof cargoConfig[Cargo]][]).map(([key, c]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => upd("cargo", key)}
                  className="px-3 py-2 rounded-lg text-[11px] font-semibold text-left transition-all"
                  style={form.cargo === key
                    ? { background: c.bg, color: c.color, border: `1.5px solid ${c.color}` }
                    : { background: "var(--bg)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Inp label="OAB" value={form.oab ?? ""} onChange={(v) => upd("oab", v)} placeholder="OAB/SC 00000" />
            <Inp label="E-mail" type="email" value={form.email ?? ""} onChange={(v) => upd("email", v)} placeholder="email@gcj.adv.br" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Inp label="Telefone" value={form.telefone ?? ""} onChange={(v) => upd("telefone", v)} placeholder="(48) 99999-9999" />
            <Inp label="Especialidade" value={form.especialidade ?? ""} onChange={(v) => upd("especialidade", v)} placeholder="Direito Civil, Trabalhista..." />
          </div>

          {/* Ativo */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => upd("ativo", !form.ativo)}
              className="relative h-5 w-9 rounded-full transition-colors"
              style={{ background: form.ativo ? "var(--gcj-red)" : "#d1d5db" }}
            >
              <span
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                style={{ transform: form.ativo ? "translateX(16px)" : "translateX(2px)" }}
              />
            </button>
            <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
              {form.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>

          {erro && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px]" style={{ background: "#fef2f2", color: "#dc2626" }}>
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {erro}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] font-medium"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            Cancelar
          </button>
          <button type="button" onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-semibold"
            style={{ background: "var(--gcj-red)", color: "#fff" }}>
            <Save className="h-3.5 w-3.5" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CARD DO MEMBRO ───────────────────────────────────────────────────────────
function CardMembro({ m, onEdit, onDelete }: {
  m: Membro;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const c = cargoConfig[m.cargo];
  return (
    <div
      className="rounded-xl p-5 transition-shadow hover:shadow-sm"
      style={{ background: "#fff", border: "1px solid var(--border)", opacity: m.ativo ? 1 : 0.55 }}
    >
      <div className="flex items-start gap-3">
        <Iniciais nome={m.nome} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>{m.nome}</p>
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5"
                style={{ color: c.color, background: c.bg }}>
                {c.label}
              </span>
              {!m.ativo && (
                <span className="ml-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: "#6b7280", background: "#f3f4f6" }}>
                  Inativo
                </span>
              )}
            </div>
            <div className="flex gap-0.5 shrink-0">
              <button type="button" onClick={onEdit}
                aria-label="Editar"
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <Edit3 className="h-3.5 w-3.5 text-gray-400" />
              </button>
              <button type="button" onClick={onDelete}
                aria-label="Excluir"
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            {m.oab && (
              <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                <FileText className="h-3 w-3 shrink-0" style={{ color: "var(--text-muted)" }} />
                {m.oab}
              </div>
            )}
            {m.email && (
              <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                <Mail className="h-3 w-3 shrink-0" style={{ color: "var(--text-muted)" }} />
                {m.email}
              </div>
            )}
            {m.telefone && (
              <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                <Phone className="h-3 w-3 shrink-0" style={{ color: "var(--text-muted)" }} />
                {m.telefone}
              </div>
            )}
            {m.especialidade && (
              <p className="text-[10px] mt-2 pt-2 border-t" style={{ color: "var(--text-muted)", borderColor: "var(--border-light)" }}>
                {m.especialidade}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function EquipePage() {
  const [equipe, setEquipe] = useState<Membro[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [membroEditando, setMembroEditando] = useState<Membro | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => { setEquipe(listarEquipe()); }, []);

  function handleSave(m: Membro) {
    salvarMembro(m);
    setEquipe(listarEquipe());
    setModalAberto(false);
    setMembroEditando(null);
  }

  function handleDelete(id: string) {
    removerMembro(id);
    setEquipe(listarEquipe());
    setConfirmDelete(null);
  }

  function abrirNovo() { setMembroEditando(null); setModalAberto(true); }
  function abrirEditar(m: Membro) { setMembroEditando(m); setModalAberto(true); }
  function fecharModal() { setModalAberto(false); setMembroEditando(null); }

  const socios = equipe.filter((m) => m.cargo === "socio");
  const advogados = equipe.filter((m) => m.cargo === "advogado");
  const estagiarios = equipe.filter((m) => m.cargo === "estagiario");
  const administrativos = equipe.filter((m) => m.cargo === "administrativo");

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Equipe</h1>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {equipe.filter((m) => m.ativo).length} ativo{equipe.filter((m) => m.ativo).length !== 1 ? "s" : ""} · {equipe.length} total
          </p>
        </div>
        <button type="button" onClick={abrirNovo}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold"
          style={{ background: "var(--gcj-red)", color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" />
          Novo Membro
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(cargoConfig) as [Cargo, typeof cargoConfig[Cargo]][]).map(([key, c]) => {
          const count = equipe.filter((m) => m.cargo === key && m.ativo).length;
          return (
            <div key={key} className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>{c.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: c.color }}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Grupos */}
      {[
        { titulo: "Sócios",          icone: UserCog, lista: socios },
        { titulo: "Advogados",       icone: UserCog, lista: advogados },
        { titulo: "Estagiários",     icone: UserCog, lista: estagiarios },
        { titulo: "Administrativo",  icone: UserCog, lista: administrativos },
      ].filter((g) => g.lista.length > 0).map((grupo) => (
        <div key={grupo.titulo}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5"
            style={{ color: "var(--text-muted)" }}>
            <grupo.icone className="h-3 w-3" />
            {grupo.titulo}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grupo.lista.map((m) => (
              <CardMembro
                key={m.id}
                m={m}
                onEdit={() => abrirEditar(m)}
                onDelete={() => setConfirmDelete(m.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {equipe.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ background: "#fff", border: "1px dashed var(--border)" }}>
          <UserCog className="h-10 w-10 mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Nenhum membro cadastrado</p>
          <button type="button" onClick={abrirNovo}
            className="mt-3 px-4 py-2 rounded-lg text-[12px] font-semibold"
            style={{ background: "var(--gcj-red)", color: "#fff" }}>
            Adicionar primeiro membro
          </button>
        </div>
      )}

      {/* Modal add/edit */}
      {modalAberto && (
        <Modal membro={membroEditando} onSave={handleSave} onClose={fecharModal} />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4" style={{ background: "#fff" }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#fef2f2" }}>
                <Trash2 className="h-5 w-5" style={{ color: "#dc2626" }} />
              </div>
              <div>
                <p className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>Excluir membro</p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {equipe.find((m) => m.id === confirmDelete)?.nome} será removido permanentemente.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-[12px] font-medium"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                Cancelar
              </button>
              <button type="button" onClick={() => handleDelete(confirmDelete)}
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
