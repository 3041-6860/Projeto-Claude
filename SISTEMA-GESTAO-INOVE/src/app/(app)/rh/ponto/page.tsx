'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const PONTO_KEY = 'inove-ponto-v1'

const USERS: { email: string; nome: string; cargo: string; dept: string; color: string }[] = [
  { email: 'admin@gcj.adv.br', nome: 'Administrador',      cargo: 'Administrador',    dept: 'Diretoria', color: '#1e3a5f' },
  { email: 'sandra',           nome: 'Sandra Otto',         cargo: 'Gestora de RH',    dept: 'RH',        color: '#059669' },
  { email: 'rodrigo',          nome: 'Rodrigo Gonçalves',   cargo: 'Gestor Comercial', dept: 'Comercial', color: '#7c3aed' },
]

type PontoRec = { entrada?: string; almoco?: string; retorno?: string; saida?: string }
type PontoStore = Record<string, Record<string, PontoRec>>

function toMin(t: string) { const [h, m] = t.split(':').map(Number); return h * 60 + m }
function calcTotal(r: PontoRec): string | null {
  if (!r.entrada) return null
  const fim = r.saida ? toMin(r.saida) : toMin(new Date().toTimeString().slice(0, 5))
  let mins = fim - toMin(r.entrada)
  if (r.almoco && r.retorno) mins -= (toMin(r.retorno) - toMin(r.almoco))
  if (mins <= 0) return null
  return `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`
}
function today() { return new Date().toISOString().slice(0, 10) }
function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().slice(0, 10)
  })
}
function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-')
  const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
  const dt = new Date(iso + 'T12:00:00')
  return `${days[dt.getDay()]} ${d}/${m}`
}
function Avatar({ nome, color }: { nome: string; color: string }) {
  const ini = nome.split(' ').map(n => n[0]).slice(0, 2).join('')
  return (
    <div style={{ width: 30, height: 30, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
      {ini}
    </div>
  )
}

export default function PontoEletronico() {
  const [tab, setTab] = useState(0)
  const [store, setStore] = useState<PontoStore>({})
  const tabs = ['Hoje', 'Semana', 'Banco de Horas', 'Relatório']

  useEffect(() => {
    try {
      const s = localStorage.getItem(PONTO_KEY)
      if (s) setStore(JSON.parse(s))
    } catch {}
  }, [])

  const todayKey = today()
  const weekDays = lastNDays(7)

  // Hoje — dados por usuário
  const hojeRows = USERS.map(u => {
    const rec: PontoRec = store[u.email]?.[todayKey] ?? {}
    const hasEntry = !!rec.entrada
    const status = hasEntry ? 'Presente' : 'Ausente'
    return { ...u, rec, status, total: calcTotal(rec) }
  })

  const presentes = hojeRows.filter(r => r.status === 'Presente').length
  const ausentes  = hojeRows.filter(r => r.status === 'Ausente').length

  // Semana
  const semanaRows = USERS.map(u => ({
    ...u,
    dias: weekDays.map(d => {
      const rec: PontoRec = store[u.email]?.[d] ?? {}
      return { date: d, rec, hasData: !!rec.entrada }
    }),
  }))

  // Banco de horas — últimos 30 dias
  const bancoRows = USERS.map(u => {
    const userStore = store[u.email] ?? {}
    let totalMins = 0; let dias = 0
    Object.values(userStore).forEach(rec => {
      const t = calcTotal(rec)
      if (t) {
        const [h, m] = t.replace('h', ':').split(':').map(Number)
        totalMins += h * 60 + (m || 0); dias++
      }
    })
    const extra = totalMins > 0 ? Math.max(0, totalMins - dias * 8 * 60) : 0
    const saldo = extra
    return { ...u, totalMins, dias, extra: +(extra / 60).toFixed(1), saldo: +(saldo / 60).toFixed(1) }
  })

  const totalExtra = bancoRows.reduce((a, b) => a + b.extra, 0)

  return (
    <div className="dash-wrap">

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 13, color: 'var(--gray)' }}>
        <Link href="/rh" style={{ color: 'var(--navy)', fontWeight: 600 }}>RH</Link>
        <span>›</span>
        <span>Ponto Eletrônico</span>
      </div>

      {/* Toolbar */}
      <div className="pg-toolbar">
        <div>
          <p className="pg-title">Ponto Eletrônico</p>
          <p className="pg-sub">Controle de entrada e saída · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button className="btn btn-outline btn-sm">📤 Exportar</button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
        <div className="card card-top-green card-bg-green">
          <p className="card-label">Presentes hoje</p>
          <p className="card-val val-green">{presentes}</p>
          <p className="card-hint">Com registro de entrada</p>
        </div>
        <div className="card card-top-red">
          <p className="card-label">Ausentes</p>
          <p className="card-val val-red">{ausentes}</p>
          <p className="card-hint">Sem registro hoje</p>
        </div>
        <div className="card card-top-navy">
          <p className="card-label">Total usuários</p>
          <p className="card-val val-navy">{USERS.length}</p>
          <p className="card-hint">Usuários do sistema</p>
        </div>
        <div className="card card-top-navy card-bg-navy">
          <p className="card-label">Banco de horas</p>
          <p className="card-val val-navy">{totalExtra.toFixed(1)}h</p>
          <p className="card-hint">Saldo positivo acumulado</p>
        </div>
      </div>

      {/* Alerta ausência */}
      {ausentes > 0 && (
        <div className="alert alert-red" style={{ marginBottom: 12 }}>
          <span>❌</span>
          <span>
            <strong>{ausentes} usuário{ausentes > 1 ? 's' : ''}</strong> sem registro de ponto hoje — {hojeRows.filter(r => r.status === 'Ausente').map(r => r.nome.split(' ')[0]).join(', ')}.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((t, i) => (
          <div key={t} className={`tab ${i === tab ? 'on' : ''}`} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>

      {/* ── Tab 0: Hoje ── */}
      {tab === 0 && (
        <table className="tbl">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Depto.</th>
              <th>Entrada</th>
              <th>Almoço</th>
              <th>Retorno</th>
              <th>Saída</th>
              <th>Trabalhado</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {hojeRows.map(r => (
              <tr key={r.email}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar nome={r.nome} color={r.color} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{r.nome}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray)', margin: 0 }}>{r.cargo}</p>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--gray)' }}>{r.dept}</td>
                <td style={{ fontFamily: 'monospace', color: r.rec.entrada ? 'var(--green)' : 'var(--gray)' }}>{r.rec.entrada ?? '—'}</td>
                <td style={{ fontFamily: 'monospace', color: r.rec.almoco  ? '#d97706' : 'var(--gray)' }}>{r.rec.almoco  ?? '—'}</td>
                <td style={{ fontFamily: 'monospace', color: r.rec.retorno ? '#3b82f6' : 'var(--gray)' }}>{r.rec.retorno ?? '—'}</td>
                <td style={{ fontFamily: 'monospace', color: r.rec.saida   ? '#dc2626' : 'var(--gray)' }}>{r.rec.saida   ?? '—'}</td>
                <td style={{ fontWeight: 700, color: 'var(--navy)' }}>{r.total ?? '—'}</td>
                <td>
                  <span className={`badge ${r.status === 'Presente' ? 'badge-green' : 'badge-red'}`}>
                    {r.status === 'Presente' ? '✅' : '❌'} {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Tab 1: Semana ── */}
      {tab === 1 && (
        <table className="tbl">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Depto.</th>
              {weekDays.map(d => (
                <th key={d} style={{ textAlign: 'center', fontSize: 11 }}>{fmtDate(d)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {semanaRows.map(r => (
              <tr key={r.email}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar nome={r.nome} color={r.color} />
                    <span style={{ fontWeight: 600 }}>{r.nome}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--gray)' }}>{r.dept}</td>
                {r.dias.map(d => (
                  <td key={d.date} style={{ textAlign: 'center', padding: '8px 4px' }}>
                    <span style={{
                      display: 'inline-block', width: 28, height: 28, borderRadius: 5,
                      background: d.hasData ? '#eaf3e5' : d.date === todayKey ? '#fce8e8' : '#f3f4f6',
                      color: d.hasData ? '#4d7a38' : d.date === todayKey ? '#c62828' : '#9ca3af',
                      fontWeight: 700, textAlign: 'center', lineHeight: '28px', fontSize: 10,
                    }}>
                      {d.hasData ? 'P' : d.date === todayKey ? 'A' : '—'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Tab 2: Banco de Horas ── */}
      {tab === 2 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 }}>
            <div className="card card-top-green">
              <p className="card-label">Total horas extras</p>
              <p className="card-val val-green">{bancoRows.reduce((a, b) => a + b.extra, 0).toFixed(1)}h</p>
              <p className="card-hint">Acumulado</p>
            </div>
            <div className="card card-top-navy">
              <p className="card-label">Dias registrados</p>
              <p className="card-val val-navy">{bancoRows.reduce((a, b) => a + b.dias, 0)}</p>
              <p className="card-hint">Total de registros</p>
            </div>
            <div className="card card-top-navy">
              <p className="card-label">Saldo geral</p>
              <p className="card-val val-navy">{bancoRows.reduce((a, b) => a + b.saldo, 0).toFixed(1)}h</p>
              <p className="card-hint">Positivo = crédito</p>
            </div>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Departamento</th>
                <th style={{ textAlign: 'center' }}>Dias registrados</th>
                <th style={{ textAlign: 'right' }}>Horas extras</th>
                <th style={{ textAlign: 'right' }}>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {bancoRows.map(b => (
                <tr key={b.email}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar nome={b.nome} color={b.color} />
                      <span style={{ fontWeight: 600 }}>{b.nome}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--gray)' }}>{b.dept}</td>
                  <td style={{ textAlign: 'center', color: 'var(--navy)', fontWeight: 600 }}>{b.dias}</td>
                  <td style={{ textAlign: 'right', color: 'var(--green)', fontWeight: 600 }}>
                    {b.extra > 0 ? `+${b.extra}h` : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: b.saldo > 0 ? 'var(--green)' : 'var(--gray)' }}>
                    {b.saldo > 0 ? `+${b.saldo}h` : '0h'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab 3: Relatório ── */}
      {tab === 3 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <p style={{ fontWeight: 600, color: '#374151', fontSize: 15, marginBottom: 8 }}>Relatórios em breve</p>
          <p style={{ fontSize: 13 }}>Os relatórios analíticos de ponto serão gerados conforme os registros forem acumulados.</p>
        </div>
      )}

    </div>
  )
}
