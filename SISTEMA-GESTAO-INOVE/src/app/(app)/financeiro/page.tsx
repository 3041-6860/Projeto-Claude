"use client";

import { useState, useEffect } from "react";

// ── Tipos ─────────────────────────────────────────────────
type Tipo   = "Receita" | "Despesa";
type Status = "Pendente" | "Recebido" | "Pago" | "Cancelado";

interface Lancamento {
  id:     string;
  desc:   string;
  tipo:   Tipo;
  cat:    string;
  valor:  number;   // sempre positivo
  data:   string;   // YYYY-MM-DD
  status: Status;
  obs?:   string;
}

const SK = "inove-financeiro-v1";
const CATEGORIAS = ["Honorários","Serviços","RH","Infraestrutura","TI","Marketing","Impostos","Outros"];
const STATUS_OPT: Status[] = ["Pendente","Recebido","Pago","Cancelado"];

const statusBadge: Record<Status, string> = {
  Recebido:  "badge badge-green",
  Pago:      "badge badge-navy",
  Pendente:  "badge badge-orange",
  Cancelado: "badge badge-red",
};

function fmtBRL(v: number) {
  return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtData(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

const EMPTY_FORM = (): Partial<Lancamento> => ({
  desc: "", tipo: "Receita", cat: "Honorários",
  valor: 0, data: new Date().toISOString().slice(0, 10),
  status: "Pendente", obs: "",
});

// ── Componente principal ──────────────────────────────────
export default function Financeiro() {
  const [lista,    setLista]    = useState<Lancamento[]>([]);
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState<Partial<Lancamento>>(EMPTY_FORM());
  const [editId,   setEditId]   = useState<string | null>(null);
  const [filtTipo, setFiltTipo] = useState("");
  const [filtCat,  setFiltCat]  = useState("");
  const [filtSt,   setFiltSt]   = useState("");
  const [delId,    setDelId]    = useState<string | null>(null);

  // Carregar do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SK);
      if (raw) setLista(JSON.parse(raw));
    } catch {}
  }, []);

  function salvar(updated: Lancamento[]) {
    setLista(updated);
    localStorage.setItem(SK, JSON.stringify(updated));
  }

  function abrirNovo() {
    setForm(EMPTY_FORM());
    setEditId(null);
    setModal(true);
  }

  function abrirEditar(l: Lancamento) {
    setForm({ ...l });
    setEditId(l.id);
    setModal(true);
  }

  function confirmar() {
    if (!form.desc?.trim() || !form.valor || !form.data) return;
    const item: Lancamento = {
      id:     editId ?? newId(),
      desc:   form.desc!.trim(),
      tipo:   form.tipo   ?? "Receita",
      cat:    form.cat    ?? "Outros",
      valor:  Math.abs(Number(form.valor)),
      data:   form.data!,
      status: form.status ?? "Pendente",
      obs:    form.obs ?? "",
    };
    if (editId) {
      salvar(lista.map(l => l.id === editId ? item : l));
    } else {
      salvar([item, ...lista]);
    }
    setModal(false);
  }

  function excluir(id: string) {
    salvar(lista.filter(l => l.id !== id));
    setDelId(null);
  }

  // ── KPIs ─────────────────────────────────────────────────
  const receita  = lista.filter(l => l.tipo === "Receita"  && l.status !== "Cancelado").reduce((s, l) => s + l.valor, 0);
  const despesa  = lista.filter(l => l.tipo === "Despesa"  && l.status !== "Cancelado").reduce((s, l) => s + l.valor, 0);
  const saldo    = receita - despesa;
  const aReceber = lista.filter(l => l.tipo === "Receita" && l.status === "Pendente").reduce((s, l) => s + l.valor, 0);

  // ── Filtros ───────────────────────────────────────────────
  const filtrada = lista.filter(l =>
    (!filtTipo || l.tipo === filtTipo) &&
    (!filtCat  || l.cat  === filtCat)  &&
    (!filtSt   || l.status === filtSt)
  ).sort((a, b) => b.data.localeCompare(a.data));

  const mesAtual = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="dash-wrap">
      {/* Toolbar */}
      <div className="pg-toolbar">
        <div>
          <p className="pg-title">Financeiro — Fluxo de Caixa</p>
          <p className="pg-sub">{mesAtual} · {lista.length} lançamento{lista.length !== 1 ? "s" : ""} cadastrado{lista.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-navy" onClick={abrirNovo}>+ Lançamento</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2.5 mb-3">
        {[
          { label: "Receita (total)",  val: receita  > 0 ? fmtBRL(receita)  : "—", hint: "Receitas cadastradas",    cls: receita  > 0 ? "val-green" : "val-gray" },
          { label: "Despesas (total)", val: despesa  > 0 ? fmtBRL(despesa)  : "—", hint: "Despesas cadastradas",    cls: despesa  > 0 ? "val-navy"  : "val-gray" },
          { label: "Saldo",            val: lista.length > 0 ? fmtBRL(saldo) : "—", hint: "Receita − Despesas",     cls: saldo    >= 0 ? "val-green" : "val-red"  },
          { label: "A Receber",        val: aReceber > 0 ? fmtBRL(aReceber) : "—", hint: "Receitas pendentes",      cls: aReceber > 0 ? "val-navy"  : "val-gray" },
        ].map((c) => (
          <div key={c.label} className="card">
            <p className="card-label">{c.label}</p>
            <p className={`card-val ${c.cls}`}>{c.val}</p>
            <p className="card-hint">{c.hint}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="filter-bar">
        <select value={filtTipo} onChange={e => setFiltTipo(e.target.value)}>
          <option value="">Receitas e Despesas</option>
          <option>Receita</option>
          <option>Despesa</option>
        </select>
        <select value={filtCat} onChange={e => setFiltCat(e.target.value)}>
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filtSt} onChange={e => setFiltSt(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUS_OPT.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Tabela */}
      {filtrada.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: "#6b7280" }}>
            {lista.length === 0 ? "Nenhum lançamento cadastrado" : "Nenhum resultado para os filtros"}
          </p>
          <p style={{ fontSize: 13 }}>
            {lista.length === 0 ? 'Clique em "+ Lançamento" para começar.' : "Tente remover os filtros."}
          </p>
        </div>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Data</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtrada.map((l) => (
              <tr key={l.id}>
                <td style={{ fontWeight: 600 }}>{l.desc}</td>
                <td>
                  <span className={l.tipo === "Receita" ? "badge badge-green" : "badge badge-red"}>
                    {l.tipo}
                  </span>
                </td>
                <td>{l.cat}</td>
                <td style={{ fontWeight: 700, color: l.tipo === "Receita" ? "#059669" : "#dc2626" }}>
                  {l.tipo === "Receita" ? "+ " : "− "}{fmtBRL(l.valor)}
                </td>
                <td style={{ color: "#6b7280" }}>{fmtData(l.data)}</td>
                <td><span className={statusBadge[l.status]}>{l.status}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => abrirEditar(l)}>Editar</button>
                    <button className="btn btn-outline btn-sm"
                      style={{ color: "#dc2626", borderColor: "#fca5a5" }}
                      onClick={() => setDelId(l.id)}>×</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Modal Lançamento ── */}
      {modal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "white", borderRadius: 12, padding: 28,
            width: 480, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 20 }}>
              {editId ? "Editar Lançamento" : "Novo Lançamento"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Descrição *</label>
                <input type="text" value={form.desc ?? ""} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                  placeholder="Ex: Honorários GCJ — Junho"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Tipo *</label>
                  <select value={form.tipo ?? "Receita"} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as Tipo }))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
                    <option>Receita</option>
                    <option>Despesa</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Categoria</label>
                  <select value={form.cat ?? "Honorários"} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Valor (R$) *</label>
                  <input type="number" min="0" step="0.01" value={form.valor ?? ""}
                    onChange={e => setForm(f => ({ ...f, valor: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Data *</label>
                  <input type="date" value={form.data ?? ""}
                    onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Status</label>
                <select value={form.status ?? "Pendente"} onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
                  {STATUS_OPT.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Observação (opcional)</label>
                <textarea value={form.obs ?? ""} onChange={e => setForm(f => ({ ...f, obs: e.target.value }))}
                  rows={2} placeholder="Detalhes adicionais..."
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, resize: "vertical" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button type="button" onClick={() => setModal(false)}
                style={{ flex: 1, padding: "10px 0", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
                Cancelar
              </button>
              <button type="button" onClick={confirmar}
                disabled={!form.desc?.trim() || !form.valor || !form.data}
                style={{ flex: 2, padding: "10px 0", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: (!form.desc?.trim() || !form.valor || !form.data) ? 0.5 : 1 }}>
                {editId ? "Salvar alterações" : "Cadastrar lançamento"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmação de exclusão ── */}
      {delId && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "white", borderRadius: 12, padding: 28, width: 360,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 8 }}>Excluir lançamento?</p>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              {lista.find(l => l.id === delId)?.desc}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDelId(null)}
                style={{ flex: 1, padding: "10px 0", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={() => excluir(delId)}
                style={{ flex: 1, padding: "10px 0", background: "#dc2626", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
