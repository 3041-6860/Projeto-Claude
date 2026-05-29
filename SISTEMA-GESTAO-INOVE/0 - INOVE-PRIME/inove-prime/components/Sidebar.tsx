"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Briefcase, Users, FileText,
  DollarSign, UserSquare2, Megaphone, MessageSquare,
  Settings, CheckSquare, Calendar, Rss, User,
  Scale,
} from "lucide-react";

const sections = [
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
      { label: "Documentos", href: "/documentos", icon: FileText    },
      { label: "Financeiro", href: "/financeiro", icon: DollarSign  },
      { label: "Marketing",  href: "/marketing",  icon: Megaphone   },
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

interface SidebarProps {
  role?: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar flex-shrink-0 flex flex-col h-full overflow-y-auto">
      <nav className="flex-1 py-2">
        {sections.map((section, si) => {
          if ((section as { roleOnly?: string[] }).roleOnly &&
              !(section as { roleOnly?: string[] }).roleOnly!.includes(role ?? "")) {
            return null;
          }
          return (
            <div key={section.label}>
              {si > 0 && <div className="sb-sep" />}
              <p className="sb-label">{section.label}</p>
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/dashboard" && pathname === "/") ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} className={`sb-item${isActive ? " active" : ""}`}>
                    <item.icon size={14} className="sb-icon" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
