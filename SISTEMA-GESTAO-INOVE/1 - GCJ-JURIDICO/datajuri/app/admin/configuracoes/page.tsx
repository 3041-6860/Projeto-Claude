"use client";
import { useState, useEffect } from "react";
import {
  User, Columns, List, LayoutGrid, ChevronRight,
  Settings, Building2, Users, Shield, ScrollText,
  CalendarDays, Mail, FileText, FolderOpen, Briefcase,
  Bookmark, Scale, ClipboardList, StickyNote, BookOpen,
  MessageSquare, Lightbulb, Calculator, Wrench, LayoutDashboard,
  Save, ChevronDown, RefreshCw, CheckCircle2, XCircle, Clock,
  AlertCircle,
} from "lucide-react";
import { DEFAULT_WIDGETS, WIDGET_GROUPS, WIDGET_LABELS, WIDGETS_STORAGE_KEY, type WidgetKey } from "@/lib/dashboard-widgets";

// ─── NAVEGAÇÃO ────────────────────────────────────────────────────────────────

type SectionId =
  | "meus-dados" | "colunas" | "listas-relacionadas" | "areas-menu" | "sub-areas-menu"
  | "opcoes-app" | "empresa" | "usuarios" | "perfis" | "auditoria" | "feriados" | "email"
  | "pessoas" | "processos" | "contratos" | "marcas" | "procuracao"
  | "atividades" | "notas" | "documentos" | "biblioteca" | "modelos" | "casos" | "calculos" | "servicos"
  | "dashboard";

const NAV_GROUPS = [
  {
    title: "Opções do Usuário",
    items: [
      { id: "meus-dados" as SectionId,       label: "Alterar meus dados",    icon: User },
      { id: "dashboard" as SectionId,        label: "Personalização do Dashboard", icon: LayoutDashboard },
      { id: "colunas" as SectionId,          label: "Colunas das listas",    icon: Columns },
      { id: "listas-relacionadas" as SectionId, label: "Listas relacionadas", icon: List },
      { id: "areas-menu" as SectionId,       label: "Áreas do menu",         icon: LayoutGrid },
      { id: "sub-areas-menu" as SectionId,   label: "Sub-áreas do menu",     icon: ChevronRight },
    ],
  },
  {
    title: "Configuração da Administração",
    items: [
      { id: "opcoes-app" as SectionId,  label: "Opções do aplicativo",  icon: Settings },
      { id: "empresa" as SectionId,     label: "Informações da Empresa", icon: Building2 },
      { id: "usuarios" as SectionId,    label: "Usuários",               icon: Users },
      { id: "perfis" as SectionId,      label: "Perfis / Acesso",        icon: Shield },
      { id: "auditoria" as SectionId,   label: "Auditoria",              icon: ScrollText },
      { id: "feriados" as SectionId,    label: "Feriados",               icon: CalendarDays },
      { id: "email" as SectionId,       label: "Substituir email",       icon: Mail },
    ],
  },
  {
    title: "Configuração do Aplicativo",
    items: [
      { id: "pessoas" as SectionId,    label: "Pessoas",                icon: Users },
      { id: "processos" as SectionId,  label: "Processos",              icon: FolderOpen },
      { id: "contratos" as SectionId,  label: "Contratos",              icon: FileText },
      { id: "marcas" as SectionId,     label: "Marcas e patentes",      icon: Bookmark },
      { id: "procuracao" as SectionId, label: "Procuração",             icon: Scale },
      { id: "atividades" as SectionId, label: "Atividades",             icon: ClipboardList },
      { id: "notas" as SectionId,      label: "Notas",                  icon: StickyNote },
      { id: "documentos" as SectionId, label: "Documentos (GED)",       icon: BookOpen },
      { id: "biblioteca" as SectionId, label: "Biblioteca",             icon: Briefcase },
      { id: "modelos" as SectionId,    label: "Modelos de comunicação", icon: MessageSquare },
      { id: "casos" as SectionId,      label: "Casos e Soluções",       icon: Lightbulb },
      { id: "calculos" as SectionId,   label: "Cálculos",               icon: Calculator },
      { id: "servicos" as SectionId,   label: "Serviços",               icon: Wrench },
    ],
  },
];

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid var(--border)" }}>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] mb-1.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none transition-colors"
      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#111"; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
    />
  );
}

