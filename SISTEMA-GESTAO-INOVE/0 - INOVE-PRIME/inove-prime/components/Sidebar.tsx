"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Briefcase, Users, FileText,
  DollarSign, UserSquare2, Megaphone, MessageSquare,
  Settings, CheckSquare, Calendar, Rss, UserPlus, Clock, Palmtree, Network, BarChart2,
} from "lucide-react";

const sections = [
  {
    label: "Principal",
    items: [
      { label: "Início",               href: "/dashboard",  icon: Home        },
      { label: "Feed",                 href: "/feed",       icon: Rss         },
      { label: "Negócios / Pipelines", href: "/negocios",   icon: Briefcase   },
      { label: "CRM / Leads",          href: "/crm/leads",  icon: Users       },
      { label: "Calendário",           href: "/calendario", icon: Calendar    },
    ],
  },
  {
    label: "Módulos",
    items: [
      { label: "Documentos", href: "/documentos", icon: FileText    },
      { label: "Financeiro", href: "/financeiro", icon: DollarSign  },
      { label: "RH",          href: "/rh",          icon: UserSquare2 },
      { label: "↳ Onboarding",  href: "/rh/onboarding",  icon: UserPlus,  showOnlyUnder: "/rh" },
      { label: "↳ Organograma", href: "/rh/organograma", icon: Network,   showOnlyUnder: "/rh" },
      { label: "↳ Ponto",      href: "/rh/ponto",       icon: Clock,     showOnlyUnder: "/rh" },
      { label: "↳ Férias",     href: "/rh/ferias",      icon: Palmtree,  showOnlyUnder: "/rh" },
      { label: "↳ Relatórios", href: "/rh/relatorios",  icon: BarChart2, showOnlyUnder: "/rh" },
      { label: "Marketing",  href: "/marketing",   icon: Megaphone   },
      { label: "Tarefas",    href: "/tarefas",     icon: CheckSquare },
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
      { label: "Configurações", href: "/configuracoes", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar flex-shrink-0 flex flex-col h-full overflow-y-auto">
      <nav className="flex-1 py-2">
        {sections.map((section, si) => (
          <div key={section.label}>
            {si > 0 && <div className="sb-sep" />}
            <p className="sb-label">{section.label}</p>
            {section.items.map((item) => {
              // Ocultar submenus quando não está na seção pai
              if (item.showOnlyUnder && !pathname.startsWith(item.showOnlyUnder)) {
                return null;
              }
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
        ))}
      </nav>
    </aside>
  );
}
