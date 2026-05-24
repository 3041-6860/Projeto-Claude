'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

/* ─── Tipos espelhados de /tarefas ───────────────────────────── */
type Status   = 'A Fazer' | 'Em Andamento' | 'Em Revisão' | 'Concluído'
type Priority = 'Urgente' | 'Alta' | 'Média' | 'Baixa'

interface Task {
  id: string; titulo: string; status: Status; prioridade: Priority
  criador: string; responsavel: string; participantes: string[]
  dataInicio: string; prazo: string
  vinculoTipo: string; vinculoNome: string
  subtarefas: { feita: boolean }[]; checklist: { feito: boolean }[]
  tags: string[]; estimativa: string; horasGastas: string
}

/* ─── Referência de colaboradores ───────────────────────────── */
const COLAB = [
  'Guilherme C. Junqueira', 'Fernanda Oliveira', 'Ana Paula Souza',
  'Bruno Alves', 'Carlos Eduardo Lima', 'Mariana Santos', 'Roberto Carvalho',
]
const EMP: Record<string, { cargo: string; dept: string; cor: string }> = {
  'Guilherme C. Junqueira': { cargo: 'Sócio Principal / CEO',  dept: 'Diretoria',  cor: '#1F3763' },
  'Fernanda Oliveira':      { cargo: 'Advogada Sênior',        dept: 'Jurídico',   cor: '#1F3763' },
  'Ana Paula Souza':        { cargo: 'Advogada Associada',     dept: 'Jurídico',   cor: '#1F3763' },
  'Bruno Alves':            { cargo: 'Advogado Associado',     dept: 'Jurídico',   cor: '#1F3763' },
  'Carlos Eduardo Lima':    { cargo: 'Gerente Comercial',      dept: 'Comercial',  cor: '#e65100' },
  'Mariana Santos':         { cargo: 'Analista Financeira',    dept: 'Financeiro', cor: '#0059b3' },
  'Roberto Carvalho':       { cargo: 'Técnico de TI',          dept: 'TI',         cor: '#4a148c' },
}

/* ─── Constantes ─────────────────────────────────────────────── */
const STORAGE  = 'inove-tarefas-v2'
const PERIODS  = ['Todos', 'Este Mês', 'Últimos 30 dias', 'Últimos 3 Meses']
const STATUSES: Status[]   = ['A Fazer', 'Em Andamento', 'Em Revisão', 'Concluído']
const STATUS_CLR: Record<Status, string> = {
  'A Fazer':      '#6b7280',
  'Em Andamento': '#e65100',
  'Em Revisão':   '#1F3763',
  'Concluído':    '#62974B',
}
const PRIO_CLS: Record<Priority, string> = {
  Urgente: 'badge badge-red', Alta: 'badge badge-orange',
  Média:   'badge badge-navy', Baixa: 'badge badge-gray',
}
const PRIO_CLR: Record<Priority, string> = {
  Urgente: '#dc2626', Alta: '#e65100', Média: '#1F3763', Baixa: '#6b7280',
}
const TAG_CLR: Record<string, string> = {
  Jurídico: '#1F3763', Financeiro: '#0059b3', Urgente: '#dc2626',
  Cliente:  '#e65100', Interno:    '#6b7280', Marketing: '#7c3aed',
  RH:       '#62974B', TI:         '#4a148c',
}

/* ─── Helpers ────────────────────────────────────────────────── */
function inPeriod(prazo: string, period: string): boolean {
  if (period === 'Todos' || !prazo) return true
  const d   = new Date(prazo)
  const now = new Date()
  if (period === 'Este Mês')
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  if (period === 'Últimos 30 dias')
    return d >= new Date(now.getTime() - 30 * 864e5)
  if (period === 'Últimos 3 Meses')
    return d >= new Date(now.getTime() - 90 * 864e5)
  return true
}
function isLate(t: Task) {
  return !!t.prazo && new Date(t.prazo) < new Date() && t.status !== 'Concluído'
}
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—' }

function Avatar({ nome, size = 40, bg = '#1F3763' }: { nome: string; size?: number; bg?: string }) {
  const initials = nome.split(' ').filter(n => n.length > 1).map(n => n[0]).slice(0, 2).join('')
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.3, fontWeight: 700,
    }}>{initials || '?'}</div>
  )
}