function Toggle({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "var(--border-light)" }}>
      <div>
        <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
        {sub && <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>}
      </div>
      <button type="button" onClick={onChange} aria-label={label}
        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0"
        style={{ background: checked ? "var(--gcj-red)" : "#d1d5db" }}>
        <span className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }} />
      </button>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="h-10 w-10 rounded-xl mb-3 flex items-center justify-center" style={{ background: "var(--bg)" }}>
          <Settings className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
        </div>
        <p className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
        <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>Esta seção está em desenvolvimento.</p>
      </div>
    </Card>
  );
}

// ─── SEÇÕES ───────────────────────────────────────────────────────────────────

function MeusDados() {
  return (
    <>
      <SectionHeader title="Alterar meus dados" sub="Informações do seu perfil de acesso" />
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <Field label="Nome completo"><Input defaultValue="Rodrigo Gonçalves" /></Field>
          <Field label="E-mail"><Input type="email" defaultValue="operacional@gcj.adv.br" /></Field>
          <Field label="Telefone"><Input defaultValue="(47) 99999-0000" /></Field>
          <Field label="OAB"><Input defaultValue="SC 29322" /></Field>
        </Card>
        <Card>
          <Field label="Senha atual"><Input type="password" placeholder="••••••••" /></Field>
          <Field label="Nova senha"><Input type="password" placeholder="••••••••" /></Field>
          <Field label="Confirmar nova senha"><Input type="password" placeholder="••••••••" /></Field>
          <button type="button" className="w-full mt-2 py-2 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--gcj-red)", color: "#fff" }}>
            Atualizar senha
          </button>
        </Card>
      </div>
    </>
  );
}

