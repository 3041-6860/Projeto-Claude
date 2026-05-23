'use client'
import { useState } from 'react'
import Link from 'next/link'

/* ─── Tipos ──────────────────────────────────────────────── */
type Status = 'Presente' | 'Atrasado' | 'Ausente' | 'Home Office' | 'Férias'

interface Registro {
  nome: string
  cargo: string
  dept: string
  previsto: string
  entrada: string | null
  saida: string | null
  status: Status
  obs: string
}

/* ─── Mock — Hoje ────────────────────────────────────────── */
const hoje: Registro[] = [
  { nome: 'Guilherme C. Junqueira', cargo: 'Advogado Sênior',    dept: 'Jurídico',   previsto: '08:00', entrada: '07:58', saida: null,    status: 'Presente',   obs: '' },
  { nome: 'Fernanda Oliveira',      cargo: 'Advogada Plena',      dept: 'Jurídico',   previsto: '08:00', entrada: '08:23', saida: null,    status: 'Atrasado',   obs: '' },
  { nome: 'Ana Paula Souza',        cargo: 'Advogada Associada',  dept: 'Jurídico',   previsto: '08:00', entrada: null,    saida: null,    status: 'Férias',     obs: 'Férias aprovadas 20/05–03/06' },
  { nome: 'Carlos Eduardo Lima',    cargo: 'Gerente Comercial',   dept: 'Comercial',  previsto: '09:00', entrada: '09:02', saida: null,    status: 'Presente',   obs: '' },
  { nome: 'Mariana Santos',         cargo: 'Analista Financeira', dept: 'Financeiro', previsto: '08:00', entrada: null,    saida: null,    status: 'Ausente',    obs: 'Sem justificativa' },
  { nome: 'Roberto Carvalho',       cargo: 'Técnico de TI',       dept: 'TI',         previsto: '08:00', entrada: '08:05', saida: null,    status: 'Presente',   obs: '' },
  { nome: 'Patrícia Nunes',         cargo: 'Assistente Jurídico', dept: 'Jurídico',   previsto: '08:00', entrada: '08:00', saida: null,    status: 'Home Office',obs: 'Home office autorizado' },
  { nome: 'André Martins',          cargo: 'Estagiário',          dept: 'Jurídico',   previsto: '13:00', entrada: '13:01', saida: null,    status: 'Presente',   obs: '' },
  { nome: 'Operacional GCJ',        cargo: 'Operacional',         dept: 'Adm',        previsto: '08:00', entrada: '07:55', saida: null,    status: 'Presente',   obs: '' },
]

/* ─── Mock — Semana ──────────────────────────────────────── */
const dias = ['Seg 19/05', 'Ter 20/05', 'Qua 21/05', 'Qui 22/05', 'Sex 23/05']
type DiaStatus = 'P' | 'A' | 'At' | 'HO' | 'F' | '-'
interface SemanaRow { nome: string; dept: string; dias: DiaStatus[]; horasSemana: number }

const semana: SemanaRow[] = [
  { nome: 'Guilherme C. Junqueira', dept: 'Jurídico',   dias: ['P', 'P', 'P', 'P', 'P'],   horasSemana: 40 },
  { nome: 'Fernanda Oliveira',      dept: 'Jurídico',   dias: ['P', 'At', 'P', 'P', 'At'],  horasSemana: 38 },
  { nome: 'Ana Paula Souza',        dept: 'Jurídico',   dias: ['F', 'F', 'F', 'F', 'F'],    horasSemana: 0  },
  { nome: 'Carlos Eduardo Lima',    dept: 'Comercial',  dias: ['P', 'P', 'HO', 'P', 'P'],   horasSemana: 40 },
  { nome: 'Mariana Santos',         dept: 'Financeiro', dias: ['P', 'P', 'P', 'P', 'A'],    horasSemana: 32 },
  { nome: 'Roberto Carvalho',       dept: 'TI',         dias: ['P', 'P', 'P', 'P', 'P'],    horasSemana: 40 },
  { nome: 'Patrícia Nunes',         dept: 'Jurídico',   dias: ['P', 'P', 'HO', 'HO', 'HO'], horasSemana: 40 },
  { nome: 'André Martins',          dept: 'Jurídico',   dias: ['P', 'P', 'P', 'P', 'P'],    horasSemana: 20 },
]

