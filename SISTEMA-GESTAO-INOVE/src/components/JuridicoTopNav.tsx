"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Abas principais ──────────────────────────────────────────────────────────
const ABAS = [
  { label: "Início",            href: "/datajuri"                              },
  { label: "Processos",         href: "/datajuri/processos"                    },
  { label: "Clientes",          href: "/datajuri/clientes"                     },
  { label: "Prazos",            href: "/datajuri/prazos"                       },
  { label: "Agenda",            href: "/datajuri/agenda"                       },
  { label: "Tarefas",           href: "/datajuri/tarefas"                      },
  { label: "Contratos",         href: "/datajuri/contratos"                    },
  { label: "Documentos",        href: "/datajuri/documentos"                   },
  { label: "Financeiro",        href: "/datajuri/financeiro"                   },
  { label: "Relatórios",        href: "/datajuri/relatorios"                   },
  { label: "Consulta",          href: "/datajuri/processos/consulta-internet"  },
];

// ─── Ações rápidas (2ª linha) ─────────────────────────────────────────────────
const ACOES = [
  { label: "Meu Jurídico",   href: "/datajuri"                              },
  { label: "Novo Processo",  href: "/datajuri/processos/novo"               },
  { label: "Novo Cliente",   href: "/datajuri/clientes/novo"                },
  { label: "Baixa em Lote",  href: "/datajuri/baixa"                        },
  { label: "+ Adicionar",    href: "/datajuri/processos/novo"               },
];

export default function JuridicoTopNav() {
  const pathname = usePathname();

  return (
    <div style={{ background: "#1e3a5f", flexShrink: 0, userSelect: "none" }}>

      {/* ── Linha 1: abas principais ── */}
      <div style={{
        display: "flex", overflowX: "auto", gap: 0,
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}>
        {ABAS.map((aba) => {
          // "Início" é ativo apenas na rota exata
          const isActive =
            aba.href === "/datajuri"
              ? pathname === "/datajuri"
              : pathname === aba.href || pathname.startsWith(aba.href + "/");

          return (
            <Link
              key={aba.href}
              href={aba.href}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "9px 16px",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                color: isActive ? "white" : "rgba(255,255,255,0.65)",
                background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                borderBottom: isActive ? "2px solid white" : "2px solid transparent",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {aba.label}
            </Link>
          );
        })}

        {/* Botão "+" para nova seção */}
        <button style={{
          padding: "9px 14px", background: "transparent", border: "none",
          color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 16,
          borderBottom: "2px solid transparent",
        }}>
          +
        </button>
      </div>

      {/* ── Linha 2: ações rápidas ── */}
      <div style={{
        display: "flex", overflowX: "auto", gap: 0,
        padding: "1px 0",
      }}>
        {ACOES.map((acao) => {
          const isActive = pathname === acao.href;
          return (
            <Link
              key={acao.label}
              href={acao.href}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "5px 14px",
                fontSize: 11,
                fontWeight: 500,
                whiteSpace: "nowrap",
                color: isActive ? "white" : "rgba(255,255,255,0.55)",
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                textDecoration: "none",
                transition: "color 0.15s, background 0.15s",
                borderRadius: 0,
              }}
            >
              {acao.label}
            </Link>
          );
        })}
      </div>

    </div>
  );
}
