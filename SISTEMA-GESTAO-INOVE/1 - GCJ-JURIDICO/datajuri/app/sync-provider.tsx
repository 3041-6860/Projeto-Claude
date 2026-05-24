"use client";
import { useEffect, useState } from "react";

const CHAVES = [
  "datajuri_processos_lista",
  "gcj_tarefas",
  "gcj_prazos",
  "gcj_agenda",
  "gcj_financeiro",
  "gcj_contratos",
  "gcj_documentos",
  "gcj_equipe",
  "gcj_escritorio",
  "gcj_servicos",
];

async function sincronizarDoServidor() {
  await Promise.all(
    CHAVES.map(async (chave) => {
      try {
        const res = await fetch(`/api/storage?key=${chave}`);
        if (!res.ok) return;
        const dados = await res.json();
        if (Array.isArray(dados) && dados.length > 0) {
          localStorage.setItem(chave, JSON.stringify(dados));
        } else if (dados && typeof dados === "object" && !Array.isArray(dados)) {
          localStorage.setItem(chave, JSON.stringify(dados));
        }
      } catch { /* ignora erros de rede */ }
    })
  );
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    sincronizarDoServidor().finally(() => setPronto(true));
  }, []);

  if (!pronto) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--gcj-red)", borderTopColor: "transparent" }} />
          <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
