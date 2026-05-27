"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { logout } from "@/app/actions/auth";

// ── Tipos ──────────────────────────────────────────────────
type UserStatus = "online" | "away" | "busy" | "offline";

const STATUS_OPTIONS: { key: UserStatus; label: string; color: string }[] = [
  { key: "online",  label: "Online",           color: "#22c55e" },
  { key: "away",    label: "Ausente",           color: "#f59e0b" },
  { key: "busy",    label: "Não perturbe",      color: "#ef4444" },
  { key: "offline", label: "Aparecer offline",  color: "#9ca3af" },
];

// ── Cor de avatar por usuário ──────────────────────────────
const USER_COLORS: Record<string, string> = {
  "admin":             "#1e3a5f",
  "admin@gcj.adv.br": "#1e3a5f",
  "sandra":            "#059669",
  "rodrigo":           "#7c3aed",
};
function avatarColor(email: string): string {
  return USER_COLORS[email] ?? "#1e3a5f";
}

// ── Rótulo legível do perfil ───────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  admin:      "Administrador",
  gestor:     "Gestor",
  rh:         "RH",
  juridico:   "Jurídico",
  comercial:  "Comercial",
  financeiro: "Financeiro",
};

// ── Relógio ao vivo ────────────────────────────────────────
function useClock() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    function tick() {
      setTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ── Status persistido ──────────────────────────────────────
function useStatus(email: string) {
  const SK = "inove-status-v1";
  const [status, setStatusState] = useState<UserStatus>("online");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SK);
      if (raw) {
        const s = JSON.parse(raw)?.[email];
        if (s) setStatusState(s as UserStatus);
      }
    } catch {}
  }, [email]);
  function setStatus(s: UserStatus) {
    try {
      const raw = localStorage.getItem(SK);
      const all = raw ? JSON.parse(raw) : {};
      all[email] = s;
      localStorage.setItem(SK, JSON.stringify(all));
    } catch {}
    setStatusState(s);
  }
  return { status, setStatus };
}

// ── Ponto virtual ──────────────────────────────────────────
type PR = { entrada?: string; almoco?: string; retorno?: string; saida?: string };

function todayKey() { return new Date().toISOString().slice(0, 10); }
function hhmm() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function usePonto(email: string) {
  const SK = "inove-ponto-v1";
  const [rec, setRec] = useState<PR>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SK);
      if (raw) setRec(JSON.parse(raw)?.[email]?.[todayKey()] ?? {});
    } catch {}
  }, [email]);
  function save(updated: PR) {
    try {
      const raw = localStorage.getItem(SK);
      const s = raw ? JSON.parse(raw) : {};
      if (!s[email]) s[email] = {};
      s[email][todayKey()] = updated;
      localStorage.setItem(SK, JSON.stringify(s));
    } catch {}
    setRec(updated);
  }
  return { rec, save };
}

// ── Foto de perfil ─────────────────────────────────────────
function useProfilePhoto(email: string) {
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`inove-perfil-${email}`);
      if (raw) {
        const p = JSON.parse(raw);
        if (p?.foto) setPhoto(p.foto);
      }
    } catch {}
  }, [email]);
  return photo;
}

// ── Nav items ──────────────────────────────────────────────
const ALL_NAV_ITEMS = [
  { label: "Painel",        href: "/dashboard",    roles: null                     },
  { label: "CRM / Leads",   href: "/crm/leads",    roles: null                     },
  { label: "Negócios",      href: "/negocios",     roles: null                     },
  { label: "Financeiro",    href: "/financeiro",   roles: null                     },
  { label: "RH",            href: "/rh",           roles: null                     },
  { label: "Jurídico",      href: "/datajuri",     roles: ["admin","juridico"]     },
  { label: "Marketing",     href: "/marketing",    roles: null                     },
  { label: "Messenger",     href: "/mensagens",    roles: null                     },
  { label: "Configurações", href: "/configuracoes",roles: null                     },
];

