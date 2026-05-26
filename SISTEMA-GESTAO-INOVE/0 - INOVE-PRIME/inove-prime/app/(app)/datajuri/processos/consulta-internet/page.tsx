"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe, Plus, RefreshCw, CheckCircle2, XCircle, Clock,
  AlertCircle, Trash2, ExternalLink, ChevronDown, ChevronUp,
  FolderOpen, Info,
} from "lucide-react";
import { listarProcessos, salvarProcesso, PROCESSOS_STORAGE_KEY } from "@/lib/datajuri/processos-storage";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type StatusConsulta = "aguardando" | "consultando" | "atualizado" | "sem_novidades" | "erro";

interface ConfigConsulta {
  id: string;
  numero: string;
  cliente: string;
  tribunal: string;
  ativo: boolean;
  ultimaConsulta: string | null;
  status: StatusConsulta;
  novosAndamentos: number;
  totalMovimentacoes?: number;
  erro?: string;
}

const STORAGE_KEY = "datajuri_consulta_internet";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function statusLabel(s: StatusConsulta) {
  const m: Record<StatusConsulta, string> = {
    aguardando:    "Aguardando",
    consultando:   "Consultando…",
    atualizado:    "Atualizado",
    sem_novidades: "Sem novidades",
    erro:          "Erro",
  };
  return m[s];
}

function statusColor(s: StatusConsulta): string {
  if (s === "atualizado")    return "#16a34a";
  if (s === "sem_novidades") return "#6b7280";
  if (s === "erro")          return "#dc2626";
  if (s === "consultando")   return "var(--gcj-red)";
  return "#ca8a04";
}

function statusBg(s: StatusConsulta): string {
  if (s === "atualizado")    return "#f0fdf4";
  if (s === "sem_novidades") return "#f9fafb";
  if (s === "erro")          return "#fef2f2";
  if (s === "consultando")   return "#fff7f7";
  return "#fefce8";
}

function StatusIcon({ s }: { s: StatusConsulta }) {
  if (s === "atualizado")    return <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#16a34a" }} />;
  if (s === "sem_novidades") return <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#9ca3af" }} />;
  if (s === "erro")          return <XCircle      className="h-3.5 w-3.5" style={{ color: "#dc2626" }} />;
  if (s === "consultando")   return <RefreshCw    className="h-3.5 w-3.5 animate-spin" style={{ color: "var(--gcj-red)" }} />;
  return <Clock className="h-3.5 w-3.5" style={{ color: "#ca8a04" }} />;
}

// ─── MODAL ADICIONAR ──────────────────────────────────────────────────────────

const CNJ_REGEX = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;

function formatarCNJ(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length <= 7)  return d;
  if (d.length <= 9)  return `${d.slice(0,7)}-${d.slice(7)}`;
  if (d.length <= 13) return `${d.slice(0,7)}-${d.slice(7,9)}.${d.slice(9)}`;
  if (d.length <= 14) return `${d.slice(0,7)}-${d.slice(7,9)}.${d.slice(9,13)}.${d.slice(13)}`;
  if (d.length <= 16) return `${d.slice(0,7)}-${d.slice(7,9)}.${d.slice(9,13)}.${d.slice(13,14)}.${d.slice(14)}`;
  return `${d.slice(0,7)}-${d.slice(7,9)}.${d.slice(9,13)}.${d.slice(13,14)}.${d.slice(14,16)}.${d.slice(16,20)}`;
}

