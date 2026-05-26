"use client";

import { useState, useEffect, useRef } from "react";

/* ─── Constantes ──────────────────────────────────────────── */
const USER_COLORS: Record<string, string> = {
  "admin":             "#1e3a5f",
  "admin@gcj.adv.br": "#1e3a5f",
  "sandra":            "#059669",
  "rodrigo":           "#7c3aed",
};

const STATUS_OPTIONS = [
  { key: "online",  label: "Online",           color: "#22c55e" },
  { key: "away",    label: "Ausente",           color: "#f59e0b" },
  { key: "busy",    label: "Não perturbe",      color: "#ef4444" },
  { key: "offline", label: "Aparecer offline",  color: "#9ca3af" },
];

const ROLE_LABELS: Record<string, string> = {
  admin:      "Administrador",
  gestor:     "Gestor",
  rh:         "RH",
  juridico:   "Jurídico",
  comercial:  "Comercial",
  financeiro: "Financeiro",
};

const TABS = ["Geral", "Tarefas", "Feed", "Ponto"] as const;
type Tab = typeof TABS[number];

type Perfil = {
  foto?: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  nascimento?: string;
  bio?: string;
  supervisor?: string;
  sexo?: string;
};

/* ─── Helpers ─────────────────────────────────────────────── */
function fmtDate(d: string) {
  if (!d) return "—";
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
}

function calcTotal(entrada?: string, saida?: string, almoco?: string, retorno?: string) {
  if (!entrada || !saida) return null;
  function toMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
  let total = toMin(saida) - toMin(entrada);
  if (almoco && retorno) total -= (toMin(retorno) - toMin(almoco));
  if (total <= 0) return null;
  const h = Math.floor(total / 60);
  const mn = total % 60;
  return `${h}h${mn > 0 ? String(mn).padStart(2, "0") : "00"}`;
}

