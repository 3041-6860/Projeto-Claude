"use client";

import { useState, useEffect, useRef } from "react";

type Perfil = {
  foto?: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  nascimento?: string;
  bio?: string;
};

export default function PerfilPage() {
  const [email, setEmail]   = useState("");
  const [nome,  setNome]    = useState("");
  const [perfil, setPerfil] = useState<Perfil>({});
  const [saved,  setSaved]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Lê usuário do cookie httpOnly via header (não acessível direto) → usa fetch
  useEffect(() => {
    // Cookie inove-session não é httpOnly de forma que possamos ler via document.cookie
    // Em vez disso, decodificamos da sessão armazenada em meta tag pelo layout
    // Mas como não temos isso, usamos o localStorage que o login pode ter salvo
    // Alternativa: ler do cookie se não for httpOnly em dev, ou usar uma API route
    const cookieRaw = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("inove-session="));
    if (cookieRaw) {
      try {
        const val = cookieRaw.split("=").slice(1).join("=").trim();
        const u = JSON.parse(atob(val));
        setEmail(u.email ?? "");
        setNome(u.name ?? "");
        const saved = localStorage.getItem(`inove-perfil-${u.email}`);
        if (saved) setPerfil(JSON.parse(saved));
      } catch {}
    }
  }, []);

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPerfil((p) => ({ ...p, foto: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function salvar() {
    localStorage.setItem(`inove-perfil-${email}`, JSON.stringify(perfil));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const initials = nome
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      {/* Cabeçalho */}
      <div className="pg-toolbar" style={{ marginBottom: 24 }}>
        <div>
          <p className="pg-title">Meu Perfil</p>
          <p className="pg-sub">Foto, dados pessoais e registro de ponto</p>
        </div>
      </div>

      {/* Card foto + nome */}
      <div style={{
        display: "flex", alignItems: "center", gap: 20,
        padding: 20, background: "#f9fafb",
        borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 24,
      }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          {perfil.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={perfil.foto} alt={nome}
              style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #e5e7eb" }} />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #1e3a5f, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, color: "white", fontWeight: 700,
            }}>
              {initials || "?"}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Alterar foto"
            style={{
              position: "absolute", bottom: 0, right: 0,
              width: 26, height: 26, borderRadius: "50%",
              background: "#3b82f6", color: "white",
              border: "2px solid white", cursor: "pointer",
              fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              lineHeight: 1,
            }}>
            +
          </button>
          <input ref={fileRef} type="file" accept="image/*"
            style={{ display: "none" }} onChange={handleFoto} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: "#111827" }}>{nome || "—"}</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{email || "—"}</div>
          {perfil.cargo && (
            <div style={{
              marginTop: 6, display: "inline-block",
              fontSize: 11, padding: "2px 10px",
              background: "#eff6ff", color: "#3b82f6",
              borderRadius: 20, fontWeight: 600,
            }}>
              {perfil.cargo}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={{ fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}>
          Alterar foto
        </button>
      </div>

      {/* Formulário */}
      <div style={{
        background: "white", borderRadius: 12,
        border: "1px solid #e5e7eb", padding: 24,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
              Telefone / WhatsApp
            </label>
            <input
              type="tel"
              value={perfil.telefone ?? ""}
              onChange={(e) => setPerfil((p) => ({ ...p, telefone: e.target.value }))}
              placeholder="(00) 00000-0000"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
              Data de Nascimento
            </label>
            <input
              type="date"
              value={perfil.nascimento ?? ""}
              onChange={(e) => setPerfil((p) => ({ ...p, nascimento: e.target.value }))}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
              Cargo
            </label>
            <input
              type="text"
              value={perfil.cargo ?? ""}
              onChange={(e) => setPerfil((p) => ({ ...p, cargo: e.target.value }))}
              placeholder="Ex: Advogado, Analista..."
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
              Departamento
            </label>
            <input
              type="text"
              value={perfil.departamento ?? ""}
              onChange={(e) => setPerfil((p) => ({ ...p, departamento: e.target.value }))}
              placeholder="Ex: Jurídico, RH, TI..."
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
            Sobre mim (opcional)
          </label>
          <textarea
            value={perfil.bio ?? ""}
            onChange={(e) => setPerfil((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Uma breve descrição sobre você..."
            rows={3}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, resize: "vertical" }}
          />
        </div>

        <button
          type="button"
          onClick={salvar}
          style={{
            padding: "10px 0",
            background: saved ? "#059669" : "#3b82f6",
            color: "white", border: "none", borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            transition: "background 0.2s",
          }}>
          {saved ? "✓ Salvo com sucesso!" : "Salvar alterações"}
        </button>
      </div>

      {/* Histórico de ponto da semana */}
      <PontoSemana email={email} />
    </div>
  );
}

// ── Histórico de ponto da semana ────────────────────────────
function PontoSemana({ email }: { email: string }) {
  const [registros, setRegistros] = useState<{ data: string; rec: Record<string, string> }[]>([]);

  useEffect(() => {
    if (!email) return;
    try {
      const raw = localStorage.getItem("inove-ponto-v1");
      if (!raw) return;
      const store = JSON.parse(raw);
      const userRecs = store[email] ?? {};
      // Pega últimos 7 dias
      const dias = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dias.push({ data: key, rec: userRecs[key] ?? {} });
      }
      setRegistros(dias);
    } catch {}
  }, [email]);

  const temDados = registros.some((r) => Object.keys(r.rec).length > 0);

  return (
    <div style={{ marginTop: 24, background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 16 }}>
        📋 Meu Cartão Ponto — Últimos 7 dias
      </div>

      {!temDados ? (
        <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "16px 0" }}>
          Nenhum registro de ponto encontrado.
        </p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Data", "Entrada", "Almoço", "Retorno", "Saída", "Total"].map((h) => (
                <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registros.map(({ data, rec }) => {
              const [ano, mes, dia] = data.split("-");
              const label = `${dia}/${mes}/${ano.slice(2)}`;
              const total = calcTotal(rec.entrada, rec.saida, rec.almoco, rec.retorno);
              return (
                <tr key={data} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "7px 10px", fontWeight: 600, color: "#374151" }}>{label}</td>
                  <td style={{ padding: "7px 10px", color: rec.entrada ? "#059669" : "#d1d5db" }}>{rec.entrada ?? "—"}</td>
                  <td style={{ padding: "7px 10px", color: rec.almoco  ? "#d97706" : "#d1d5db" }}>{rec.almoco  ?? "—"}</td>
                  <td style={{ padding: "7px 10px", color: rec.retorno ? "#3b82f6" : "#d1d5db" }}>{rec.retorno ?? "—"}</td>
                  <td style={{ padding: "7px 10px", color: rec.saida   ? "#dc2626" : "#d1d5db" }}>{rec.saida   ?? "—"}</td>
                  <td style={{ padding: "7px 10px", fontWeight: 600, color: total ? "#374151" : "#d1d5db" }}>{total ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function calcTotal(entrada?: string, saida?: string, almoco?: string, retorno?: string): string | null {
  if (!entrada || !saida) return null;
  function toMin(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }
  let total = toMin(saida) - toMin(entrada);
  if (almoco && retorno) total -= (toMin(retorno) - toMin(almoco));
  if (total <= 0) return null;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h${m > 0 ? String(m).padStart(2, "0") : "00"}`;
}
