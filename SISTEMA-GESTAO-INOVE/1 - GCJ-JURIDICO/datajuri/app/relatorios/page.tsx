"use client";
import { useState, useEffect } from "react";
import { listarProcessos } from "@/lib/processos-storage";
import { listarHonorarios } from "@/lib/financeiro-storage";
import { listarTarefas } from "@/lib/tarefas-storage";
import { listarPrazos } from "@/lib/prazos-storage";
import type { Processo } from "@/lib/mock-data";
import type { Honorario } from "@/lib/financeiro-storage";
import type { Tarefa } from "@/lib/tarefas-storage";
import type { Prazo } from "@/lib/prazos-storage";
import { BarChart3, TrendingUp, FolderOpen, CircleDollarSign, AlertCircle, CheckSquare, FileText, Download } from "lucide-react";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtData(d: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function downloadCSV(rows: string[][], filename: string) {
  const bom = "﻿";
  const csv = bom + rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const tipoLabels: Record<string, string> = {
  civil: "Cível", trabalhista: "Trabalhista", criminal: "Criminal",
  tributario: "Tributário", previdenciario: "Previdenciário", administrativo: "Administrativo",
};

const statusProcessoLabel: Record<string, string> = {
  ativo: "Ativo", suspenso: "Suspenso", arquivado: "Arquivado",
  baixado: "Baixado", aguardando_baixa: "Ag. Baixa",
};

type Aba = "processos" | "financeiro" | "prazos" | "tarefas";

export default function RelatoriosPage() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [honorarios, setHonorarios] = useState<Honorario[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [prazos, setPrazos] = useState<Prazo[]>([]);
  const [aba, setAba] = useState<Aba>("processos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    setProcessos(listarProcessos());
    setHonorarios(listarHonorarios());
    setTarefas(listarTarefas());
    setPrazos(listarPrazos());
  }, []);

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);

  // Processos stats
  const processosFiltrados = processos.filter((p) => {
    if (dataInicio && p.dataDistribuicao < dataInicio) return false;
    if (dataFim && p.dataDistribuicao > dataFim) return false;
    return true;
  });
  const ativos = processosFiltrados.filter((p) => p.status === "ativo").length;
  const aguardandoBaixa = processosFiltrados.filter((p) => p.status === "aguardando_baixa").length;
  const suspensos = processosFiltrados.filter((p) => p.status === "suspenso").length;
  const arquivados = processosFiltrados.filter((p) => p.status === "arquivado").length;
  const valorTotal = processosFiltrados.reduce((s, p) => s + (p.valorCausa ?? 0), 0);
  const valorMedio = valorTotal / Math.max(processosFiltrados.length, 1);
  const porTipo: Record<string, number> = {};
  processosFiltrados.forEach((p) => { porTipo[p.tipo] = (porTipo[p.tipo] ?? 0) + 1; });

  // Financeiro stats
  const honorariosFiltrados = honorarios.filter((h) => {
    if (dataInicio && h.dataVencimento < dataInicio) return false;
    if (dataFim && h.dataVencimento > dataFim) return false;
    return true;
  });
  const totalHon = honorariosFiltrados.reduce((s, h) => s + h.valor, 0);
  const recebido = honorariosFiltrados.filter((h) => h.status === "pago" || h.status === "parcial").reduce((s, h) => s + (h.valorPago ?? 0), 0);
  const pendente = honorariosFiltrados.filter((h) => h.status === "pendente").reduce((s, h) => s + h.valor, 0);
  const vencido = honorariosFiltrados.filter((h) => h.status === "vencido").reduce((s, h) => s + h.valor, 0);
  const taxaRec = totalHon > 0 ? (recebido / totalHon) * 100 : 0;

  // Tarefas stats
  const tPendentes = tarefas.filter((t) => t.status === "pendente").length;
  const tAndamento = tarefas.filter((t) => t.status === "em_andamento").length;
  const tConcluidas = tarefas.filter((t) => t.status === "concluida").length;
  const tAtrasadas = tarefas.filter((t) => t.status !== "concluida" && new Date(t.dataVencimento + "T00:00:00") < hoje).length;

  // Prazos stats
  const pVencidos = prazos.filter((p) => p.status === "vencido").length;
  const pUrgentes = prazos.filter((p) => p.status === "urgente").length;
  const pCumpridos = prazos.filter((p) => p.status === "cumprido").length;
  const pPendentes = prazos.filter((p) => p.status === "pendente").length;

  function exportProcessosCSV() {
    const header = ["Número", "Cliente", "Tipo", "Status", "Advogado", "Tribunal", "Vara", "Fase", "Valor Causa", "Data Distribuição"];
    const rows = processosFiltrados.map((p) => [
      p.numero, p.cliente, tipoLabels[p.tipo] ?? p.tipo,
      statusProcessoLabel[p.status] ?? p.status,
      p.advogadoResponsavel, p.tribunal, p.vara, p.fase,
      p.valorCausa?.toFixed(2) ?? "0,00",
      fmtData(p.dataDistribuicao),
    ]);
    downloadCSV([header, ...rows], "processos.csv");
  }

  function exportFinanceiroCSV() {
    const header = ["Cliente", "Descrição", "Tipo", "Valor", "Status", "Vencimento", "Valor Pago", "Data Pagamento"];
    const rows = honorariosFiltrados.map((h) => [
      h.cliente, h.descricao, h.tipo,
      h.valor.toFixed(2),
      h.status,
      fmtData(h.dataVencimento),
      (h.valorPago ?? 0).toFixed(2),
      h.dataPagamento ? fmtData(h.dataPagamento) : "",
    ]);
    downloadCSV([header, ...rows], "financeiro.csv");
  }

  function exportPrazosCSV() {
    const header = ["Processo", "Cliente", "Descrição", "Tipo", "Vencimento", "Status"];
    const rows = prazos.map((p) => [
      p.numeroProcesso, p.cliente, p.descricao, p.tipo,
      fmtData(p.dataVencimento), p.status,
    ]);
    downloadCSV([header, ...rows], "prazos.csv");
  }

  function exportTarefasCSV() {
    const header = ["Descrição", "Advogado", "Cliente", "Prioridade", "Status", "Vencimento", "Conclusão"];
    const rows = tarefas.map((t) => [
      t.descricao, t.advogado, t.cliente ?? "",
      t.prioridade, t.status,
      fmtData(t.dataVencimento),
      t.dataConclusao ? fmtData(t.dataConclusao) : "",
    ]);
    downloadCSV([header, ...rows], "tarefas.csv");
  }

  const card = (bg: string, label: string, value: string | number, sub?: string) => (
    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{sub}</p>}
    </div>
  );

  const row = (label: string, value: string | number, sub?: string) => (
    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
        {sub && <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{sub}</p>}
      </div>
    </div>
  );

  const section = (title: string, icon: React.ReactNode, children: React.ReactNode) => (
    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{title}</span>
      </div>
      {children}
    </div>
  );

  const abas: { key: Aba; label: string }[] = [
    { key: "processos", label: "Processos" },
    { key: "financeiro", label: "Financeiro" },
    { key: "prazos", label: "Prazos" },
    { key: "tarefas", label: "Tarefas" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Relatórios</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>Visão analítica consolidada do escritório</p>
        </div>
        <button
          onClick={() => window.print()}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
        >
          <FileText size={13} /> Imprimir / PDF
        </button>
      </div>

      {/* Filtro de período */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10 }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>Filtrar por período:</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)", fontSize: 12, color: "var(--text-primary)", background: "var(--bg)" }}
          />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>até</span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)", fontSize: 12, color: "var(--text-primary)", background: "var(--bg)" }}
          />
        </div>
        {(dataInicio || dataFim) && (
          <button
            onClick={() => { setDataInicio(""); setDataFim(""); }}
            style={{ fontSize: 11, color: "var(--gcj-red)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}
          >
            Limpar
          </button>
        )}
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fef2f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FolderOpen size={15} style={{ color: "var(--gcj-red)" }} />
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.2 }}>Processos Ativos</p>
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{ativos}</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>de {processosFiltrados.length} no período</p>
        </div>
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircleDollarSign size={15} style={{ color: "#16a34a" }} />
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.2 }}>Honorários Recebidos</p>
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{fmt(recebido)}</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{taxaRec.toFixed(1)}% do total</p>
        </div>
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertCircle size={15} style={{ color: "#d97706" }} />
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.2 }}>Prazos Críticos</p>
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{pVencidos + pUrgentes}</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{pVencidos} vencidos, {pUrgentes} urgentes</p>
        </div>
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f3f0ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckSquare size={15} style={{ color: "#7c3aed" }} />
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.2 }}>Tarefas Abertas</p>
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{tPendentes + tAndamento}</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{tAtrasadas} atrasadas</p>
        </div>
      </div>

      {/* Abas de relatórios */}
      <div>
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
          {abas.map((a) => (
            <button
              key={a.key}
              onClick={() => setAba(a.key)}
              style={{
                padding: "8px 16px", fontSize: 13, fontWeight: aba === a.key ? 600 : 400,
                color: aba === a.key ? "var(--gcj-red)" : "var(--text-muted)",
                background: "none", border: "none", borderBottom: aba === a.key ? "2px solid var(--gcj-red)" : "2px solid transparent",
                cursor: "pointer", marginBottom: -1, transition: "color .15s",
              }}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Processos */}
        {aba === "processos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={exportProcessosCSV}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid var(--gcj-red)", background: "var(--gcj-red)", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
              >
                <Download size={13} /> Exportar CSV
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {section("Por Status", <FolderOpen size={15} style={{ color: "var(--gcj-red)" }} />, (
                <div>
                  {row("Ativos", ativos)}
                  {row("Ag. Baixa", aguardandoBaixa)}
                  {row("Suspensos", suspensos)}
                  {row("Arquivados", arquivados)}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
                    {row("Total no período", processosFiltrados.length)}
                    {row("Valor total", fmt(valorTotal))}
                    {row("Valor médio", fmt(valorMedio))}
                  </div>
                </div>
              ))}
              {section("Por Tipo", <BarChart3 size={15} style={{ color: "var(--gcj-red)" }} />, (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {processosFiltrados.length === 0 ? (
                    <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>Nenhum processo no período</p>
                  ) : Object.entries(porTipo).sort((a, b) => b[1] - a[1]).map(([tipo, count]) => {
                    const pct = Math.round((count / processosFiltrados.length) * 100);
                    return (
                      <div key={tipo} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", width: 100, flexShrink: 0 }}>{tipoLabels[tipo] ?? tipo}</span>
                        <div style={{ flex: 1, background: "var(--border-light)", borderRadius: 4, height: 8 }}>
                          <div style={{ height: 8, borderRadius: 4, background: "var(--gcj-red)", width: `${pct}%`, transition: "width .3s" }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", width: 24, textAlign: "right" }}>{count}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", width: 34 }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Tabela de processos */}
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Lista de Processos ({processosFiltrados.length})</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--border-light)" }}>
                      {["Número", "Cliente", "Tipo", "Status", "Advogado", "Valor Causa"].map((h) => (
                        <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {processosFiltrados.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: "24px", textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>Nenhum processo encontrado</td></tr>
                    ) : processosFiltrados.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-primary)", fontFamily: "monospace", whiteSpace: "nowrap" }}>{p.numero}</td>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-primary)" }}>{p.cliente}</td>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-muted)" }}>{tipoLabels[p.tipo] ?? p.tipo}</td>
                        <td style={{ padding: "9px 14px" }}>
                          <span style={{
                            fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20,
                            background: p.status === "ativo" ? "#dcfce7" : p.status === "suspenso" ? "#fef9c3" : "#f1f5f9",
                            color: p.status === "ativo" ? "#16a34a" : p.status === "suspenso" ? "#92400e" : "#64748b",
                          }}>
                            {statusProcessoLabel[p.status] ?? p.status}
                          </span>
                        </td>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-muted)" }}>{p.advogadoResponsavel}</td>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{fmt(p.valorCausa ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Financeiro */}
        {aba === "financeiro" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={exportFinanceiroCSV}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid var(--gcj-red)", background: "var(--gcj-red)", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
              >
                <Download size={13} /> Exportar CSV
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {section("Resumo Financeiro", <CircleDollarSign size={15} style={{ color: "#16a34a" }} />, (
                <div>
                  {row("Total cobrado", fmt(totalHon))}
                  {row("Recebido", fmt(recebido), `${taxaRec.toFixed(1)}% do total`)}
                  {row("Pendente", fmt(pendente))}
                  {row("Em atraso", fmt(vencido))}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ background: "var(--border-light)", borderRadius: 4, height: 8 }}>
                      <div style={{ height: 8, borderRadius: 4, background: "#16a34a", width: `${Math.min(taxaRec, 100)}%`, transition: "width .3s" }} />
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{taxaRec.toFixed(1)}% de taxa de recebimento</p>
                  </div>
                </div>
              ))}
              {section("Por Status", <TrendingUp size={15} style={{ color: "#16a34a" }} />, (
                <div>
                  {[
                    { label: "Pagos", status: "pago", cor: "#16a34a", bg: "#dcfce7" },
                    { label: "Parciais", status: "parcial", cor: "#2563eb", bg: "#dbeafe" },
                    { label: "Pendentes", status: "pendente", cor: "#d97706", bg: "#fef3c7" },
                    { label: "Vencidos", status: "vencido", cor: "#dc2626", bg: "#fee2e2" },
                  ].map(({ label, status, cor, bg }) => {
                    const qtd = honorariosFiltrados.filter((h) => h.status === status).length;
                    const val = honorariosFiltrados.filter((h) => h.status === status).reduce((s, h) => s + (status === "pago" || status === "parcial" ? (h.valorPago ?? 0) : h.valor), 0);
                    return (
                      <div key={status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20, background: bg, color: cor }}>{label}</span>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{qtd} lançamentos</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{fmt(val)}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Honorários ({honorariosFiltrados.length})</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--border-light)" }}>
                      {["Cliente", "Descrição", "Valor", "Status", "Vencimento", "Pago"].map((h) => (
                        <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {honorariosFiltrados.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: "24px", textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>Nenhum lançamento no período</td></tr>
                    ) : honorariosFiltrados.map((h) => (
                      <tr key={h.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-primary)" }}>{h.cliente}</td>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-muted)", maxWidth: 200 }}>{h.descricao}</td>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{fmt(h.valor)}</td>
                        <td style={{ padding: "9px 14px" }}>
                          <span style={{
                            fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20,
                            background: h.status === "pago" ? "#dcfce7" : h.status === "parcial" ? "#dbeafe" : h.status === "vencido" ? "#fee2e2" : "#fef9c3",
                            color: h.status === "pago" ? "#16a34a" : h.status === "parcial" ? "#2563eb" : h.status === "vencido" ? "#dc2626" : "#92400e",
                          }}>
                            {h.status === "pago" ? "Pago" : h.status === "parcial" ? "Parcial" : h.status === "vencido" ? "Vencido" : "Pendente"}
                          </span>
                        </td>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmtData(h.dataVencimento)}</td>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{h.valorPago ? fmt(h.valorPago) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Prazos */}
        {aba === "prazos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={exportPrazosCSV}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid var(--gcj-red)", background: "var(--gcj-red)", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
              >
                <Download size={13} /> Exportar CSV
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              {card("", "Vencidos", pVencidos)}
              {card("", "Urgentes (≤7d)", pUrgentes)}
              {card("", "Pendentes", pPendentes)}
              {card("", "Cumpridos", pCumpridos)}
            </div>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Todos os prazos ({prazos.length})</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--border-light)" }}>
                      {["Processo", "Cliente", "Descrição", "Tipo", "Vencimento", "Status"].map((h) => (
                        <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {prazos.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: "24px", textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>Nenhum prazo cadastrado</td></tr>
                    ) : prazos.sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento)).map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-primary)", fontFamily: "monospace" }}>{p.numeroProcesso}</td>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-primary)" }}>{p.cliente}</td>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-muted)" }}>{p.descricao}</td>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-muted)" }}>{p.tipo}</td>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{fmtData(p.dataVencimento)}</td>
                        <td style={{ padding: "9px 14px" }}>
                          <span style={{
                            fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20,
                            background: p.status === "cumprido" ? "#dcfce7" : p.status === "vencido" ? "#fee2e2" : p.status === "urgente" ? "#fef3c7" : "#f1f5f9",
                            color: p.status === "cumprido" ? "#16a34a" : p.status === "vencido" ? "#dc2626" : p.status === "urgente" ? "#d97706" : "#64748b",
                          }}>
                            {p.status === "cumprido" ? "Cumprido" : p.status === "vencido" ? "Vencido" : p.status === "urgente" ? "Urgente" : "Pendente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tarefas */}
        {aba === "tarefas" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={exportTarefasCSV}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid var(--gcj-red)", background: "var(--gcj-red)", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
              >
                <Download size={13} /> Exportar CSV
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              {card("", "Pendentes", tPendentes)}
              {card("", "Em Andamento", tAndamento)}
              {card("", "Concluídas", tConcluidas)}
              {card("", "Atrasadas", tAtrasadas)}
            </div>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Todas as tarefas ({tarefas.length})</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--border-light)" }}>
                      {["Descrição", "Advogado", "Prioridade", "Status", "Vencimento", "Conclusão"].map((h) => (
                        <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tarefas.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: "24px", textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>Nenhuma tarefa cadastrada</td></tr>
                    ) : tarefas.map((t) => {
                      const atrasada = t.status !== "concluida" && new Date(t.dataVencimento + "T00:00:00") < hoje;
                      return (
                        <tr key={t.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                          <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-primary)" }}>{t.descricao}</td>
                          <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-muted)" }}>{t.advogado}</td>
                          <td style={{ padding: "9px 14px" }}>
                            <span style={{
                              fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20,
                              background: t.prioridade === "alta" ? "#fee2e2" : t.prioridade === "media" ? "#fef3c7" : "#f1f5f9",
                              color: t.prioridade === "alta" ? "#dc2626" : t.prioridade === "media" ? "#d97706" : "#64748b",
                            }}>
                              {t.prioridade === "alta" ? "Alta" : t.prioridade === "media" ? "Média" : "Baixa"}
                            </span>
                          </td>
                          <td style={{ padding: "9px 14px" }}>
                            <span style={{
                              fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20,
                              background: t.status === "concluida" ? "#dcfce7" : t.status === "em_andamento" ? "#dbeafe" : "#f1f5f9",
                              color: t.status === "concluida" ? "#16a34a" : t.status === "em_andamento" ? "#2563eb" : "#64748b",
                            }}>
                              {t.status === "concluida" ? "Concluída" : t.status === "em_andamento" ? "Em andamento" : "Pendente"}
                            </span>
                          </td>
                          <td style={{ padding: "9px 14px", fontSize: 12, color: atrasada ? "#dc2626" : "var(--text-muted)", whiteSpace: "nowrap" }}>
                            {fmtData(t.dataVencimento)}{atrasada ? " ⚠" : ""}
                          </td>
                          <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                            {t.dataConclusao ? fmtData(t.dataConclusao) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