/* ─── Componente principal ────────────────────────────────── */
export default function PerfilPage() {
  const [email,   setEmail]   = useState("");
  const [nome,    setNome]    = useState("");
  const [role,    setRole]    = useState("admin");
  const [perfil,  setPerfil]  = useState<Perfil>({});
  const [saved,   setSaved]   = useState(false);
  const [tab,     setTab]     = useState<Tab>("Geral");
  const [status,  setStatus]  = useState("online");
  const [banner,  setBanner]  = useState<string | null>(null);

  // dados ligados ao usuário
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tasks,    setTasks]    = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts,    setPosts]    = useState<any[]>([]);
  const [pontoRows, setPontoRows] = useState<{ data: string; rec: Record<string, string> }[]>([]);

  const photoRef  = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  /* ── Leitura inicial ──── */
  useEffect(() => {
    const raw = document.cookie.split(";").find(c => c.trim().startsWith("inove-session="));
    if (!raw) return;
    try {
      const val = raw.split("=").slice(1).join("=").trim();
      const u   = JSON.parse(atob(val));
      const em  = u.email ?? "";
      const nm  = u.name  ?? "";
      const rl  = u.role  ?? "admin";
      setEmail(em); setNome(nm); setRole(rl);

      const sp = localStorage.getItem(`inove-perfil-${em}`);
      if (sp) setPerfil(JSON.parse(sp));

      const ss = localStorage.getItem("inove-status-v1");
      if (ss) { const s = JSON.parse(ss)?.[em]; if (s) setStatus(s); }

      const sb = localStorage.getItem(`inove-banner-${em}`);
      if (sb) setBanner(sb);

      // Tarefas — responsável ou criador
      const st = localStorage.getItem("inove-tarefas-v2");
      if (st) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTasks((JSON.parse(st) as any[]).filter(t => t.responsavel === nm || t.criador === nm));
      }

      // Feed — publicações do usuário
      const sf = localStorage.getItem("inove-feed-posts-v2");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (sf) setPosts((JSON.parse(sf) as any[]).filter(p => p.author === nm));

      // Ponto — últimos 7 dias
      const sk = localStorage.getItem("inove-ponto-v1");
      if (sk) {
        const store = JSON.parse(sk);
        const ur    = store[em] ?? {};
        const dias  = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          dias.push({ data: key, rec: ur[key] ?? {} });
        }
        setPontoRows(dias);
      }
    } catch {}
  }, []);

  /* ── Foto de perfil ───── */
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => setPerfil(p => ({ ...p, foto: r.result as string }));
    r.readAsDataURL(f);
  }

  /* ── Banner ───────────── */
  function handleBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const src = r.result as string;
      setBanner(src);
      try { localStorage.setItem(`inove-banner-${email}`, src); } catch {}
    };
    r.readAsDataURL(f);
  }

  /* ── Salvar perfil ────── */
  function salvar() {
    try { localStorage.setItem(`inove-perfil-${email}`, JSON.stringify(perfil)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  /* ── Derivados ────────── */
  const initials       = nome.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const avatarBg       = USER_COLORS[email] ?? "#1e3a5f";
  const roleLabel      = ROLE_LABELS[role] ?? "Usuário";
  const currentStatus  = STATUS_OPTIONS.find(s => s.key === status) ?? STATUS_OPTIONS[0];
  const tarefasConcl   = tasks.filter(t => t.status === "Concluído").length;
  const pontoComDados  = pontoRows.filter(r => Object.keys(r.rec).length > 0).length;

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>

      {/* ══ HEADER BITRIX-STYLE ══════════════════════════════ */}
      <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb", marginBottom: 0 }}>

        {/* Banner */}
        <div style={{
          height: 180, position: "relative",
          background: banner
            ? `url(${banner}) center/cover no-repeat`
            : `linear-gradient(135deg, ${avatarBg} 0%, ${avatarBg}99 100%)`,
        }}>
          <button type="button" onClick={() => bannerRef.current?.click()}
            style={{
              position: "absolute", top: 12, right: 12,
              padding: "5px 12px", borderRadius: 18,
              background: "rgba(0,0,0,0.45)", color: "white",
              border: "none", cursor: "pointer", fontSize: 11,
              backdropFilter: "blur(4px)",
            }}>
            📷 Alterar capa
          </button>
          <input ref={bannerRef} type="file" accept="image/*"
            style={{ display: "none" }} onChange={handleBanner} />
        </div>

        {/* Barra branca com avatar flutuante */}
        <div style={{
          background: "white",
          padding: "0 24px 16px",
          position: "relative",
        }}>
          {/* Avatar */}
          <div style={{ position: "absolute", top: -52, left: 24 }}>
            <div style={{ position: "relative" }}>
              {perfil.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={perfil.foto} alt={nome} style={{
                  width: 100, height: 100, borderRadius: "50%",
                  objectFit: "cover", border: "4px solid white",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                  display: "block",
                }} />
              ) : (
                <div style={{
                  width: 100, height: 100, borderRadius: "50%",
                  background: avatarBg, border: "4px solid white",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 34, fontWeight: 700, color: "white",
                  userSelect: "none",
                }}>
                  {initials || "?"}
                </div>
              )}
              {/* Status dot */}
              <div style={{
                position: "absolute", bottom: 6, right: 6,
                width: 18, height: 18, borderRadius: "50%",
                background: currentStatus.color, border: "3px solid white",
              }} />
              {/* Botão trocar foto */}
              <button type="button" onClick={() => photoRef.current?.click()}
                title="Alterar foto"
                style={{
                  position: "absolute", top: 0, right: 0,
                  width: 26, height: 26, borderRadius: "50%",
                  background: avatarBg, color: "white",
                  border: "2px solid white", cursor: "pointer",
                  fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                ✏️
              </button>
              <input ref={photoRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handlePhoto} />
            </div>
          </div>

          {/* Nome + badges */}
          <div style={{ paddingTop: 16, paddingLeft: 128 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 800, fontSize: 22, color: "#111827" }}>{nome || "—"}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "3px 10px",
                background: avatarBg + "18", color: avatarBg,
                borderRadius: 20, border: `1px solid ${avatarBg}44`,
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                {roleLabel}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 5, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: currentStatus.color, fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: currentStatus.color, display: "inline-block" }} />
                {currentStatus.label}
              </span>
              {perfil.cargo && (
                <span style={{ fontSize: 12, color: "#6b7280" }}>· {perfil.cargo}</span>
              )}
              {perfil.departamento && (
                <span style={{ fontSize: 12, color: "#6b7280" }}>· {perfil.departamento}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ ABAS ══════════════════════════════════════════════ */}
      <div style={{
        display: "flex", borderBottom: "1px solid #e5e7eb",
        background: "white", marginBottom: 24,
        borderRadius: "0 0 0 0",
      }}>
        {TABS.map(t => {
          const badge =
            t === "Tarefas" ? tasks.length :
            t === "Feed"    ? posts.length  : 0;
          return (
            <button key={t} type="button" onClick={() => setTab(t)}
              style={{
                padding: "12px 20px", fontSize: 13, fontWeight: 600,
                border: "none", background: "none", cursor: "pointer",
                borderBottom: tab === t ? `2px solid ${avatarBg}` : "2px solid transparent",
                color: tab === t ? avatarBg : "#6b7280",
                transition: "all 0.15s", marginBottom: -1, whiteSpace: "nowrap",
              }}>
              {t === "Geral"    ? "👤 Geral" :
               t === "Tarefas" ? "✅ Tarefas" :
               t === "Feed"    ? "📣 Feed"   : "📋 Ponto"}
              {badge > 0 && (
                <span style={{
                  marginLeft: 6, fontSize: 10, fontWeight: 700,
                  background: avatarBg, color: "white",
                  borderRadius: 10, padding: "1px 6px",
                }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══ TAB: GERAL ════════════════════════════════════════ */}
      {tab === "Geral" && (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>

          {/* Coluna esquerda */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Card atividade */}
            <div className="card">
              <p className="card-label" style={{ marginBottom: 14 }}>📊 Atividade</p>
              {[
                { label: "Tarefas atribuídas", val: tasks.length },
                { label: "Tarefas concluídas", val: tarefasConcl },
                { label: "Posts no Feed",       val: posts.length },
                { label: "Dias registrados",    val: pontoComDados },
              ].map(item => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "7px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}>
                  <span style={{ fontSize: 13, color: "#374151" }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: avatarBg, fontSize: 14 }}>{item.val}</span>
                </div>
              ))}
            </div>

            {/* Card contato rápido */}
            <div className="card">
              <p className="card-label" style={{ marginBottom: 10 }}>📧 Contato</p>
              <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 2 }}>E-MAIL</div>
              <div style={{ fontSize: 13, color: "#1d4ed8", marginBottom: 10, wordBreak: "break-all" }}>{email || "—"}</div>
              {perfil.telefone && (
                <>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 2 }}>TELEFONE</div>
                  <div style={{ fontSize: 13, color: "#374151" }}>{perfil.telefone}</div>
                </>
              )}
            </div>
          </div>

          {/* Coluna direita — formulário */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p className="card-label" style={{ margin: 0 }}>Informações de contato</p>
              <button type="button" onClick={salvar}
                style={{
                  padding: "7px 20px",
                  background: saved ? "#059669" : avatarBg,
                  color: "white", border: "none", borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "background 0.2s",
                }}>
                {saved ? "✓ Salvo!" : "Salvar alterações"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 20px" }}>

              {/* Campos somente leitura */}
              {[
                { label: "Nome",      value: nome.split(" ")[0]              },
                { label: "Sobrenome", value: nome.split(" ").slice(1).join(" ") },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 4 }}>{f.label.toUpperCase()}</div>
                  <div style={{ fontSize: 14, color: "#111827", padding: "6px 0" }}>{f.value || "—"}</div>
                </div>
              ))}

              <div>
                <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 4 }}>E-MAIL</div>
                <div style={{ fontSize: 14, color: "#1d4ed8", padding: "6px 0", wordBreak: "break-all" }}>{email || "—"}</div>
              </div>

              {/* Campos editáveis */}
              {([
                { key: "telefone",     label: "TELEFONE CELULAR",   type: "tel",    placeholder: "(00) 00000-0000" },
                { key: "cargo",        label: "CARGO",               type: "text",   placeholder: "Ex: Advogado, Analista..." },
                { key: "departamento", label: "DEPARTAMENTO",        type: "text",   placeholder: "Ex: Jurídico, RH..." },
                { key: "supervisor",   label: "SUPERVISOR",          type: "text",   placeholder: "Nome do supervisor" },
                { key: "nascimento",   label: "DATA DE NASCIMENTO",  type: "date",   placeholder: "" },
              ] as { key: keyof Perfil; label: string; type: string; placeholder: string }[]).map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: 4 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={(perfil[f.key] as string) ?? ""}
                    onChange={e => setPerfil(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{
                      width: "100%", padding: "7px 10px",
                      border: "1px solid #e5e7eb", borderRadius: 7,
                      fontSize: 13, outline: "none",
                    }}
                  />
                </div>
              ))}

              <div>
                <label style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: 4 }}>SEXO</label>
                <select
                  value={perfil.sexo ?? ""}
                  onChange={e => setPerfil(p => ({ ...p, sexo: e.target.value }))}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13 }}>
                  <option value="">—</option>
                  <option>Masculino</option>
                  <option>Feminino</option>
                  <option>Prefiro não informar</option>
                </select>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: 4 }}>SOBRE MIM</label>
                <textarea
                  value={perfil.bio ?? ""}
                  onChange={e => setPerfil(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Uma breve descrição sobre você..."
                  rows={3}
                  style={{
                    width: "100%", padding: "7px 10px",
                    border: "1px solid #e5e7eb", borderRadius: 7,
                    fontSize: 13, resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: TAREFAS ══════════════════════════════════════ */}
      {tab === "Tarefas" && (
        <div className="card">
          <p className="pg-title" style={{ marginBottom: 4 }}>Minhas Tarefas</p>
          <p className="pg-sub" style={{ marginBottom: 20 }}>
            {tasks.length} tarefa{tasks.length !== 1 ? "s" : ""} atribuídas a {nome}
            {tarefasConcl > 0 && ` · ${tarefasConcl} concluída${tarefasConcl !== 1 ? "s" : ""}`}
          </p>

          {tasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af", fontSize: 13 }}>
              Nenhuma tarefa atribuída a {nome} ainda.
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Tarefa</th>
                  <th>Status</th>
                  <th>Prioridade</th>
                  <th>Prazo</th>
                  <th>Papel</th>
                  <th>Vínculo</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => {
                  const late = !!t.prazo && new Date(t.prazo) < new Date() && t.status !== "Concluído";
                  return (
                    <tr key={t.id}>
                      <td>
                        <p style={{ fontWeight: 600, margin: 0 }}>{t.titulo}</p>
                        {t.descricao && (
                          <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>
                            {t.descricao.slice(0, 60)}{t.descricao.length > 60 ? "…" : ""}
                          </p>
                        )}
                      </td>
                      <td>
                        <span className="badge" style={{ background: avatarBg, color: "#fff" }}>{t.status}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${t.prioridade === "Urgente" ? "red" : t.prioridade === "Alta" ? "orange" : "gray"}`}>
                          {t.prioridade}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: late ? "#dc2626" : "#6b7280", whiteSpace: "nowrap" }}>
                        {fmtDate(t.prazo)}
                        {late && <span className="badge badge-red" style={{ marginLeft: 4 }}>Atrasada</span>}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {t.responsavel === nome ? (
                          <span className="badge badge-navy">Responsável</span>
                        ) : (
                          <span className="badge badge-gray">Criador</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: "#6b7280" }}>
                        {t.vinculoNome
                          ? `${t.vinculoTipo === "lead" ? "🙋" : "💼"} ${t.vinculoNome}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ══ TAB: FEED ═════════════════════════════════════════ */}
      {tab === "Feed" && (
        <div className="card">
          <p className="pg-title" style={{ marginBottom: 4 }}>Publicações no Feed</p>
          <p className="pg-sub" style={{ marginBottom: 20 }}>
            {posts.length} publicaç{posts.length !== 1 ? "ões" : "ão"} de {nome}
          </p>

          {posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af", fontSize: 13 }}>
              {nome} ainda não fez nenhuma publicação no Feed.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {posts.map(p => (
                <div key={p.id} style={{
                  padding: "14px 16px", borderRadius: 10,
                  border: "1px solid #e5e7eb", background: "#fafafa",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span className={`badge badge-${p.type === "evento" ? "navy" : p.type === "arquivo" ? "orange" : "gray"}`}>
                      {p.type === "evento" ? "📅 Evento" : p.type === "arquivo" ? "📎 Arquivo" : "💬 Mensagem"}
                    </span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{p.timestamp}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af" }}>
                      ❤️ {p.likes} · 💬 {p.comments?.length ?? 0} · 👁 {p.views}
                    </span>
                  </div>
                  {p.eventTitle && (
                    <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 4px" }}>{p.eventTitle}</p>
                  )}
                  {p.fileName && (
                    <p style={{ fontSize: 13, color: "#374151", margin: "0 0 4px" }}>📎 {p.fileName}</p>
                  )}
                  {p.content && (
                    <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>{p.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ TAB: PONTO ════════════════════════════════════════ */}
      {tab === "Ponto" && (
        <div className="card">
          <p className="pg-title" style={{ marginBottom: 4 }}>Cartão Ponto</p>
          <p className="pg-sub" style={{ marginBottom: 20 }}>
            Últimos 7 dias · {pontoComDados} dia{pontoComDados !== 1 ? "s" : ""} com registro
          </p>

          {pontoComDados === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af", fontSize: 13 }}>
              Nenhum registro de ponto encontrado nos últimos 7 dias.
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  {["Data", "Entrada", "Almoço", "Retorno", "Saída", "Total"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pontoRows.map(({ data, rec }) => {
                  const [y, m, d] = data.split("-");
                  const label = `${d}/${m}/${y.slice(2)}`;
                  const total = calcTotal(rec.entrada, rec.saida, rec.almoco, rec.retorno);
                  const semDados = Object.keys(rec).length === 0;
                  return (
                    <tr key={data} style={{ opacity: semDados ? 0.4 : 1 }}>
                      <td style={{ fontWeight: 600 }}>{label}</td>
                      <td style={{ color: rec.entrada ? "#059669" : "#d1d5db" }}>{rec.entrada ?? "—"}</td>
                      <td style={{ color: rec.almoco  ? "#d97706" : "#d1d5db" }}>{rec.almoco  ?? "—"}</td>
                      <td style={{ color: rec.retorno ? "#3b82f6" : "#d1d5db" }}>{rec.retorno ?? "—"}</td>
                      <td style={{ color: rec.saida   ? "#dc2626" : "#d1d5db" }}>{rec.saida   ?? "—"}</td>
                      <td style={{ fontWeight: 700, color: total ? "#374151" : "#d1d5db" }}>{total ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
