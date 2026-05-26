"use client";
import Link from "next/link";
import { ArrowLeft, Users, FolderOpen, ArrowRight, Info } from "lucide-react";

export default function NovoClientePage() {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <Link href="/datajuri/clientes">
          <button
            type="button"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8,
              border: "1px solid var(--border)", background: "var(--bg)",
              color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer",
            }}
          >
            <ArrowLeft size={13} /> Voltar
          </button>
        </Link>
      </div>

      <div style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "32px 28px", textAlign: "center",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "#eff6ff", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 20px",
        }}>
          <Users size={26} style={{ color: "#2563eb" }} />
        </div>

        <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>
          Cadastro de Clientes
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 24px" }}>
          Neste sistema, os clientes são registrados automaticamente ao cadastrar um processo.
          Não é necessário cadastrar o cliente separadamente.
        </p>

        <div style={{
          background: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: 10, padding: "14px 16px",
          display: "flex", alignItems: "flex-start", gap: 10,
          textAlign: "left", marginBottom: 28,
        }}>
          <Info size={15} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6, margin: 0 }}>
            Ao criar um processo e informar o nome do cliente, ele aparecerá automaticamente
            na lista de clientes com todos os seus processos vinculados.
          </p>
        </div>

        <Link href="/datajuri/processos/novo">
          <button
            type="button"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 22px", borderRadius: 10, border: "none",
              background: "var(--gcj-red)", color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <FolderOpen size={15} />
            Cadastrar novo processo
            <ArrowRight size={14} />
          </button>
        </Link>

        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 16 }}>
          O cliente será criado automaticamente junto com o processo.
        </p>
      </div>
    </div>
  );
}
