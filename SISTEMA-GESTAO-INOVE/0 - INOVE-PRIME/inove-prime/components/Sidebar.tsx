"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Briefcase, Users, FileText,
  DollarSign, UserSquare2, Megaphone, MessageSquare,
  Settings, CheckSquare, Calendar, Rss,
  UserPlus, Clock, Palmtree, Network, BarChart2, Scale,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type UserRole = 'admin' | 'gestor' | 'rh' | 'juridico' | 'comercial' | 'financeiro'

interface SidebarItem {
  label: string
  href: string
  icon: React.ElementType
  showOnlyUnder?: string
  roles?: UserRole[] // undefined = todos os perfis
}

interface SidebarSection {
  label: string
  items: SidebarItem[]
}

// ─── Estrutura do menu com controle de perfil ─────────────────────────────────
const ALL_ROLES: UserRole[] = ['admin', 'gestor', 'rh', 'juridico', 'comercial', 'financeiro']

const sections: SidebarSection[] = [
  {
    label: "Principal",
    items: [
      { label: "Início",               href: "/dashboard",  icon: Home,      roles: ALL_ROLES },
      { label: "Feed",                 href: "/feed",       icon: Rss,       roles: ALL_ROLES },
      { label: "Negócios / Pipelines", href: "/negocios",   icon: Briefcase, roles: ['admin', 'gestor', 'juridico', 'comercial'] },
      { label: "CRM / Leads",          href: "/crm/leads",  icon: Users,     roles: ['admin', 'gestor', 'comercial'] },
      { label: "Calendário",           href: "/calendario", icon: Calendar,  roles: ALL_ROLES },
    ],
  },
  {
    label: "Módulos",
    items: [
      { label: "Documentos", href: "/documentos", icon: FileText,    roles: ALL_ROLES },
      { label: "Financeiro", href: "/financeiro", icon: DollarSign,  roles: ['admin', 'gestor', 'financeiro'] },
      {
        label: "RH",        href: "/rh",          icon: UserSquare2,
        roles: ['admin', 'gestor', 'rh'],
      },
      { label: "↳ Onboarding",  href: "/rh/onboarding",  icon: UserPlus,  showOnlyUnder: "/rh", roles: ['admin', 'gestor', 'rh'] },
      { label: "↳ Organograma", href: "/rh/organograma", icon: Network,   showOnlyUnder: "/rh", roles: ['admin', 'gestor', 'rh'] },
      { label: "↳ Ponto",       href: "/rh/ponto",       icon: Clock,     showOnlyUnder: "/rh", roles: ['admin', 'gestor', 'rh'] },
      { label: "↳ Férias",      href: "/rh/ferias",      icon: Palmtree,  showOnlyUnder: "/rh", roles: ['admin', 'gestor', 'rh'] },
      { label: "↳ Relatórios",  href: "/rh/relatorios",  icon: BarChart2, showOnlyUnder: "/rh", roles: ['admin', 'gestor', 'rh'] },
      { label: "Marketing",  href: "/marketing",  icon: Megaphone,   roles: ['admin', 'gestor', 'comercial'] },
      { label: "Tarefas",    href: "/tarefas",    icon: CheckSquare, roles: ALL_ROLES },
      { label: "Processos",  href: "/processos",  icon: Scale,       roles: ['admin', 'gestor', 'juridico'] },
    ],
  },
  {
    label: "Comunicação",
    items: [
      { label: "Messenger", href: "/mensagens", icon: MessageSquare, roles: ALL_ROLES },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Configurações", href: "/configuracoes", icon: Settings, roles: ['admin'] },
    ],
  },
]

// ─── Normaliza role ───────────────────────────────────────────────────────────
function normalizeRole(role?: string): UserRole {
  if (!role) return 'admin'
  if (role === 'admin@gcj.adv.br' || role === 'admin') return 'admin'
  const valid: UserRole[] = ['gestor', 'rh', 'juridico', 'comercial', 'financeiro']
  if (valid.includes(role as UserRole)) return role as UserRole
  return 'admin'
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface SidebarProps {
  role?: string
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function Sidebar({ role }: SidebarProps) {
  const pathname  = usePathname()
  const userRole  = normalizeRole(role)

  return (
    <aside className="app-sidebar flex-shrink-0 flex flex-col h-full overflow-y-auto">
      <nav className="flex-1 py-2">
        {sections.map((section, si) => {
          // Filtra itens pelo perfil do usuário
          const visibleItems = section.items.filter(
            item => !item.roles || item.roles.includes(userRole)
          )

          // Oculta seção inteira se nenhum item visível
          if (visibleItems.length === 0) return null

          return (
            <div key={section.label}>
              {si > 0 && <div className="sb-sep" />}
              <p className="sb-label">{section.label}</p>

              {visibleItems.map((item) => {
                // Ocultar submenus quando não está na seção pai
                if (item.showOnlyUnder && !pathname.startsWith(item.showOnlyUnder)) {
                  return null
                }

                const isActive =
                  pathname === item.href ||
                  (item.href === "/dashboard" && pathname === "/") ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sb-item${isActive ? " active" : ""}`}
                  >
                    <item.icon size={14} className="sb-icon" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
