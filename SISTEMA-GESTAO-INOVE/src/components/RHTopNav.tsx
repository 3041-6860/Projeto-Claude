"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Abas principais ──────────────────────────────────────────────────────────
const ABAS = [
  { label: "Início",        href: "/rh"                },
  { label: "Colaboradores", href: "/rh/colaboradores"  },
  { label: "Onboarding",    href: "/rh/onboarding"     },
  { label: "Ponto",         href: "/rh/ponto"          },
  { label: "Férias",        href: "/rh/ferias"         },
  { label: "Organograma",   href: "/rh/organograma"    },
  { label: "Relatórios",    href: "/rh/relatorios"     },
];

// ─── Ações rápidas (2ª linha) ─────────────────────────────────────────────────
const ACOES = [
  { label: "Meu RH",           href: "/rh"               },
  { label: "Novo Colaborador", href: "/rh/colaboradores"  },
  { label: "Registrar Ponto",  href: "/rh/ponto"         },
  { label: "Solicitar Férias", href: "/rh/ferias"        },
  { label: "+ Adicionar",      href: "/rh/colaboradores"  },
];

export default function RHTopNav() {
  const pathname = usePathname();

  return (
    <div style={{ background: "#1e4d3a", flexShrink: 0, userSelect: "none" }}>

      {/* ── Linha 1: abas principais ── */}
      <div style={{
        display: "flex", overflowX: "auto", gap: 0,
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}>
        {ABAS.map((aba) => {
          const isActive =
            aba.href === "/rh"
              ? pathname === "/rh"
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
