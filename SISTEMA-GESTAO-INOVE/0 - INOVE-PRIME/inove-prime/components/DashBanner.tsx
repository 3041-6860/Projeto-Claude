"use client";

import { useEffect, useState } from "react";

function getSaudacao(hora: number) {
  if (hora >= 5 && hora < 12) return "☀️ Bom dia";
  if (hora >= 12 && hora < 18) return "🌤️ Boa tarde";
  return "🌙 Boa noite";
}

function getDataPorExtenso(data: Date) {
  const dias = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
  const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  return `${dias[data.getDay()]}, ${data.getDate()} de ${meses[data.getMonth()]} de ${data.getFullYear()}`;
}

interface DashBannerProps {
  userName?: string;
}

export default function DashBanner({ userName }: DashBannerProps) {
  const [hora, setHora] = useState<number | null>(null);
  const [dataStr, setDataStr] = useState("");

  useEffect(() => {
    function atualizar() {
      const agora = new Date();
      setHora(agora.getHours());
      setDataStr(getDataPorExtenso(agora));
    }
    atualizar();
    const intervalo = setInterval(atualizar, 60_000);
    return () => clearInterval(intervalo);
  }, []);

  const saudacao = hora !== null ? getSaudacao(hora) : "👋 Olá";
  const nome = userName ? `, ${userName.split(" ")[0]}!` : ", equipe!";

  return (
    <div className="dash-banner">
      <div className="dash-banner-left">
        <div className="dash-banner-greeting">{saudacao}{nome}</div>
        <div className="dash-banner-date">{dataStr || "Carregando…"} · Inove Prime</div>
      </div>
      <div className="dash-banner-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-branco.png" alt="Inove Prime" className="dash-banner-logo-img" />
      </div>
    </div>
  );
}
