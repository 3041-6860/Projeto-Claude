"use client";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Search, FolderPlus, CheckCircle2, AlertCircle,
  Loader2, FolderOpen, Users, Gavel, DollarSign, Save,
  RefreshCw, Info,
} from "lucide-react";
import Link from "next/link";
import { salvarProcesso } from "@/lib/processos-storage";
import type { TipoProcesso, Processo } from "@/lib/mock-data";
import { listarAdvogados, labelAdvogado } from "@/lib/equipe-storage";
import type { Membro } from "@/lib/equipe-storage";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type Modo = "auto" | "manual";
type BuscaStatus = "idle" | "buscando" | "encontrado" | "nao_encontrado" | "erro";

interface DadosProcesso {
  numero: string;
  tribunal: string;
  vara: string;
  juiz: string;
  tipo: string;
  status: string;
  fase: string;
  dataDistribuicao: string;
  parteContraria: string;
  advogadoContrario: string;
  valorCausa: string;
  descricao: string;
  comarca: string;
  instancia: string;
  clienteNome: string;
  advogadoResponsavel: string;
  movimentacoes: { data: string; descricao: string }[];
  parteAtiva: string;
  advogadoAtivo: string;
}

// ─── VALIDAÇÃO CNJ ────────────────────────────────────────────────────────────
// Formato: NNNNNNN-DD.AAAA.J.TT.OOOO
const CNJ_REGEX = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;

function validarCNJ(numero: string): boolean {
  return CNJ_REGEX.test(numero.trim());
}

function formatarCNJ(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 7)  return digits;
  if (digits.length <= 9)  return `${digits.slice(0,7)}-${digits.slice(7)}`;
  if (digits.length <= 13) return `${digits.slice(0,7)}-${digits.slice(7,9)}.${digits.slice(9)}`;
  if (digits.length <= 14) return `${digits.slice(0,7)}-${digits.slice(7,9)}.${digits.slice(9,13)}.${digits.slice(13)}`;
  if (digits.length <= 16) return `${digits.slice(0,7)}-${digits.slice(7,9)}.${digits.slice(9,13)}.${digits.slice(13,14)}.${digits.slice(14)}`;
  return `${digits.slice(0,7)}-${digits.slice(7,9)}.${digits.slice(9,13)}.${digits.slice(13,14)}.${digits.slice(14,16)}.${digits.slice(16,20)}`;
}

// ─── API DATAJUD (via proxy server-side em /api/datajud) ─────────────────────

const DATAJUD_KEY_STORAGE = "datajuri_api_key";

function grau2instancia(grau: string) {
  return grau === "G2" ? "2" : "1";
}

function parseTipo(tipo: string): TipoProcesso {
  const t = tipo.toLowerCase();
  if (t.includes("trabalh") || t.includes("empregad")) return "trabalhista";
  if (t.includes("crimin") || t.includes("penal") || t.includes("infra")) return "criminal";
  if (t.includes("tribut") || t.includes("fiscal")) return "tributario";
  if (t.includes("previd") || t.includes("inss") || t.includes("aposentad")) return "previdenciario";
  if (t.includes("administ") || t.includes("mandado de seguran")) return "administrativo";
  return "civil";
}

type DataJudHit = {
  _source: {
    numeroProcesso?: string;
    tribunal?: string;
    grau?: string;
    orgaoJulgador?: { nome?: string };
    classeProcessual?: { nome?: string };
    assuntos?: { nome?: string }[];
    dataAjuizamento?: string;
    movimentos?: { dataHora?: string; nome?: string }[];
    partes?: { nome?: string; polo?: string; advogados?: { nome?: string }[] }[];
    valorCausa?: number;
  };
};

