"use client";

import { useState, useEffect, useMemo } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Tipo   = "Receita" | "Despesa";
type Status = "Pendente" | "Recebido" | "Pago" | "Vencido" | "Cancelado";
type Recorr = "Única" | "Mensal" | "Trimestral" | "Anual";

interface Lancamento {
  id:        string;
  desc:      string;
  tipo:      Tipo;
  cat:       string;
  valor:     number;
  data:      string;   // YYYY-MM-DD vencimento
  dataPgto?: string;   // YYYY-MM-DD pagamento efetivo
  status:    Status;
  recorrencia: Recorr;
  centroCusto: string;
  obs?:      string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const SK = "inove-financeiro-v1";

const CATEGORIAS_RECEITA = ["Honorários","Consultoria","Serviços Jurídicos","Assessoria","Outros Receitas"];
const CATEGORIAS_DESPESA = ["Salários/RH","Aluguel","Infraestrutura","TI/Software","Marketing","Impostos","Jurídico","Despesas Financeiras","Outros Custos"];
const CATEGORIAS = [...CATEGORIAS_RECEITA, ...CATEGORIAS_DESPESA];

const CENTROS = ["Geral","Jurídico","Comercial","RH","TI","Marketing","Administrativo"];
const RECORR_OPT: Recorr[] = ["Única","Mensal","Trimestral","Anual"];
const STATUS_OPT: Status[] = ["Pendente","Recebido","Pago","Vencido","Cancelado"];

const statusBadge: Record<Status, string> = {
  Recebido:  "badge badge-green",
  Pago:      "badge badge-navy",
  Pendente:  "badge badge-orange",
  Vencido:   "badge badge-red",
  Cancelado: "badge",
};

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MESES_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtBRL(v: number) {
  return "R$ " + Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtBRLSigned(v: number) {
  const abs = Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (v < 0 ? "− " : "+ ") + "R$ " + abs;
}
function fmtData(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}
function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function today() { return new Date().toISOString().slice(0, 10); }
function yyyymm(iso: string) { return iso ? iso.slice(0, 7) : ""; }

const EMPTY_FORM = (): Partial<Lancamento> => ({
  desc: "", tipo: "Receita", cat: "Honorários",
  valor: 0, data: today(), status: "Pendente",
  recorrencia: "Única", centroCusto: "Geral", obs: "",
});

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function Financeiro() {
  const [lista,   setLista]   = useState<Lancamento[]>([]);
  const [aba,     setAba]     = useState<"lancamentos"|"contas"|"fluxo"|"dre">("lancamentos");
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState<Partial<Lancamento>>(EMPTY_FORM());
  const [editId,  setEditId]  = useState<string | null>(null);
  const [delId,   setDelId]   = useState<string | null>(null);
  const [filtTipo, setFiltTipo] = useState("");
  const [filtCat,  setFiltCat]  = useState("");
  const [filtSt,   setFiltSt]   = useState("");
  const [filtMes,  setFiltMes]  = useState("");
  const [contasAba, setContasAba] = useState<"pagar"|"receber">("receber");
  const [dreAno,   setDreAno]   = useState(new Date().getFullYear().toString());
  const [fluxoAno, setFluxoAno] = useState(new Date().getFullYear().toString());

  // Carregar / Salvar localStorage
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

  function abrirNovo(tipo?: Tipo) {
    setForm({ ...EMPTY_FORM(), tipo: tipo ?? "Receita", cat: tipo === "Despesa" ? "Salários/RH" : "Honorários" });
    setEditId(null);
    setModal(true);
  }
  function abrirEditar(l: Lancamento) { setForm({ ...l }); setEditId(l.id); setModal(true); }

  function confirmar() {
    if (!form.desc?.trim() || !form.valor || !form.data) return;
    const item: Lancamento = {
      id:          editId ?? newId(),
      desc:        form.desc!.trim(),
      tipo:        form.tipo ?? "Receita",
      cat:         form.cat ?? "Outros",
      valor:       Math.abs(Number(form.valor)),
      data:        form.data!,
      dataPgto:    form.dataPgto || undefined,
      status:      form.status ?? "Pendente",
      recorrencia: form.recorrencia ?? "Única",
      centroCusto: form.centroCusto ?? "Geral",
      obs:         form.obs ?? "",
    };
    if (editId) {
      salvar(lista.map(l => l.id === editId ? item : l));
    } else {
      salvar([item, ...lista]);
    }
    setModal(false);
  }

  function excluir(id: string) { salvar(lista.filter(l => l.id !== id)); setDelId(null); }

  function marcarStatus(id: string, st: Status) {
    salvar(lista.map(l => l.id === id ? {
      ...l, status: st,
      dataPgto: (st === "Pago" || st === "Recebido") ? today() : l.dataPgto,
    } : l));
  }

  // ─── KPIs Globais ──────────────────────────────────────────────────────────
  const ativos = lista.filter(l => l.status !== "Cancelado");
  const receitaTotal  = ativos.filter(l => l.tipo === "Receita").reduce((s, l) => s + l.valor, 0);
  const despesaTotal  = ativos.filter(l => l.tipo === "Despesa").reduce((s, l) => s + l.valor, 0);
  const saldoTotal    = receitaTotal - despesaTotal;
  const aReceber      = ativos.filter(l => l.tipo === "Receita" && l.status === "Pendente").reduce((s, l) => s + l.valor, 0);
  const aPagar        = ativos.filter(l => l.tipo === "Despesa" && l.status === "Pendente").reduce((s, l) => s + l.valor, 0);
  const vencidos      = lista.filter(l => l.status === "Vencido").reduce((s, l) => s + l.valor, 0);

  // ─── Filtros lançamentos ───────────────────────────────────────────────────
  const filtrada = lista.filter(l =>
    (!filtTipo || l.tipo === filtTipo) &&
    (!filtCat  || l.cat  === filtCat)  &&
    (!filtSt   || l.status === filtSt) &&
    (!filtMes  || yyyymm(l.data) === filtMes)
  ).sort((a, b) => b.data.localeCompare(a.data));

  // ─── Contas ────────────────────────────────────────────────────────────────
  const contasPendentes = useMemo(() => {
    const tipo = contasAba === "receber" ? "Receita" : "Despesa";
    return lista
      .filter(l => l.tipo === tipo && (l.status === "Pendente" || l.status === "Vencido"))
      .sort((a, b) => a.data.localeCompare(b.data));
  }, [lista, contasAba]);

  const totalContas = contasPendentes.reduce((s, l) => s + l.valor, 0);
  const vencContas  = contasPendentes.filter(l => l.status === "Vencido").reduce((s, l) => s + l.valor, 0);

  // ─── Fluxo de Caixa ────────────────────────────────────────────────────────
  const fluxoData = useMemo(() => {
    const mesesComDados = MESES.map((mes, mi) => {
      const mm = String(mi + 1).padStart(2, "0");
      const key = `${fluxoAno}-${mm}`;
      const rec = lista.filter(l => l.tipo === "Receita" && l.status !== "Cancelado" && yyyymm(l.data) === key)
                       .reduce((s, l) => s + l.valor, 0);
      const desp = lista.filter(l => l.tipo === "Despesa" && l.status !== "Cancelado" && yyyymm(l.data) === key)
                        .reduce((s, l) => s + l.valor, 0);
      return { mes, key, rec, desp, saldo: rec - desp };
    });
    return mesesComDados;
  }, [lista, fluxoAno]);

  const maxFluxo = Math.max(...fluxoData.map(d => Math.max(d.rec, d.desp)), 1);

  // ─── DRE ───────────────────────────────────────────────────────────────────
  const dreData = useMemo(() => {
    const ano = lista.filter(l => l.status !== "Cancelado" && l.data.startsWith(dreAno));

    // Receitas por categoria
    const recBruta = ano.filter(l => l.tipo === "Receita").reduce((s, l) => s + l.valor, 0);
    const impostos = ano.filter(l => l.cat === "Impostos").reduce((s, l) => s + l.valor, 0);
    const recLiq   = recBruta - impostos;

    const salarios = ano.filter(l => l.cat === "Salários/RH").reduce((s, l) => s + l.valor, 0);
    const infraest = ano.filter(l => l.cat === "Aluguel" || l.cat === "Infraestrutura").reduce((s, l) => s + l.valor, 0);
    const ti       = ano.filter(l => l.cat === "TI/Software").reduce((s, l) => s + l.valor, 0);
    const mkt      = ano.filter(l => l.cat === "Marketing").reduce((s, l) => s + l.valor, 0);
    const jur      = ano.filter(l => l.cat === "Jurídico").reduce((s, l) => s + l.valor, 0);
    const despFin  = ano.filter(l => l.cat === "Despesas Financeiras").reduce((s, l) => s + l.valor, 0);
    const outros   = ano.filter(l => l.cat === "Outros Custos").reduce((s, l) => s + l.valor, 0);

    const lucBruto  = recLiq - salarios - infraest - ti;
    const despOper  = mkt + jur + outros;
    const ebitda    = lucBruto - despOper;
    const lucroLiq  = ebitda - despFin;

    const margem = recBruta > 0 ? (lucroLiq / recBruta) * 100 : 0;

    // Por mês para DRE mensal
    const meses = MESES.map((mes, mi) => {
      const mm  = String(mi + 1).padStart(2, "0");
      const key = `${dreAno}-${mm}`;
      const r = ano.filter(l => l.tipo === "Receita" && yyyymm(l.data) === key).reduce((s, l) => s + l.valor, 0);
      const d = ano.filter(l => l.tipo === "Despesa" && yyyymm(l.data) === key).reduce((s, l) => s + l.valor, 0);
      return { mes, rec: r, desp: d, res: r - d };
    });

    return { recBruta, impostos, recLiq, salarios, infraest, ti, mkt, jur, despFin, outros,
             lucBruto, despOper, ebitda, lucroLiq, margem, meses };
  }, [lista, dreAno]);

  // ─── Anos disponíveis ──────────────────────────────────────────────────────
  const anos = useMemo(() => {
    const s = new Set(lista.map(l => l.data.slice(0, 4)));
    const now = new Date().getFullYear().toString();
    s.add(now);
    return Array.from(s).sort().reverse();
  }, [lista]);

  // ─── Meses disponíveis ─────────────────────────────────────────────────────
  const mesesDisp = useMemo(() => {
    const s = new Set(lista.map(l => yyyymm(l.data)));
    return Array.from(s).sort().reverse();
  }, [lista]);

  const mesAtual = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="dash-wrap">
      {/* ── Toolbar ── */}
      <div className="pg-toolbar">
        <div>
          <p className="pg-title">Financeiro</p>
          <p className="pg-sub">{mesAtual} · {lista.length} lançamento{lista.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => abrirNovo("Despesa")}>+ Despesa</button>
          <button className="btn btn-navy"    onClick={() => abrirNovo("Receita")}>+ Receita</button>
        </div>
      </div>

      {/* ── KPIs Globais ── */}
      <div className="grid grid-cols-3 gap-2.5 mb-3" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
        {[
          { label: "Receita Total",    val: receitaTotal > 0 ? fmtBRL(receitaTotal) : "—",  hint: "Receitas cadastradas",  cls: receitaTotal > 0 ? "val-green" : "val-gray" },
          { label: "Despesas Total",   val: despesaTotal > 0 ? fmtBRL(despesaTotal) : "—",  hint: "Despesas cadastradas",  cls: "val-navy" },
          { label: "Saldo",            val: lista.length > 0 ? fmtBRL(saldoTotal)   : "—",  hint: "Receita − Despesas",    cls: saldoTotal >= 0 ? "val-green" : "val-red" },
          { label: "A Receber",        val: aReceber > 0 ? fmtBRL(aReceber)         : "—",  hint: "Receitas pendentes",    cls: "val-navy" },
          { label: "A Pagar",          val: aPagar > 0   ? fmtBRL(aPagar)           : "—",  hint: "Despesas pendentes",    cls: aPagar > 0 ? "val-orange" : "val-gray" },
          { label: "Vencidos",         val: vencidos > 0 ? fmtBRL(vencidos)         : "—",  hint: "Itens vencidos",        cls: vencidos > 0 ? "val-red" : "val-gray" },
        ].map((c) => (
          <div key={c.label} className="card">
            <p className="card-label">{c.label}</p>
            <p className={`card-val ${c.cls}`}>{c.val}</p>
            <p className="card-hint">{c.hint}</p>
          </div>
        ))}
      </div>

      {/* ── Abas ── */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e5e7eb", marginBottom: 16 }}>
        {([
          { key: "lancamentos", label: "📋 Lançamentos" },
          { key: "contas",      label: "💳 Contas" },
          { key: "fluxo",       label: "📈 Fluxo de Caixa" },
          { key: "dre",         label: "📊 DRE" },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setAba(t.key)}
            style={{
              padding: "8px 16px", border: "none", background: "transparent", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              color: aba === t.key ? "#2563eb" : "#6b7280",
              borderBottom: aba === t.key ? "2px solid #2563eb" : "2px solid transparent",
              marginBottom: -2,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          ABA: LANÇAMENTOS
      ════════════════════════════════════════════════════════════════════════ */}
      {aba === "lancamentos" && (
        <>
          <div className="filter-bar" style={{ flexWrap: "wrap" }}>
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
            <select value={filtMes} onChange={e => setFiltMes(e.target.value)}>
              <option value="">Todos os meses</option>
              {mesesDisp.map(m => {
                const [y, mo] = m.split("-");
                return <option key={m} value={m}>{MESES_FULL[parseInt(mo)-1]} {y}</option>;
              })}
            </select>
          </div>

          {filtrada.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: "#6b7280" }}>
                {lista.length === 0 ? "Nenhum lançamento cadastrado" : "Nenhum resultado para os filtros"}
              </p>
              <p style={{ fontSize: 13 }}>
                {lista.length === 0 ? 'Clique em "+ Receita" ou "+ Despesa" para começar.' : "Tente remover os filtros."}
              </p>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Centro</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th>Rec.</th>
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
                    <td style={{ fontSize: 12, color: "#6b7280" }}>{l.cat}</td>
                    <td style={{ fontSize: 12, color: "#6b7280" }}>{l.centroCusto}</td>
                    <td style={{ fontWeight: 700, color: l.tipo === "Receita" ? "#059669" : "#dc2626" }}>
                      {l.tipo === "Receita" ? "+ " : "− "}{fmtBRL(l.valor)}
                    </td>
                    <td style={{ color: "#6b7280", fontSize: 12 }}>{fmtData(l.data)}</td>
                    <td style={{ color: "#6b7280", fontSize: 12 }}>{l.dataPgto ? fmtData(l.dataPgto) : "—"}</td>
                    <td>
                      <select value={l.status}
                        onChange={e => marcarStatus(l.id, e.target.value as Status)}
                        className={statusBadge[l.status]}
                        style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 11, padding: "2px 4px", fontWeight: 600 }}>
                        {STATUS_OPT.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ fontSize: 11, color: "#9ca3af" }}>{l.recorrencia !== "Única" ? l.recorrencia : "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => abrirEditar(l)}>✏️</button>
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
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          ABA: CONTAS A PAGAR / RECEBER
      ════════════════════════════════════════════════════════════════════════ */}
      {aba === "contas" && (
        <>
          {/* Sub-abas */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => setContasAba("receber")}
              style={{
                padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: contasAba === "receber" ? "#059669" : "#f3f4f6",
                color: contasAba === "receber" ? "white" : "#374151",
              }}>
              💚 A Receber ({lista.filter(l => l.tipo === "Receita" && (l.status === "Pendente" || l.status === "Vencido")).length})
            </button>
            <button
              onClick={() => setContasAba("pagar")}
              style={{
                padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: contasAba === "pagar" ? "#dc2626" : "#f3f4f6",
                color: contasAba === "pagar" ? "white" : "#374151",
              }}>
              ❤️ A Pagar ({lista.filter(l => l.tipo === "Despesa" && (l.status === "Pendente" || l.status === "Vencido")).length})
            </button>
          </div>

          {/* Resumo */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div className="card">
              <p className="card-label">Total {contasAba === "receber" ? "a Receber" : "a Pagar"}</p>
              <p className={`card-val ${contasAba === "receber" ? "val-green" : "val-red"}`}>{totalContas > 0 ? fmtBRL(totalContas) : "—"}</p>
              <p className="card-hint">{contasPendentes.length} item{contasPendentes.length !== 1 ? "s" : ""} pendente{contasPendentes.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="card">
              <p className="card-label">Vencidos</p>
              <p className={`card-val ${vencContas > 0 ? "val-red" : "val-gray"}`}>{vencContas > 0 ? fmtBRL(vencContas) : "—"}</p>
              <p className="card-hint">{contasPendentes.filter(l => l.status === "Vencido").length} item{contasPendentes.filter(l => l.status === "Vencido").length !== 1 ? "s" : ""} vencido{contasPendentes.filter(l => l.status === "Vencido").length !== 1 ? "s" : ""}</p>
            </div>
            <div className="card">
              <p className="card-label">No Prazo</p>
              <p className="card-val val-navy">{fmtBRL(totalContas - vencContas)}</p>
              <p className="card-hint">{contasPendentes.filter(l => l.status === "Pendente").length} item{contasPendentes.filter(l => l.status === "Pendente").length !== 1 ? "s" : ""} no prazo</p>
            </div>
          </div>

          {contasPendentes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{contasAba === "receber" ? "💚" : "💳"}</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#6b7280" }}>
                Nenhuma conta {contasAba === "receber" ? "a receber" : "a pagar"} pendente
              </p>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Dias</th>
                  <th>Status</th>
                  <th>Ação Rápida</th>
                </tr>
              </thead>
              <tbody>
                {contasPendentes.map((l) => {
                  const diff = Math.ceil((new Date(l.data).getTime() - new Date().getTime()) / 86400000);
                  const diasTxt = diff < 0 ? `${Math.abs(diff)}d vencido` : diff === 0 ? "Hoje" : `${diff}d`;
                  const diasCls = diff < 0 ? "#dc2626" : diff <= 7 ? "#f59e0b" : "#6b7280";
                  return (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 600 }}>{l.desc}</td>
                      <td style={{ fontSize: 12, color: "#6b7280" }}>{l.cat}</td>
                      <td style={{ fontWeight: 700, color: contasAba === "receber" ? "#059669" : "#dc2626" }}>
                        {fmtBRL(l.valor)}
                      </td>
                      <td style={{ fontSize: 12, color: "#6b7280" }}>{fmtData(l.data)}</td>
                      <td style={{ fontWeight: 600, color: diasCls, fontSize: 12 }}>{diasTxt}</td>
                      <td><span className={statusBadge[l.status]}>{l.status}</span></td>
                      <td>
                        <button
                          className="btn btn-navy btn-sm"
                          onClick={() => marcarStatus(l.id, contasAba === "receber" ? "Recebido" : "Pago")}>
                          ✓ {contasAba === "receber" ? "Recebido" : "Pago"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          ABA: FLUXO DE CAIXA
      ════════════════════════════════════════════════════════════════════════ */}
      {aba === "fluxo" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Ano:</span>
            <select value={fluxoAno} onChange={e => setFluxoAno(e.target.value)}
              style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
              {anos.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>

          {/* Gráfico de barras simples */}
          <div className="card" style={{ marginBottom: 16, padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 16 }}>
              Fluxo de Caixa Mensal — {fluxoAno}
            </p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 160 }}>
              {fluxoData.map((d) => (
                <div key={d.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 130 }}>
                    <div style={{
                      flex: 1, background: "#059669", borderRadius: "3px 3px 0 0",
                      height: d.rec > 0 ? `${(d.rec / maxFluxo) * 120}px` : "2px",
                      minHeight: 2, transition: "height 0.3s",
                    }} title={`Receita: ${fmtBRL(d.rec)}`} />
                    <div style={{
                      flex: 1, background: "#dc2626", borderRadius: "3px 3px 0 0",
                      height: d.desp > 0 ? `${(d.desp / maxFluxo) * 120}px` : "2px",
                      minHeight: 2, transition: "height 0.3s",
                    }} title={`Despesa: ${fmtBRL(d.desp)}`} />
                  </div>
                  <span style={{ fontSize: 10, color: "#6b7280", textAlign: "center" }}>{d.mes}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <span style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>■ Receita</span>
              <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>■ Despesa</span>
            </div>
          </div>

          {/* Tabela mensal */}
          <table className="tbl">
            <thead>
              <tr>
                <th>Mês</th>
                <th style={{ color: "#059669" }}>Receita</th>
                <th style={{ color: "#dc2626" }}>Despesa</th>
                <th>Resultado</th>
                <th>Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let acum = 0;
                return fluxoData.map((d) => {
                  acum += d.saldo;
                  return (
                    <tr key={d.key}>
                      <td style={{ fontWeight: 600 }}>{d.mes}/{fluxoAno.slice(2)}</td>
                      <td style={{ color: "#059669", fontWeight: 600 }}>{d.rec > 0 ? fmtBRL(d.rec) : "—"}</td>
                      <td style={{ color: "#dc2626", fontWeight: 600 }}>{d.desp > 0 ? fmtBRL(d.desp) : "—"}</td>
                      <td style={{ fontWeight: 700, color: d.saldo >= 0 ? "#059669" : "#dc2626" }}>
                        {d.rec === 0 && d.desp === 0 ? "—" : fmtBRLSigned(d.saldo)}
                      </td>
                      <td style={{ fontWeight: 600, color: acum >= 0 ? "#2563eb" : "#dc2626" }}>
                        {d.rec === 0 && d.desp === 0 && acum === 0 ? "—" : fmtBRL(acum)}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f9fafb", fontWeight: 700 }}>
                <td>Total {fluxoAno}</td>
                <td style={{ color: "#059669" }}>
                  {fmtBRL(fluxoData.reduce((s, d) => s + d.rec, 0))}
                </td>
                <td style={{ color: "#dc2626" }}>
                  {fmtBRL(fluxoData.reduce((s, d) => s + d.desp, 0))}
                </td>
                <td style={{ color: fluxoData.reduce((s, d) => s + d.saldo, 0) >= 0 ? "#059669" : "#dc2626" }}>
                  {fmtBRLSigned(fluxoData.reduce((s, d) => s + d.saldo, 0))}
                </td>
                <td>—</td>
              </tr>
            </tfoot>
          </table>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          ABA: DRE — Demonstrativo do Resultado do Exercício
      ════════════════════════════════════════════════════════════════════════ */}
      {aba === "dre" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Exercício:</span>
            <select value={dreAno} onChange={e => setDreAno(e.target.value)}
              style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
              {anos.map(a => <option key={a}>{a}</option>)}
            </select>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              {lista.filter(l => l.data.startsWith(dreAno)).length} lançamentos no exercício
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* DRE Anual */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", background: "#1e3a5f", color: "white" }}>
                <p style={{ fontSize: 13, fontWeight: 700 }}>DRE — {dreAno}</p>
                <p style={{ fontSize: 11, opacity: 0.7 }}>Demonstrativo do Resultado do Exercício</p>
              </div>
              <div style={{ padding: 0 }}>
                {[
                  { label: "Receita Bruta",              val: dreData.recBruta,  indent: 0, bold: true,  positivo: true  },
                  { label: "(−) Impostos",                val: -dreData.impostos, indent: 1, bold: false, positivo: false },
                  { label: "= Receita Líquida",           val: dreData.recLiq,    indent: 0, bold: true,  positivo: true, sep: true  },
                  { label: "(−) Salários / RH",           val: -dreData.salarios, indent: 1, bold: false, positivo: false },
                  { label: "(−) Aluguel / Infraestrutura",val: -dreData.infraest, indent: 1, bold: false, positivo: false },
                  { label: "(−) TI / Software",           val: -dreData.ti,       indent: 1, bold: false, positivo: false },
                  { label: "= Lucro Bruto",               val: dreData.lucBruto,  indent: 0, bold: true,  positivo: dreData.lucBruto >= 0, sep: true },
                  { label: "(−) Marketing",               val: -dreData.mkt,      indent: 1, bold: false, positivo: false },
                  { label: "(−) Jurídico",                val: -dreData.jur,      indent: 1, bold: false, positivo: false },
                  { label: "(−) Outros Custos",           val: -dreData.outros,   indent: 1, bold: false, positivo: false },
                  { label: "= EBITDA",                    val: dreData.ebitda,    indent: 0, bold: true,  positivo: dreData.ebitda >= 0, sep: true },
                  { label: "(−) Despesas Financeiras",    val: -dreData.despFin,  indent: 1, bold: false, positivo: false },
                  { label: "= Resultado Líquido",         val: dreData.lucroLiq,  indent: 0, bold: true,  positivo: dreData.lucroLiq >= 0, sep: true, destaque: true },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: `${row.destaque ? 12 : 8}px 16px`,
                    paddingLeft: `${16 + row.indent * 16}px`,
                    borderTop: row.sep ? "1px solid #e5e7eb" : "none",
                    background: row.destaque ? (dreData.lucroLiq >= 0 ? "#f0fdf4" : "#fef2f2") : "transparent",
                  }}>
                    <span style={{ fontSize: row.bold ? 13 : 12, fontWeight: row.bold ? 700 : 400, color: row.indent > 0 ? "#6b7280" : "#111827" }}>
                      {row.label}
                    </span>
                    <span style={{
                      fontSize: row.bold ? 13 : 12,
                      fontWeight: row.bold ? 700 : 500,
                      color: row.val === 0 ? "#9ca3af" : row.val < 0 ? "#dc2626" : "#059669",
                    }}>
                      {row.val === 0 ? "—" : fmtBRLSigned(row.val)}
                    </span>
                  </div>
                ))}
                <div style={{ padding: "8px 16px", background: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>
                    Margem Líquida: <strong style={{ color: dreData.margem >= 0 ? "#059669" : "#dc2626" }}>
                      {dreData.margem.toFixed(1)}%
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* DRE por Mês */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", background: "#1e3a5f", color: "white" }}>
                <p style={{ fontSize: 13, fontWeight: 700 }}>Resultado por Mês — {dreAno}</p>
                <p style={{ fontSize: 11, opacity: 0.7 }}>Receita, Despesa e Resultado mensais</p>
              </div>
              <div style={{ overflowY: "auto", maxHeight: 400 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", color: "#374151", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Mês</th>
                      <th style={{ padding: "8px 12px", textAlign: "right", color: "#059669", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Receita</th>
                      <th style={{ padding: "8px 12px", textAlign: "right", color: "#dc2626", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Despesa</th>
                      <th style={{ padding: "8px 12px", textAlign: "right", color: "#111827", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dreData.meses.map((m, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "7px 12px", fontWeight: 600, color: "#374151" }}>{m.mes}</td>
                        <td style={{ padding: "7px 12px", textAlign: "right", color: "#059669" }}>{m.rec > 0 ? fmtBRL(m.rec) : "—"}</td>
                        <td style={{ padding: "7px 12px", textAlign: "right", color: "#dc2626" }}>{m.desp > 0 ? fmtBRL(m.desp) : "—"}</td>
                        <td style={{ padding: "7px 12px", textAlign: "right", fontWeight: 700, color: m.res >= 0 ? "#059669" : "#dc2626" }}>
                          {m.rec === 0 && m.desp === 0 ? "—" : fmtBRLSigned(m.res)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "#f9fafb", fontWeight: 700 }}>
                      <td style={{ padding: "8px 12px", color: "#111827" }}>Total</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: "#059669" }}>{fmtBRL(dreData.recBruta)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: "#dc2626" }}>{fmtBRL(dreData.recBruta - dreData.lucroLiq)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: dreData.lucroLiq >= 0 ? "#059669" : "#dc2626" }}>
                        {fmtBRLSigned(dreData.lucroLiq)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL: Lançamento
      ════════════════════════════════════════════════════════════════════════ */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 12, padding: 28, width: 520, maxWidth: "92vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 20 }}>
              {editId ? "Editar Lançamento" : "Novo Lançamento"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Descrição */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Descrição *</label>
                <input type="text" value={form.desc ?? ""} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                  placeholder="Ex: Honorários GCJ — Junho/2026"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
              </div>

              {/* Tipo + Categoria */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Tipo *</label>
                  <select value={form.tipo ?? "Receita"} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as Tipo, cat: e.target.value === "Receita" ? "Honorários" : "Salários/RH" }))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
                    <option>Receita</option>
                    <option>Despesa</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Categoria</label>
                  <select value={form.cat ?? ""} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
                    {(form.tipo === "Receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Valor + Data Vencimento */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Valor (R$) *</label>
                  <input type="number" min="0" step="0.01" value={form.valor ?? ""}
                    onChange={e => setForm(f => ({ ...f, valor: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Vencimento *</label>
                  <input type="date" value={form.data ?? ""}
                    onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} />
                </div>
              </div>

              {/* Status + Recorrência */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Status</label>
                  <select value={form.status ?? "Pendente"} onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
                    {STATUS_OPT.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Recorrência</label>
                  <select value={form.recorrencia ?? "Única"} onChange={e => setForm(f => ({ ...f, recorrencia: e.target.value as Recorr }))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
                    {RECORR_OPT.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Centro de Custo + Data Pagamento */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Centro de Custo</label>
                  <select value={form.centroCusto ?? "Geral"} onChange={e => setForm(f => ({ ...f, centroCusto: e.target.value }))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
                    {CENTROS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Data de Pagamento</label>
                  <input type="date" value={form.dataPgto ?? ""}
                    onChange={e => setForm(f => ({ ...f, dataPgto: e.target.value || undefined }))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} />
                </div>
              </div>

              {/* Observação */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Observação (opcional)</label>
                <textarea value={form.obs ?? ""} onChange={e => setForm(f => ({ ...f, obs: e.target.value }))}
                  rows={2} placeholder="Detalhes adicionais..."
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 12, padding: 28, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 8 }}>Excluir lançamento?</p>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>{lista.find(l => l.id === delId)?.desc}</p>
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
