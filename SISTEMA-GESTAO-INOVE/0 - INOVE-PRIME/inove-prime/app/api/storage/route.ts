// Storage sync — no-op (dados ficam no localStorage do browser)
// O sync.ts chama esta rota silenciosamente; falhas são ignoradas.
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  return NextResponse.json([]);
}

export async function POST(_req: NextRequest) {
  return NextResponse.json({ ok: true });
}
