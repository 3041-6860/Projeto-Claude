import { NextRequest, NextResponse } from "next/server";

// Chave pública DataJud — funciona sem configuração (rate-limited)
const PUBLIC_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

// Mapa J=8 (Justiça Estadual): TT → slug do DataJud
const ESTADUAL: Record<number, string> = {
  1: "tjac", 2: "tjal",  3: "tjap",  4: "tjam",  5: "tjba",
  6: "tjce", 7: "tjdft", 8: "tjes",  9: "tjgo", 10: "tjma",
 11: "tjmt",12: "tjms", 13: "tjmg", 14: "tjpa", 15: "tjpb",
 16: "tjpr",17: "tjpe", 18: "tjpi", 19: "tjrj", 20: "tjrn",
 21: "tjrs",22: "tjro", 23: "tjrr", 24: "tjsc", 25: "tjsp",
 26: "tjse",27: "tjto",
};

function resolveEndpoint(digits: string): string | null {
  if (digits.length !== 20) return null;
  const j  = +digits[13];
  const tt = +digits.slice(14, 16);
  if (j === 8) return ESTADUAL[tt] ?? null;
  if (j === 4) return `trf${tt}`;   // J=4: Justiça Federal
  if (j === 5) return `trt${tt}`;   // J=5: Justiça do Trabalho
  if (j === 1) return "stf";
  if (j === 3) return "stj";
  if (j === 2) return "cnj";
  return null;
}

export async function POST(req: NextRequest) {
  let numero = "", apiKey = "", test = false;
  try {
    const body = await req.json() as { numero?: string; apiKey?: string; test?: boolean };
    numero = body.numero ?? "";
    apiKey = body.apiKey ?? "";
    test   = body.test ?? false;
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const key = apiKey.trim() || PUBLIC_KEY;

  // Modo teste — verifica autenticidade da chave com query mínima no TJSC
  if (test) {
    try {
      const r = await fetch(
        "https://api-publica.datajud.cnj.jus.br/api_publica_tjsc/_search",
        {
          method: "POST",
          headers: { Authorization: `APIKey ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ query: { match_all: {} }, size: 0 }),
          signal: AbortSignal.timeout(8000),
        }
      );
      return NextResponse.json({ ok: r.ok, status: r.status });
    } catch {
      return NextResponse.json({ ok: false, status: 503 });
    }
  }

  // Modo busca normal
  const digits   = numero.replace(/\D/g, "");
  const endpoint = resolveEndpoint(digits);

  if (!endpoint) {
    return NextResponse.json(
      { error: "Tribunal não identificado pelo número CNJ informado." },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(
      `https://api-publica.datajud.cnj.jus.br/api_publica_${endpoint}/_search`,
      {
        method: "POST",
        headers: { Authorization: `APIKey ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: { match: { numeroProcesso: digits } } }),
        signal: AbortSignal.timeout(15000),
      }
    );

    const data: unknown = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { error: "Falha de conexão com o DataJud. Verifique sua internet." },
      { status: 503 }
    );
  }
}