function DashboardConfig() {
  const [widgets, setWidgets] = useState<Record<WidgetKey, boolean>>(DEFAULT_WIDGETS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(WIDGETS_STORAGE_KEY);
      if (s) setWidgets({ ...DEFAULT_WIDGETS, ...JSON.parse(s) });
    } catch { /* ignore */ }
  }, []);

  function toggleWidget(key: WidgetKey) {
    setWidgets((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function handleSave() {
    localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(widgets));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <SectionHeader title="Personalização do Dashboard" sub="Escolha quais widgets aparecem na tela inicial" />
      <Card>
        <div className="space-y-6">
          {WIDGET_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5" style={{ color: "var(--text-muted)" }}>
                {group.title}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {group.keys.map((key) => (
                  <label key={key} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer"
                    style={{ background: widgets[key] ? "#f9f5f5" : "var(--bg)", border: `1px solid ${widgets[key] ? "#ddc0c4" : "var(--border)"}` }}>
                    <div className="h-4 w-4 rounded flex items-center justify-center shrink-0 transition-colors"
                      style={{ background: widgets[key] ? "var(--gcj-red)" : "#fff", border: `1px solid ${widgets[key] ? "var(--gcj-red)" : "var(--border)"}` }}>
                      {widgets[key] && (
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <input type="checkbox" checked={widgets[key]} onChange={() => toggleWidget(key)} className="sr-only" />
                    <span className="text-[11px] font-medium" style={{ color: "var(--text-primary)" }}>{WIDGET_LABELS[key]}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t flex justify-end" style={{ borderColor: "var(--border-light)" }}>
          <button type="button" onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--gcj-red)", color: "#fff" }}>
            <Save className="h-3.5 w-3.5" />
            {saved ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </Card>
    </>
  );
}

function Empresa() {
  return (
    <>
      <SectionHeader title="Informações da Empresa" sub="Dados do escritório exibidos em documentos e relatórios" />
      <Card>
        <div className="grid grid-cols-2 gap-x-6">
          <Field label="Razão Social"><Input defaultValue="Gonçalves Consultoria Sociedade Individual de Advocacia EIRELI" /></Field>
          <Field label="Nome Fantasia"><Input defaultValue="Gonçalves Consultoria Jurídica" /></Field>
          <Field label="CNPJ"><Input defaultValue="25.297.463/0001-98" /></Field>
          <Field label="OAB"><Input defaultValue="SC 2902" /></Field>
          <Field label="E-mail"><Input defaultValue="operacional@gcj.adv.br" /></Field>
          <Field label="Telefone"><Input defaultValue="" placeholder="(47) ___-____" /></Field>
          <Field label="Endereço"><Input defaultValue="Rua La Paz, 37, Ponta Aguda" /></Field>
          <Field label="Cidade / Estado"><Input defaultValue="Blumenau / SC" /></Field>
          <Field label="CEP"><Input defaultValue="89051-080" /></Field>
          <Field label="Site"><Input placeholder="www.gcj.adv.br" /></Field>
        </div>
      </Card>
    </>
  );
}

function OpcoesApp() {
  const [opts, setOpts] = useState({
    backup: true, logo: true, emailDiario: false, modoEscuro: false,
  });
  return (
    <>
      <SectionHeader title="Opções do Aplicativo" sub="Configurações gerais de comportamento do sistema" />
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <Field label="Fuso horário">
            <select className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <option>America/Sao_Paulo (GMT-3)</option>
              <option>America/Manaus (GMT-4)</option>
              <option>America/Belem (GMT-3)</option>
            </select>
          </Field>
          <Field label="Formato de data">
            <select className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <option>DD/MM/AAAA</option>
              <option>MM/DD/AAAA</option>
              <option>AAAA-MM-DD</option>
            </select>
          </Field>
          <Field label="Moeda padrão">
            <select className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <option>BRL — Real brasileiro</option>
              <option>USD — Dólar americano</option>
              <option>EUR — Euro</option>
            </select>
          </Field>
        </Card>
        <Card>
          <Toggle label="Backup automático" sub="Salva dados diariamente" checked={opts.backup} onChange={() => setOpts(p => ({ ...p, backup: !p.backup }))} />
          <Toggle label="Logo na impressão" sub="Inclui marca GCJ em PDFs" checked={opts.logo} onChange={() => setOpts(p => ({ ...p, logo: !p.logo }))} />
          <Toggle label="Resumo diário por e-mail" sub="Enviado às 8h nos dias úteis" checked={opts.emailDiario} onChange={() => setOpts(p => ({ ...p, emailDiario: !p.emailDiario }))} />
          <Toggle label="Modo escuro" sub="Interface em tema escuro" checked={opts.modoEscuro} onChange={() => setOpts(p => ({ ...p, modoEscuro: !p.modoEscuro }))} />
        </Card>
      </div>
    </>
  );
}

// ─── PROCESSOS ────────────────────────────────────────────────────────────────

type SyncStatus = "idle" | "syncing" | "ok" | "error";

const DATAJUD_KEY_STORAGE    = "datajuri_api_key";
const PROCESSOS_CONFIG_KEY   = "datajuri_processos_config";

type ProcessosConfig = {
  tribunal: string; autoSync: boolean; syncHour: string;
  syncDays: { seg: boolean; ter: boolean; qua: boolean; qui: boolean; sex: boolean; sab: boolean; dom: boolean };
  notifEmail: boolean; notifPrazo: boolean; validarCNJ: boolean; lastSync: string | null;
};

const CONFIG_DEFAULT: ProcessosConfig = {
  tribunal: "TJSC", autoSync: true, syncHour: "06:00",
  syncDays: { seg: true, ter: true, qua: true, qui: true, sex: true, sab: false, dom: false },
  notifEmail: true, notifPrazo: true, validarCNJ: true, lastSync: null,
};

function Processos() {
  const [apiKey,     setApiKey]     = useState("");
  const [keySaved,   setKeySaved]   = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [cfg,        setCfg]        = useState<ProcessosConfig>(CONFIG_DEFAULT);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  const DIAS = [
    { key: "seg" as const, label: "Seg" }, { key: "ter" as const, label: "Ter" },
    { key: "qua" as const, label: "Qua" }, { key: "qui" as const, label: "Qui" },
    { key: "sex" as const, label: "Sex" }, { key: "sab" as const, label: "Sáb" },
    { key: "dom" as const, label: "Dom" },
  ];

  const TRIBUNAIS = [
    "TJSC","TJSP","TJRJ","TJRS","TJMG","TJPR","TJBA","TJGO",
    "TJPE","TJCE","TJAM","TJMT","TJMS","TJPA","TJMA","STJ","STF","TRF1","TRF4",
  ];

  // Carrega do localStorage na montagem
  useEffect(() => {
    try {
      setApiKey(localStorage.getItem(DATAJUD_KEY_STORAGE) ?? "");
      const raw = localStorage.getItem(PROCESSOS_CONFIG_KEY);
      if (raw) setCfg({ ...CONFIG_DEFAULT, ...JSON.parse(raw) as Partial<ProcessosConfig> });
    } catch { /* ignore */ }
  }, []);

  // Auto-salva configurações (exceto API key) a cada mudança
  useEffect(() => {
    try { localStorage.setItem(PROCESSOS_CONFIG_KEY, JSON.stringify(cfg)); } catch { /* ignore */ }
  }, [cfg]);

  function upd<K extends keyof ProcessosConfig>(key: K, val: ProcessosConfig[K]) {
    setCfg(p => ({ ...p, [key]: val }));
  }

  function toggleDia(key: keyof ProcessosConfig["syncDays"]) {
    setCfg(p => ({ ...p, syncDays: { ...p.syncDays, [key]: !p.syncDays[key] } }));
  }

  function saveApiKey() {
    try { localStorage.setItem(DATAJUD_KEY_STORAGE, apiKey.trim()); } catch { /* ignore */ }
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  }

  async function testConnection() {
    setTestStatus("testing");
    try {
      const resp = await fetch("/api/datajud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true, apiKey: apiKey.trim() }),
      });
      const data = await resp.json() as { ok?: boolean };
      setTestStatus(data.ok ? "ok" : "error");
    } catch {
      setTestStatus("error");
    }
    setTimeout(() => setTestStatus("idle"), 4000);
  }

  function syncNow() {
    setSyncStatus("syncing");
    // Stub — atualização real requer lista de CNJ dos processos cadastrados
    setTimeout(() => {
      setSyncStatus("ok");
      const ts = new Date().toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
      upd("lastSync", ts);
      setTimeout(() => setSyncStatus("idle"), 4000);
    }, 2500);
  }

  return (
    <>
      <SectionHeader title="Processos" sub="Integração com tribunais e atualização automática de movimentações" />
      <div className="space-y-4">

        {/* API DataJud */}
        <Card>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: "var(--text-muted)" }}>
            Integração com DataJud / CNJ
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Field label="Chave de API (DataJud)">
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Cole aqui a chave do DataJud (opcional)"
                  className="flex-1 h-8 px-3 text-[12px] rounded-lg focus:outline-none"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onKeyDown={e => e.key === "Enter" && saveApiKey()}
                />
                <button type="button" onClick={saveApiKey}
                  className="px-3 h-8 rounded-lg text-[11px] font-semibold shrink-0 transition-opacity hover:opacity-80"
                  style={{ background: keySaved ? "#16a34a" : "var(--gcj-red)", color: "#fff" }}>
                  {keySaved ? "Salvo!" : "Salvar"}
                </button>
                <button type="button" onClick={testConnection}
                  disabled={testStatus === "testing"}
                  className="px-3 h-8 rounded-lg text-[11px] font-semibold shrink-0 transition-opacity hover:opacity-80 disabled:opacity-60"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                  {testStatus === "testing" ? "…" : "Testar"}
                </button>
              </div>
              {testStatus === "ok" && (
                <p className="flex items-center gap-1 mt-1.5 text-[11px]" style={{ color: "#16a34a" }}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Conexão com DataJud estabelecida
                </p>
              )}
              {testStatus === "error" && (
                <p className="flex items-center gap-1 mt-1.5 text-[11px]" style={{ color: "#dc2626" }}>
                  <XCircle className="h-3.5 w-3.5" /> Falha — verifique a chave ou sua conexão
                </p>
              )}
              {testStatus === "testing" && (
                <p className="flex items-center gap-1 mt-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Conectando ao DataJud…
                </p>
              )}
            </Field>
            <Field label="Tribunal padrão para busca">
              <select value={cfg.tribunal} onChange={e => upd("tribunal", e.target.value)}
                className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {TRIBUNAIS.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg" style={{ background: "#fefce8", border: "1px solid #fef08a" }}>
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "#ca8a04" }} />
            <p className="text-[11px]" style={{ color: "#92400e" }}>
              Sem chave configurada, o sistema usa a <strong>API pública do DataJud</strong> (gratuita, com limite de requisições).
              Para volume maior, obtenha uma chave em <span className="font-semibold">datajud.cnj.jus.br</span>.
            </p>
          </div>
        </Card>

        {/* Atualização automática */}
        <Card>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: "var(--text-muted)" }}>
            Atualização automática de movimentações
          </p>
          <Toggle
            label="Ativar atualização automática"
            sub="O sistema busca novos andamentos diariamente no horário configurado"
            checked={cfg.autoSync}
            onChange={() => upd("autoSync", !cfg.autoSync)}
          />
          {cfg.autoSync && (
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Horário de atualização">
                <select value={cfg.syncHour} onChange={e => upd("syncHour", e.target.value)}
                  className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  {["04:00","05:00","06:00","07:00","08:00","09:00","10:00","12:00","14:00","18:00","20:00","22:00"].map(h => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
              </Field>
              <Field label="Dias da semana">
                <div className="flex gap-1.5 flex-wrap">
                  {DIAS.map(({ key, label }) => (
                    <button key={key} type="button" onClick={() => toggleDia(key)}
                      className="px-2 py-1 rounded text-[11px] font-semibold transition-colors"
                      style={{
                        background: cfg.syncDays[key] ? "var(--gcj-red)" : "var(--bg)",
                        color:      cfg.syncDays[key] ? "#fff" : "var(--text-muted)",
                        border:     `1px solid ${cfg.syncDays[key] ? "var(--gcj-red)" : "var(--border)"}`,
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* Atualizar agora */}
          <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid var(--border-light)" }}>
            <div>
              {syncStatus === "idle" && cfg.lastSync && (
                <p className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  <Clock className="h-3.5 w-3.5" /> Última atualização: {cfg.lastSync}
                </p>
              )}
              {syncStatus === "idle" && !cfg.lastSync && (
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Nenhuma atualização realizada ainda</p>
              )}
              {syncStatus === "syncing" && (
                <p className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--gcj-red)" }}>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Buscando movimentações…
                </p>
              )}
              {syncStatus === "ok" && (
                <p className="flex items-center gap-1.5 text-[11px]" style={{ color: "#16a34a" }}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Atualização concluída com sucesso
                </p>
              )}
              {syncStatus === "error" && (
                <p className="flex items-center gap-1.5 text-[11px]" style={{ color: "#dc2626" }}>
                  <XCircle className="h-3.5 w-3.5" /> Falha na atualização — verifique a API
                </p>
              )}
            </div>
            <button type="button" onClick={syncNow} disabled={syncStatus === "syncing"}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-60"
              style={{ background: "var(--gcj-red)", color: "#fff" }}>
              <RefreshCw className={`h-3.5 w-3.5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
              Atualizar agora
            </button>
          </div>
        </Card>

        {/* Notificações */}
        <Card>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "var(--text-muted)" }}>
            Notificações de movimentações
          </p>
          <Toggle
            label="Notificar por e-mail ao detectar novos andamentos"
            sub="Envia resumo para operacional@gcj.adv.br"
            checked={cfg.notifEmail}
            onChange={() => upd("notifEmail", !cfg.notifEmail)}
          />
          <Toggle
            label="Alertar sobre prazos detectados automaticamente"
            sub="Cria prazo no sistema quando movimentação indica data limite"
            checked={cfg.notifPrazo}
            onChange={() => upd("notifPrazo", !cfg.notifPrazo)}
          />
        </Card>

        {/* Numeração CNJ */}
        <Card>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "var(--text-muted)" }}>
            Validação e numeração CNJ
          </p>
          <Toggle
            label="Validar número CNJ no cadastro"
            sub="Rejeita números fora do padrão NNNNNNN-DD.AAAA.J.TT.OOOO"
            checked={cfg.validarCNJ}
            onChange={() => upd("validarCNJ", !cfg.validarCNJ)}
          />
        </Card>

      </div>
    </>
  );
}

// Mapa de seções → componente
const SECTION_MAP: Partial<Record<SectionId, React.ComponentType>> = {
  "meus-dados": MeusDados,
  "dashboard":  DashboardConfig,
  "empresa":    Empresa,
  "opcoes-app": OpcoesApp,
  "processos":  Processos,
};

// Labels para "em breve"
const SECTION_LABELS: Record<SectionId, string> = {
  "meus-dados": "Alterar meus dados", "dashboard": "Personalização do Dashboard",
  "colunas": "Colunas das listas", "listas-relacionadas": "Listas relacionadas",
  "areas-menu": "Áreas do menu", "sub-areas-menu": "Sub-áreas do menu",
  "opcoes-app": "Opções do aplicativo", "empresa": "Informações da Empresa",
  "usuarios": "Usuários", "perfis": "Perfis / Acesso", "auditoria": "Auditoria",
  "feriados": "Feriados", "email": "Substituir email", "pessoas": "Pessoas",
  "processos": "Processos", "contratos": "Contratos", "marcas": "Marcas e patentes",
  "procuracao": "Procuração", "atividades": "Atividades", "notas": "Notas",
  "documentos": "Documentos (GED)", "biblioteca": "Biblioteca",
  "modelos": "Modelos de comunicação", "casos": "Casos e Soluções",
  "calculos": "Cálculos", "servicos": "Serviços",
};

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const [active, setActive] = useState<SectionId>("meus-dados");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  function toggleGroup(title: string) {
    setCollapsed((p) => ({ ...p, [title]: !p[title] }));
  }

  const ActiveSection = SECTION_MAP[active];

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex gap-5 max-w-[1100px]" style={{ minHeight: "calc(100vh - 100px)" }}>

      {/* Nav lateral */}
      <aside className="w-56 shrink-0">
        <div className="rounded-xl overflow-hidden sticky top-0" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="border-b last:border-0" style={{ borderColor: "var(--border-light)" }}>
              <button type="button" onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between px-3 py-2.5 transition-colors hover:bg-gray-50">
                <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
                  {group.title}
                </span>
                <ChevronDown className="h-3 w-3 transition-transform" style={{
                  color: "var(--text-muted)",
                  transform: collapsed[group.title] ? "rotate(-90deg)" : "rotate(0deg)",
                }} />
              </button>
              {!collapsed[group.title] && (
                <div className="pb-1.5">
                  {group.items.map(({ id, label, icon: Icon }) => (
                    <button key={id} type="button" onClick={() => setActive(id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                      style={{
                        background: active === id ? "#f9f5f5" : "transparent",
                        borderLeft: `2px solid ${active === id ? "var(--gcj-red)" : "transparent"}`,
                        color: active === id ? "var(--gcj-red)" : "var(--text-secondary)",
                      }}>
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[11px] font-medium leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Configurações</h1>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{SECTION_LABELS[active]}</p>
          </div>
          {active !== "dashboard" && (
            <button type="button" onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-opacity hover:opacity-80"
              style={{ background: "var(--gcj-red)", color: "#fff" }}>
              <Save className="h-3.5 w-3.5" />
              {saved ? "Salvo!" : "Salvar alterações"}
            </button>
          )}
        </div>

        {ActiveSection
          ? <ActiveSection />
          : <ComingSoon label={SECTION_LABELS[active]} />
        }
      </div>
    </div>
  );
}
