"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { listarProcessos } from "@/lib/datajuri/processos-storage";
import type { Processo, StatusProcesso } from "@/lib/datajuri/mock-data";
import { formatDate, formatCurrency } from "@/lib/datajuri/utils";
import {
  ArrowLeft, Users, FolderOpen, Eye, AlertCircle,
} from "lucide-react";
import Link from "next/link";

const statusConfig: Record<StatusProcesso, { label: string; bg: string; color: string }> = {
  ativo:           { label: "Ativo",       bg: "#dcfce7", color: "#15803d" },
  suspenso:        { label: "Suspenso",    bg: "#fef9c3", color: "#a16207" },
  arquivado:       { label: "Arquivado",   bg: "#f3f4f6", color: "#6b7280" },
  baixado:         { label: "Baixado",     bg: "#f0fdf4", color: "#16a34a" },
  aguardando_baixa:{ label: "Ag. Baixa",  bg: "#fff7ed", color: "#c2410c" },
};

const TABS = ["Processos", "Movimentações"] as const;
type Tab = typeof TABS[number];

export default function ClienteDetalhePage() {
  const params = useParams();
  const nomeDecoded = decodeURIComponent(params.id as string);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [tab, setTab] = useState<Tab>("Processos");

  useEffect(() => {
    const todos = listarProcessos();
    setProcessos(todos.filter((p) => p.cliente?.trim() === nomeDecoded.trim()));
  }, [nomeDecoded]);

  const ativo = processos.some((p) => p.status === "ativo" || p.status === "suspenso");
  const totalCausa = processos.reduce((s, p) => s + (p.valorCausa ?? 0), 0);

  // Todas as movimentações de todos os processos, ordenadas por data desc
  const todasMovs = processos
    .flatMap((p) =>
      (p.movimentacoes ?? []).map((m) => ({ ...m, processo: p.numero, tribunal: p.tribunal }))
    )
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 50);

  if (processos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ color: "var(--text-muted)" }}>
        <AlertCircle className="h-10 w-10 mb-3" />
        <p className="font-medium text-sm">Cliente não encontrado</p>
        <p className="text-xs mt-1">{nomeDecoded}</p>
        <Link href="/datajuri/clientes">
          <button type="button" className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: "var(--gcj-red)", color: "#fff" }}>
            Voltar para Clientes
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">

      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Link href="/datajuri/clientes">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Clientes
          </button>
        </Link>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--sidebar-active-bg)" }}>
            <Users className="h-4 w-4" style={{ color: "var(--gcj-gold)" }} />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{nomeDecoded}</h1>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              {processos.length} processo{processos.length !== 1 ? "s" : ""} · Valor total: {formatCurrency(totalCausa)}
            </p>
          </div>
          <span
            className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={ativo ? { background: "#dcfce7", color: "#15803d" } : { background: "#f3f4f6", color: "#6b7280" }}
          >
            {ativo ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Processos ativos",    value: processos.filter(p => p.status === "ativo").length },
          { label: "Tribunais distintos", value: new Set(processos.map(p => p.tribunal).filter(Boolean)).size },
          { label: "Movimentações",       value: processos.reduce((s, p) => s + (p.movimentacoes?.length ?? 0), 0) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-2xl font-bold" style={{ color: "var(--gcj-red)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: "var(--border)" }}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="px-4 py-2 text-[12px] font-semibold transition-colors"
            style={tab === t
              ? { color: "var(--gcj-red)", borderBottom: "2px solid var(--gcj-red)", marginBottom: -1 }
              : { color: "var(--text-muted)", borderBottom: "2px solid transparent", marginBottom: -1 }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Processos */}
      {tab === "Processos" && (
        <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ background: "var(--bg)", borderColor: "var(--border-light)" }}>
                {["Número", "Tribunal / Vara", "Tipo", "Parte contrária", "Valor", "Distribuição", "Status", ""].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processos.map((p) => {
                const s = statusConfig[p.status];
                return (
                  <tr key={p.id} className="border-b last:border-0" style={{ borderColor: "var(--border-light)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[11px] font-semibold" style={{ color: "var(--gcj-red)" }}>{p.numero}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="text-xs" style={{ color: "var(--text-primary)" }}>{p.tribunal}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{p.vara}</p>
                    </td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {p.classeProcessual ?? p.tipo}
                    </td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {p.parteContraria || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                      {formatCurrency(p.valorCausa)}
                    </td>
                    <td className="py-2.5 px-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {formatDate(p.dataDistribuicao)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <Link href={`/datajuri/processos/${p.id}`}>
                        <button type="button" aria-label="Ver processo" className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                          <Eye className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Movimentações */}
      {tab === "Movimentações" && (
        <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          {todasMovs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: "var(--text-muted)" }}>
              <FolderOpen className="h-8 w-8 mb-2" />
              <p className="text-sm font-medium">Nenhuma movimentação registrada</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
              {todasMovs.map((m, i) => (
                <div key={i} className="flex items-start gap-4 px-4 py-3">
                  <span className="text-[10px] font-mono shrink-0 mt-0.5 w-20" style={{ color: "var(--text-muted)" }}>{m.data}</span>
                  <span className="text-[11px] font-mono shrink-0 w-32 truncate" style={{ color: "var(--gcj-red)" }} title={m.processo}>{m.processo}</span>
                  <span className="text-[11px] flex-1" style={{ color: "var(--text-primary)" }}>{m.descricao}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