/* ─── Mock — Banco de Horas ──────────────────────────────── */
interface BancoRow { nome: string; dept: string; extras: number; debito: number; saldo: number }
const banco: BancoRow[] = [
  { nome: 'Guilherme C. Junqueira', dept: 'Jurídico',   extras: 12.5, debito: 0,   saldo: 12.5  },
  { nome: 'Fernanda Oliveira',      dept: 'Jurídico',   extras: 6.0,  debito: 1.5, saldo: 4.5   },
  { nome: 'Carlos Eduardo Lima',    dept: 'Comercial',  extras: 8.0,  debito: 0,   saldo: 8.0   },
  { nome: 'Mariana Santos',         dept: 'Financeiro', extras: 2.0,  debito: 8.0, saldo: -6.0  },
  { nome: 'Roberto Carvalho',       dept: 'TI',         extras: 14.0, debito: 0,   saldo: 14.0  },
  { nome: 'Patrícia Nunes',         dept: 'Jurídico',   extras: 0,    debito: 0,   saldo: 0     },
  { nome: 'André Martins',          dept: 'Jurídico',   extras: 1.0,  debito: 3.0, saldo: -2.0  },
]

/* ─── Helpers visuais ────────────────────────────────────── */
const statusBadge: Record<Status, string> = {
  'Presente':   'badge-green',
  'Atrasado':   'badge-orange',
  'Ausente':    'badge-red',
  'Home Office':'badge-navy',
  'Férias':     'badge-gray',
}
const statusEmoji: Record<Status, string> = {
  'Presente': '✅', 'Atrasado': '⚠️', 'Ausente': '❌', 'Home Office': '🏠', 'Férias': '🌴',
}
const diaStyle: Record<DiaStatus, { bg: string; color: string; label: string }> = {
  'P':  { bg: '#eaf3e5', color: '#4d7a38', label: 'P'  },
  'At': { bg: '#fff3e0', color: '#bf360c', label: 'At' },
  'A':  { bg: '#fce8e8', color: '#c62828', label: 'A'  },
  'HO': { bg: '#e8edf5', color: '#1F3763', label: 'HO' },
  'F':  { bg: '#f0f0f0', color: '#606062', label: 'F'  },
  '-':  { bg: '#f9f9f9', color: '#ccc',    label: '—'  },
}

function calcHoras(entrada: string | null, saida: string | null): string {
  if (!entrada) return '—'
  const [eh, em] = entrada.split(':').map(Number)
  const agora = saida ? saida.split(':').map(Number) : [17, 0]
  const mins = (agora[0] * 60 + agora[1]) - (eh * 60 + em) - 60 // -60 = intervalo almoço
  if (mins <= 0) return '—'
  return `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`
}