async function buscarProcessoCNJ(numero: string): Promise<{ ok: boolean; dados?: DadosProcesso; erro?: string }> {
  let apiKey = "";
  try { apiKey = localStorage.getItem(DATAJUD_KEY_STORAGE) ?? ""; } catch { /* SSR */ }

  let resp: Response;
  try {
    resp = await fetch("/api/datajud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero, apiKey }),
    });
  } catch {
    return { ok: false, erro: "Falha de conexão. Verifique sua internet e tente novamente." };
  }

  if (resp.status === 400) {
    const err = await resp.json().catch(() => ({})) as { error?: string };
    return { ok: false, erro: err.error ?? "Número CNJ inválido." };
  }
  if (resp.status === 401) {
    return { ok: false, erro: "Chave de API inválida. Configure em Configurações → Processos." };
  }
  if (resp.status === 503) {
    return { ok: false, erro: "Sem conexão com o DataJud. Verifique sua internet e tente novamente." };
  }
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({})) as { error?: string };
    return { ok: false, erro: err.error ?? `Erro na consulta (HTTP ${resp.status}).` };
  }

  const json = await resp.json() as { hits?: { hits?: DataJudHit[] }; error?: string };
  const hits = json?.hits?.hits ?? [];

  if (hits.length === 0) {
    return { ok: false, erro: "Processo não encontrado nos tribunais consultados." };
  }

  const src = hits[0]._source;
  const partePassiva = (src.partes ?? []).find(p => p.polo === "PASSIVO");
  const parteAtiva = (src.partes ?? []).find(p => p.polo === "ATIVO");

  const movimentacoes = [...(src.movimentos ?? [])]
    .sort((a, b) => (b.dataHora ?? "").localeCompare(a.dataHora ?? ""))
    .slice(0, 25)
    .map(m => ({ data: (m.dataHora ?? "").slice(0, 10), descricao: m.nome ?? "" }));

  return {
    ok: true,
    dados: {
      numero:              src.numeroProcesso ?? numero,
      tribunal:            src.tribunal ?? "",
      vara:                src.orgaoJulgador?.nome ?? "",
      juiz:                "",
      tipo:                src.classeProcessual?.nome ?? "",
      status:              "ativo",
      fase:                "",
      dataDistribuicao:    (src.dataAjuizamento ?? "").slice(0, 10),
      parteContraria:      partePassiva?.nome ?? "",
      advogadoContrario:   partePassiva?.advogados?.[0]?.nome ?? "",
      parteAtiva:          parteAtiva?.nome ?? "",
      advogadoAtivo:       parteAtiva?.advogados?.[0]?.nome ?? "",
      valorCausa:          src.valorCausa != null ? String(src.valorCausa) : "",
      descricao:           src.assuntos?.[0]?.nome ?? "",
      comarca:             "",
      instancia:           grau2instancia(src.grau ?? "G1"),
      clienteNome:         "",
      advogadoResponsavel: "",
      movimentacoes,
    },
  };
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
    <input
      {...props}
      className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none transition-colors"
      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#111"; props.onFocus?.(e); }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; props.onBlur?.(e); }}
    />
  );
}

function Sel({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none"
      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
    >
      {children}
    </select>
  );
}

function CardSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl" style={{ background: "#fff", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "var(--border-light)" }}>
        <Icon className="h-3.5 w-3.5" style={{ color: "var(--gcj-red)" }} />
        <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{title}</span>
      </div>
      <div className="p-5 grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

// ─── MODO AUTOMÁTICO ──────────────────────────────────────────────────────────

