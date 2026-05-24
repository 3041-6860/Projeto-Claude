import { cookies } from "next/headers";
import OnboardingClient from "./client";

// Perfis que podem acessar e criar onboarding
const PERFIS_PERMITIDOS = new Set(["admin", "rh", "gestor", "admin@gcj.adv.br"]);

export default async function OnboardingPage() {
  const store = await cookies();
  const session = store.get("inove-session");

  let role = "";
  let userName = "equipe";
  if (session) {
    try {
      const u = JSON.parse(Buffer.from(session.value, "base64").toString());
      role = u?.role ?? "";
      if (u?.name) userName = u.name.split(" ")[0];
    } catch {}
  }

  const canAccess = PERFIS_PERMITIDOS.has(role);

  if (!canAccess) {
    return (
      <div className="dash-wrap" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "60vh",
      }}>
        <div style={{ textAlign: "center", padding: "48px 32px", maxWidth: 420 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <h2 style={{ color: "var(--navy)", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
            Acesso Restrito
          </h2>
          <p style={{ color: "#374151", fontSize: 14, marginBottom: 6 }}>
            O módulo de <strong>Onboarding</strong> é exclusivo para a equipe de
            <strong> RH</strong> e <strong>gestores responsáveis</strong>.
          </p>
          <p style={{ color: "var(--gray)", fontSize: 13 }}>
            Olá, <strong>{userName}</strong>. Solicite acesso ao administrador do sistema
            caso precise gerenciar integrações de colaboradores.
          </p>
          <div style={{
            marginTop: 24, padding: "12px 16px", borderRadius: 8,
            background: "#f0f9ff", border: "1px solid #bae6fd", fontSize: 12, color: "#0369a1",
          }}>
            💡 Perfis com acesso: <strong>Admin · RH · Gestor</strong>
          </div>
        </div>
      </div>
    );
  }

  return <OnboardingClient />;
}
