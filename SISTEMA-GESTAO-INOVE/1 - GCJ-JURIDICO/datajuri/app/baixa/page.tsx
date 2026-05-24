"use client";
import { useState } from "react";
import { processos as mockProcessos } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatCurrency } from "@/lib/utils";
import { FileDown, CheckCircle, Search, AlertCircle } from "lucide-react";

const elegiveisParaBaixa = mockProcessos.filter(
  (p) => p.status === "aguardando_baixa" || p.status === "ativo"
);

export default function BaixaPage() {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState("");
  const [dataBaixa, setDataBaixa] = useState(new Date().toISOString().split("T")[0]);
  const [motivoBaixa, setMotivoBaixa] = useState("Processo encerrado por sentença transitada em julgado");
  const [baixados, setBaixados] = useState<Set<string>>(new Set());

  const filtrados = elegiveisParaBaixa.filter(
    (p) =>
      busca === "" ||
      p.numero.toLowerCase().includes(busca.toLowerCase()) ||
      p.cliente.toLowerCase().includes(busca.toLowerCase())
  );

  const toggleSelecionado = (id: string) => {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  };

  const selecionarTodos = () => {
    if (selecionados.size === filtrados.length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(filtrados.map((p) => p.id)));
    }
  };

  const realizarBaixa = () => {
    setBaixados((prev) => new Set([...prev, ...selecionados]));
    setSelecionados(new Set());
  };

  const aguardandoBaixa = elegiveisParaBaixa.filter((p) => p.status === "aguardando_baixa");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Baixa de Processos</h1>
        <p className="text-sm text-gray-500 mt-1">Registre o encerramento e arquivamento de processos</p>
      </div>

      {/* Alerta processos aguardando */}
      {aguardandoBaixa.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>{aguardandoBaixa.length} processo{aguardandoBaixa.length > 1 ? "s" : ""}</strong>{" "}
                já marcado{aguardandoBaixa.length > 1 ? "s" : ""} como{" "}
                <em>aguardando baixa</em> — selecione abaixo para confirmar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de processos */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar processo..."
                className="pl-9"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={selecionarTodos}>
              {selecionados.size === filtrados.length ? "Desmarcar todos" : "Selecionar todos"}
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {filtrados.map((processo) => {
                  const sel = selecionados.has(processo.id);
                  const feito = baixados.has(processo.id);
                  return (
                    <div
                      key={processo.id}
                      onClick={() => !feito && toggleSelecionado(processo.id)}
                      className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                        feito
                          ? "bg-green-50 cursor-default"
                          : sel
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        feito
                          ? "border-green-500 bg-green-500"
                          : sel
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      }`}>
                        {(sel || feito) && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-blue-700 font-medium">{processo.numero}</span>
                          {processo.status === "aguardando_baixa" && (
                            <Badge variant="warning" className="text-xs">Ag. Baixa</Badge>
                          )}
                          {feito && <Badge variant="success" className="text-xs">Baixado</Badge>}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{processo.cliente}</p>
                        <p className="text-xs text-gray-400">{processo.tribunal} · {processo.vara}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-gray-700">{formatCurrency(processo.valorCausa)}</p>
                        <p className="text-xs text-gray-400">{formatDate(processo.dataDistribuicao)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel de confirmação */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileDown className="h-4 w-4" />
                Confirmar Baixa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Processos selecionados</p>
                <p className="text-3xl font-bold text-blue-600">{selecionados.size}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Data da Baixa *</label>
                <Input
                  type="date"
                  value={dataBaixa}
                  onChange={(e) => setDataBaixa(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Motivo da Baixa</label>
                <select
                  value={motivoBaixa}
                  onChange={(e) => setMotivoBaixa(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                >
                  <option>Processo encerrado por sentença transitada em julgado</option>
                  <option>Acordo extrajudicial</option>
                  <option>Desistência da ação</option>
                  <option>Extinção sem resolução de mérito</option>
                  <option>Cumprimento de sentença concluído</option>
                  <option>Outro</option>
                </select>
              </div>

              <Button
                className="w-full"
                disabled={selecionados.size === 0}
                onClick={realizarBaixa}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Realizar Baixa ({selecionados.size})
              </Button>

              {baixados.size > 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {baixados.size} processo{baixados.size > 1 ? "s" : ""} baixado{baixados.size > 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