function ModoAutomatico({ onSwitchManual }: { onSwitchManual: (numero: string, dados?: DadosProcesso) => void }) {
  const [numero, setNumero] = useState("");
  const [status, setStatus] = useState<BuscaStatus>("idle");
  const [resultado, setResultado] = useState<DadosProcesso | null>(null);
  const [erro, setErro] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [advogado, setAdvogado] = useState("");
  const [monitorar, setMonitorar] = useState(true);
  const [salvo, setSalvo] = useState(false);
  const [advogados, setAdvogados] = useState<Membro[]>([]);

  useEffect(() => { setAdvogados(listarAdvogados()); }, []);

  useEffect(() => {
    if (resultado?.parteAtiva) setClienteNome(resultado.parteAtiva);
  }, [resultado]);

  const valido = validarCNJ(numero);

  function handleNumero(e: React.ChangeEvent<HTMLInputElement>) {
    setNumero(formatarCNJ(e.target.value));
    setStatus("idle");
    setResultado(null);
  }

  async function buscar() {
    if (!valido) return;
    setStatus("buscando");
    setErro("");
    setResultado(null);
    const res = await buscarProcessoCNJ(numero);
    if (res.ok && res.dados) {
      setResultado(res.dados);
      setStatus("encontrado");
    } else {
      setErro(res.erro ?? "Erro ao consultar.");
      setStatus("nao_encontrado");
    }
  }

  function handleSalvar() {
    if (!resultado || !clienteNome.trim() || !advogado) return;
    const id = `proc_${Date.now()}`;
    const processo: Processo = {
      id,
      numero:              resultado.numero,
      clienteId:           "",
      cliente:             clienteNome.trim(),
      tribunal:            resultado.tribunal,
      vara:                resultado.vara,
      juiz:                resultado.juiz,
      tipo:                parseTipo(resultado.tipo),
      status:              "ativo",
      fase:                resultado.fase,
      parteContraria:      resultado.parteContraria,
      advogadoContrario:   resultado.advogadoContrario,
      advogadoResponsavel: advogado,
      dataDistribuicao:    resultado.dataDistribuicao,
      valorCausa:          parseFloat(resultado.valorCausa) || 0,
      descricao:           resultado.descricao,
      comarca:             resultado.comarca,
      instancia:           resultado.instancia,
      classeProcessual:    resultado.tipo,
      parteAtiva:          resultado.parteAtiva,
      advogadoAtivo:       resultado.advogadoAtivo,
      movimentacoes:       resultado.movimentacoes,
      monitorar,
      createdAt:           new Date().toISOString(),
    };
    salvarProcesso(processo);
    if (monitorar) {
      try {
        const raw = localStorage.getItem("datajuri_consulta_internet");
        const lista: unknown[] = raw ? JSON.parse(raw) : [];
        lista.push({
          id: `ci_${Date.now()}`,
          numero: resultado.numero,
          cliente: clienteNome.trim(),
          tribunal: resultado.tribunal || "DataJud",
          ativo: true,
          ultimaConsulta: null,
          status: "aguardando",
          novosAndamentos: 0,
          totalMovimentacoes: resultado.movimentacoes.length,
        });
        localStorage.setItem("datajuri_consulta_internet", JSON.stringify(lista));
      } catch { /* ignore */ }
    }
    setSalvo(true);
  }

  return (
    <div className="space-y-4">

      {/* Info API */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
        <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#b45309" }} />
        <p className="text-[11px]" style={{ color: "#92400e" }}>
          A busca consulta a <strong>API pública do DataJud (CNJ)</strong> — cobre todos os tribunais brasileiros (TJSC, TRT, TRF, STJ…).
          Para uma chave dedicada com limites maiores, configure em{" "}
          <Link href="/admin/configuracoes" className="underline font-medium">Configurações → Processos</Link>.
        </p>
      </div>

      {/* Input CNJ */}
      <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid var(--border)" }}>
        <Label required>Número do Processo (formato CNJ)</Label>
        <div className="flex gap-2 mt-1.5">
          <div className="flex-1 relative">
            <Inp
              value={numero}
              onChange={handleNumero}
              placeholder="0000000-00.0000.0.00.0000"
              maxLength={25}
              onKeyDown={(e) => e.key === "Enter" && valido && buscar()}
            />
            {numero.length > 0 && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold"
                style={{ color: valido ? "#16a34a" : "#dc2626" }}>
                {valido ? "✓ válido" : "formato inválido"}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={buscar}
            disabled={!valido || status === "buscando"}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-opacity disabled:opacity-40"
            style={{ background: "var(--gcj-red)", color: "#fff" }}
          >
            {status === "buscando"
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Search className="h-3.5 w-3.5" />}
            {status === "buscando" ? "Buscando..." : "Buscar"}
          </button>
        </div>
        <p className="text-[10px] mt-1.5" style={{ color: "var(--text-muted)" }}>
          Formato: NNNNNNN-DD.AAAA.J.TT.OOOO — ex: 0302845-76.2017.8.24.0135
        </p>
      </div>

      {/* Buscando */}
      {status === "buscando" && (
        <div className="flex flex-col items-center justify-center py-10 rounded-xl" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <Loader2 className="h-8 w-8 animate-spin mb-3" style={{ color: "var(--gcj-red)" }} />
          <p className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>Consultando tribunais...</p>
          <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>DataJud CNJ · TJSC · TRT 12ª Região</p>
        </div>
      )}

      {/* Não encontrado */}
      {status === "nao_encontrado" && (
        <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 shrink-0" style={{ color: "#dc2626" }} />
            <div>
              <p className="text-[12px] font-semibold" style={{ color: "#dc2626" }}>Processo não encontrado</p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{erro}</p>
            </div>
          </div>
          <button type="button" onClick={() => onSwitchManual(numero)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
            <FolderPlus className="h-3.5 w-3.5" />
            Cadastrar manualmente
          </button>
        </div>
      )}

      {/* Encontrado */}
      {status === "encontrado" && resultado && !salvo && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#f0fdf4", border: "1px solid #86efac" }}>
            <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#16a34a" }} />
            <p className="text-[12px] font-semibold" style={{ color: "#15803d" }}>Processo encontrado — revise e confirme os dados</p>
          </div>

          {/* Dados encontrados */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border-light)", background: "var(--bg)" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>Dados encontrados nos tribunais</p>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { l: "Número CNJ",   v: resultado.numero },
                { l: "Tribunal",     v: resultado.tribunal },
                { l: "Vara",         v: resultado.vara },
                { l: "Tipo",         v: resultado.tipo },
                { l: "Fase",         v: resultado.fase },
                { l: "Distribuição", v: resultado.dataDistribuicao },
              ].map(({ l, v }) => (
                <div key={l}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] mb-0.5" style={{ color: "var(--text-muted)" }}>{l}</p>
                  <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>{v || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Movimentações */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border-light)", background: "var(--bg)" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
                Movimentações ({resultado.movimentacoes.length})
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
              {resultado.movimentacoes.map((m, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-2.5">
                  <span className="text-[10px] shrink-0 font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>{m.data}</span>
                  <span className="text-[11px]" style={{ color: "var(--text-primary)" }}>{m.descricao}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Complementar (cliente + advogado — obrigatório) */}
          <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <p className="text-[11px] font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Complete os dados internos antes de salvar:</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Cliente (parte assistida)</Label>
                <Inp
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <Label required>Advogado responsável</Label>
                <Sel value={advogado} onChange={(e) => setAdvogado(e.target.value)}>
                  <option value="">Selecione...</option>
                  {advogados.map((m) => (
                    <option key={m.id} value={m.nome}>{labelAdvogado(m)}</option>
                  ))}
                </Sel>
              </div>
              <div className="col-span-2 flex items-center gap-2.5 mt-1">
                <input
                  type="checkbox"
                  id="monitorar"
                  checked={monitorar}
                  onChange={(e) => setMonitorar(e.target.checked)}
                  className="h-3.5 w-3.5 rounded"
                  style={{ accentColor: "var(--gcj-red)" }}
                />
                <label htmlFor="monitorar" className="text-[11px] cursor-pointer" style={{ color: "var(--text-primary)" }}>
                  Monitorar automaticamente na <strong>Consulta Internet</strong>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={() => onSwitchManual(numero, resultado)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              <FolderPlus className="h-3.5 w-3.5" />
              Editar manualmente
            </button>
            <button
              type="button"
              onClick={handleSalvar}
              disabled={!clienteNome.trim() || !advogado}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-semibold transition-opacity disabled:opacity-40"
              style={{ background: "var(--gcj-red)", color: "#fff" }}>
              <Save className="h-3.5 w-3.5" />
              Confirmar e Salvar Processo
            </button>
          </div>
        </div>
      )}

      {/* Salvo */}
      {salvo && (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <CheckCircle2 className="h-10 w-10 mb-3" style={{ color: "#16a34a" }} />
          <p className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>Processo cadastrado com sucesso!</p>
          <p className="text-[11px] mt-1 mb-5" style={{ color: "var(--text-muted)" }}>{numero}</p>
          <div className="flex gap-2">
            <Link href="/processos">
              <button type="button" className="px-4 py-2 rounded-lg text-[11px] font-semibold"
                style={{ background: "var(--gcj-red)", color: "#fff" }}>
                Ver lista de processos
              </button>
            </Link>
            <button type="button" onClick={() => { setSalvo(false); setNumero(""); setStatus("idle"); setResultado(null); }}
              className="px-4 py-2 rounded-lg text-[11px] font-semibold"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              Importar outro processo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MODO MANUAL ──────────────────────────────────────────────────────────────

function ModoManual({ numeroInicial, dadosIniciais }: { numeroInicial?: string; dadosIniciais?: Partial<DadosProcesso> }) {
  const [advogados, setAdvogados] = useState<Membro[]>([]);
  useEffect(() => { setAdvogados(listarAdvogados()); }, []);

  const [form, setForm] = useState<DadosProcesso>({
    numero: numeroInicial ?? "",
    clienteNome: dadosIniciais?.parteAtiva ?? "", tribunal: dadosIniciais?.tribunal ?? "",
    vara: dadosIniciais?.vara ?? "", juiz: "", tipo: dadosIniciais?.tipo ?? "civil",
    status: "ativo", fase: dadosIniciais?.fase ?? "",
    parteContraria: dadosIniciais?.parteContraria ?? "", advogadoContrario: dadosIniciais?.advogadoContrario ?? "",
    advogadoResponsavel: "", dataDistribuicao: dadosIniciais?.dataDistribuicao ?? "",
    valorCausa: dadosIniciais?.valorCausa ?? "", descricao: dadosIniciais?.descricao ?? "",
    comarca: dadosIniciais?.comarca ?? "",
    instancia: dadosIniciais?.instancia ?? "1", movimentacoes: dadosIniciais?.movimentacoes ?? [],
    parteAtiva: dadosIniciais?.parteAtiva ?? "", advogadoAtivo: dadosIniciais?.advogadoAtivo ?? "",
  });
  const [salvoManual, setSalvoManual] = useState(false);

  function upd(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleSalvarManual() {
    if (!form.clienteNome.trim() || !form.advogadoResponsavel) return;
    const id = `proc_${Date.now()}`;
    const processo: Processo = {
      id,
      numero:              form.numero,
      clienteId:           "",
      cliente:             form.clienteNome.trim(),
      tribunal:            form.tribunal,
      vara:                form.vara,
      juiz:                form.juiz,
      tipo:                parseTipo(form.tipo),
      status:              form.status as "ativo",
      fase:                form.fase,
      parteContraria:      form.parteContraria,
      advogadoContrario:   form.advogadoContrario,
      advogadoResponsavel: form.advogadoResponsavel,
      dataDistribuicao:    form.dataDistribuicao,
      valorCausa:          parseFloat(form.valorCausa) || 0,
      descricao:           form.descricao,
      comarca:             form.comarca,
      instancia:           form.instancia,
      parteAtiva:          form.parteAtiva,
      advogadoAtivo:       form.advogadoAtivo,
      movimentacoes:       form.movimentacoes,
      createdAt:           new Date().toISOString(),
    };
    salvarProcesso(processo);
    setSalvoManual(true);
  }

  if (salvoManual) {
    return (
      <div className="flex flex-col items-center justify-center py-12 rounded-xl" style={{ background: "#fff", border: "1px solid var(--border)" }}>
        <CheckCircle2 className="h-10 w-10 mb-3" style={{ color: "#16a34a" }} />
        <p className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>Processo cadastrado com sucesso!</p>
        <p className="text-[11px] mt-1 mb-5 font-mono" style={{ color: "var(--text-muted)" }}>{form.numero}</p>
        <div className="flex gap-2">
          <Link href="/processos">
            <button type="button" className="px-4 py-2 rounded-lg text-[11px] font-semibold" style={{ background: "var(--gcj-red)", color: "#fff" }}>
              Ver lista de processos
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CardSection title="Identificação do Processo" icon={FolderOpen}>
        <div className="col-span-2">
          <Label required>Número do Processo (CNJ)</Label>
          <Inp name="numero" value={form.numero} onChange={upd} placeholder="0000000-00.0000.0.00.0000" />
        </div>
        <div>
          <Label required>Tipo</Label>
          <Sel name="tipo" value={form.tipo} onChange={upd}>
            <option value="civil">Cível</option>
            <option value="trabalhista">Trabalhista</option>
            <option value="criminal">Criminal</option>
            <option value="tributario">Tributário</option>
            <option value="previdenciario">Previdenciário</option>
            <option value="administrativo">Administrativo</option>
          </Sel>
        </div>
        <div>
          <Label>Instância</Label>
          <Sel name="instancia" value={form.instancia} onChange={upd}>
            <option value="1">1ª Instância</option>
            <option value="2">2ª Instância / Recursal</option>
            <option value="superior">Tribunal Superior</option>
          </Sel>
        </div>
        <div>
          <Label required>Status</Label>
          <Sel name="status" value={form.status} onChange={upd}>
            <option value="ativo">Ativo</option>
            <option value="suspenso">Suspenso</option>
            <option value="aguardando_baixa">Aguardando Baixa</option>
            <option value="baixado">Baixado</option>
            <option value="arquivado">Arquivado</option>
          </Sel>
        </div>
        <div>
          <Label>Fase atual</Label>
          <Inp name="fase" value={form.fase} onChange={upd} placeholder="Ex: Instrução, Execução..." />
        </div>
        <div>
          <Label required>Data de distribuição</Label>
          <Inp type="date" name="dataDistribuicao" value={form.dataDistribuicao} onChange={upd} />
        </div>
      </CardSection>

      <CardSection title="Tribunal e Juízo" icon={Gavel}>
        <div>
          <Label required>Tribunal</Label>
          <Inp name="tribunal" value={form.tribunal} onChange={upd} placeholder="Ex: TJSC, TRT 12ª Região..." />
        </div>
        <div>
          <Label>Comarca</Label>
          <Inp name="comarca" value={form.comarca} onChange={upd} placeholder="Ex: Blumenau" />
        </div>
        <div>
          <Label>Vara / Câmara</Label>
          <Inp name="vara" value={form.vara} onChange={upd} placeholder="Ex: 1ª Vara Cível" />
        </div>
        <div>
          <Label>Juiz(a) / Desembargador(a)</Label>
          <Inp name="juiz" value={form.juiz} onChange={upd} placeholder="Nome do magistrado" />
        </div>
      </CardSection>

      <CardSection title="Partes" icon={Users}>
        <div className="col-span-2">
          <Label required>Cliente (parte assistida)</Label>
          <Inp name="clienteNome" value={form.clienteNome} onChange={upd} placeholder="Nome do cliente" />
        </div>
        <div>
          <Label required>Advogado responsável</Label>
          <Sel name="advogadoResponsavel" value={form.advogadoResponsavel} onChange={upd}>
            <option value="">Selecione...</option>
            {advogados.map((m) => (
              <option key={m.id} value={m.nome}>{labelAdvogado(m)}</option>
            ))}
          </Sel>
        </div>
        <div className="col-span-2">
          <Label required>Parte contrária</Label>
          <Inp name="parteContraria" value={form.parteContraria} onChange={upd} placeholder="Nome da parte contrária" />
        </div>
        <div className="col-span-2">
          <Label>Advogado(a) da parte contrária</Label>
          <Inp name="advogadoContrario" value={form.advogadoContrario} onChange={upd} placeholder="Nome e OAB (se conhecido)" />
        </div>
      </CardSection>

      <CardSection title="Valores" icon={DollarSign}>
        <div>
          <Label>Valor da causa (R$)</Label>
          <Inp type="number" name="valorCausa" value={form.valorCausa} onChange={upd} placeholder="0,00" />
        </div>
        <div className="col-span-2">
          <Label>Descrição / Objeto</Label>
          <textarea
            name="descricao" value={form.descricao} onChange={upd} rows={3}
            placeholder="Descreva o objeto da ação e os pedidos principais..."
            className="w-full px-3 py-2 text-[12px] rounded-lg resize-none focus:outline-none transition-colors"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#111"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
          />
        </div>
      </CardSection>

      <div className="flex justify-end gap-2 pb-6">
        <Link href="/processos">
          <button type="button" className="px-4 py-2 rounded-lg text-[12px] font-medium"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            Cancelar
          </button>
        </Link>
        <button
          type="button"
          onClick={handleSalvarManual}
          disabled={!form.clienteNome.trim() || !form.advogadoResponsavel}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: "var(--gcj-red)", color: "#fff" }}>
          <Save className="h-3.5 w-3.5" />
          Salvar Processo
        </button>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function NovoProcessoPage() {
  const [modo, setModo] = useState<Modo>("auto");
  const [numeroParaManual, setNumeroParaManual] = useState("");
  const [dadosParaManual, setDadosParaManual] = useState<DadosProcesso | undefined>();

  function switchManual(numero: string, dados?: DadosProcesso) {
    setNumeroParaManual(numero);
    setDadosParaManual(dados);
    setModo("manual");
  }

  return (
    <div className="space-y-4 max-w-3xl">

      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Link href="/processos">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </button>
        </Link>
        <div>
          <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Novo Processo</h1>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Importe automaticamente pelo número CNJ ou cadastre manualmente</p>
        </div>
      </div>

      {/* Seletor de modo */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setModo("auto")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all"
          style={modo === "auto"
            ? { background: "var(--gcj-red)", color: "#fff" }
            : { background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
          <RefreshCw className="h-3.5 w-3.5" />
          Buscar automaticamente (CNJ)
        </button>
        <button type="button" onClick={() => setModo("manual")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all"
          style={modo === "manual"
            ? { background: "var(--gcj-red)", color: "#fff" }
            : { background: "#fff", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
          <FolderPlus className="h-3.5 w-3.5" />
          Cadastrar manualmente
        </button>
      </div>

      {/* Conteúdo do modo */}
      {modo === "auto"
        ? <ModoAutomatico onSwitchManual={switchManual} />
        : <ModoManual numeroInicial={numeroParaManual} dadosIniciais={dadosParaManual} />
      }
    </div>
  );
}
