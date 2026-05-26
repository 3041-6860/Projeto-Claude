'use client'
import { useState } from 'react'
import Link from 'next/link'

/* ─── Tipos ──────────────────────────────────────────────── */
type StatusSol = 'Pendente' | 'Aprovado' | 'Recusado'

interface Solicitacao {
  id: number
  nome: string
  dept: string
  cargo: string
  inicio: string
  fim: string
  dias: number
  solicitado: string
  status: StatusSol
  obs: string
}

interface Saldo {
  nome: string
  dept: string
  direito: number
  gozado: number
  saldo: number
  vencimento: string
  alerta: boolean
}

/* ─── Dados iniciais — começam vazios, preenchidos pela equipe ── */
const solicitacoes: Solicitacao[] = []
const saldos: Saldo[] = []
const ferias_calendario: { nome: string; inicio: number; fim: number; mes: string; cor: string; borda: string }[] = []

/* ─── Helpers ────────────────────────────────────────────── */
const statusBadge: Record<StatusSol, string> = {
  Pendente: 'badge-orange',
  Aprovado: 'badge-green',
  Recusado: 'badge-red',
}
const statusEmoji: Record<StatusSol, string> = {
  Pendente: '⏳', Aprovado: '✅', Recusado: '❌',
}

function Avatar({ nome }: { nome: string }) {
  const initials = nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

/* ─── Página ─────────────────────────────────────────────── */
export default function Ferias() {
  const [tab, setTab]         = useState(0)
  const [filtStatus, setFiltStatus] = useState<string>('')
  const [solList, setSolList] = useState<Solicitacao[]>(solicitacoes)

  const tabs = ['Solicitações', 'Calendário', 'Saldos', 'Histórico']

  const pendentes  = solList.filter(s => s.status === 'Pendente').length
  const emFerias   = solList.filter(s => s.status === 'Aprovado' && s.inicio <= '23/05/2026' && s.fim >= '23/05/2026').length
  const alertas    = saldos.filter(s => s.alerta).length
  const mediaSaldo = Math.round(saldos.reduce((a, s) => a + s.saldo, 0) / saldos.length)

  const solFiltradas = solList.filter(s => !filtStatus || s.status === filtStatus)

  function aprovar(id: number) {
    setSolList(prev => prev.map(s => s.id === id ? { ...s, status: 'Aprovado' as StatusSol } : s))
  }
  function recusar(id: number) {
    setSolList(prev => prev.map(s => s.id === id ? { ...s, status: 'Recusado' as StatusSol } : s))
  }

  return (
    <div className="dash-wrap">

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 13, color: 'var(--gray)' }}>
        <Link href="/rh" style={{ color: 'var(--navy)', fontWeight: 600 }}>RH</Link>
        <span>›</span>
        <span>Férias & Ausências</span>
      </div>

      {/* Toolbar */}
      <div className="pg-toolbar">
        <div>
          <p className="pg-title">Férias & Ausências</p>
          <p className="pg-sub">Gestão de solicitações, saldos e calendário de afastamentos</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-outline btn-sm">📤 Exportar</button>
          <button type="button" className="btn btn-navy btn-sm">+ Nova solicitação</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2.5 mb-3">
        <div className="card card-top-orange">
          <p className="card-label">Solicitações pendentes</p>
          <p className="card-val val-gray">{pendentes}</p>
          <p className="card-hint">Aguardam aprovação</p>
        </div>
        <div className="card card-top-green card-bg-green">
          <p className="card-label">Em férias hoje</p>
          <p className="card-val val-green">{emFerias}</p>
          <p className="card-hint">Colaboradores afastados</p>
        </div>
        <div className="card card-top-red">
          <p className="card-label">Saldos a vencer</p>
          <p className="card-val val-red">{alertas}</p>
          <p className="card-hint">Vencendo em 90 dias</p>
        </div>
        <div className="card card-top-navy card-bg-navy">
          <p className="card-label">Saldo médio</p>
          <p className="card-val val-navy">{mediaSaldo} dias</p>
          <p className="card-hint">Por colaborador</p>
        </div>
      </div>

      {/* Alertas */}
      {pendentes > 0 && (
        <div className="alert alert-orange mb-2">
          <span>⏳</span>
          <span><strong>{pendentes} solicitações</strong> aguardam aprovação da diretoria — {solList.filter(s => s.status === 'Pendente').map(s => s.nome.split(' ')[0]).join(', ')}.</span>
        </div>
      )}
      {alertas > 0 && (
        <div className="alert alert-red mb-3">
          <span>⚠️</span>
          <span><strong>{alertas} colaboradores</strong> com saldo de férias vencendo em menos de 90 dias — {saldos.filter(s => s.alerta).map(s => s.nome.split(' ')[0]).join(', ')}.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((t, i) => (
          <div key={t} className={`tab ${i === tab ? 'on' : ''}`} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>

      {/* ── Tab 0: Solicitações ── */}
      {tab === 0 && (
        <div>
          <div className="filter-bar mb-3">
            <select title="Filtrar por status" value={filtStatus} onChange={e => setFiltStatus(e.target.value)}>
              <option value="">Todos os status</option>
              <option>Pendente</option>
              <option>Aprovado</option>
              <option>Recusado</option>
            </select>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Período solicitado</th>
                <th style={{ textAlign: 'center' }}>Dias</th>
                <th>Solicitado em</th>
                <th>Status</th>
                <th>Observação</th>
                <th aria-label="Ações"></th>
              </tr>
            </thead>
            <tbody>
              {solFiltradas.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar nome={s.nome} />
                      <div>
                        <p className="font-semibold" style={{ fontSize: 13 }}>{s.nome}</p>
                        <p style={{ fontSize: 11, color: 'var(--gray)' }}>{s.cargo} · {s.dept}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {s.inicio} <span style={{ color: 'var(--gray)', fontWeight: 400 }}>até</span> {s.fim}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--navy)' }}>{s.dias}</td>
                  <td style={{ color: 'var(--gray)' }}>{s.solicitado}</td>
                  <td>
                    <span className={`badge ${statusBadge[s.status]}`}>
                      {statusEmoji[s.status]} {s.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: s.status === 'Recusado' ? '#c62828' : 'var(--gray)', maxWidth: 200 }}>
                    {s.obs || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {s.status === 'Pendente' && (
                        <>
                          <button type="button" onClick={() => aprovar(s.id)} className="btn btn-green btn-sm">✓ Aprovar</button>
                          <button type="button" onClick={() => recusar(s.id)} className="btn btn-sm" style={{ background: '#fff', color: '#c62828', border: '1px solid #c62828' }}>✕ Recusar</button>
                        </>
                      )}
                      {s.status !== 'Pendente' && (
                        <button type="button" className="btn btn-outline btn-sm">Ver</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab 1: Calendário ── */}
      {tab === 1 && (
        <div className="flex flex-col gap-3">

          {/* Junho */}
          <div className="card">
            <p className="mod-title mb-3">📅 Junho 2026 — Afastamentos programados</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 10 }}>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--gray)', padding: '4px 0' }}>{d}</div>
              ))}
              {/* offset: junho começa na segunda (1) */}
              {[...Array(1)].map((_, i) => <div key={`empty-${i}`} />)}
              {[...Array(30)].map((_, i) => {
                const dia = i + 1
                const emFerias = ferias_calendario.filter(f =>
                  f.mes === 'Junho' && dia >= f.inicio && dia <= f.fim
                )
                return (
                  <div key={dia} style={{
                    padding: '6px 4px', borderRadius: 5, textAlign: 'center', fontSize: 12, fontWeight: 600,
                    background: emFerias.length > 0 ? emFerias[0].cor : 'var(--light)',
                    border: emFerias.length > 0 ? `1px solid ${emFerias[0].borda}` : '1px solid transparent',
                    color: emFerias.length > 0 ? '#374151' : '#6b7280',
                    position: 'relative', cursor: emFerias.length > 0 ? 'pointer' : 'default',
                  }}
                    title={emFerias.length > 0 ? emFerias.map(f => f.nome).join(', ') : ''}
                  >
                    {dia}
                    {emFerias.length > 0 && (
                      <div style={{ fontSize: 8, color: emFerias[0].borda, marginTop: 2, lineHeight: 1.2 }}>
                        {emFerias[0].nome.split(' ')[0]}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legenda */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              {ferias_calendario.filter(f => f.mes === 'Junho').map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: f.cor, border: `1px solid ${f.borda}` }} />
                  <span style={{ color: '#374151' }}>{f.nome}</span>
                  <span style={{ color: 'var(--gray)' }}>{f.inicio}–{f.fim}/06</span>
                </div>
              ))}
            </div>
          </div>

          {/* Próximos afastamentos */}
          <div className="card">
            <p className="mod-title mb-3">🗓️ Próximos afastamentos</p>
            <div className="flex flex-col gap-2">
              {solList.filter(s => s.status !== 'Recusado').map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar nome={s.nome} />
                    <div>
                      <p className="font-semibold" style={{ fontSize: 13 }}>{s.nome}</p>
                      <p style={{ fontSize: 12, color: 'var(--gray)' }}>{s.dept}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{s.inicio} → {s.fim}</p>
                    <p style={{ fontSize: 12, color: 'var(--gray)' }}>{s.dias} dias</p>
                  </div>
                  <span className={`badge ${statusBadge[s.status]}`}>{statusEmoji[s.status]} {s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Saldos ── */}
      {tab === 2 && (
        <div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Departamento</th>
                <th style={{ textAlign: 'center' }}>Direito/ano</th>
                <th style={{ textAlign: 'center' }}>Gozado</th>
                <th style={{ textAlign: 'center' }}>Saldo</th>
                <th>Vencimento</th>
                <th style={{ textAlign: 'center' }}>Situação</th>
                <th aria-label="Ações"></th>
              </tr>
            </thead>
            <tbody>
              {saldos.map((s) => {
                const pct = Math.round((s.gozado / s.direito) * 100)
                return (
                  <tr key={s.nome}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar nome={s.nome} />
                        <span className="font-semibold">{s.nome}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray)' }}>{s.dept}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{s.direito}d</td>
                    <td style={{ textAlign: 'center', color: 'var(--gray)' }}>{s.gozado}d</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: s.saldo > 20 ? 'var(--green)' : s.saldo > 10 ? '#e65100' : '#c62828' }}>
                        {s.saldo}d
                      </span>
                      <div style={{ width: 60, height: 4, borderRadius: 2, background: 'var(--border)', margin: '4px auto 0', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct > 60 ? '#c62828' : 'var(--green)', borderRadius: 2 }} />
                      </div>
                    </td>
                    <td style={{ color: s.alerta ? '#c62828' : 'var(--gray)', fontWeight: s.alerta ? 600 : 400 }}>
                      {s.alerta ? '⚠️ ' : ''}{s.vencimento}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={s.alerta ? 'badge badge-red' : 'badge badge-green'}>
                        {s.alerta ? 'Atenção' : 'Regular'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="btn btn-outline btn-sm">Solicitar</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab 3: Histórico ── */}
      {tab === 3 && (
        <div>
          <div className="filter-bar mb-3">
            <select title="Filtrar por departamento" defaultValue="">
              <option value="">Todos os departamentos</option>
              {['Jurídico', 'Comercial', 'Financeiro', 'TI'].map(d => <option key={d}>{d}</option>)}
            </select>
            <select title="Filtrar por ano" defaultValue="2026">
              <option>2026</option>
              <option>2025</option>
              <option>2024</option>
            </select>
            <button type="button" className="btn btn-outline btn-sm">📤 Exportar CSV</button>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Período gozado</th>
                <th style={{ textAlign: 'center' }}>Dias</th>
                <th>Aprovado por</th>
                <th>Data aprovação</th>
                <th>Status final</th>
              </tr>
            </thead>
            <tbody>
              {[
                { nome: 'Guilherme C. Junqueira', dept: 'Jurídico',   inicio: '10/01/2026', fim: '19/01/2026', dias: 10, aprovador: 'Administrador', aprovado: '05/01/2026', status: 'Concluído' },
                { nome: 'Carlos Eduardo Lima',    dept: 'Comercial',  inicio: '15/02/2026', fim: '19/02/2026', dias:  5, aprovador: 'Administrador', aprovado: '10/02/2026', status: 'Concluído' },
                { nome: 'Fernanda Oliveira',      dept: 'Jurídico',   inicio: '03/03/2026', fim: '12/03/2026', dias: 10, aprovador: 'Administrador', aprovado: '25/02/2026', status: 'Concluído' },
                { nome: 'Ana Paula Souza',        dept: 'Jurídico',   inicio: '20/05/2026', fim: '03/06/2026', dias: 15, aprovador: 'Administrador', aprovado: '05/05/2026', status: 'Em andamento' },
                { nome: 'Roberto Carvalho',       dept: 'TI',         inicio: '04/08/2026', fim: '17/08/2026', dias: 14, aprovador: 'Administrador', aprovado: '20/05/2026', status: 'Aprovado' },
              ].map((h, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar nome={h.nome} />
                      <div>
                        <p className="font-semibold" style={{ fontSize: 13 }}>{h.nome}</p>
                        <p style={{ fontSize: 11, color: 'var(--gray)' }}>{h.dept}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {h.inicio} <span style={{ color: 'var(--gray)', fontWeight: 400 }}>até</span> {h.fim}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--navy)' }}>{h.dias}</td>
                  <td style={{ color: 'var(--gray)' }}>{h.aprovador}</td>
                  <td style={{ color: 'var(--gray)' }}>{h.aprovado}</td>
                  <td>
                    <span className={
                      h.status === 'Concluído'     ? 'badge badge-gray'  :
                      h.status === 'Em andamento'  ? 'badge badge-navy'  :
                      'badge badge-green'
                    }>{h.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
