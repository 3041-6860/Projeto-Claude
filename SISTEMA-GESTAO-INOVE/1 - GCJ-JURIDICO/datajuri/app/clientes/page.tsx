"use client";
import { useState, useEffect } from "react";
import { listarProcessos } from "@/lib/processos-storage";
import type { Processo } from "@/lib/mock-data";
import { Search, Users, FolderOpen, Eye, Plus } from "lucide-react";
import Link from "next/link";

interface ClienteAgregado {
  nome: string;
  processos: Processo[];
  ativo: boolean;
}

function agregarClientes(lista: Processo[]): ClienteAgregado[] {
  const map = new Map<string, Processo[]>();
  for (const p of lista) {
    if (!p.cliente?.trim()) continue;
    const key = p.cliente.trim();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return Array.from(map.entries())
    .map(([nome, procs]) => ({
      nome,
      processos: procs,
      ativo: procs.some((p) => p.status === "ativo" || p.status === "suspenso"),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteAgregado[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    setClientes(agregarClientes(listarProcessos()));
  }, []);

  const filtrados = clientes.filter(
    (c) => busca === "" || c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Barra superior */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
          <input
            placeholder="Buscar cliente..."
            className="w-full h-8 pl-8 pr-3 text-xs rounded-lg focus:outline-none"
            style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {filtrados.length} cliente{filtrados.length !== 1 ? "s" : ""}
          </span>
          <Link href="/processos/novo">
            <button
              type="button"
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold"
              style={{ background: "var(--gcj-red)", color: "#fff" }}
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Processo
            </button>
          </Link>
        </div>
      </div>

      {/* Aviso de integração */}
      <div
        className="px-3 py-2 rounded-lg text-[11px]"
        style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}
      >
        Clientes são cadastrados automaticamente ao registrar um processo. Para adicionar um cliente, cadastre um processo.
      </div>

      {/* Tabela */}
      <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14" style={{ color: "var(--text-muted)" }}>
            <Users className="h-9 w-9 mb-2.5" />
            <p className="text-sm font-medium">
              {clientes.length === 0 ? "Nenhum cliente cadastrado" : "Nenhum cliente encontrado"}
            </p>
            {clientes.length === 0 && (
              <Link href="/processos/novo">
                <button
                  type="button"
                  className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: "var(--gcj-red)", color: "#fff" }}
                >
                  Cadastrar primeiro processo
                </button>
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ background: "var(--bg)", borderColor: "var(--border-light)" }}>
                {["Cliente", "Processos", "Último tribunal", "Advogado resp.", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => {
                const ultimo = [...c.processos].sort((a, b) =>
                  b.createdAt.localeCompare(a.createdAt)
                )[0];
                return (
                  <tr
                    key={c.nome}
                    className="border-b last:border-0 transition-colors"
                    style={{ borderColor: "var(--border-light)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "var(--sidebar-active-bg)" }}
                        >
                          <Users className="h-3.5 w-3.5" style={{ color: "var(--gcj-gold)" }} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                          {c.nome}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <FolderOpen className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
                        {c.processos.length}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {ultimo?.tribunal ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {ultimo?.advogadoResponsavel ?? "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={
                          c.ativo
                            ? { background: "#dcfce7", color: "#15803d" }
                            : { background: "#f3f4f6", color: "#6b7280" }
                        }
                      >
                        {c.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/clientes/${encodeURIComponent(c.nome)}`}>
                        <button type="button" aria-label="Ver cliente" className="p-1.5 rounded transition-colors hover:bg-gray-100">
                          <Eye className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