function HBar({ val, max, color }: { val: number; max: number; color: string }) {
  const pct = max > 0 ? (val / max) * 100 : 0
  return (
    <div style={{ height: 8, borderRadius: 4, background: '#e5e7eb', overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width .5s' }} />
    </div>
  )
}

/* ─── Componente ─────────────────────────────────────────────── */
export default function RelatoriosRH() {
  const [tasks,    setTasks]   = useState<Task[]>([])
  const [selected, setSelected] = useState(COLAB[0])
  const [period,   setPeriod]  = useState('Todos')
  const [tab,      setTab]     = useState(0)

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE); if (s) setTasks(JSON.parse(s)) } catch {}
  }, [])

  /* ── Segmentação das tarefas ──── */
  const myTasks   = tasks.filter(t => t.responsavel === selected && inPeriod(t.prazo, period))
  const partTasks = tasks.filter(t => t.participantes.includes(selected) && t.responsavel !== selected && inPeriod(t.prazo, period))
  const delegTasks= tasks.filter(t => t.criador === selected && t.responsavel !== selected && inPeriod(t.prazo, period))

  const active = tab === 0 ? myTasks : tab === 1 ? partTasks : delegTasks

  /* ── Métricas ──── */
  const totalEst   = myTasks.reduce((a, t) => a + (Number(t.estimativa)  || 0), 0)
  const totalGasto = myTasks.reduce((a, t) => a + (Number(t.horasGastas) || 0), 0)
  const concluidas = myTasks.filter(t => t.status === 'Concluído').length
  const atrasadas  = myTasks.filter(isLate).length
  const taxa       = myTasks.length > 0 ? Math.round(concluidas / myTasks.length * 100) : 0
  const subDoneAll = myTasks.reduce((a, t) => a + t.subtarefas.filter(s => s.feita).length, 0)
  const subTotAll  = myTasks.reduce((a, t) => a + t.subtarefas.length, 0)
  const chkDoneAll = myTasks.reduce((a, t) => a + t.checklist.filter(c => c.feito).length, 0)
  const chkTotAll  = myTasks.reduce((a, t) => a + t.checklist.length, 0)

  const byStatus = STATUSES.map(s => ({ status: s, count: myTasks.filter(t => t.status === s).length }))
  const byPrio   = (['Urgente', 'Alta', 'Média', 'Baixa'] as Priority[]).map(p => ({
    prio: p, count: myTasks.filter(t => t.prioridade === p).length,
  }))

  /* vínculos únicos trabalhados */
  const vinculosUnicos = Array.from(new Set(myTasks.filter(t => t.vinculoNome).map(t => `${t.vinculoTipo}|${t.vinculoNome}`)))
    .map(v => { const [tipo, nome] = v.split('|'); return { tipo, nome } })

  const info = EMP[selected] || { cargo: 'Colaborador', dept: 'Geral', cor: '#6b7280' }

  return (
    <div className="dash-wrap">

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 13, color: 'var(--gray)' }}>
        <Link href="/rh" style={{ color: 'var(--navy)', fontWeight: 600 }}>RH</Link>
        <span>›</span>
        <span>Relatórios de Trabalho</span>
      </div>

      {/* Toolbar */}
      <div className="pg-toolbar">
        <div>
          <p className="pg-title">Relatórios de Trabalho</p>
          <p className="pg-sub">Desempenho individual por colaborador · baseado nas Tarefas</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="feed-input" style={{ width: 210 }} value={selected}
            onChange={e => setSelected(e.target.value)} title="Colaborador">
            {COLAB.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="feed-input" style={{ width: 170 }} value={period}
            onChange={e => setPeriod(e.target.value)} title="Período">
            {PERIODS.map(p => <option key={p}>{p}</option>)}
          </select>
          <button type="button" className="btn btn-outline btn-sm">📤 Exportar PDF</button>
        </div>
      </div>

      {/* Card do colaborador */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', marginBottom: 16, borderLeft: `4px solid ${info.cor}` }}>
        <Avatar nome={selected} size={52} bg={info.cor} />
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{selected}</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--gray)' }}>{info.cargo} · {info.dept}</p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--gray)' }}>Período: <strong>{period}</strong></p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--gray)' }}>
            {myTasks.length} como responsável · {partTasks.length} como participante
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3" style={{ marginBottom: 16 }}>
        {[
          { label: 'Atribuídas',       val: String(myTasks.length),  color: 'var(--navy)' },
          { label: 'Concluídas',       val: String(concluidas),      color: '#62974B'     },
          { label: 'Em Andamento',     val: String(myTasks.filter(t => t.status === 'Em Andamento').length), color: '#e65100' },
          { label: 'Atrasadas',        val: String(atrasadas),       color: atrasadas > 0 ? '#dc2626' : '#6b7280' },
          { label: 'Conclusão',        val: `${taxa}%`,              color: taxa >= 70 ? '#62974B' : taxa >= 40 ? '#e65100' : '#dc2626' },
        ].map(k => (
          <div key={k.label} className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: k.color }}>{k.val}</p>
            <p className="card-label" style={{ marginTop: 4, fontSize: 11 }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Gráficos + Horas */}
      <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 16 }}>

        {/* Por Status */}
        <div className="card">
          <p className="card-label" style={{ marginBottom: 12 }}>Por Status</p>
          {byStatus.map(({ status, count }) => (
            <div key={status} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: STATUS_CLR[status], fontWeight: 600 }}>{status}</span>
                <span style={{ color: 'var(--gray)' }}>{count}</span>
              </div>
              <HBar val={count} max={myTasks.length} color={STATUS_CLR[status]} />
            </div>
          ))}
        </div>

        {/* Por Prioridade */}
        <div className="card">
          <p className="card-label" style={{ marginBottom: 12 }}>Por Prioridade</p>
          {byPrio.map(({ prio, count }) => (
            <div key={prio} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: PRIO_CLR[prio], fontWeight: 600 }}>{prio}</span>
                <span style={{ color: 'var(--gray)' }}>{count}</span>
              </div>
              <HBar val={count} max={myTasks.length} color={PRIO_CLR[prio]} />
            </div>
          ))}
        </div>

        {/* Horas */}
        <div className="card">
          <p className="card-label" style={{ marginBottom: 12 }}>⏱ Horas</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#f0f4ff' }}>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--navy)' }}>{totalEst.toFixed(1)}h</p>
              <p className="card-hint" style={{ margin: 0 }}>Estimadas</p>
            </div>
            <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: totalGasto > totalEst ? '#fff1f1' : '#f0fdf4' }}>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: totalGasto > totalEst ? '#dc2626' : '#62974B' }}>
                {totalGasto.toFixed(1)}h
              </p>
              <p className="card-hint" style={{ margin: 0 }}>Realizadas</p>
            </div>
            {totalEst > 0 && (
              <p style={{
                margin: 0, textAlign: 'center', fontSize: 12, fontWeight: 600, padding: '6px 10px', borderRadius: 6,
                background: totalGasto > totalEst ? '#fee2e2' : '#dcfce7',
                color: totalGasto > totalEst ? '#dc2626' : '#16a34a',
              }}>
                {totalGasto > totalEst
                  ? `⚠️ Excedeu ${(totalGasto - totalEst).toFixed(1)}h`
                  : `✅ Saldo: +${(totalEst - totalGasto).toFixed(1)}h`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subtarefas + Checklist + Vínculos */}
      <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 16 }}>

        <div className="card">
          <p className="card-label" style={{ marginBottom: 10 }}>✅ Subtarefas</p>
          {subTotAll > 0 ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ fontWeight: 700, fontSize: 22, color: 'var(--navy)' }}>
                  {subDoneAll}<span style={{ fontSize: 14, color: 'var(--gray)', fontWeight: 400 }}>/{subTotAll}</span>
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#62974B', alignSelf: 'flex-end' }}>
                  {Math.round(subDoneAll / subTotAll * 100)}%
                </span>
              </div>
              <HBar val={subDoneAll} max={subTotAll} color="#62974B" />
            </>
          ) : <p className="card-hint">Sem subtarefas no período</p>}
        </div>

        <div className="card">
          <p className="card-label" style={{ marginBottom: 10 }}>📋 Checklist</p>
          {chkTotAll > 0 ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ fontWeight: 700, fontSize: 22, color: 'var(--navy)' }}>
                  {chkDoneAll}<span style={{ fontSize: 14, color: 'var(--gray)', fontWeight: 400 }}>/{chkTotAll}</span>
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#62974B', alignSelf: 'flex-end' }}>
                  {Math.round(chkDoneAll / chkTotAll * 100)}%
                </span>
              </div>
              <HBar val={chkDoneAll} max={chkTotAll} color="#62974B" />
            </>
          ) : <p className="card-hint">Sem checklist no período</p>}
        </div>

        <div className="card">
          <p className="card-label" style={{ marginBottom: 10 }}>🔗 Clientes / Negócios</p>
          {vinculosUnicos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {vinculosUnicos.map(v => (
                <div key={v.nome} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span>{v.tipo === 'lead' ? '🙋' : '💼'}</span>
                  <span style={{ color: '#374151' }}>{v.nome}</span>
                </div>
              ))}
            </div>
          ) : <p className="card-hint">Nenhum vínculo no período</p>}
        </div>
      </div>

      {/* Tabs de tarefas */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 14, borderBottom: '1px solid var(--border)' }}>
        {[
          { label: `Responsável`,  count: myTasks.length    },
          { label: `Participei`,   count: partTasks.length  },
          { label: `Delegações`,   count: delegTasks.length },
        ].map((t, i) => (
          <button key={i} type="button"
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer',
              borderBottom: tab === i ? '2px solid var(--navy)' : '2px solid transparent',
              color: tab === i ? 'var(--navy)' : 'var(--gray)',
              marginBottom: -1,
            }}
            onClick={() => setTab(i)}>
            {t.label}
            <span style={{
              marginLeft: 6, fontSize: 11, background: tab === i ? 'var(--navy)' : '#e5e7eb',
              color: tab === i ? '#fff' : '#6b7280', borderRadius: 10, padding: '1px 6px',
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Tabela de tarefas */}
      {active.length === 0 ? (
        <div className="card txt-center p-xl">
          <p style={{ fontSize: 32, marginBottom: 8 }}>
            {tab === 0 ? '📋' : tab === 1 ? '👥' : '📤'}
          </p>
          <p className="pg-sub">
            {tab === 0
              ? 'Nenhuma tarefa atribuída a este colaborador no período.'
              : tab === 1
              ? 'Nenhuma tarefa como participante no período.'
              : 'Nenhuma delegação registrada no período.'}
          </p>
          <Link href="/tarefas"
            className="btn btn-navy btn-sm"
            style={{ marginTop: 14, display: 'inline-block' }}>
            Ir para Tarefas →
          </Link>
        </div>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Tarefa</th>
              <th>Prioridade</th>
              <th>Status</th>
              {tab === 2 && <th>Responsável</th>}
              <th>Prazo</th>
              <th>Estimativa</th>
              <th>Realizado</th>
              <th>Progresso</th>
            </tr>
          </thead>
          <tbody>
            {active.map(task => {
              const late    = isLate(task)
              const subDone = task.subtarefas.filter(s => s.feita).length
              const subTot  = task.subtarefas.length
              const chkDone = task.checklist.filter(c => c.feito).length
              const chkTot  = task.checklist.length
              const overEst = task.estimativa && task.horasGastas &&
                Number(task.horasGastas) > Number(task.estimativa)
              return (
                <tr key={task.id}>
                  <td style={{ maxWidth: 280 }}>
                    <p className="font-semibold" style={{ marginBottom: 2 }}>{task.titulo}</p>
                    {task.vinculoNome && (
                      <p className="card-hint" style={{ marginBottom: 3 }}>
                        {task.vinculoTipo === 'lead' ? '🙋' : '💼'} {task.vinculoNome}
                      </p>
                    )}
                    <div>
                      {task.tags.map(tag => (
                        <span key={tag} className="badge"
                          style={{ background: TAG_CLR[tag] || '#6b7280', color: '#fff', marginRight: 3, fontSize: 10 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={PRIO_CLS[task.prioridade]}>{task.prioridade}</span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: STATUS_CLR[task.status], color: '#fff' }}>
                      {task.status}
                    </span>
                  </td>
                  {tab === 2 && <td className="card-hint">{task.responsavel || '—'}</td>}
                  <td className="card-hint" style={late ? { color: '#dc2626', fontWeight: 600 } : {}}>
                    {fmtDate(task.prazo)}
                    {late && <><br /><span className="badge badge-red" style={{ fontSize: 10 }}>Atrasada</span></>}
                  </td>
                  <td className="card-hint" style={{ textAlign: 'center' }}>
                    {task.estimativa ? `${task.estimativa}h` : '—'}
                  </td>
                  <td className="card-hint" style={{ textAlign: 'center', color: overEst ? '#dc2626' : 'inherit', fontWeight: overEst ? 600 : 400 }}>
                    {task.horasGastas ? `${task.horasGastas}h` : '—'}
                    {overEst && <><br /><span style={{ fontSize: 10, color: '#dc2626' }}>⚠️ excedido</span></>}
                  </td>
                  <td style={{ minWidth: 110 }}>
                    {(subTot > 0 || chkTot > 0) ? (
                      <div>
                        {subTot > 0 && (
                          <div style={{ marginBottom: 4 }}>
                            <div style={{ height: 5, borderRadius: 3, background: '#e5e7eb', overflow: 'hidden', width: 90 }}>
                              <div style={{ height: '100%', width: `${subDone / subTot * 100}%`, background: 'var(--navy)' }} />
                            </div>
                            <span style={{ fontSize: 10, color: 'var(--gray)' }}>{subDone}/{subTot} sub</span>
                          </div>
                        )}
                        {chkTot > 0 && (
                          <div>
                            <div style={{ height: 5, borderRadius: 3, background: '#e5e7eb', overflow: 'hidden', width: 90 }}>
                              <div style={{ height: '100%', width: `${chkDone / chkTot * 100}%`, background: '#62974B' }} />
                            </div>
                            <span style={{ fontSize: 10, color: 'var(--gray)' }}>{chkDone}/{chkTot} chk</span>
                          </div>
                        )}
                      </div>
                    ) : <span className="card-hint">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
