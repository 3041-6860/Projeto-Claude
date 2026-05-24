"use client";
import { useState } from "react";
import { casos, type StatusCaso, type TipoCaso } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Search, Plus, Briefcase, Filter, Eye } from "lucide-react";

const statusConfig: Record<StatusCaso, { label: string; variant: "default" | "success" | "warning" | "secondary" }> = {
  ativo: { label: "Ativo", variant: "default" },
  concluido: { label: "Concluído", variant: "success" },
  suspenso: { label: "Suspenso", variant: "warning" },
  arquivado: { label: "Arquivado", variant: "secondary" },
};

const tipoLabel: Record<TipoCaso, string> = {
  consultoria: "Consultoria",
  pre_contencioso: "Pré-Contencioso",
  acordo: "Acordo",
  administrativo: "Administrativo",
  trabalhista: "Trabalhista",
  societario: "Societário",
};

const statusFiltros = [
  { value: "todos", label: "Todos" },
  { value: "ativo", label: "Ativos" },
  { value: "concluido", label: "Concluídos" },
  { value: "suspenso", label: "Suspensos" },
  { value: "arquivado", label: "Arquivados" },
];

export default function CasosPage() {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");

  const filtrados = casos.filter((c) => {
    const matchBusca =
      busca === "" ||
      c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      c.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      c.advogadoResponsavel.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = statusFiltro === "todos" || c.status === statusFiltro;
    return matchBusca && matchStatus;
  });

  const counts = {
    ativo: casos.filter((c) => c.status === "ativo").length,
    concluido: casos.filter((c) => c.status === "concluido").length,
    suspenso: casos.filter((c) => c.status === "suspenso").length,
    arquivado: casos.filter((c) => c.status === "arquivado").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Casos</h1>
          <p className="text-xs text-gray-500 mt-0.5">{filtrados.length} caso{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}</p>
        </div>
        <Button>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Novo Caso
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Ativos", value: counts.ativo, color: "#8b2333", bg: "#fef2f4" },
          { label: "Concluídos", value: counts.concluido, color: "#16a34a", bg: "#f0fdf4" },
          { label: "Suspensos", value: counts.suspenso, color: "#d97706", bg: "#fffbeb" },
          { label: "Arquivados", value: counts.arquivado, color: "#6b7280", bg: "#f9fafb" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border p-4" style={{ borderColor: "#e8e6e3" }}>
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input placeholder="Buscar por título, cliente, advogado..." className="pl-9 h-8 text-xs" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-gray-400" />
          {statusFiltros.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFiltro(f.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={statusFiltro === f.value ? { background: "#8b2333", color: "#fff" } : { background: "#fff", border: "1px solid #e5e7eb", color: "#6b7280" }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Briefcase className="h-10 w-10 mb-3" />
              <p className="font-medium text-sm">Nenhum caso encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wide">Título</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wide">Advogado</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wide">Valor Est.</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wide">Abertura</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtrados.map((caso) => {
                    const s = statusConfig[caso.status];
                    return (
                      <tr key={caso.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 text-xs">{caso.titulo}</p>
                          {caso.resultado && <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[180px]">{caso.resultado}</p>}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{caso.cliente}</td>
                        <td className="py-3 px-4 text-gray-600">{tipoLabel[caso.tipo]}</td>
                        <td className="py-3 px-4 text-gray-600">{caso.advogadoResponsavel}</td>
                        <td className="py-3 px-4 text-gray-700 font-medium">{caso.valorEstimado ? formatCurrency(caso.valorEstimado) : "—"}</td>
                        <td className="py-3 px-4"><Badge variant={s.variant}>{s.label}</Badge></td>
                        <td className="py-3 px-4 text-gray-500">{formatDate(caso.createdAt)}</td>
                        <td className="py-3 px-4">
                          <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                            <Eye className="h-3.5 w-3.5 text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
