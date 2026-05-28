"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { listarProcessos, salvarProcesso, removerProcesso } from "@/lib/datajuri/processos-storage";
import type { Processo, StatusProcesso } from "@/lib/datajuri/mock-data";
import { formatDate, formatCurrency } from "@/lib/datajuri/utils";
import {
  ArrowLeft, Scale, FileText, Clock, Users, Gavel,
  DollarSign, AlertCircle, RefreshCw, Eye, EyeOff,
  Pencil, Archive, Trash2, X, Check,
} from "lucide-react";
import Link from "next/link";

const statusConfig: Record<StatusProcesso, { label: string; bg: string; color: string }> = {
  ativo:            { label: "Ativo",       bg: "#dcfce7", color: "#15803d" },
  suspenso:         { label: "Suspenso",    bg: "#fef9c3", color: "#a16207" },
  arquivado:        { label: "Arquivado",   bg: "#f3f4f6", color: "#6b7280" },
  baixado:          { label: "Baixado",     bg: "#f0fdf4", color: "#16a34a" },
  aguardando_baixa: { label: "Ag. Baixa",  bg: "#fff7ed", color: "#c2410c" },
};

const statusOpcoes: { value: StatusProcesso; label: string }[] = [
  { value: "ativo", label: "Ativo" },
  { value: "suspenso", label: "Suspenso" },
  { value: "aguardando_baixa", label: "Aguardando Baixa" },
  { value: "arquivado", label: "Arquivado" },
  { value: "baixado", label: "Baixado" },
];

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "var(--border-light)", background: "var(--bg)" }}>
        <Icon className="h-3.5 w-3.5" style={{ color: "var(--gcj-red)" }} />
        <span className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--text-secondary)" }}>{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function inp(extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: "100%", padding: "7px 10px", borderRadius: 7,
    border: "1px solid var(--border)", fontSize: 12,
    color: "var(--text-primary)", background: "var(--bg)",
    boxSizing: "border-box" as const,
    ...extra,
  };
}

