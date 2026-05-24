"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Wrench, Clock, DollarSign, X, Save, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { listarServicos, salvarServico, removerServico } from "@/lib/servicos-storage";
import type { Servico, CategoriaServico } from "@/lib/servicos-storage";

// ─── CONFIGS ─────────────────────────────────────────────────────────────────

const CAT_CFG: Record<CategoriaServico, { label: string; color: string; bg: string }> = {
  consultivo:  { label: "Consultivo",  color: "#2563eb", bg: "#eff6ff" },
  contencioso: { label: "Contencioso", color: "var(--gcj-red)", bg: "#fef2f4" },
  societario:  { label: "Societário",  color: "#7c3aed", bg: "#f5f3ff" },
  trabalhista: { label: "Trabalhista", color: "#d97706", bg: "#fffbeb" },
  preventivo:  { label: "Preventivo",  color: "#16a34a", bg: "#f0fdf4" },
};

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
  servico?: Servico | null;
  onSave: (s: Servico) => void;
  onClose: () => void;
}

const FORM_VAZIO = {
  nome: "", categoria: "consultivo" as CategoriaServico,
  descricao: "", valorHora: "", valorFixo: "", ativo: true,
};

function Modal({ servico, onSave, onClose }: ModalProps) {
  const [form, setForm] = useState(() =>
    servico
      ? { nome: servico.nome, categoria: servico.categoria, descricao: servico.descricao,
          valorHora: servico.valorHora ? String(servico.valorHora) : "",
          valorFixo: servico.valorFixo ? String(servico.valorFixo) : "",
          ativo: servico.ativo }
      : { ...FORM_VAZIO }
  );

  function upd(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleSave() {
    if (!form.nome.trim()) return;
    onSave({
      id: servico?.id ?? `srv_${Date.now()}`,
      nome: form.nome.trim(),
      categoria: form.categoria,
      descricao: form.descricao.trim(),
      valorHora: form.valorHora ? parseFloat(form.valorHora) : undefined,
      valorFixo: form.valorFixo ? parseFloat(form.valorFixo) : undefined,
      ativo: form.ativo,
      createdAt: servico?.createdAt ?? new Date().toISOString(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-md rounded-2xl shadow-2xl" style={{ background: "#fff" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
          <h2 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
            {servico ? "Editar Serviço" : "Novo Serviço"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-60">
            <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <Label required>Nome do serviço</Label>
            <Inp name="nome" value={form.nome} onChange={upd} placeholder="Ex: Consultoria Trabalhista" />
          </div>

          <div>
            <Label required>Categoria</Label>
            <Sel name="categoria" value={form.categoria} onChange={upd}>
              {(Object.keys(CAT_CFG) as CategoriaServico[]).map((c) => (
                <option key={c} value={c}>{CAT_CFG[c].label}</option>
              ))}
            </Sel>
          </div>

          <div>
            <Label>Descrição</Label>
            <textarea name="descricao" value={form.descricao} onChange={upd} rows={3}
              placeholder="Descreva o serviço prestado..."
              className="w-full px-3 py-2 text-[12px] rounded-lg resize-none focus:outline-none transition-colors"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#111"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor por hora (R$)</Label>
              <Inp type="number" min="0" step="0.01" name="valorHora" value={form.valorHora} onChange={upd} placeholder="0,00" />
            </div>
            <div>
              <Label>Valor fixo (R$)</Label>
              <Inp type="number" min="0" step="0.01" name="valorFixo" value={form.valorFixo} onChange={upd} placeholder="0,00" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <input type="checkbox" id="ativo" checked={form.ativo}
              onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
              className="h-3.5 w-3.5 rounded" style={{ accentColor: "var(--gcj-red)" }} />
            <label htmlFor="ativo" className="text-[11px] cursor-pointer" style={{ color: "var(--text-primary)" }}>
              Serviço ativo (disponível para uso)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: "var(--border-light)" }}>
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] font-medium"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!form.nome.trim()}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-40"
            style={{ background: "var(--gcj-red)", color: "#fff" }}>
            <Save className="h-3.5 w-3.5" />
            {servico ? "Salvar" : "Criar serviço"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [busca, setBusca] = useState("");
  const [catFiltro, setCatFiltro] = useState<"todas" | CategoriaServico>("todas");
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEdit, setServicoEdit] = useState<Servico | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function recarregar() { setServicos(listarServicos()); }
  useEffect(() => { recarregar(); }, []);

  function handleSave(s: Servico) {
    salvarServico(s);
    recarregar();
    setModalAberto(false);
    setServicoEdit(null);
  }

  function handleDelete(id: string) {
    removerServico(id);
    recarregar();
    setConfirmDelete(null);
  }

  function toggleAtivo(s: Servico) {
    salvarServico({ ...s, ativo: !s.ativo });
    recarregar();
  }

  const ativos    = servicos.filter((s) => s.ativo).length;
  const cats      = new Set(servicos.map((s) => s.categoria)).size;
  const valorMed  = (() => {
    const comValor = servicos.filter((s) => s.ativo && (s.valorFixo ?? s.valorHora));
    if (!comValor.length) return 0;
    return comValor.reduce((acc, s) => acc + (s.valorFixo ?? s.valorHora ?? 0), 0) / comValor.length;
  })();

  const lista = servicos.filter((s) => {
    const q = busca.toLowerCase();
    const matchBusca = !busca || s.nome.toLowerCase().includes(q) || s.descricao.toLowerCase().includes(q);
    const matchCat   = catFiltro === "todas" || s.categoria === catFiltro;
    const matchAtivo = mostrarInativos || s.ativo;
    return matchBusca && matchCat && matchAtivo;
  });

  return (
    <div className="space-y-5">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Serviços</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Catálogo de serviços jurídicos do escritório</p>
        </div>
        <button onClick={() => { setServicoEdit(null); setModalAberto(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold"
          style={{ background: "var(--gcj-red)", color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" />
          Novo Serviço
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Serviços Ativos", value: String(ativos),      icon: Wrench,      text: "var(--gcj-red)" },
          { label: "Categorias",      value: String(cats),         icon: Clock,       text: "var(--text-primary)" },
          { label: "Valor Médio Base",value: fmtCurrency(valorMed),icon: DollarSign,  text: "var(--text-primary)" },
        ].map(({ label, value, icon: Icon, text }) => (
          <div key={label} className="flex items-center gap-3 px-5 py-4 rounded-xl" style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#fef2f2" }}>
              <Icon className="h-4 w-4" style={{ color: "var(--gcj-red)" }} />
            </div>
            <div>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className="text-lg font-bold" style={{ color: text }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
          <input placeholder="Buscar serviço..."
            value={busca} onChange={(e) => setBusca(e.target.value)}
            className="h-8 pl-8 pr-3 text-[12px] rounded-lg w-52 focus:outline-none"
            style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        <button onClick={() => setCatFiltro("todas")}
          className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
          style={catFiltro === "todas"
            ? { background: "var(--gcj-red)", color: "#fff" }
            : { background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
          Todas
        </button>
        {(Object.keys(CAT_CFG) as CategoriaServico[]).map((cat) => (
          <button key={cat} onClick={() => setCatFiltro(catFiltro === cat ? "todas" : cat)}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
            style={catFiltro === cat
              ? { background: "var(--gcj-red)", color: "#fff" }
              : { background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            {CAT_CFG[cat].label}
          </button>
        ))}
        <button onClick={() => setMostrarInativos((v) => !v)}
          className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-full text-[11px] font-medium"
          style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
          {mostrarInativos ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
          {mostrarInativos ? "Ocultar inativos" : "Mostrar inativos"}
        </button>
      </div>

      {/* Cards */}
      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <Wrench className="h-8 w-8 mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-[12px] font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
            {servicos.length === 0 ? "Nenhum serviço cadastrado" : "Nenhum serviço encontrado"}
          </p>
          {servicos.length === 0 && (
            <button onClick={() => { setServicoEdit(null); setModalAberto(true); }}
              className="px-4 py-2 rounded-lg text-[11px] font-semibold"
              style={{ background: "var(--gcj-red)", color: "#fff" }}>
              Criar primeiro serviço
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {lista.map((s) => {
            const c = CAT_CFG[s.categoria];
            return (
              <div key={s.id} className="rounded-xl p-5 transition-shadow hover:shadow-md"
                style={{ background: "#fff", border: "1px solid var(--border)", opacity: s.ativo ? 1 : 0.55 }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide"
                    style={{ color: c.color, background: c.bg }}>{c.label}</span>
                  <span className="text-[12px] font-bold" style={{ color: "var(--gcj-red)" }}>
                    {s.valorHora ? `R$ ${s.valorHora}/h` : s.valorFixo ? fmtCurrency(s.valorFixo) : ""}
                  </span>
                </div>
                <h3 className="text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>{s.nome}</h3>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{s.descricao}</p>
                {s.valorHora && (
                  <div className="flex items-center gap-1 mt-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <Clock className="h-3 w-3" />
                    Atendimento por hora
                  </div>
                )}
                <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t" style={{ borderColor: "var(--border-light)" }}>
                  <button onClick={() => toggleAtivo(s)} title={s.ativo ? "Desativar" : "Ativar"}
                    className="p-1.5 rounded-lg hover:opacity-70 text-[10px] font-semibold"
                    style={{ background: s.ativo ? "#f0fdf4" : "#f3f4f6", color: s.ativo ? "#16a34a" : "#6b7280" }}>
                    {s.ativo ? "Ativo" : "Inativo"}
                  </button>
                  <button onClick={() => { setServicoEdit(s); setModalAberto(true); }}
                    className="p-1.5 rounded-lg hover:opacity-70"
                    style={{ background: "var(--bg)", color: "var(--text-secondary)" }}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setConfirmDelete(s.id)}
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

      {modalAberto && (
        <Modal
          servico={servicoEdit}
          onSave={handleSave}
          onClose={() => { setModalAberto(false); setServicoEdit(null); }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: "#fff" }}>
            <p className="text-[13px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>Excluir serviço?</p>
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
