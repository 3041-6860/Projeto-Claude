"use client";
import { useState, useEffect } from "react";
import { type StatusProcesso, type Processo } from "@/lib/datajuri/mock-data";
import { listarProcessos } from "@/lib/datajuri/processos-storage";
import { Card, CardContent } from "@/components/datajuri/ui/card";
import { Badge } from "@/components/datajuri/ui/badge";
import { Button } from "@/components/datajuri/ui/button";
import { Input } from "@/components/datajuri/ui/input";
import { formatDate, formatCurrency } from "@/lib/datajuri/utils";
import { Search, Plus, FolderOpen, Eye } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<StatusProcesso, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  ativo: { label: "Ativo", variant: "default" },
  suspenso: { label: "Suspenso", variant: "warning" },
  arquivado: { label: "Arquivado", variant: "secondary" },
  baixado: { label: "Baixado", variant: "success" },
  aguardando_baixa: { label: "Ag. Baixa", variant: "warning" },
};


const statusFiltros = [
  { value: "todos", label: "Todos" },
  { value: "ativo", label: "Ativos" },
  { value: "aguardando_baixa", label: "Ag. Baixa" },
  { value: "suspenso", label: "Suspensos" },
  { value: "baixado", label: "Baixados" },
  { value: "arquivado", label: "Arquivados" },
];

function tipoDisplay(tipo: string): string {
  const map: Record<string, string> = {
    civil: "Cível", trabalhista: "Trabalhista", criminal: "Criminal",
    tributario: "Tributário", previdenciario: "Previdenciário", administrativo: "Administrativo",
  };
  return map[tipo] ?? tipo;
}

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");

  useEffect(() => { setProcessos(listarProcessos()); }, []);

  const filtrados = processos.filter((p) => {
    const matchBusca =
      busca === "" ||
      p.numero.toLowerCase().includes(busca.toLowerCase()) ||
      p.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      p.parteContraria.toLowerCase().includes(busca.toLowerCase()) ||
      p.tribunal.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = statusFiltro === "todos" || p.status === statusFiltro;
    return matchBusca && matchStatus;
  });

  return (
    <div className="space-y-3">
      {/* Barra superior: busca + filtros + ação */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Buscar número, cliente, tribunal..."
            className="pl-8 h-8 text-xs"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {statusFiltros.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFiltro(f.value)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors"
              style={statusFiltro === f.value
                ? { background: "#8b2333", color: "#fff" }
                : { background: "#fff", border: "1px solid #e5e7eb", color: "#6b7280" }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">{filtrados.length} processo{filtrados.length !== 1 ? "s" : ""}</span>
          <Link href="/gcj/processos/novo">
            <Button className="h-8 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Novo Processo
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400">
              <FolderOpen className="h-9 w-9 mb-2.5" />
              <p className="text-sm font-medium">Nenhum processo encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Número</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Tribunal / Vara</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Fase</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Valor</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Distribuição</th>
                    <th className="py-2.5 px-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtrados.map((processo) => {
                    const s = statusConfig[processo.status];
                    return (
                      <tr key={processo.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-2 px-3">
                          <span className="font-mono text-[11px] font-semibold" style={{ color: "#8b2333" }}>{processo.numero}</span>
                        </td>
                        <td className="py-2 px-3">
                          <p className="text-xs font-medium text-gray-900">{processo.cliente}</p>
                          <p className="text-[10px] text-gray-400">{processo.advogadoResponsavel}</p>
                        </td>
                        <td className="py-2 px-3">
                          <p className="text-xs text-gray-700">{processo.tribunal}</p>
                          <p className="text-[10px] text-gray-400">{processo.vara}</p>
                        </td>
                        <td className="py-2 px-3 text-xs text-gray-600">{tipoDisplay(processo.tipo)}</td>
                        <td className="py-2 px-3 text-xs text-gray-600">{processo.fase}</td>
                        <td className="py-2 px-3 text-xs font-medium text-gray-700">{formatCurrency(processo.valorCausa)}</td>
                        <td className="py-2 px-3"><Badge variant={s.variant}>{s.label}</Badge></td>
                        <td className="py-2 px-3 text-[11px] text-gray-400">{formatDate(processo.dataDistribuicao)}</td>
                        <td className="py-2 px-3">
                          <Link href={`/datajuri/processos/${processo.id}`}>
                            <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                              <Eye className="h-3.5 w-3.5 text-gray-400" />
                            </button>
                          </Link>
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
