"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Search, Bell, Plus, FolderOpen, Users,
  Settings, Building2, UserCog, LogOut, ChevronDown, X, Menu,
} from "lucide-react";
import Link from "next/link";
import { listarProcessos } from "@/lib/processos-storage";
import type { Processo } from "@/lib/mock-data";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/processos": "Processos",
  "/casos": "Casos",
  "/prazos": "Prazos e Alertas",
  "/baixa": "Baixa de Processos",
  "/clientes": "Clientes",
  "/contratos": "Contratos",
  "/servicos": "Serviços",
  "/agenda": "Agenda",
  "/tarefas": "Tarefas",
  "/documentos": "Documentos",
  "/financeiro": "Honorários",
  "/relatorios": "Relatórios",
  "/admin/escritorio": "Escritório",
  "/admin/equipe": "Equipe",
  "/admin/configuracoes": "Configurações",
};

const quickLinks = [
  { href: "/processos/novo", label: "Novo Processo", icon: FolderOpen },
  { href: "/clientes/novo", label: "Novo Cliente", icon: Users },
];

const adminLinks = [
  { href: "/admin/escritorio", label: "Escritório", icon: Building2 },
  { href: "/admin/equipe", label: "Equipe", icon: UserCog },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

interface SearchResults {
  processos: Processo[];
  clientes: { nome: string; total: number }[];
}

function buscarDados(termo: string): SearchResults {
  const t = termo.trim().toLowerCase();
  if (t.length < 2) return { processos: [], clientes: [] };

  const todos = listarProcessos();

  const processos = todos
    .filter(
      (p) =>
        p.numero.toLowerCase().includes(t) ||
        p.cliente.toLowerCase().includes(t)
    )
    .slice(0, 5);

  const clienteMap = new Map<string, number>();
  for (const p of todos) {
    if (!p.cliente?.trim()) continue;
    if (!p.cliente.toLowerCase().includes(t)) continue;
    const key = p.cliente.trim();
    clienteMap.set(key, (clienteMap.get(key) ?? 0) + 1);
  }
  const clientes = Array.from(clienteMap.entries())
    .map(([nome, total]) => ({ nome, total }))
    .slice(0, 4);

  return { processos, clientes };
}

const statusColor: Record<string, string> = {
  ativo: "#16a34a",
  suspenso: "#d97706",
  arquivado: "#6b7280",
  baixado: "#6b7280",
  aguardando_baixa: "#c2410c",
};

export function Topbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResults>({ processos: [], clientes: [] });
  const [showResults, setShowResults] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const userName = session?.user?.name ?? "Usuário";
  const userInitials = (session?.user as { initials?: string })?.initials ?? userName.charAt(0).toUpperCase();
  const userCargo = (session?.user as { cargo?: string })?.cargo ?? "";

  const adminRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const title = Object.entries(routeTitles).find(([key]) =>
    key === "/" ? pathname === "/" : pathname.startsWith(key)
  )?.[1] ?? "GCJ Gestão de Sistemas";

  const computeResults = useCallback((value: string) => {
    setResults(buscarDados(value));
    setShowResults(value.trim().length >= 2);
  }, []);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setSearch(v);
    computeResults(v);
  }

  function clearSearch() {
    setSearch("");
    setResults({ processos: [], clientes: [] });
    setShowResults(false);
  }

  function navigate(href: string) {
    clearSearch();
    router.push(href);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) {
        setAdminOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        clearSearch();
        setAdminOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const hasResults = results.processos.length > 0 || results.clientes.length > 0;

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center gap-2 px-3 md:px-5"
      style={{
        left: 0,
        height: 52,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Botão hamburger — mobile only */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg transition-colors hover:bg-gray-100 shrink-0"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
      </button>

      {/* Espaço da sidebar no desktop */}
      <div className="hidden md:block shrink-0" style={{ width: 240 }} />

      {/* Título */}
      <span className="text-[13px] font-semibold shrink-0 flex-1 md:flex-none truncate" style={{ color: "var(--text-primary)" }}>
        {title}
      </span>

      <div className="w-px h-4 mx-1 hidden md:block" style={{ background: "var(--border)" }} />

      {/* Busca — desktop only */}
      <div className="relative w-56 hidden md:block" ref={searchRef}>
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          value={search}
          onChange={handleSearchChange}
          onFocus={() => search.trim().length >= 2 && setShowResults(true)}
          placeholder="Buscar processos, clientes..."
          className="w-full h-8 pl-8 pr-7 text-[11px] rounded-lg transition-colors focus:outline-none"
          style={{
            background: showResults ? "#fff" : "var(--bg)",
            border: `1px solid ${showResults ? "#111111" : "var(--border)"}`,
            color: "var(--text-primary)",
          }}
        />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Limpar busca"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded"
          >
            <X className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
          </button>
        )}

        {/* Dropdown de resultados */}
        {showResults && (
          <div
            className="absolute top-full left-0 right-0 mt-1.5 rounded-xl shadow-lg overflow-hidden z-50"
            style={{ background: "#fff", border: "1px solid var(--border)" }}
          >
            {!hasResults ? (
              <p className="text-[11px] text-center py-4" style={{ color: "var(--text-muted)" }}>
                Nenhum resultado para &ldquo;{search}&rdquo;
              </p>
            ) : (
              <>
                {results.processos.length > 0 && (
                  <div>
                    <p className="px-3 pt-2.5 pb-1 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                      Processos
                    </p>
                    {results.processos.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => navigate(`/processos/${p.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="h-6 w-6 rounded-md flex items-center justify-center shrink-0"
                          style={{ background: "#fef2f4" }}
                        >
                          <FolderOpen className="h-3.5 w-3.5" style={{ color: "var(--gcj-red)" }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-mono font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                            {p.numero}
                          </p>
                          <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                            {p.cliente}
                          </p>
                        </div>
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ background: "#f3f4f6", color: statusColor[p.status] ?? "#6b7280" }}
                        >
                          {p.status === "aguardando_baixa" ? "Ag. Baixa" : p.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {results.clientes.length > 0 && (
                  <div className={results.processos.length > 0 ? "border-t" : ""} style={{ borderColor: "var(--border-light)" }}>
                    <p className="px-3 pt-2.5 pb-1 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                      Clientes
                    </p>
                    {results.clientes.map((c) => (
                      <button
                        key={c.nome}
                        type="button"
                        onClick={() => navigate(`/clientes/${encodeURIComponent(c.nome)}`)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="h-6 w-6 rounded-md flex items-center justify-center shrink-0"
                          style={{ background: "#eff6ff" }}
                        >
                          <Users className="h-3.5 w-3.5" style={{ color: "#2563eb" }} />
                        </div>
                        <p className="text-[11px] font-medium flex-1 truncate" style={{ color: "var(--text-primary)" }}>
                          {c.nome}
                        </p>
                        <span className="text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>
                          {c.total} processo{c.total !== 1 ? "s" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="px-3 py-1.5 border-t" style={{ borderColor: "var(--border-light)" }}>
                  <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                    Enter ou clique para navegar · Esc para fechar
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Ações rápidas */}
      <div className="flex items-center gap-1.5 ml-auto">
        {quickLinks.map(({ href, label }) => (
          <Link key={href} href={href} className="hidden lg:block">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-80"
              style={{ background: "var(--gcj-red)", color: "#fff" }}
            >
              <Plus className="h-3 w-3" />
              {label}
            </button>
          </Link>
        ))}

        {/* Notificações — desktop only */}
        <button
          type="button"
          aria-label="Notificações"
          className="relative p-2 rounded-lg transition-colors hover:bg-gray-100 hidden lg:block"
          style={{ color: "var(--text-secondary)" }}
        >
          <Bell className="h-4 w-4" />
          <span
            className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--gcj-red)" }}
          />
        </button>

        {/* Perfil + Admin */}
        <div className="relative" ref={adminRef}>
          <button
            type="button"
            onClick={() => setAdminOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg transition-colors hover:bg-gray-100"
          >
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{ background: "var(--gcj-red)", color: "#fff" }}
            >
              {userInitials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[11px] font-semibold leading-none" style={{ color: "var(--text-primary)" }}>
                {userName}
              </p>
              <p className="text-[9px] leading-none mt-0.5" style={{ color: "var(--text-muted)" }}>
                {userCargo}
              </p>
            </div>
            <ChevronDown className="h-3 w-3 shrink-0" style={{ color: "var(--text-muted)" }} />
          </button>

          {adminOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-52 rounded-xl shadow-lg py-1.5 z-50"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: "var(--text-muted)" }}>
                Administração
              </p>
              {adminLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setAdminOpen(false)}>
                  <div
                    className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition-colors cursor-pointer hover:bg-gray-50"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--gcj-red)" }} />
                    {label}
                  </div>
                </Link>
              ))}
              <div className="border-t mt-1 pt-1" style={{ borderColor: "var(--border-light)" }}>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium cursor-pointer hover:bg-gray-50 transition-colors text-left"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <LogOut className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
