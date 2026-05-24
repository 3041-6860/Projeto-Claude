"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderOpen, Users, Clock, Calendar,
  CheckSquare, FileText, CircleDollarSign, FileSignature,
  Wrench, BarChart3, Globe, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "PROCESSOS",
    items: [
      { href: "/processos", label: "Processos", icon: FolderOpen },
      { href: "/processos/consulta-internet", label: "Consulta Internet", icon: Globe },
      { href: "/prazos", label: "Prazos e Alertas", icon: Clock },
    ],
  },
  {
    title: "CRM",
    items: [
      { href: "/clientes", label: "Clientes", icon: Users },
      { href: "/contratos", label: "Contratos", icon: FileSignature },
      { href: "/servicos", label: "Serviços", icon: Wrench },
      { href: "/agenda", label: "Agenda", icon: Calendar },
      { href: "/tarefas", label: "Tarefas", icon: CheckSquare },
      { href: "/documentos", label: "Documentos", icon: FileText },
    ],
  },
  {
    title: "FINANCEIRO",
    items: [
      { href: "/financeiro", label: "Honorários", icon: CircleDollarSign },
      { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay escuro — mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-60 flex flex-col z-40 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        {/* Logo + botão fechar (mobile) */}
        <div
          className="flex items-center gap-3 px-4 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--sidebar-border)" }}
        >
          <div
            className="shrink-0 rounded-lg overflow-hidden"
            style={{ width: 38, height: 38, background: "#fff", padding: 3 }}
          >
            <Image
              src="/logo-gcj.jpg"
              alt="GCJ"
              width={32}
              height={32}
              className="object-contain w-full h-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold leading-tight text-white tracking-tight truncate">
              GCJ Gestão de
            </p>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5" style={{ color: "var(--gcj-gold)" }}>
              Sistemas
            </p>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg transition-opacity hover:opacity-70"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4">
          {navSections.map((section, si) => (
            <div key={si}>
              {section.title && (
                <p
                  className="px-2.5 mb-1 text-[9px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: "var(--sidebar-section)" }}
                >
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] font-medium transition-all")}
                      style={
                        active
                          ? { background: "var(--sidebar-active-bg)", color: "var(--gcj-gold)", borderLeft: "2px solid var(--gcj-gold)" }
                          : { color: "var(--sidebar-text)", borderLeft: "2px solid transparent" }
                      }
                      onMouseEnter={(e) => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = "var(--sidebar-hover)";
                      }}
                      onMouseLeave={(e) => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 leading-none">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
