"use client";
import Link from "next/link";
import { useState } from "react";

const pipelines = [
  {
    key: "gcj-juridico",
    titulo: "GCJ Jurídico",
    descricao: "Negócios e contratos do escritório GCJ",
    cor: "#1F3763",
    fases: [
      { nome: "Prospecção",  qtd: 2, valor: "R$ 60.000" },
      { nome: "Qualificação",qtd: 1, valor: "R$ 85.000" },
      { nome: "Proposta",    qtd: 2, valor: "R$ 83.000" },
      { nome: "Negociação",  qtd: 1, valor: "R$ 18.000" },
      { nome: "Fechado ✓",   qtd: 1, valor: "R$ 22.000" },
    ],
  },
  {
    key: "ivi-negocios",
    titulo: "IVI – NEGÓCIOS",
    descricao: "Benefícios previdenciários e atendimentos IVI",
    cor: "#62974B",
    fases: [
      { nome: "Novo Contato", qtd: 2, valor: "R$ 10.500" },
      { nome: "Em Análise",   qtd: 1, valor: "R$ 8.000"  },
      { nome: "Documentação", qtd: 1, valor: "R$ 6.000"  },
      { nome: "Protocolo",    qtd: 0, valor: "R$ 0"      },
      { nome: "Deferido ✓",   qtd: 1, valor: "R$ 7.200"  },
    ],
  },
  {
    key: "grupo-inove",
    titulo: "Grupo Inove Prime",
    descricao: "Parcerias estratégicas e projetos do grupo",
    cor: "#2a4a82",
    fases: [
      { nome: "Prospecção", qtd: 1, valor: "R$ 30.000"  },
      { nome: "Proposta",   qtd: 1, valor: "R$ 120.000" },
      { nome: "Negociação", qtd: 0, valor: "R$ 0"       },
      { nome: "Contrato",   qtd: 0, valor: "R$ 0"       },
      { nome: "Fechado ✓",  qtd: 0, valor: "R$ 0"       },
    ],
  },
];

const faseColors = [
  "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981",
];

export default function PipelinesPage() {
  const [editando, setEditando] = useState<string | null>(null);

  return (
    <div className="dash-wrap">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/negocios" className="breadcrumb-link">Negócios</Link>
        <span className="breadcrumb-sep">›</span>
        <span>Pipelines e Túneis de Vendas</span>
      </div>

      {/* Header */}
      <div className="pl-header">
        <div>
          <p className="pg-title">Pipelines e Túneis de Vendas</p>
          <p className="pg-sub">Configure os estágios de cada funil de negócios</p>
        </div>
        <button type="button" className="btn btn-primary">+ Novo Pipeline</button>
      </div>

      {/* Pipeline cards */}
      <div className="pl-list">
        {pipelines.map((pl) => (
          <div key={pl.key} className="pl-card">
            {/* Card header */}
            <div className="pl-card-head" style={{ borderLeftColor: pl.cor }}>
              <div className="pl-card-info">
                <div className="pl-card-title">{pl.titulo}</div>
                <div className="pl-card-desc">{pl.descricao}</div>
              </div>
              <div className="pl-card-actions">
                <button
                  type="button"
                  className={`btn btn-sm btn-outline${editando === pl.key ? " active" : ""}`}
                  onClick={() => setEditando(v => v === pl.key ? null : pl.key)}
                >
                  {editando === pl.key ? "Fechar" : "Editar fases"}
                </button>
                <Link href={`/negocios?pipeline=${pl.key}`} className="btn btn-sm btn-primary">
                  Ver Kanban
                </Link>
              </div>
            </div>

            {/* Fases */}
            <div className="pl-fases">
              {pl.fases.map((fase, i) => (
                <div key={fase.nome} className="pl-fase" style={{ borderTopColor: faseColors[i % faseColors.length] }}>
                  <div className="pl-fase-dot" style={{ background: faseColors[i % faseColors.length] }} />
                  <div className="pl-fase-nome">{fase.nome}</div>
                  <div className="pl-fase-qtd">{fase.qtd} negócio{fase.qtd !== 1 ? "s" : ""}</div>
                  <div className="pl-fase-val">{fase.valor}</div>
                  {editando === pl.key && (
                    <button type="button" className="pl-fase-edit">✎</button>
                  )}
                </div>
              ))}
              {editando === pl.key && (
                <button type="button" className="pl-fase pl-fase-add">
                  + Adicionar fase
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
