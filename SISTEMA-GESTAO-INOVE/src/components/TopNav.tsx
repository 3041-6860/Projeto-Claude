"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { logout } from "@/app/actions/auth";

const navItems = [
  { label: "Dashboard",     href: "/dashboard" },
  { label: "CRM / Leads",   href: "/crm/leads" },
  { label: "Negócios",      href: "/negocios" },
  { label: "Financeiro",    href: "/financeiro" },
  { label: "RH",            href: "/rh" },
  { label: "Marketing",     href: "/marketing" },
  { label: "Messenger",     href: "/mensagens" },
  { label: "Configurações", href: "/configuracoes" },
];

interface TopNavProps {
  user?: { name: string; email: string; role: string }
}

export default function TopNav({ user }: TopNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const displayName = user?.name ?? 'Administrador'
  const displayEmail = user?.email ?? 'admin'
  const initials = displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="top-nav flex-shrink-0 flex items-stretch">

      {/* Logo colorida sobre fundo branco */}
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

        <button type="button" className="top-nav-icon-btn" title="Notificações">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="top-nav-notif-badge">3</span>
        </button>

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
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open ? "true" : "false"}
          >
            <div className="top-nav-avatar-circle">{initials}</div>
            <div>
              <div className="top-nav-avatar-name">{displayName}</div>
              <div className="top-nav-avatar-role">{displayEmail}</div>
            </div>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={`top-nav-chevron${open ? " open" : ""}`}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {open && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-name">{displayName}</div>
                <div className="profile-dropdown-email">{displayEmail}</div>
              </div>

              <Link href="/configuracoes" className="profile-dropdown-item" onClick={() => setOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                Meu Perfil
              </Link>

              <Link href="/configuracoes" className="profile-dropdown-item" onClick={() => setOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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