function ModalAdicionar({ onAdd, onClose }: { onAdd: (cfg: Omit<ConfigConsulta, "id">) => void; onClose: () => void }) {
  const [numero,   setNumero]   = useState("");
  const [cliente,  setCliente]  = useState("");
  const [tribunal, setTribunal] = useState("");

  const valido = CNJ_REGEX.test(numero.trim());

  function handleAdd() {
    if (!valido) return;
    onAdd({
      numero: numero.trim(),
      cliente: cliente.trim() || "—",
      tribunal: tribunal.trim() || "DataJud",
      ativo: true,
      ultimaConsulta: null,
      status: "aguardando",
      novosAndamentos: 0,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-[480px] rounded-2xl shadow-2xl overflow-hidden" style={{ background: "#fff" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
          <p className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>Adicionar processo ao monitoramento</p>
          <button type="button" onClick={onClose} className="text-[18px] leading-none" style={{ color: "var(--text-muted)" }}>×</button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] mb-1.5" style={{ color: "var(--text-muted)" }}>
              Número do Processo (CNJ) <span style={{ color: "var(--gcj-red)" }}>*</span>
            </label>
            <div className="relative">
              <input
                value={numero}
                onChange={e => setNumero(formatarCNJ(e.target.value))}
                placeholder="0000000-00.0000.0.00.0000"
                maxLength={25}
                className="w-full h-8 px-3 pr-20 text-[12px] rounded-lg focus:outline-none"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                onKeyDown={e => e.key === "Enter" && valido && handleAdd()}
              />
              {numero.length > 0 && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold"
                  style={{ color: valido ? "#16a34a" : "#dc2626" }}>
                  {valido ? "✓ válido" : "inválido"}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] mb-1.5" style={{ color: "var(--text-muted)" }}>
              Cliente (referência interna)
            </label>
            <input
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              placeholder="Nome do cliente"
              className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] mb-1.5" style={{ color: "var(--text-muted)" }}>
              Tribunal (opcional — detectado automaticamente)
            </label>
            <input
              value={tribunal}
              onChange={e => setTribunal(e.target.value)}
              placeholder="Ex: TJSC (auto)"
              className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </div>
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg mt-1" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "#b45309" }} />
            <p className="text-[10px]" style={{ color: "#92400e" }}>
              O processo será consultado automaticamente via DataJud conforme o horário configurado em{" "}
              <Link href="/datajuri/admin/configuracoes" className="underline font-medium">Configurações → Processos</Link>.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border-light)" }}>
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg text-[11px] font-medium"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            Cancelar
          </button>
          <button type="button" onClick={handleAdd} disabled={!valido}
            className="px-4 py-2 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: "var(--gcj-red)", color: "#fff" }}>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ConsultaInternetPage() {
  const [configs, setConfigs] = useState<ConfigConsulta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [expandedErro, setExpandedErro] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConfigs(JSON.parse(raw) as ConfigConsulta[]);
    } catch { /* ignore */ }
  }, []);

  function save(list: ConfigConsulta[]) {
    setConfigs(list);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
  }

  function addConfig(cfg: Omit<ConfigConsulta, "id">) {
    const newCfg: ConfigConsulta = { ...cfg, id: Date.now().toString() };
    save([...configs, newCfg]);
  }

  function removeConfig(id: string) {
    save(configs.filter(c => c.id !== id));
  }

  function toggleAtivo(id: string) {
    save(configs.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c));
  }

  async function consultarUm(id: string) {
    // Lê estado fresco do localStorage para evitar closure stale em consultarTodos
    let currentConfigs: ConfigConsulta[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      currentConfigs = raw ? (JSON.parse(raw) as ConfigConsulta[]) : configs;
    } catch { currentConfigs = configs; }

    const cfg = currentConfigs.find(c => c.id === id);
    if (!cfg) return;

    save(currentConfigs.map(c => c.id === id ? { ...c, status: "consultando" as StatusConsulta } : c));

    let apiKey = "";
    try { apiKey = localStorage.getItem("datajuri_api_key") ?? ""; } catch { /* no-op */ }

    const ts = new Date().toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    try {
      const resp = await fetch("/api/datajud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: cfg.numero, apiKey }),
      });

      // Re-lê configs após await (outro processo pode ter sido atualizado)
      let latest: ConfigConsulta[] = configs;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) latest = JSON.parse(raw) as ConfigConsulta[];
      } catch { /* usa state */ }

      if (!resp.ok) {
        save(latest.map(c => c.id === id
          ? { ...c, status: "erro" as StatusConsulta, ultimaConsulta: ts, erro: `HTTP ${resp.status}` }
          : c));
        return;
      }

      type Hit = {
        _source: {
          tribunal?: string;
          movimentos?: { dataHora?: string; nome?: string }[];
        };
      };
      const json = await resp.json() as { hits?: { hits?: Hit[] } };
      const hits = json?.hits?.hits ?? [];

      if (hits.length === 0) {
        save(latest.map(c => c.id === id
          ? { ...c, status: "sem_novidades" as StatusConsulta, ultimaConsulta: ts, novosAndamentos: 0, erro: undefined }
          : c));
        return;
      }

      const src = hits[0]._source;

      // Ordenar e montar lista de movimentações
      const movimentacoes = [...(src.movimentos ?? [])]
        .sort((a, b) => (b.dataHora ?? "").localeCompare(a.dataHora ?? ""))
        .slice(0, 50)
        .map(m => ({ data: (m.dataHora ?? "").slice(0, 10), descricao: m.nome ?? "" }));

      const totalAtual = movimentacoes.length;
      const totalAnterior = cfg.totalMovimentacoes ?? 0;
      const novas = Math.max(0, totalAtual - totalAnterior);

      // ── SYNC: atualiza o processo no localStorage quando há novidades ──
      if (novas > 0) {
        const processos = listarProcessos();
        const idx = processos.findIndex(p => p.numero === cfg.numero);
        if (idx >= 0) {
          salvarProcesso({ ...processos[idx], movimentacoes });
        }
      }

      save(latest.map(c => c.id === id ? {
        ...c,
        tribunal:          src.tribunal ?? c.tribunal,
        status:            novas > 0 ? "atualizado" as StatusConsulta : "sem_novidades" as StatusConsulta,
        ultimaConsulta:    ts,
        novosAndamentos:   novas,
        totalMovimentacoes: totalAtual,
        erro:              undefined,
      } : c));
    } catch {
      let latest: ConfigConsulta[] = configs;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) latest = JSON.parse(raw) as ConfigConsulta[];
      } catch { /* usa state */ }
      save(latest.map(c => c.id === id
        ? { ...c, status: "erro" as StatusConsulta, ultimaConsulta: ts, erro: "Falha de conexão" }
        : c));
    }
  }

  async function consultarTodos() {
    setSyncingAll(true);
    const ativos = configs.filter(c => c.ativo);
    for (const c of ativos) {
      await consultarUm(c.id);
    }
    setSyncingAll(false);
  }

  const total   = configs.length;
  const ativos  = configs.filter(c => c.ativo).length;
  const comErro = configs.filter(c => c.status === "erro").length;
  const atualizados = configs.filter(c => c.status === "atualizado").length;

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Consulta Internet</h1>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            Monitoramento automático de movimentações via DataJud (API CNJ)
          </p>
        </div>
        <div className="flex gap-2">
          {configs.length > 0 && (
            <button type="button" onClick={consultarTodos} disabled={syncingAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-60"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <RefreshCw className={`h-3.5 w-3.5 ${syncingAll ? "animate-spin" : ""}`} />
              Consultar todos
            </button>
          )}
          <button type="button" onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--gcj-red)", color: "#fff" }}>
            <Plus className="h-3.5 w-3.5" />
            Adicionar processo
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      {configs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Processos monitorados", value: total,       color: "var(--text-primary)" },
            { label: "Monitoramento ativo",    value: ativos,      color: "#16a34a" },
            { label: "Com novas movimentações",value: atualizados, color: "var(--gcj-red)" },
            { label: "Com erro",               value: comErro,     color: "#dc2626" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl px-4 py-3" style={{ background: "#fff", border: "1px solid var(--border)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabela / empty state */}
      {configs.length === 0 ? (
        <div className="rounded-2xl flex flex-col items-center justify-center py-16 text-center"
          style={{ background: "#fff", border: "2px dashed var(--border)" }}>
          <div className="h-12 w-12 rounded-2xl mb-4 flex items-center justify-center" style={{ background: "var(--bg)" }}>
            <Globe className="h-6 w-6" style={{ color: "var(--text-muted)" }} />
          </div>
          <p className="text-[13px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>Nenhum processo monitorado</p>
          <p className="text-[11px] mb-5 max-w-xs" style={{ color: "var(--text-muted)" }}>
            Adicione os números CNJ dos processos que deseja acompanhar automaticamente.
            O sistema consultará o DataJud nos horários configurados e registrará novas movimentações.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <button type="button" onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold"
              style={{ background: "var(--gcj-red)", color: "#fff" }}>
              <Plus className="h-3.5 w-3.5" />
              Adicionar processo
            </button>
            <Link href="/datajuri/admin/configuracoes">
              <button type="button"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                Configurar horário de consulta
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border-light)" }}>
                {["Processo", "Cliente", "Tribunal", "Última consulta", "Status", "Andamentos", ""].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-bold tracking-[0.1em] uppercase" style={{ color: "var(--text-muted)", fontSize: 10 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {configs.map((cfg) => (
                <>
                  <tr key={cfg.id} className="border-b last:border-0 transition-colors hover:bg-gray-50"
                    style={{ borderColor: "var(--border-light)" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Toggle ativo */}
                        <button type="button" onClick={() => toggleAtivo(cfg.id)} aria-label="Ativar/desativar monitoramento"
                          className="relative inline-flex h-4 w-7 items-center rounded-full transition-colors shrink-0"
                          style={{ background: cfg.ativo ? "var(--gcj-red)" : "#d1d5db" }}>
                          <span className="inline-block h-3 w-3 rounded-full bg-white shadow transition-transform"
                            style={{ transform: cfg.ativo ? "translateX(14px)" : "translateX(2px)" }} />
                        </button>
                        <Link href={`/datajuri/processos?q=${cfg.numero}`}>
                          <span className="text-[11px] font-medium font-mono hover:underline" style={{ color: "var(--gcj-red)" }}>
                            {cfg.numero}
                          </span>
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{cfg.cliente}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{cfg.tribunal}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                        {cfg.ultimaConsulta ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold"
                        style={{ background: statusBg(cfg.status), color: statusColor(cfg.status) }}>
                        <StatusIcon s={cfg.status} />
                        {statusLabel(cfg.status)}
                      </span>
                      {cfg.status === "erro" && cfg.erro && (
                        <button type="button" onClick={() => setExpandedErro(expandedErro === cfg.id ? null : cfg.id)}
                          className="ml-1.5" style={{ color: "#dc2626" }}>
                          {expandedErro === cfg.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {cfg.novosAndamentos > 0 ? (
                        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[9px] font-bold"
                          style={{ background: "var(--gcj-red)", color: "#fff" }}>
                          +{cfg.novosAndamentos}
                        </span>
                      ) : (
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => consultarUm(cfg.id)}
                          disabled={cfg.status === "consultando" || !cfg.ativo}
                          title="Consultar agora"
                          className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-40">
                          <RefreshCw className={`h-3.5 w-3.5 ${cfg.status === "consultando" ? "animate-spin" : ""}`}
                            style={{ color: "var(--gcj-red)" }} />
                        </button>
                        <Link href={`/datajuri/processos?q=${cfg.numero}`} title="Ver processo">
                          <button type="button" className="p-1.5 rounded-lg transition-colors hover:bg-gray-100">
                            <FolderOpen className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                          </button>
                        </Link>
                        <Link href={`/datajuri/processos/novo?numero=${cfg.numero}`} title="Abrir no DataJud">
                          <button type="button" className="p-1.5 rounded-lg transition-colors hover:bg-gray-100">
                            <ExternalLink className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                          </button>
                        </Link>
                        <button type="button" onClick={() => removeConfig(cfg.id)} title="Remover do monitoramento"
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" style={{ color: "#dc2626" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedErro === cfg.id && cfg.erro && (
                    <tr key={`${cfg.id}-erro`} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td colSpan={7} className="px-4 pb-3">
                        <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "#dc2626" }} />
                          <p className="text-[11px]" style={{ color: "#dc2626" }}>{cfg.erro}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info box */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl" style={{ background: "#f8fafc", border: "1px solid var(--border)" }}>
        <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }} />
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          As consultas são realizadas via <strong>API pública do DataJud (CNJ)</strong>.
          Para configurar o horário de atualização automática ou usar uma chave própria, acesse{" "}
          <Link href="/datajuri/admin/configuracoes" className="underline" style={{ color: "var(--gcj-red)" }}>
            Configurações → Processos
          </Link>.
          Para adicionar um processo já com todos os dados importados, use{" "}
          <Link href="/datajuri/processos/novo" className="underline" style={{ color: "var(--gcj-red)" }}>
            Processos → Novo processo (CNJ)
          </Link>.
        </p>
      </div>

      {showModal && <ModalAdicionar onAdd={addConfig} onClose={() => setShowModal(false)} />}
    </div>
  );
}
