"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { logout } from "@/app/actions/auth";

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
const navItems = [
  { label: "Painel",        href: "/dashboard"    },
  { label: "CRM / Leads",   href: "/crm/leads"    },
  { label: "Negócios",      href: "/negocios"     },
  { label: "Financeiro",    href: "/financeiro"   },
  { label: "RH",            href: "/rh"           },
  { label: "Marketing",     href: "/marketing"    },
  { label: "Messenger",     href: "/mensagens"    },
  { label: "Configurações", href: "/configuracoes"},
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
  const [open, setOpen]           = useState(false);
  const [editKey, setEditKey]     = useState<string | null>(null);
  const [editVal, setEditVal]     = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  const email    = user?.email ?? "admin";
  const role     = user?.role  ?? "admin";
  const name     = user?.name  ?? "Administrador";
  const isGestor = role === "admin" || role === "gestor" || role === "admin@gcj.adv.br";
  const initials = name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  const { rec, save } = usePonto(email);
  const photo = useProfilePhoto(email);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
        setEditKey(null);
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

  return (
    <nav className="top-nav flex-shrink-0 flex items-stretch">

      {/* Logo */}
      <div className="top-nav-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-nav.png" alt="Grupo Inove Prime" className="top-nav-logo" />
      </div>

      {/* Links centrais */}
      <div className="flex flex-1">
        {navItems.map((item) => {
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
          <span className="top-nav-notif-badge">3</span>
        </button>

        {/* Mensagens */}
        <button type="button" className="top-nav-icon-btn" title="Mensagens">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="top-nav-notif-badge green">12</span>
        </button>

        {/* Perfil com dropdown */}
        <div className="profile-dropdown-wrap" ref={dropRef}>
          <button
            type="button"
            className="top-nav-avatar"
            onClick={() => { setOpen(v => !v); setEditKey(null); }}
            aria-expanded={open ? "true" : "false"}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={name}
                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div className="top-nav-avatar-circle">{initials}</div>
            )}
            <div>
              <div className="top-nav-avatar-name">{name}</div>
              <div className="top-nav-avatar-role">{email}</div>
            </div>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={`top-nav-chevron${open ? " open" : ""}`}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {open && (
            <div className="profile-dropdown" style={{ minWidth: 290 }}>
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-name">{name}</div>
                <div className="profile-dropdown-email">{email}</div>
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
                  const val   = rec[key as keyof PR];
                  const depOk = dep ? !!rec[dep as keyof PR] : true;
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
                          {isGestor && (
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
                      ) : isGestor ? (
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

              {/* Links do menu */}
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
          )}
        </div>
      </div>
    </nav>
  );
}
