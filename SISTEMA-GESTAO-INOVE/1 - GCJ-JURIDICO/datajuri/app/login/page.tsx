"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setErro("Preencha e-mail e senha."); return; }
    setErro("");
    setCarregando(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setCarregando(false);
    if (result?.error) {
      setErro("E-mail ou senha incorretos.");
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(160deg, #faf8f5 0%, #f2ece4 60%, #ede4d8 100%)" }}
    >
      {/* Marca */}
      <div className="flex flex-col items-center mb-10 w-full max-w-sm">
        <div className="mb-5">
          <Image
            src="/logo-gcj.jpg"
            alt="Gonçalves Consultoria Jurídica"
            width={160}
            height={160}
            className="object-contain"
            style={{ mixBlendMode: "multiply" }}
            priority
          />
        </div>

        <h1
          className="text-center font-bold tracking-wide leading-tight"
          style={{ fontSize: 22, color: "#1e1210", letterSpacing: "0.04em" }}
        >
          Gonçalves Consultoria Jurídica
        </h1>

        <div className="flex items-center gap-3 mt-3 mb-3 w-full">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, #c4a040)" }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "#c4a040" }}>
            Gestão de Sistemas
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, #c4a040)" }} />
        </div>

        <p className="text-center text-[12px]" style={{ color: "#7a6a5a" }}>
          Acesso exclusivo para membros da equipe
        </p>
      </div>

      {/* Formulário */}
      <div
        className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #e8ddd4" }}
      >
        <div
          className="px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ background: "#1e1210", color: "rgba(255,255,255,0.7)" }}
        >
          Entrar no Sistema
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-7 space-y-5">
          {/* E-mail */}
          <div>
            <label
              className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
              style={{ color: "#7a6a5a" }}
            >
              E-mail
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ width: 14, height: 14, color: "#b8a898" }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@gcj.adv.br"
                autoComplete="email"
                autoFocus
                required
                className="w-full h-12 pl-10 pr-4 text-[13px] rounded-xl focus:outline-none transition-all"
                style={{
                  background: "#faf8f5",
                  border: "1.5px solid #e0d5c8",
                  color: "#1e1210",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#8b2333";
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,35,51,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e0d5c8";
                  e.currentTarget.style.background = "#faf8f5";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label
              className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
              style={{ color: "#7a6a5a" }}
            >
              Senha
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ width: 14, height: 14, color: "#b8a898" }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full h-12 pl-10 pr-4 text-[13px] rounded-xl focus:outline-none transition-all"
                style={{
                  background: "#faf8f5",
                  border: "1.5px solid #e0d5c8",
                  color: "#1e1210",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#8b2333";
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,35,51,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e0d5c8";
                  e.currentTarget.style.background = "#faf8f5";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {erro && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-[12px]"
              style={{ background: "#fff5f5", color: "#c0392b", border: "1px solid #fecaca" }}
            >
              <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-[14px] font-bold tracking-wide transition-all disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #2a1208, #1e1210)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(30,18,8,0.4)",
              letterSpacing: "0.06em",
            }}
          >
            {carregando ? (
              <>
                <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                Entrando…
              </>
            ) : (
              "ENTRAR"
            )}
          </button>
        </form>
      </div>

      {/* Rodapé */}
      <p className="mt-8 text-center text-[10px]" style={{ color: "#b0a090" }}>
        GCJ Gestão de Sistemas · Uso exclusivo interno
        <br />
        © {new Date().getFullYear()} Gonçalves Consultoria Jurídica
      </p>
    </div>
  );
}