export default function ProcessoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [processo, setProcesso] = useState<Processo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mostraTodas, setMostraTodas] = useState(false);

  // Modals
  const [showDelete, setShowDelete] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Edit form fields
  const [fStatus, setFStatus] = useState<StatusProcesso>("ativo");
  const [fFase, setFFase] = useState("");
  const [fAdvogado, setFAdvogado] = useState("");
  const [fValor, setFValor] = useState("");
  const [fDescricao, setFDescricao] = useState("");
  const [fJuiz, setFJuiz] = useState("");
  const [fParteContraria, setFParteContraria] = useState("");

  useEffect(() => {
    const lista = listarProcessos();
    const p = lista.find((x) => x.id === id) ?? null;
    setProcesso(p);
    if (p) {
      setFStatus(p.status);
      setFFase(p.fase ?? "");
      setFAdvogado(p.advogadoResponsavel ?? "");
      setFValor(p.valorCausa?.toString() ?? "");
      setFDescricao(p.descricao ?? "");
      setFJuiz(p.juiz ?? "");
      setFParteContraria(p.parteContraria ?? "");
    }
    setCarregando(false);
  }, [id]);

  function handleSave() {
    if (!processo) return;
    setSalvando(true);
    const updated: Processo = {
      ...processo,
      status: fStatus,
      fase: fFase,
      advogadoResponsavel: fAdvogado,
      valorCausa: parseFloat(fValor.replace(",", ".")) || processo.valorCausa,
      descricao: fDescricao,
      juiz: fJuiz || undefined,
      parteContraria: fParteContraria,
    };
    salvarProcesso(updated);
    setProcesso(updated);
    setSalvando(false);
    setShowEdit(false);
  }

  function handleArchive() {
    if (!processo) return;
    const updated: Processo = { ...processo, status: "arquivado" };
    salvarProcesso(updated);
    setProcesso(updated);
    setShowArchive(false);
  }

  function handleDelete() {
    if (!processo) return;
    removerProcesso(processo.id);
    router.push("/gcj/processos");
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20" style={{ color: "var(--text-muted)" }}>
        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">Carregando...</span>
      </div>
    );
  }

  if (!processo) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ color: "var(--text-muted)" }}>
        <AlertCircle className="h-10 w-10 mb-3" />
        <p className="font-medium text-sm">Processo não encontrado</p>
        <Link href="/gcj/processos">
          <button type="button" className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: "var(--gcj-red)", color: "#fff" }}>
            Voltar para Processos
          </button>
        </Link>
      </div>
    );
  }

  const s = statusConfig[processo.status];
  const movs = processo.movimentacoes ?? [];
  const movsExibidas = mostraTodas ? movs : movs.slice(0, 10);

  return (
    <div className="space-y-4 max-w-4xl">

      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Link href="/gcj/processos">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-mono text-base font-bold" style={{ color: "var(--gcj-red)" }}>{processo.numero}</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
              {s.label}
            </span>
          </div>
          <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
            {processo.classeProcessual ?? processo.tipo} · {processo.tribunal}
          </p>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <Pencil className="h-3 w-3" /> Editar
          </button>
          {processo.status !== "arquivado" && (
            <button
              type="button"
              onClick={() => setShowArchive(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
              style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}
            >
              <Archive className="h-3 w-3" /> Arquivar
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
            style={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c" }}
          >
            <Trash2 className="h-3 w-3" /> Excluir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Coluna principal */}
        <div className="md:col-span-2 space-y-4">

          {/* Dados do processo */}
          <Section title="Dados do Processo" icon={FileText}>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Field label="Número CNJ"       value={processo.numero} />
              <Field label="Tribunal"         value={processo.tribunal} />
              <Field label="Vara / Câmara"    value={processo.vara} />
              <Field label="Comarca"          value={processo.comarca} />
              <Field label="Instância"        value={processo.instancia ? `${processo.instancia}ª Instância` : undefined} />
              <Field label="Classe Processual" value={processo.classeProcessual} />
              <Field label="Distribuição"     value={formatDate(processo.dataDistribuicao)} />
              <Field label="Valor da Causa"   value={formatCurrency(processo.valorCausa)} />
              {processo.fase && <Field label="Fase" value={processo.fase} />}
              {processo.descricao && (
                <div className="col-span-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5" style={{ color: "var(--text-muted)" }}>Descrição / Objeto</p>
                  <p className="text-[12px]" style={{ color: "var(--text-primary)" }}>{processo.descricao}</p>
                </div>
              )}
            </div>
          </Section>

          {/* Partes */}
          <Section title="Partes" icon={Users}>
            <div className="space-y-3">
              <div className="p-3 rounded-lg" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: "#1d4ed8" }}>Parte Ativa (cliente assistido)</p>
                <p className="text-[12px] font-semibold" style={{ color: "#1e3a5f" }}>{processo.parteAtiva || processo.cliente}</p>
                {processo.advogadoAtivo && (
                  <p className="text-[11px] mt-0.5" style={{ color: "#3b82f6" }}>Adv: {processo.advogadoAtivo}</p>
                )}
              </div>
              {processo.parteContraria && (
                <div className="p-3 rounded-lg" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: "var(--text-muted)" }}>Parte Contrária (passivo)</p>
                  <p className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{processo.parteContraria}</p>
                  {processo.advogadoContrario && (
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>Adv: {processo.advogadoContrario}</p>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* Movimentações */}
          <Section title={`Movimentações (${movs.length})`} icon={Clock}>
            {movs.length === 0 ? (
              <p className="text-[11px] text-center py-4" style={{ color: "var(--text-muted)" }}>Nenhuma movimentação registrada</p>
            ) : (
              <>
                <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
                  {movsExibidas.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                      <span className="text-[10px] font-mono shrink-0 mt-0.5 w-20" style={{ color: "var(--text-muted)" }}>{m.data}</span>
                      <span className="text-[11px] flex-1" style={{ color: "var(--text-primary)" }}>{m.descricao}</span>
                    </div>
                  ))}
                </div>
                {movs.length > 10 && (
                  <button
                    type="button"
                    onClick={() => setMostraTodas(!mostraTodas)}
                    className="mt-3 flex items-center gap-1.5 text-[11px] font-medium w-full justify-center py-1.5 rounded-lg"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                  >
                    {mostraTodas
                      ? <><EyeOff className="h-3 w-3" /> Mostrar menos</>
                      : <><Eye className="h-3 w-3" /> Ver todas ({movs.length - 10} restantes)</>
                    }
                  </button>
                )}
              </>
            )}
          </Section>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-4">

          {/* Responsável */}
          <Section title="Responsável" icon={Scale}>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                style={{ background: "var(--sidebar-active-bg)", color: "var(--gcj-gold)" }}>
                {processo.advogadoResponsavel?.split(" ").pop()?.[0] ?? "?"}
              </div>
              <div>
                <p className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{processo.advogadoResponsavel}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Advogado responsável</p>
              </div>
            </div>
          </Section>

          {/* Tribunal */}
          <Section title="Juízo" icon={Gavel}>
            <div className="space-y-3">
              <Field label="Tribunal"   value={processo.tribunal} />
              <Field label="Instância"  value={processo.instancia ? `${processo.instancia}ª Instância` : undefined} />
              <Field label="Vara"       value={processo.vara} />
              <Field label="Comarca"    value={processo.comarca} />
              {processo.juiz && <Field label="Juiz(a)" value={processo.juiz} />}
            </div>
          </Section>

          {/* Financeiro */}
          <Section title="Financeiro" icon={DollarSign}>
            <div className="space-y-3">
              <Field label="Valor da Causa"    value={formatCurrency(processo.valorCausa)} />
              <Field label="Distribuição"      value={formatDate(processo.dataDistribuicao)} />
              <Field label="Cadastrado em"     value={formatDate(processo.createdAt)} />
              {processo.dataBaixa && <Field label="Baixado em" value={formatDate(processo.dataBaixa)} />}
            </div>
          </Section>

          {/* Monitoramento */}
          {processo.monitorar !== undefined && (
            <div className="px-4 py-3 rounded-xl text-[11px]"
              style={processo.monitorar
                ? { background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d" }
                : { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              {processo.monitorar ? "✓ Monitorado na Consulta Internet" : "Não monitorado"}
            </div>
          )}

          {/* Link para cliente */}
          <Link href={`/datajuri/clientes/${encodeURIComponent(processo.cliente)}`}>
            <div className="px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer"
              style={{ background: "#fff", border: "1px solid var(--border)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>Cliente</p>
                <p className="text-[12px] font-semibold mt-0.5" style={{ color: "var(--text-primary)" }}>{processo.cliente}</p>
              </div>
              <Users className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
            </div>
          </Link>

        </div>
      </div>

      {/* Modal Editar */}
      {showEdit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "var(--bg)", borderRadius: 14, width: "100%", maxWidth: 540, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Editar Processo</span>
              <button onClick={() => setShowEdit(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={16} /></button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status</label>
                  <select value={fStatus} onChange={(e) => setFStatus(e.target.value as StatusProcesso)} style={inp()}>
                    {statusOpcoes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Fase</label>
                  <input value={fFase} onChange={(e) => setFFase(e.target.value)} style={inp()} placeholder="Ex: Instrução" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Advogado Responsável</label>
                  <input value={fAdvogado} onChange={(e) => setFAdvogado(e.target.value)} style={inp()} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Valor da Causa (R$)</label>
                  <input value={fValor} onChange={(e) => setFValor(e.target.value)} style={inp()} placeholder="0.00" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Juiz(a)</label>
                  <input value={fJuiz} onChange={(e) => setFJuiz(e.target.value)} style={inp()} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Parte Contrária</label>
                  <input value={fParteContraria} onChange={(e) => setFParteContraria(e.target.value)} style={inp()} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Descrição / Objeto</label>
                <textarea value={fDescricao} onChange={(e) => setFDescricao(e.target.value)} rows={3} style={{ ...inp(), resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setShowEdit(false)} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={salvando} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "var(--gcj-red)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Check size={13} /> Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Arquivar */}
      {showArchive && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "var(--bg)", borderRadius: 14, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Archive size={18} style={{ color: "#b45309" }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Arquivar processo?</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
              O processo <strong style={{ color: "var(--text-primary)" }}>{processo.numero}</strong> será marcado como arquivado. Você pode reativá-lo editando o status depois.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setShowArchive(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleArchive} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#b45309", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Arquivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Excluir */}
      {showDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "var(--bg)", borderRadius: 14, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={18} style={{ color: "#be123c" }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Excluir processo?</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
              O processo <strong style={{ color: "var(--text-primary)" }}>{processo.numero}</strong> ({processo.cliente}) será excluído permanentemente. Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setShowDelete(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleDelete} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#be123c", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Excluir definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
