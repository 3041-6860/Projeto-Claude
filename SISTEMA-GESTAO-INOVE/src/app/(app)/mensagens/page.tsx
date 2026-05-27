"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Edit, Filter, Send, Plus, X, Users, MessageSquare, Bell, Hash, Briefcase, Bot } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Tab = "bate-papos" | "tarefas" | "contact-center" | "copilot" | "canais";

interface Msg {
  id:     string;
  texto:  string;
  autor:  string;
  hora:   string;
  meu:    boolean;
}

interface Conversa {
  id:        string;
  nome:      string;
  tipo:      "interno" | "cliente" | "grupo" | "canal" | "tarefa";
  msgs:      Msg[];
  ultimaMsg: string;
  hora:      string;
  naoLidas:  number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function hhmm()  { return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }
function initials(nome: string) { return nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase(); }

const AVATAR_COLORS = ["#1e3a5f","#059669","#7c3aed","#d97706","#dc2626","#0ea5e9","#84cc16","#f43f5e"];
function avatarColor(nome: string) {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ─── Configuração das abas ────────────────────────────────────────────────────
const TABS: { key: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "bate-papos",    label: "Bate-papos",            icon: MessageSquare, desc: "Conversas internas entre a equipe" },
  { key: "tarefas",       label: "Bate-papos de Tarefas", icon: Briefcase,     desc: "Discussões vinculadas a tarefas" },
  { key: "contact-center",label: "Contact Center",        icon: Users,         desc: "Atendimento e conversas com clientes" },
  { key: "copilot",       label: "CoPilot IA",            icon: Bot,           desc: "Assistente de IA para a equipe" },
  { key: "canais",        label: "Canais",                icon: Hash,          desc: "Comunicados e feeds da equipe" },
];

const SK = "inove-messenger-v1";

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function Mensagens() {
  const [aba,          setAba]          = useState<Tab>("bate-papos");
  const [conversas,    setConversas]    = useState<Record<Tab, Conversa[]>>({
    "bate-papos": [], tarefas: [], "contact-center": [], copilot: [], canais: [],
  });
  const [ativoId,      setAtivoId]      = useState<string | null>(null);
  const [texto,        setTexto]        = useState("");
  const [busca,        setBusca]        = useState("");
  const [modalNova,    setModalNova]    = useState(false);
  const [novaNome,     setNovaNome]     = useState("");
  const msgsEndRef = useRef<HTMLDivElement>(null);

  // Carregar do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SK);
      if (raw) setConversas(JSON.parse(raw));
    } catch {}
  }, []);

  function salvarConversas(updated: Record<Tab, Conversa[]>) {
    setConversas(updated);
    localStorage.setItem(SK, JSON.stringify(updated));
  }

  // Scroll ao final das mensagens
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ativoId, conversas]);

  // Conversa ativa
  const listaAtual = conversas[aba] ?? [];
  const listaFiltrada = listaAtual.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );
  const conversa = ativoId ? listaAtual.find(c => c.id === ativoId) ?? null : null;

  function criarConversa() {
    if (!novaNome.trim()) return;
    const tipos: Record<Tab, Conversa["tipo"]> = {
      "bate-papos": "interno", tarefas: "tarefa", "contact-center": "cliente", copilot: "interno", canais: "canal",
    };
    const nova: Conversa = {
      id: newId(), nome: novaNome.trim(),
      tipo: tipos[aba], msgs: [], ultimaMsg: "Conversa iniciada", hora: hhmm(), naoLidas: 0,
    };
    const updated = { ...conversas, [aba]: [nova, ...conversas[aba]] };
    salvarConversas(updated);
    setAtivoId(nova.id);
    setNovaNome("");
    setModalNova(false);
  }

  function enviarMensagem() {
    if (!texto.trim() || !conversa) return;
    const msg: Msg = { id: newId(), texto: texto.trim(), autor: "Eu", hora: hhmm(), meu: true };
    const updated = {
      ...conversas,
      [aba]: conversas[aba].map(c =>
        c.id === ativoId
          ? { ...c, msgs: [...c.msgs, msg], ultimaMsg: texto.trim(), hora: hhmm(), naoLidas: 0 }
          : c
      ),
    };
    salvarConversas(updated);
    setTexto("");
  }

  function marcarLido(id: string) {
    const updated = {
      ...conversas,
      [aba]: conversas[aba].map(c => c.id === id ? { ...c, naoLidas: 0 } : c),
    };
    salvarConversas(updated);
    setAtivoId(id);
  }

  function excluirConversa(id: string) {
    const updated = { ...conversas, [aba]: conversas[aba].filter(c => c.id !== id) };
    salvarConversas(updated);
    if (ativoId === id) setAtivoId(null);
  }

  const tabInfo = TABS.find(t => t.key === aba)!;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>

      {/* ── Barra de abas (estilo Bitrix24) ── */}
      <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", background: "#f9fafb", overflowX: "auto", flexShrink: 0 }}>
        {TABS.map(tab => {
          const total = conversas[tab.key]?.reduce((s, c) => s + c.naoLidas, 0) ?? 0;
          return (
            <button
              key={tab.key}
              onClick={() => { setAba(tab.key); setAtivoId(null); setBusca(""); }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer",
                fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                color: aba === tab.key ? "#2563eb" : "#6b7280",
                borderBottom: aba === tab.key ? "2px solid #2563eb" : "2px solid transparent",
                transition: "all 0.15s", position: "relative",
              }}
            >
              <tab.icon size={13} />
              {tab.label}
              {total > 0 && (
                <span style={{ background: "#dc2626", color: "white", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 5px", minWidth: 16, textAlign: "center" }}>
                  {total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Corpo: lista + chat ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Painel esquerdo: lista de conversas ── */}
        <div style={{ width: 280, borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", flexShrink: 0 }}>

          {/* Busca e botão novo */}
          <div style={{ padding: "10px 10px 8px", display: "flex", gap: 6, borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input
                value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar ou iniciar bate-papo"
                style={{ width: "100%", paddingLeft: 28, paddingRight: 8, paddingTop: 6, paddingBottom: 6, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, boxSizing: "border-box", outline: "none" }}
              />
            </div>
            <button title="Filtrar" style={{ padding: "6px 7px", border: "1px solid #e5e7eb", borderRadius: 8, background: "white", cursor: "pointer" }}>
              <Filter size={13} color="#6b7280" />
            </button>
            <button title="Nova conversa" onClick={() => setModalNova(true)}
              style={{ padding: "6px 7px", border: "1px solid #e5e7eb", borderRadius: 8, background: "white", cursor: "pointer" }}>
              <Edit size={13} color="#2563eb" />
            </button>
          </div>

          {/* Lista de conversas */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {listaFiltrada.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af" }}>
                <tabInfo.icon size={32} style={{ margin: "0 auto 10px", opacity: 0.3, display: "block" }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
                  {busca ? "Nenhum resultado" : `Nenhum bate-papo ainda`}
                </p>
                <p style={{ fontSize: 12 }}>{busca ? "Tente outros termos" : tabInfo.desc}</p>
                {!busca && (
                  <button onClick={() => setModalNova(true)}
                    style={{ marginTop: 12, padding: "6px 14px", background: "#2563eb", color: "white", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    + Iniciar
                  </button>
                )}
              </div>
            ) : (
              listaFiltrada.map(c => (
                <div
                  key={c.id}
                  onClick={() => marcarLido(c.id)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "10px 12px", cursor: "pointer",
                    background: ativoId === c.id ? "#eff6ff" : "white",
                    borderLeft: ativoId === c.id ? "3px solid #2563eb" : "3px solid transparent",
                    borderBottom: "1px solid #f9fafb",
                    transition: "background 0.1s",
                    position: "relative",
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    background: avatarColor(c.nome), color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700,
                  }}>
                    {initials(c.nome)}
                  </div>

                  {/* Conteúdo */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: c.naoLidas > 0 ? 700 : 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.nome}
                      </span>
                      <span style={{ fontSize: 10, color: "#9ca3af", flexShrink: 0, marginLeft: 4 }}>{c.hora}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {c.ultimaMsg}
                      </span>
                      {c.naoLidas > 0 && (
                        <span style={{ background: "#2563eb", color: "white", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px", marginLeft: 4, flexShrink: 0 }}>
                          {c.naoLidas}
                        </span>
                      )}
                    </div>
                    <span style={{
                      fontSize: 10, padding: "1px 6px", borderRadius: 4, marginTop: 3, display: "inline-block",
                      background: c.tipo === "cliente" ? "#fef3c7" : c.tipo === "canal" ? "#f0fdf4" : c.tipo === "tarefa" ? "#eff6ff" : "#f3f4f6",
                      color: c.tipo === "cliente" ? "#d97706" : c.tipo === "canal" ? "#059669" : c.tipo === "tarefa" ? "#2563eb" : "#6b7280",
                      fontWeight: 600,
                    }}>
                      {c.tipo === "interno" ? "Interno" : c.tipo === "cliente" ? "Cliente" : c.tipo === "grupo" ? "Grupo" : c.tipo === "canal" ? "Canal" : "Tarefa"}
                    </span>
                  </div>

                  {/* Botão excluir */}
                  <button
                    onClick={e => { e.stopPropagation(); excluirConversa(c.id); }}
                    style={{ position: "absolute", top: 6, right: 6, background: "none", border: "none", cursor: "pointer", opacity: 0, padding: 2, borderRadius: 4 }}
                    className="del-btn"
                    title="Excluir conversa"
                  >
                    <X size={11} color="#9ca3af" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Painel direito: chat ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {conversa ? (
            <>
              {/* Header do chat */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: avatarColor(conversa.nome), color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                  {initials(conversa.nome)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{conversa.nome}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    {conversa.tipo === "interno" ? "Conversa interna" :
                     conversa.tipo === "cliente" ? "Atendimento ao cliente" :
                     conversa.tipo === "canal"   ? "Canal de comunicados" :
                     conversa.tipo === "tarefa"  ? "Bate-papo de tarefa" : "Grupo"}
                    {" · "}{conversa.msgs.length} mensagen{conversa.msgs.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ padding: "5px 12px", border: "1px solid #e5e7eb", borderRadius: 7, background: "white", fontSize: 12, cursor: "pointer", color: "#374151" }}>
                    <Bell size={13} />
                  </button>
                  <button onClick={() => setAtivoId(null)} style={{ padding: "5px 12px", border: "1px solid #e5e7eb", borderRadius: 7, background: "white", fontSize: 12, cursor: "pointer", color: "#374151" }}>
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Mensagens */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 8 }}>
                {conversa.msgs.length === 0 ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                    <MessageSquare size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>Nenhuma mensagem ainda</p>
                    <p style={{ fontSize: 12 }}>Seja o primeiro a enviar uma mensagem!</p>
                  </div>
                ) : (
                  conversa.msgs.map(m => (
                    <div key={m.id} style={{ display: "flex", justifyContent: m.meu ? "flex-end" : "flex-start" }}>
                      {!m.meu && (
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%", marginRight: 8, flexShrink: 0,
                          background: avatarColor(m.autor), color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
                        }}>
                          {initials(m.autor)}
                        </div>
                      )}
                      <div style={{
                        maxWidth: "70%", padding: "8px 12px", borderRadius: m.meu ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                        background: m.meu ? "#2563eb" : "#f3f4f6",
                        color: m.meu ? "white" : "#111827",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}>
                        {!m.meu && <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 3, color: "#6b7280" }}>{m.autor}</div>}
                        <div style={{ fontSize: 13, lineHeight: 1.5 }}>{m.texto}</div>
                        <div style={{ fontSize: 10, marginTop: 4, opacity: 0.65, textAlign: "right" }}>{m.hora}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={msgsEndRef} />
              </div>

              {/* Input de mensagem */}
              <div style={{ padding: "10px 16px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, flexShrink: 0 }}>
                <input
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarMensagem(); } }}
                  placeholder="Digite uma mensagem… (Enter para enviar)"
                  style={{ flex: 1, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }}
                />
                <button
                  onClick={enviarMensagem}
                  disabled={!texto.trim()}
                  style={{ padding: "8px 16px", background: "#2563eb", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: !texto.trim() ? 0.5 : 1 }}>
                  <Send size={13} /> Enviar
                </button>
              </div>
            </>
          ) : (
            /* Estado vazio — nenhuma conversa selecionada */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", padding: 32 }}>
              <tabInfo.icon size={56} style={{ opacity: 0.15, marginBottom: 16, display: "block" }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 8 }}>{tabInfo.label}</p>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20, textAlign: "center", maxWidth: 320 }}>{tabInfo.desc}</p>
              <button onClick={() => setModalNova(true)}
                style={{ padding: "8px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={14} />
                {aba === "contact-center" ? "Novo Atendimento" :
                 aba === "canais" ? "Novo Canal" :
                 aba === "tarefas" ? "Novo Bate-papo de Tarefa" :
                 aba === "copilot" ? "Conversar com CoPilot" :
                 "Nova Conversa"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Nova Conversa ── */}
      {modalNova && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 12, padding: 28, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 4 }}>
              {aba === "contact-center" ? "Novo Atendimento" :
               aba === "canais" ? "Novo Canal" :
               aba === "tarefas" ? "Novo Bate-papo de Tarefa" :
               aba === "copilot" ? "Nova Conversa CoPilot" :
               "Nova Conversa Interna"}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>{tabInfo.desc}</div>

            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              {aba === "contact-center" ? "Nome do cliente" :
               aba === "canais" ? "Nome do canal" :
               aba === "tarefas" ? "Nome da tarefa" :
               "Nome / colaborador"}
            </label>
            <input
              autoFocus
              value={novaNome}
              onChange={e => setNovaNome(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") criarConversa(); if (e.key === "Escape") setModalNova(false); }}
              placeholder={aba === "contact-center" ? "Ex: João Silva" : aba === "canais" ? "Ex: #geral" : "Ex: Equipe Jurídico"}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, boxSizing: "border-box", outline: "none" }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setModalNova(false); setNovaNome(""); }}
                style={{ flex: 1, padding: "10px 0", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={criarConversa} disabled={!novaNome.trim()}
                style={{ flex: 2, padding: "10px 0", background: "#2563eb", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !novaNome.trim() ? 0.5 : 1 }}>
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS inline para hover do botão excluir */}
      <style>{`
        .del-btn { opacity: 0 !important; transition: opacity 0.15s; }
        div:hover > .del-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
