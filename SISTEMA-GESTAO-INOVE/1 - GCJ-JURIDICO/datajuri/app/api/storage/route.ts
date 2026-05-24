import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

function db() {
  return neon(process.env.DATABASE_URL!);
}

async function ensureTable() {
  const sql = db();
  await sql`
    CREATE TABLE IF NOT EXISTS gcj_storage (
      chave TEXT PRIMARY KEY,
      dados JSONB NOT NULL DEFAULT '[]',
      atualizado_em TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json([], { status: 400 });
  try {
    await ensureTable();
    const sql = db();
    const rows = await sql`SELECT dados FROM gcj_storage WHERE chave = ${key}`;
    return NextResponse.json(rows[0]?.dados ?? []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key, data } = await req.json();
    if (!key) return NextResponse.json({ ok: false }, { status: 400 });
    await ensureTable();
    const sql = db();
    await sql`
      INSERT INTO gcj_storage (chave, dados, atualizado_em)
      VALUES (${key}, ${JSON.stringify(data)}, NOW())
      ON CONFLICT (chave) DO UPDATE
        SET dados = EXCLUDED.dados, atualizado_em = NOW()
    `;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