function Avatar({ nome }: { nome: string }) {
  const initials = nome.split(' ').map(n => n[0]).slice(0, 2).join('')
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

/* ─── Página ─────────────────────────────────────────────── */
export default function PontoEletronico() {
  const [tab, setTab]       = useState(0)
  const [filtDept, setFiltDept] = useState('')
  const [filtStatus, setFiltStatus] = useState('')
  const tabs = ['Hoje', 'Semana', 'Banco de Horas', 'Relatório']

  // KPIs de hoje
  const presentes   = hoje.filter(r => r.status === 'Presente' || r.status === 'Home Office').length
  const atrasados   = hoje.filter(r => r.status === 'Atrasado').length
  const ausentes    = hoje.filter(r => r.status === 'Ausente').length
  const totalExtras = banco.reduce((acc, b) => acc + (b.saldo > 0 ? b.saldo : 0), 0)

  const registrosFiltrados = hoje.filter(r =>
    (!filtDept   || r.dept === filtDept) &&
    (!filtStatus || r.status === filtStatus)
  )

  const depts = [...new Set(hoje.map(r => r.dept))]

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
          <p className="pg-sub">Controle de entrada e saída · Sexta-feira, 23 de maio de 2026</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm">📤 Exportar</button>
          <button className="btn btn-navy btn-sm">+ Registrar manualmente</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2.5 mb-3">
        <div className="card card-top-green card-bg-green">
          <p className="card-label">Presentes hoje</p>
          <p className="card-val val-green">{presentes}</p>
          <p className="card-hint">Inclui home office</p>
        </div>
        <div className="card card-top-orange">
          <p className="card-label">Atrasos</p>
          <p className="card-val val-gray">{atrasados}</p>
          <p className="card-hint">Entradas após horário</p>
        </div>
        <div className="card card-top-red">
          <p className="card-label">Ausentes</p>
          <p className="card-val val-red">{ausentes}</p>
          <p className="card-hint">Sem justificativa</p>
        </div>
        <div className="card card-top-navy card-bg-navy">
          <p className="card-label">Banco de horas</p>
          <p className="card-val val-navy">{totalExtras.toFixed(1)}h</p>
          <p className="card-hint">Saldo positivo acumulado</p>
        </div>
      </div>

      {/* Alerta ausência */}
      {ausentes > 0 && (
        <div className="alert alert-red mb-3">
          <span>❌</span>
          <span><strong>{ausentes} colaborador{ausentes > 1 ? 'es' : ''}</strong> {ausentes > 1 ? 'estão' : 'está'} ausente{ausentes > 1 ? 's' : ''} sem justificativa hoje — {hoje.filter(r => r.status === 'Ausente').map(r => r.nome.split(' ')[0]).join(', ')}.</span>
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
        <div>
          <div className="filter-bar mb-3">
            <select value={filtDept} onChange={e => setFiltDept(e.target.value)}>
              <option value="">Todos os departamentos</option>
              {depts.map(d => <option key={d}>{d}</option>)}
            </select>
            <select value={filtStatus} onChange={e => setFiltStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {(['Presente', 'Atrasado', 'Ausente', 'Home Office', 'Férias'] as Status[]).map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Depto.</th>
                <th>Previsto</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>Trabalhado</th>
                <th>Status</th>
                <th>Obs.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.map((r) => (
                <tr key={r.nome}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar nome={r.nome} />
                      <div>
                        <p className="font-semibold" style={{ fontSize: 13 }}>{r.nome}</p>
                        <p style={{ fontSize: 11, color: 'var(--gray)' }}>{r.cargo}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--gray)' }}>{r.dept}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.previsto}</td>
                  <td style={{ fontFamily: 'monospace', color: r.entrada ? (r.status === 'Atrasado' ? '#e65100' : 'var(--green)') : 'var(--gray)' }}>
                    {r.entrada ?? '—'}
                  </td>
                  <td style={{ fontFamily: 'monospace', color: r.saida ? '#374151' : 'var(--gray)' }}>
                    {r.saida ?? '—'}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--navy)' }}>
                    {calcHoras(r.entrada, r.saida)}
                  </td>
                  <td>
                    <span className={`badge ${statusBadge[r.status]}`}>
                      {statusEmoji[r.status]} {r.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--gray)', maxWidth: 160 }}>{r.obs || '—'}</td>
                  <td>
                    <button className="btn btn-outline btn-sm">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab 1: Semana ── */}
      {tab === 1 && (
        <div>
          <div className="flex gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
            {[
              { label: 'P', desc: 'Presente',    bg: '#eaf3e5', color: '#4d7a38' },
              { label: 'At', desc: 'Atrasado',   bg: '#fff3e0', color: '#bf360c' },
              { label: 'A', desc: 'Ausente',     bg: '#fce8e8', color: '#c62828' },
              { label: 'HO', desc: 'Home Office',bg: '#e8edf5', color: '#1F3763' },
              { label: 'F', desc: 'Férias',      bg: '#f0f0f0', color: '#606062' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span style={{ display: 'inline-block', width: 24, height: 24, borderRadius: 4, background: l.bg, color: l.color, fontWeight: 700, textAlign: 'center', lineHeight: '24px', fontSize: 11 }}>{l.label}</span>
                <span style={{ color: 'var(--gray)' }}>{l.desc}</span>
              </div>
            ))}
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Depto.</th>
                {dias.map(d => <th key={d} style={{ textAlign: 'center' }}>{d}</th>)}
                <th style={{ textAlign: 'center' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {semana.map((r) => (
                <tr key={r.nome}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar nome={r.nome} />
                      <span className="font-semibold">{r.nome}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--gray)' }}>{r.dept}</td>
                  {r.dias.map((d, i) => {
                    const s = diaStyle[d]
                    return (
                      <td key={i} style={{ textAlign: 'center', padding: '8px 4px' }}>
                        <span style={{ display: 'inline-block', width: 28, height: 28, borderRadius: 5, background: s.bg, color: s.color, fontWeight: 700, textAlign: 'center', lineHeight: '28px', fontSize: 11 }}>
                          {s.label}
                        </span>
                      </td>
                    )
                  })}
                  <td style={{ textAlign: 'center', fontWeight: 700, color: r.horasSemana >= 40 ? 'var(--green)' : r.horasSemana === 0 ? 'var(--gray)' : '#e65100' }}>
                    {r.horasSemana}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab 2: Banco de Horas ── */}
      {tab === 2 && (
        <div>
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            <div className="card card-top-green">
              <p className="card-label">Total horas extras</p>
              <p className="card-val val-green">{banco.reduce((a, b) => a + b.extras, 0).toFixed(1)}h</p>
              <p className="card-hint">Acumulado no mês</p>
            </div>
            <div className="card card-top-red">
              <p className="card-label">Total em débito</p>
              <p className="card-val val-red">{banco.reduce((a, b) => a + b.debito, 0).toFixed(1)}h</p>
              <p className="card-hint">Horas a compensar</p>
            </div>
            <div className="card card-top-navy">
              <p className="card-label">Saldo geral</p>
              <p className="card-val val-navy">{banco.reduce((a, b) => a + b.saldo, 0).toFixed(1)}h</p>
              <p className="card-hint">Positivo = crédito</p>
            </div>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Departamento</th>
                <th style={{ textAlign: 'right' }}>Horas extras</th>
                <th style={{ textAlign: 'right' }}>Em débito</th>
                <th style={{ textAlign: 'right' }}>Saldo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {banco.map((b) => (
                <tr key={b.nome}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar nome={b.nome} />
                      <span className="font-semibold">{b.nome}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--gray)' }}>{b.dept}</td>
                  <td style={{ textAlign: 'right', color: 'var(--green)', fontWeight: 600 }}>+{b.extras.toFixed(1)}h</td>
                  <td style={{ textAlign: 'right', color: b.debito > 0 ? '#c62828' : 'var(--gray)', fontWeight: 600 }}>
                    {b.debito > 0 ? `-${b.debito.toFixed(1)}h` : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: b.saldo > 0 ? 'var(--green)' : b.saldo < 0 ? '#c62828' : 'var(--gray)' }}>
                    {b.saldo > 0 ? `+${b.saldo.toFixed(1)}h` : b.saldo < 0 ? `${b.saldo.toFixed(1)}h` : '0h'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-outline btn-sm">Histórico</button>
                      <button className="btn btn-outline btn-sm">Ajustar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab 3: Relatório ── */}
      {tab === 3 && (
        <div className="flex flex-col gap-3">

          {/* Filtros de período */}
          <div className="card">
            <p className="card-label mb-2">Período de análise</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <select defaultValue="maio-2026" style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: 13 }}>
                <option value="maio-2026">Maio 2026</option>
                <option value="abril-2026">Abril 2026</option>
                <option value="marco-2026">Março 2026</option>
              </select>
              <select defaultValue="" style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: 13 }}>
                <option value="">Todos os departamentos</option>
                {depts.map(d => <option key={d}>{d}</option>)}
              </select>
              <button className="btn btn-navy btn-sm">Gerar relatório</button>
              <button className="btn btn-outline btn-sm">📤 Exportar CSV</button>
            </div>
          </div>

          {/* Métricas do mês */}
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { label: 'Pontualidade',      val: '87%',  hint: 'Entradas no horário',      cor: 'val-green' },
              { label: 'Taxa de presença',  val: '94%',  hint: 'Dias úteis trabalhados',   cor: 'val-navy'  },
              { label: 'Média diária',      val: '7h52', hint: 'Horas por colaborador/dia', cor: 'val-navy'  },
              { label: 'Absenteísmo',       val: '2,1%', hint: 'Abaixo da meta de 5%',     cor: 'val-green' },
            ].map(m => (
              <div key={m.label} className="card card-top-navy">
                <p className="card-label">{m.label}</p>
                <p className={`card-val ${m.cor}`} style={{ fontSize: 22 }}>{m.val}</p>
                <p className="card-hint">{m.hint}</p>
              </div>
            ))}
          </div>

          {/* Ranking pontualidade */}
          <div className="card">
            <p className="mod-title mb-3">🏆 Ranking de Pontualidade — Maio 2026</p>
            <table className="tbl">
              <thead>
                <tr><th>#</th><th>Colaborador</th><th>Departamento</th><th style={{ textAlign: 'right' }}>Entradas no horário</th><th style={{ textAlign: 'right' }}>Atrasos</th><th style={{ textAlign: 'right' }}>Pontualidade</th></tr>
              </thead>
              <tbody>
                {[
                  { pos: 1, nome: 'Roberto Carvalho',       dept: 'TI',         ok: 22, at: 0,  pct: 100 },
                  { pos: 2, nome: 'Guilherme C. Junqueira', dept: 'Jurídico',   ok: 21, at: 1,  pct: 95  },
                  { pos: 3, nome: 'Carlos Eduardo Lima',    dept: 'Comercial',  ok: 20, at: 2,  pct: 91  },
                  { pos: 4, nome: 'Patrícia Nunes',         dept: 'Jurídico',   ok: 19, at: 3,  pct: 86  },
                  { pos: 5, nome: 'Fernanda Oliveira',      dept: 'Jurídico',   ok: 17, at: 5,  pct: 77  },
                  { pos: 6, nome: 'André Martins',          dept: 'Jurídico',   ok: 16, at: 4,  pct: 80  },
                  { pos: 7, nome: 'Mariana Santos',         dept: 'Financeiro', ok: 14, at: 3,  pct: 82  },
                ].map(r => (
                  <tr key={r.nome}>
                    <td style={{ fontWeight: 700, color: r.pos <= 3 ? '#e65100' : 'var(--gray)' }}>
                      {r.pos === 1 ? '🥇' : r.pos === 2 ? '🥈' : r.pos === 3 ? '🥉' : r.pos}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar nome={r.nome} />
                        <span className="font-semibold">{r.nome}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray)' }}>{r.dept}</td>
                    <td style={{ textAlign: 'right', color: 'var(--green)', fontWeight: 600 }}>{r.ok} dias</td>
                    <td style={{ textAlign: 'right', color: r.at > 3 ? '#c62828' : 'var(--gray)' }}>{r.at}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                        <div style={{ width: 60, height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: r.pct >= 90 ? 'var(--green)' : r.pct >= 75 ? '#e65100' : '#c62828', width: `${r.pct}%` }} />
                        </div>
                        <span style={{ fontWeight: 700, color: r.pct >= 90 ? 'var(--green)' : r.pct >= 75 ? '#e65100' : '#c62828', minWidth: 36 }}>{r.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
