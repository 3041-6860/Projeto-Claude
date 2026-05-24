"use client";
import { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Empresa = "GCJ" | "IVI" | "JH";
type StatusOB = "Em andamento" | "Concluído";
type TabDetalhe = "cronograma" | "termos" | "avaliacao";

interface Atividade {
  id: string;
  label: string;
  responsavel: string;
  feito: boolean;
}

interface Dia {
  titulo: string;
  atividades: Atividade[];
}

interface Termo {
  id: string;
  nome: string;
  assinado: boolean;
  dataAssinatura?: string;
}

interface Onboarding {
  id: string;
  colaborador: string;
  cargo: string;
  empresa: Empresa;
  gestor: string;
  dataInicio: string;
  status: StatusOB;
  dias: Dia[];
  termos: Termo[];
  avaliacaoColaborador: Record<string, number>;
  avaliacaoGestor: Record<string, number>;
}

// ─── Templates (baseados no Plano_Integracao_Grupo_Inove_Prime.pdf) ───────────

function criarDias(): Dia[] {
  return [
    {
      titulo: "Segunda-feira — Recepção, Cultura e Apresentação do Grupo",
      atividades: [
        { id: "s1", label: "Recepção formal · Apresentação da equipe e do(a) gestor(a) responsável", responsavel: "Gestor(a)", feito: false },
        { id: "s2", label: "Apresentação do Grupo Inove Prime: história, missão, visão, valores e estrutura", responsavel: "Gestor(a)", feito: false },
        { id: "s3", label: "Apresentação: Gonçalves Consultoria, Instituto Vinícius Ian e Just Help", responsavel: "Gestor(a)", feito: false },
        { id: "s4", label: "Entrega e assinatura de todos os documentos de integração", responsavel: "Gestor(a)", feito: false },
        { id: "s5", label: "Leitura orientada: Manual Interno e Código de Ética e Conduta do Grupo", responsavel: "Colaborador(a)", feito: false },
        { id: "s6", label: "Configuração de acessos: e-mail institucional e sistemas operacionais", responsavel: "Gestor(a) / TI", feito: false },
      ],
    },
    {
      titulo: "Terça-feira — ESG, LGPD e Responsabilidades",
      atividades: [
        { id: "t1", label: "Treinamento ESG: o que é, por que importa e como se aplica em cada empresa", responsavel: "Gestor(a)", feito: false },
        { id: "t2", label: "Treinamento LGPD: conceitos, obrigações do colaborador e boas práticas", responsavel: "Gestor(a)", feito: false },
        { id: "t3", label: "Política de uso de sistemas, equipamentos e dados — regras e obrigações", responsavel: "Gestor(a)", feito: false },
        { id: "t4", label: "Treinamento no Bitrix24: visão geral, CRM, tarefas, agenda e comunicação interna", responsavel: "Gestor(a)", feito: false },
      ],
    },
    {
      titulo: "Quarta-feira — Sistemas e Processos Operacionais",
      atividades: [
        { id: "q1", label: "Bitrix24 — aprofundamento: funil de atendimento, automações, follow-up e relatórios", responsavel: "Gestor(a)", feito: false },
        { id: "q2", label: "Datajuri — visão geral: cadastro de processos, controle de prazos e alertas processuais", responsavel: "Gestor(a)", feito: false },
        { id: "q3", label: "Fluxo de atendimento ao cliente: da triagem ao encerramento do caso", responsavel: "Gestor(a)", feito: false },
        { id: "q4", label: "Apresentação de modelos de documentos, petições e templates do grupo", responsavel: "Gestor(a)", feito: false },
      ],
    },
    {
      titulo: "Quinta-feira — Prática Supervisionada",
      atividades: [
        { id: "qu1", label: "Acompanhamento de atendimento real com o(a) gestor(a) — observação ativa", responsavel: "Gestor(a)", feito: false },
        { id: "qu2", label: "Primeiras atividades práticas assistidas conforme a função designada", responsavel: "Gestor(a)", feito: false },
        { id: "qu3", label: "Registro e atualização de dados nos sistemas sob supervisão", responsavel: "Colaborador(a)", feito: false },
        { id: "qu4", label: "Dúvidas, alinhamento de processos e feedback do dia", responsavel: "Gestor(a)", feito: false },
      ],
    },
    {
      titulo: "Sexta-feira — Consolidação, Avaliação e Boas-Vindas Oficial",
      atividades: [
        { id: "sx1", label: "Revisão geral da semana: dúvidas finais e consolidação dos aprendizados", responsavel: "Gestor(a)", feito: false },
        { id: "sx2", label: "Preenchimento da Ficha de Encerramento da Integração", responsavel: "Gestor(a) + Colab.", feito: false },
        { id: "sx3", label: "Reunião de feedback final e definição das metas para os primeiros 30 dias", responsavel: "Gestor(a)", feito: false },
        { id: "sx4", label: "Boas-vindas oficial: apresentação à equipe e início das atividades regulares", responsavel: "Equipe", feito: false },
      ],
    },
  ];
}

function criarTermos(): Termo[] {
  return [
    { id: "tc", nome: "Termo de Confidencialidade e Sigilo Profissional", assinado: false },
    { id: "tl", nome: "Termo de Ciência e Responsabilidade — LGPD (Lei 13.709/2018)", assinado: false },
    { id: "te", nome: "Termo de Ciência — Código de Ética e Conduta", assinado: false },
    { id: "ts", nome: "Política de Uso de Sistemas, Equipamentos e Dados", assinado: false },
    { id: "tr", nome: "Termo de Recebimento de Equipamentos e Materiais", assinado: false },
  ];
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "inove_onboardings_v2";

const EMPRESA_NOME: Record<Empresa, string> = {
  GCJ: "Gonçalves Consultoria Jurídica",
  IVI: "Instituto Vinícius Ian",
  JH: "Just Help",
};

const AVALIACAO_COLAB = [
  "Qualidade do treinamento recebido",
  "Clareza das informações e orientações",
  "Apresentação das empresas do grupo",
  "Treinamento no Bitrix24 e Datajuri",
  "Orientação sobre LGPD e Sigilo",
  "Orientação sobre ESG",
  "Acolhimento e suporte do(a) gestor(a)",
  "Sentimento de preparo para a função",
];

const AVALIACAO_GESTOR = [
  "Adaptação ao ambiente e à equipe",
  "Assimilação dos processos e sistemas",
  "Comprometimento e proatividade",
  "Compreensão e adesão à LGPD e ESG",
  "Ética e conduta profissional",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcProgress(ob: Onboarding): number {
  const totalAtiv = ob.dias.reduce((s, d) => s + d.atividades.length, 0);
  const feitasAtiv = ob.dias.reduce((s, d) => s + d.atividades.filter(a => a.feito).length, 0);
  const total = totalAtiv + ob.termos.length;
  const done = feitasAtiv + ob.termos.filter(t => t.assinado).length;
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

function mediaAvaliacao(notas: Record<string, number>, itens: string[]): string {
  const vals = itens.map(i => notas[i] ?? 0).filter(v => v > 0);
  if (!vals.length) return "—";
  return (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1);
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function OnboardingClient() {
  const [lista, setLista] = useState<Onboarding[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabDetalhe>("cronograma");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    colaborador: "",
    cargo: "",
    empresa: "GCJ" as Empresa,
    gestor: "",
    dataInicio: "",
  });

  // Carrega dados do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLista(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  function salvar(data: Onboarding[]) {
    setLista(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // ── Ações ────────────────────────────────────────────────────────────────

  function criarOnboarding() {
    if (!form.colaborador.trim() || !form.cargo.trim() || !form.gestor.trim() || !form.dataInicio) return;
    const novo: Onboarding = {
      id: Date.now().toString(),
      colaborador: form.colaborador.trim(),
      cargo: form.cargo.trim(),
      empresa: form.empresa,
      gestor: form.gestor.trim(),
      dataInicio: form.dataInicio,
      status: "Em andamento",
      dias: criarDias(),
      termos: criarTermos(),
      avaliacaoColaborador: {},
      avaliacaoGestor: {},
    };
    salvar([novo, ...lista]);
    setShowModal(false);
    setSelectedId(novo.id);
    setTab("cronograma");
    setForm({ colaborador: "", cargo: "", empresa: "GCJ", gestor: "", dataInicio: "" });
  }

  function excluirOnboarding(id: string) {
    if (!confirm("Excluir esta integração?")) return;
    const nova = lista.filter(o => o.id !== id);
    salvar(nova);
    if (selectedId === id) setSelectedId(null);
  }

  function toggleAtividade(obId: string, diaIdx: number, atId: string) {
    salvar(lista.map(ob => {
      if (ob.id !== obId) return ob;
      const dias = ob.dias.map((d, di) =>
        di !== diaIdx ? d : {
          ...d,
          atividades: d.atividades.map(a => a.id === atId ? { ...a, feito: !a.feito } : a),
        }
      );
      const prog = calcProgress({ ...ob, dias });
      return { ...ob, dias, status: prog === 100 ? "Concluído" : "Em andamento" };
    }));
  }

  function toggleTermo(obId: string, termoId: string) {
    salvar(lista.map(ob => {
      if (ob.id !== obId) return ob;
      const termos = ob.termos.map(t =>
        t.id !== termoId ? t : {
          ...t,
          assinado: !t.assinado,
          dataAssinatura: !t.assinado ? new Date().toLocaleDateString("pt-BR") : undefined,
        }
      );
      const prog = calcProgress({ ...ob, termos });
      return { ...ob, termos, status: prog === 100 ? "Concluído" : "Em andamento" };
    }));
  }

  function setNota(obId: string, tipo: "colaborador" | "gestor", item: string, nota: number) {
    salvar(lista.map(ob => {
      if (ob.id !== obId) return ob;
      return tipo === "colaborador"
        ? { ...ob, avaliacaoColaborador: { ...ob.avaliacaoColaborador, [item]: nota } }
        : { ...ob, avaliacaoGestor: { ...ob.avaliacaoGestor, [item]: nota } };
    }));
  }

  // ── Derivados ────────────────────────────────────────────────────────────

  const ob = lista.find(o => o.id === selectedId) ?? null;
  const ativos = lista.filter(o => o.status === "Em andamento").length;
  const concluidos = lista.filter(o => o.status === "Concluído").length;
  const mediaGeral = lista.length
    ? Math.round(lista.reduce((s, o) => s + calcProgress(o), 0) / lista.length)
    : 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="dash-wrap">

      {/* Toolbar */}
      <div className="pg-toolbar">
        <div>
          <p className="pg-title">Onboarding — Integração de Colaboradores</p>
          <p className="pg-sub">
            {lista.length} integração(ões) · {ativos} em andamento · {concluidos} concluída(s)
          </p>
        </div>
        <button className="btn btn-navy" onClick={() => setShowModal(true)}>
          <UserPlus size={14} /> Nova Integração
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2.5 mb-3">
        {[
          { label: "Total",           val: lista.length.toString(),  hint: "Integrações cadastradas",               cls: "val-navy"  },
          { label: "Em andamento",    val: ativos.toString(),        hint: "Colaboradores na semana de integração",  cls: "val-navy"  },
          { label: "Concluídas",      val: concluidos.toString(),    hint: "Integrações finalizadas com sucesso",    cls: "val-green" },
          { label: "Progresso médio", val: lista.length ? `${mediaGeral}%` : "—", hint: "Média de progresso das integrações", cls: "val-gray" },
        ].map(c => (
          <div key={c.label} className="card">
            <p className="card-label">{c.label}</p>
            <p className={`card-val ${c.cls}`}>{c.val}</p>
            <p className="card-hint">{c.hint}</p>
          </div>
        ))}
      </div>

      {/* Conteúdo principal */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>

        {/* ── Lista de onboardings ──────────────────────────────────────── */}
        <div style={{ width: ob ? 300 : "100%", flexShrink: 0 }}>
          {lista.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ fontSize: 32, marginBottom: 10 }}>👋</p>
              <p style={{ fontWeight: 700, marginBottom: 6, color: "var(--navy)" }}>Nenhuma integração cadastrada</p>
              <p style={{ color: "var(--gray)", fontSize: 12, marginBottom: 16 }}>
                Crie a primeira integração para começar o processo de onboarding.
              </p>
              <button className="btn btn-navy" onClick={() => setShowModal(true)}>
                + Nova Integração
              </button>
            </div>
          ) : (
            lista.map(o => {
              const prog = calcProgress(o);
              const ativo = o.id === selectedId;
              return (
                <div
                  key={o.id}
                  className="card"
                  style={{
                    marginBottom: 10,
                    cursor: "pointer",
                    borderLeft: ativo ? "3px solid var(--navy)" : "3px solid transparent",
                    transition: "border .15s",
                  }}
                  onClick={() => { setSelectedId(o.id); setTab("cronograma"); }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{o.colaborador}</p>
                      <p style={{ color: "var(--gray)", fontSize: 12 }}>{o.cargo}</p>
                      <p style={{ color: "var(--gray)", fontSize: 11, marginTop: 2 }}>{EMPRESA_NOME[o.empresa]}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <span className={`badge ${o.status === "Concluído" ? "badge-green" : "badge-navy"}`}>
                        {o.status}
                      </span>
                      <button
                        className="btn btn-danger-outline btn-sm"
                        style={{ fontSize: 10, padding: "2px 8px" }}
                        onClick={e => { e.stopPropagation(); excluirOnboarding(o.id); }}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                  {/* Barra de progresso */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--gray)", marginBottom: 3 }}>
                      <span>Progresso</span><span>{prog}%</span>
                    </div>
                    <div style={{ height: 5, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${prog}%`,
                        background: prog === 100 ? "var(--green)" : "var(--navy)",
                        borderRadius: 4,
                        transition: "width .3s",
                      }} />
                    </div>
                  </div>
                  <p style={{ marginTop: 7, fontSize: 11, color: "var(--gray)" }}>
                    Gestor: {o.gestor} · Início: {new Date(o.dataInicio + "T00:00:00").toLocaleDateString("pt-BR")}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* ── Painel de detalhe ─────────────────────────────────────────── */}
        {ob && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>

              {/* Cabeçalho */}
              <div style={{
                background: "var(--navy)",
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{ob.colaborador}</p>
                  <p style={{ color: "rgba(255,255,255,.7)", fontSize: 12, marginTop: 2 }}>
                    {ob.cargo} · {EMPRESA_NOME[ob.empresa]} · Gestor: {ob.gestor}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    className="badge"
                    style={{
                      background: ob.status === "Concluído" ? "var(--green)" : "rgba(255,255,255,.2)",
                      color: "#fff",
                    }}
                  >
                    {ob.status}
                  </span>
                  <button
                    onClick={() => setSelectedId(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex", padding: 0 }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Barra de progresso no cabeçalho */}
              <div style={{ height: 4, background: "var(--navy-dark)" }}>
                <div style={{
                  height: "100%",
                  width: `${calcProgress(ob)}%`,
                  background: "var(--green)",
                  transition: "width .3s",
                }} />
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "#fff" }}>
                {(["cronograma", "termos", "avaliacao"] as TabDetalhe[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      padding: "10px 18px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      borderBottom: tab === t ? "2px solid var(--navy)" : "2px solid transparent",
                      color: tab === t ? "var(--navy)" : "var(--gray)",
                    }}
                  >
                    {t === "cronograma" ? "📅 Cronograma" : t === "termos" ? "📄 Documentos" : "⭐ Avaliação"}
                  </button>
                ))}
                {/* Progresso % na direita */}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", paddingRight: 16, fontSize: 12, color: "var(--gray)" }}>
                  {calcProgress(ob)}% concluído
                </div>
              </div>

              <div style={{ padding: 20 }}>

                {/* ── TAB: Cronograma ─────────────────────────────────── */}
                {tab === "cronograma" && (
                  <div>
                    {ob.dias.map((dia, diaIdx) => {
                      const total = dia.atividades.length;
                      const feitas = dia.atividades.filter(a => a.feito).length;
                      const diaOk = feitas === total;
                      return (
                        <div key={diaIdx} style={{ marginBottom: 18 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <p style={{ fontWeight: 700, fontSize: 13, color: diaOk ? "var(--green-dark)" : "var(--navy)" }}>
                              {diaOk ? "✅ " : "📋 "}{dia.titulo}
                            </p>
                            <span style={{ fontSize: 11, color: "var(--gray)", flexShrink: 0 }}>{feitas}/{total}</span>
                          </div>
                          {dia.atividades.map(at => (
                            <div
                              key={at.id}
                              onClick={() => toggleAtividade(ob.id, diaIdx, at.id)}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 9,
                                padding: "7px 10px",
                                borderRadius: 6,
                                background: at.feito ? "var(--green-light)" : "#fff",
                                border: "1px solid var(--border)",
                                marginBottom: 4,
                                cursor: "pointer",
                              }}
                            >
                              <div style={{
                                width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                                border: `2px solid ${at.feito ? "var(--green)" : "#ccc"}`,
                                background: at.feito ? "var(--green)" : "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                {at.feito && <span style={{ color: "#fff", fontSize: 9, lineHeight: 1 }}>✓</span>}
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{
                                  fontSize: 12.5,
                                  color: at.feito ? "var(--gray)" : "#111827",
                                  textDecoration: at.feito ? "line-through" : "none",
                                }}>
                                  {at.label}
                                </p>
                                <p style={{ fontSize: 11, color: "var(--gray)", marginTop: 1 }}>
                                  Responsável: {at.responsavel}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── TAB: Documentos ─────────────────────────────────── */}
                {tab === "termos" && (
                  <div>
                    <div className="alert alert-navy" style={{ marginBottom: 16 }}>
                      <span>📌</span>
                      <span>
                        Clique no documento para registrar a assinatura no sistema.
                        O original físico deve ser assinado e arquivado no primeiro dia.
                      </span>
                    </div>

                    {ob.termos.map(t => (
                      <div
                        key={t.id}
                        onClick={() => toggleTermo(ob.id, t.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "13px 16px",
                          borderRadius: 8,
                          border: `1px solid ${t.assinado ? "var(--green)" : "var(--border)"}`,
                          background: t.assinado ? "var(--green-light)" : "#fff",
                          marginBottom: 8,
                          cursor: "pointer",
                          transition: "background .15s",
                        }}
                      >
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{t.assinado ? "✅" : "📄"}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: t.assinado ? "var(--green-dark)" : "#111827",
                          }}>
                            {t.nome}
                          </p>
                          {t.assinado && t.dataAssinatura && (
                            <p style={{ fontSize: 11, color: "var(--gray)", marginTop: 2 }}>
                              Registrado em {t.dataAssinatura}
                            </p>
                          )}
                        </div>
                        <span className={`badge ${t.assinado ? "badge-green" : "badge-orange"}`} style={{ flexShrink: 0 }}>
                          {t.assinado ? "Registrado" : "Pendente"}
                        </span>
                      </div>
                    ))}

                    {/* Resumo */}
                    <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                      <div className="card" style={{ flex: 1, textAlign: "center", padding: "12px 8px" }}>
                        <p className="card-label">Assinados</p>
                        <p className="card-val val-green">{ob.termos.filter(t => t.assinado).length}</p>
                      </div>
                      <div className="card" style={{ flex: 1, textAlign: "center", padding: "12px 8px" }}>
                        <p className="card-label">Pendentes</p>
                        <p className="card-val val-navy">{ob.termos.filter(t => !t.assinado).length}</p>
                      </div>
                      <div className="card" style={{ flex: 1, textAlign: "center", padding: "12px 8px" }}>
                        <p className="card-label">Total</p>
                        <p className="card-val val-gray">{ob.termos.length}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB: Avaliação ──────────────────────────────────── */}
                {tab === "avaliacao" && (
                  <div>
                    {/* Avaliação do Colaborador */}
                    <div style={{ marginBottom: 28 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: "var(--navy)" }}>
                          Avaliação do Colaborador sobre a Integração
                        </p>
                        <span className="badge badge-navy">
                          Média: {mediaAvaliacao(ob.avaliacaoColaborador, AVALIACAO_COLAB)}
                        </span>
                      </div>
                      {AVALIACAO_COLAB.map(item => (
                        <div
                          key={item}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "7px 0",
                            borderBottom: "1px solid var(--border)",
                            gap: 8,
                          }}
                        >
                          <p style={{ fontSize: 12.5, flex: 1 }}>{item}</p>
                          <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                            {[1, 2, 3, 4, 5].map(n => {
                              const ativo = (ob.avaliacaoColaborador[item] ?? 0) >= n;
                              return (
                                <button
                                  key={n}
                                  onClick={() => setNota(ob.id, "colaborador", item, n)}
                                  style={{
                                    width: 27, height: 27,
                                    borderRadius: 4,
                                    border: "1px solid var(--border)",
                                    background: ativo ? "var(--navy)" : "#fff",
                                    color: ativo ? "#fff" : "var(--gray)",
                                    cursor: "pointer",
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                  }}
                                >{n}</button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Avaliação do Gestor */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: "var(--navy)" }}>
                          Avaliação do Gestor sobre o Colaborador
                        </p>
                        <span className="badge badge-green">
                          Média: {mediaAvaliacao(ob.avaliacaoGestor, AVALIACAO_GESTOR)}
                        </span>
                      </div>
                      {AVALIACAO_GESTOR.map(item => (
                        <div
                          key={item}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "7px 0",
                            borderBottom: "1px solid var(--border)",
                            gap: 8,
                          }}
                        >
                          <p style={{ fontSize: 12.5, flex: 1 }}>{item}</p>
                          <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                            {[1, 2, 3, 4, 5].map(n => {
                              const ativo = (ob.avaliacaoGestor[item] ?? 0) >= n;
                              return (
                                <button
                                  key={n}
                                  onClick={() => setNota(ob.id, "gestor", item, n)}
                                  style={{
                                    width: 27, height: 27,
                                    borderRadius: 4,
                                    border: "1px solid var(--border)",
                                    background: ativo ? "var(--green)" : "#fff",
                                    color: ativo ? "#fff" : "var(--gray)",
                                    cursor: "pointer",
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                  }}
                                >{n}</button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Alerta de prazo */}
                    <div className="alert alert-orange" style={{ marginTop: 20 }}>
                      <span>⏰</span>
                      <span>
                        Lembre-se de realizar a avaliação de desempenho inicial com o colaborador
                        nos primeiros <strong>30 dias</strong> após o início.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal: Nova Integração ──────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <p className="modal-title" style={{ margin: 0 }}>Nova Integração</p>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-form">
              {[
                { label: "Nome do Colaborador *", key: "colaborador", type: "text", placeholder: "Nome completo" },
                { label: "Função / Cargo *", key: "cargo", type: "text", placeholder: "Ex: Advogado Associado" },
                { label: "Gestor(a) Responsável *", key: "gestor", type: "text", placeholder: "Nome do gestor" },
                { label: "Data de Início *", key: "dataInicio", type: "date", placeholder: "" },
              ].map(f => (
                <div key={f.key}>
                  <p className="modal-label">{f.label}</p>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}

              <div>
                <p className="modal-label">Empresa do Grupo *</p>
                <select
                  value={form.empresa}
                  onChange={e => setForm(p => ({ ...p, empresa: e.target.value as Empresa }))}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 13,
                    fontFamily: "inherit",
                    outline: "none",
                    background: "#fff",
                  }}
                >
                  <option value="GCJ">Gonçalves Consultoria Jurídica</option>
                  <option value="IVI">Instituto Vinícius Ian</option>
                  <option value="JH">Just Help</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button
                className="btn btn-navy"
                onClick={criarOnboarding}
                disabled={!form.colaborador.trim() || !form.cargo.trim() || !form.gestor.trim() || !form.dataInicio}
                style={{ opacity: (!form.colaborador.trim() || !form.cargo.trim() || !form.gestor.trim() || !form.dataInicio) ? .5 : 1 }}
              >
                Criar Integração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