const PONTO_STEPS = [
  { key: "entrada", label: "Entrada", color: "#059669", dep: null      },
  { key: "almoco",  label: "Almoço",  color: "#d97706", dep: "entrada" },
  { key: "retorno", label: "Retorno", color: "#3b82f6", dep: "almoco"  },
  { key: "saida",   label: "Saída",   color: "#dc2626", dep: "entrada" },
] as const;

interface TopNavProps {
  user?: { name: string; email: string; role: string };
}

export default function TopNav({ user }: TopNavProps) {
  const pathname = usePathname();
  const time     = useClock();

  const [open, setOpen]             = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [editKey, setEditKey]       = useState<string | null>(null);
  const [editVal, setEditVal]       = useState("");
  const dropRef   = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const email    = user?.email ?? "admin";
  const role     = user?.role  ?? "admin";
  const name     = user?.name  ?? "Administrador";
  const isAdmin  = role === "admin";
  const roleLabel = ROLE_LABELS[role] ?? "Usuário";
  const initials  = name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  const bgColor   = avatarColor(email);

  const { status, setStatus } = useStatus(email);
  const { rec, save }         = usePonto(email);
  const photo                 = useProfilePhoto(email);

  const currentStatusOpt = STATUS_OPTIONS.find(s => s.key === status) ?? STATUS_OPTIONS[0];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
        setEditKey(null);
        setStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function regPonto(key: string) {
    save({ ...rec, [key]: hhmm() });
  }

  function salvarEdit(key: string) {
    if (editVal) save({ ...rec, [key]: editVal });
    setEditKey(null);
    setEditVal("");
  }

  // ── Avatar com dot de status ──────────────────────────────
  function AvatarWithStatus({ size = 32, dotSize = 10 }: { size?: number; dotSize?: number }) {
    return (
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={name}
            style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{
            width: size, height: size, borderRadius: "50%",
            background: bgColor,
            color: "white", fontSize: size * 0.36, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            userSelect: "none",
          }}>
            {initials}
          </div>
        )}
        {/* Status dot */}
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          width: dotSize, height: dotSize, borderRadius: "50%",
          background: currentStatusOpt.color,
          border: "2px solid white",
          boxSizing: "border-box",
        }} />
      </div>
    );
  }

  return (
    <nav className="top-nav shrink-0 flex items-stretch">

      {/* Logo */}
      <div className="top-nav-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-nav.png" alt="Grupo Inove Prime" className="top-nav-logo" />
      </div>

      {/* Links centrais */}
      <div className="flex flex-1">
        {ALL_NAV_ITEMS.filter(item => !item.roles || item.roles.includes(role)).map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`top-nav-link flex-1 flex items-center justify-center whitespace-nowrap${isActive ? " active" : ""}`}>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Ações à direita */}
      <div className="top-nav-actions">
        <input type="text" placeholder="🔍  Buscar…" className="top-nav-search" />

        {/* Relógio */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5, padding: "0 10px",
          fontSize: 13, fontWeight: 700, color: "#374151",
          background: "#f3f4f6", borderRadius: 8, minWidth: 60, justifyContent: "center",
          border: "1px solid #e5e7eb",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {time}
        </div>

        {/* Notificações */}
        <button type="button" className="top-nav-icon-btn" title="Notificações">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        {/* Mensagens */}
        <button type="button" className="top-nav-icon-btn" title="Mensagens">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>

        {/* ── Perfil com dropdown estilo Bitrix24 ── */}
        <div className="profile-dropdown-wrap" ref={dropRef}>
          <button
            type="button"
            className="top-nav-avatar"
            onClick={() => { setOpen(v => !v); setEditKey(null); setStatusOpen(false); }}
            aria-expanded={open ? "true" : "false"}
          >
            <AvatarWithStatus size={32} dotSize={10} />
            <div>
              <div className="top-nav-avatar-name">{name}</div>
              <div className="top-nav-avatar-role" style={{ color: currentStatusOpt.color, fontSize: 11 }}>
                {currentStatusOpt.label}
              </div>
            </div>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={`top-nav-chevron${open ? " open" : ""}`}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {open && (
            <div className="profile-dropdown" style={{ minWidth: 300 }}>

              {/* ── Cabeçalho estilo Bitrix24 ── */}
              <div style={{
                padding: "18px 16px 14px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <AvatarWithStatus size={52} dotSize={13} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 2 }}>
                    {name}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                    {roleLabel}
                  </div>

                  {/* ── Seletor de status ── */}
                  <div ref={statusRef} style={{ position: "relative", display: "inline-block" }}>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setStatusOpen(v => !v); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "4px 10px 4px 8px",
                        borderRadius: 20,
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                        cursor: "pointer",
                        fontSize: 12, fontWeight: 600,
                        color: currentStatusOpt.color,
                        transition: "background 0.15s",
                      }}
                    >
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: currentStatusOpt.color, flexShrink: 0,
                      }} />
                      {currentStatusOpt.label}
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>

                    {statusOpen && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200,
                        background: "white", borderRadius: 10,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                        border: "1px solid #e5e7eb",
                        minWidth: 180, overflow: "hidden",
                      }}>
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={e => { e.stopPropagation(); setStatus(opt.key); setStatusOpen(false); }}
                            style={{
                              display: "flex", alignItems: "center", gap: 10,
                              width: "100%", padding: "9px 14px",
                              background: status === opt.key ? "#f0fdf4" : "white",
                              border: "none", cursor: "pointer",
                              fontSize: 13, color: "#111827",
                              textAlign: "left",
                              transition: "background 0.1s",
                            }}
                          >
                            <span style={{
                              width: 10, height: 10, borderRadius: "50%",
                              background: opt.color, flexShrink: 0,
                            }} />
                            {opt.label}
                            {status === opt.key && (
                              <svg style={{ marginLeft: "auto" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Ponto do Dia ── */}
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#6b7280",
                  marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  📋 Ponto de hoje — {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                </div>

                {PONTO_STEPS.map(({ key, label, color, dep }) => {
                  const val    = rec[key as keyof PR];
                  const depOk  = dep ? !!rec[dep as keyof PR] : true;
                  const canReg = depOk && !val;

                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: val ? color : "#e5e7eb", flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 12, color: "#374151", flex: 1 }}>{label}</span>

                      {editKey === key ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          <input type="time" value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            style={{ fontSize: 11, padding: "2px 4px", border: "1px solid #d1d5db", borderRadius: 4, width: 76 }} />
                          <button type="button" onClick={() => salvarEdit(key)}
                            style={{ fontSize: 10, padding: "2px 6px", background: "#059669", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>✓</button>
                          <button type="button" onClick={() => { setEditKey(null); setEditVal(""); }}
                            style={{ fontSize: 10, padding: "2px 6px", background: "#9ca3af", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>×</button>
                        </div>
                      ) : val ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color }}>{val}</span>
                          {isAdmin && (
                            <button type="button"
                              onClick={() => { setEditKey(key); setEditVal(val); }}
                              style={{ fontSize: 9, padding: "1px 5px", background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 3, cursor: "pointer" }}>
                              editar
                            </button>
                          )}
                        </div>
                      ) : canReg ? (
                        <button type="button" onClick={() => regPonto(key)}
                          style={{ fontSize: 11, padding: "2px 10px", background: color, color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>
                          Registrar
                        </button>
                      ) : isAdmin ? (
                        <button type="button"
                          onClick={() => { setEditKey(key); setEditVal(hhmm()); }}
                          style={{ fontSize: 11, padding: "2px 10px", background: "#f59e0b", color: "white", border: "none", borderRadius: 5, cursor: "pointer" }}>
                          Autorizar
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>Pendente</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Links de navegação ── */}
              <div style={{ padding: "6px 0" }}>
                <Link href="/perfil" className="profile-dropdown-item" onClick={() => setOpen(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  Meu Perfil
                </Link>

                <Link href="/configuracoes" className="profile-dropdown-item" onClick={() => setOpen(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  Configurações
                </Link>

                <div className="profile-dropdown-sep" />

                <form action={logout}>
                  <button type="submit" className="profile-dropdown-item danger">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sair do sistema
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
