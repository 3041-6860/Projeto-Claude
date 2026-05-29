"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home, Briefcase, Users, FileText,
  DollarSign, UserSquare2, Megaphone, MessageSquare,
  Settings, CheckSquare, Calendar, Rss, User,
  Scale, ChevronDown, ChevronRight,
} from "lucide-react";

interface Child  { label: string; href: string; icon: React.ElementType }
interface NavItem { label: string; href: string; icon: React.ElementType; children?: Child[] }
interface Section { label: string; items: NavItem[]; roleOnly?: string[] }

const sections: Section[] = [
  {
    label: "Principal",
    items: [
      { label: "Início",               href: "/dashboard",  icon: Home      },
      { label: "Feed",                 href: "/feed",       icon: Rss       },
      { label: "Negócios / Pipelines", href: "/negocios",   icon: Briefcase },
      { label: "CRM / Leads",          href: "/crm/leads",  icon: Users     },
      { label: "Calendário",           href: "/calendario", icon: Calendar  },
    ],
  },
  {
    label: "Módulos",
    items: [
      { label: "Documentos", href: "/documentos", icon: FileText   },
      { label: "Financeiro", href: "/financeiro", icon: DollarSign },
      { label: "Marketing",  href: "/marketing",  icon: Megaphone  },
      { label: "Tarefas",    href: "/tarefas",    icon: CheckSquare },
    ],
  },
  {
    label: "Jurídico",
    roleOnly: ["admin", "juridico"],
    items: [
      // Sem filhos — navegação interna feita pelo JuridicoTopNav
      { label: "Jurídico", href: "/gcj", icon: Scale },
    ],
  },
  {
    label: "RH",
    roleOnly: ["admin", "rh"],
    items: [
      // Sem filhos — navegação interna feita pelo RHTopNav
      { label: "RH", href: "/rh", icon: UserSquare2 },
    ],
  },
  {
    label: "Comunicação",
    items: [
      { label: "Messenger", href: "/mensagens", icon: MessageSquare },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Meu Perfil",    href: "/perfil",        icon: User     },
      { label: "Configurações", href: "/configuracoes", icon: Settings },
    ],
  },
];

interface SidebarProps { role?: string }

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  function defaultExpanded(): Set<string> {
    const s = new Set<string>();
    sections.forEach(sec =>
      sec.items.forEach(item => {
        if (item.children && pathname.startsWith(item.href)) s.add(item.href);
      })
    );
    return s;
  }

  const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded);

  useEffect(() => {
    sections.forEach(sec =>
      sec.items.forEach(item => {
        if (item.children && pathname.startsWith(item.href)) {
          setExpanded(prev => new Set([...prev, item.href]));
        }
      })
    );
  }, [pathname]);

  function toggle(href: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(href) ? next.delete(href) : next.add(href);
      return next;
    });
  }

  return (
    <aside className="app-sidebar" style={{ flexShrink: 0, display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      <nav style={{ flex: 1, paddingTop: 8, paddingBottom: 8 }}>
        {sections.map((section, si) => {
          if (section.roleOnly && !section.roleOnly.includes(role ?? "")) return null;
          return (
            <div key={section.label}>
              {si > 0 && <div className="sb-sep" />}
              <p className="sb-label">{section.label}</p>

              {section.items.map((item) => {
                const hasKids  = !!item.children?.length;
                const isOpen   = expanded.has(item.href);
                const isActive = pathname === item.href ||
                  (item.href === "/dashboard" && pathname === "/") ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <div key={item.href}>
                    {hasKids ? (
                      <button
                        type="button"
                        onClick={() => toggle(item.href)}
                        className={`sb-item${isActive ? " active" : ""}`}
                        style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        <item.icon size={14} className="sb-icon" />
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {isOpen
                          ? <ChevronDown  size={11} style={{ opacity: 0.45, flexShrink: 0 }} />
                          : <ChevronRight size={11} style={{ opacity: 0.45, flexShrink: 0 }} />
                        }
                      </button>
                    ) : (
                      <Link href={item.href} className={`sb-item${isActive ? " active" : ""}`}>
                        <item.icon size={14} className="sb-icon" />
                        {item.label}
                      </Link>
                    )}

                    {hasKids && isOpen && (
                      <div style={{ borderLeft: "2px solid #e2e8ef", marginLeft: 20, marginBottom: 2 }}>
                        {item.children!.map((child) => {
                          const ca = pathname === child.href || pathname.startsWith(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`sb-item${ca ? " active" : ""}`}
                              style={{ paddingLeft: 10, fontSize: 12 }}
                            >
                              <child.icon size={12} className="sb-icon" />
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
