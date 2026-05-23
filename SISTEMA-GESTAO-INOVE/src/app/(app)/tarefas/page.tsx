'use client'
import { useState, useEffect } from 'react'

/* ─── Types ──────────────────────────────────────────────────── */
type Status   = 'A Fazer' | 'Em Andamento' | 'Em Revisão' | 'Concluído'
type Priority = 'Urgente' | 'Alta' | 'Média' | 'Baixa'

interface SubItem  { id: string; titulo: string; feita: boolean }
interface CheckItem{ id: string; item:   string; feito: boolean }
interface Task {
  id:           string
  titulo:       string
  descricao:    string
  status:       Status
  prioridade:   Priority
  criador:      string
  responsavel:  string
  participantes:string[]
  dataInicio:   string
  prazo:        string
  vinculoTipo:  'lead' | 'negocio' | ''
  vinculoId:    string
  vinculoNome:  string
  subtarefas:   SubItem[]
  checklist:    CheckItem[]
  tags:         string[]
  estimativa:   string
  horasGastas:  string
}

/* ─── Dados de referência ────────────────────────────────────── */
const COLAB = [
  'Guilherme C. Junqueira', 'Fernanda Oliveira', 'Ana Paula Souza',
  'Bruno Alves', 'Carlos Eduardo Lima', 'Mariana Santos', 'Roberto Carvalho',
]
const LEADS = [
  { id: 'l1', nome: 'Maria Silva',   empresa: 'Construtora ABC'  },
  { id: 'l2', nome: 'João Pedro',    empresa: 'Tech Solutions'   },
  { id: 'l3', nome: 'Ana Rodrigues', empresa: 'Farmácia Central' },
  { id: 'l4', nome: 'Carlos Mendes', empresa: 'Indústria Forte'  },
]
const NEGOCIOS = [
  { id: 'n1', nome: 'Assessoria Trabalhista — Construtora ABC', valor: 'R$ 8.500'  },
  { id: 'n2', nome: 'Processo Cível — João Pedro',             valor: 'R$ 12.000' },
  { id: 'n3', nome: 'Contrato Societário — Tech Solutions',    valor: 'R$ 5.200'  },
  { id: 'n4', nome: 'Inventário — Carlos Mendes',              valor: 'R$ 18.000' },
]
const TAGS = ['Jurídico', 'Financeiro', 'Urgente', 'Cliente', 'Interno', 'Marketing', 'RH', 'TI']
const TAG_CLR: Record<string, string> = {
  Jurídico:   '#1F3763', Financeiro: '#0059b3', Urgente:    '#dc2626',
  Cliente:    '#e65100', Interno:    '#6b7280', Marketing:  '#7c3aed',
  RH:         '#62974B', TI:         '#4a148c',
}
const STATUSES: Status[] = ['A Fazer', 'Em Andamento', 'Em Revisão', 'Concluído']
const STATUS_CLR: Record<Status, string> = {
  'A Fazer':      '#6b7280',
  'Em Andamento': '#e65100',
  'Em Revisão':   '#1F3763',
  'Concluído':    '#62974B',
}
const PRIO_CLS: Record<Priority, string> = {
  Urgente: 'badge badge-red',
  Alta:    'badge badge-orange',
  Média:   'badge badge-navy',
  Baixa:   'badge badge-gray',
}
const STORAGE = 'inove-tarefas-v2'
const M_TABS  = ['Geral', 'Vínculos', 'Subtarefas', 'Checklist', 'Tempo']

/* ─── Helpers ────────────────────────────────────────────────── */
function uid()   { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5) }
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—' }
function isLate(t: Task)    { return !!t.prazo && new Date(t.prazo) < new Date() && t.status !== 'Concluído' }

function blank(status: Status = 'A Fazer'): Omit<Task, 'id'> {
  return {
    titulo: '', descricao: '', status, prioridade: 'Média',
    criador: COLAB[0], responsavel: '', participantes: [],
    dataInicio: '', prazo: '',
    vinculoTipo: '', vinculoId: '', vinculoNome: '',
    subtarefas: [], checklist: [], tags: [],
    estimativa: '', horasGastas: '',
  }
}

function ProgBar({ done, total }: { done: number; total: number }) {
  if (!total) return null
  const pct = Math.round((done / total) * 100)
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 4, borderRadius: 2, background: '#e5e7eb', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#62974B' : '#1F3763', transition: 'width .3s' }} />
      </div>
      <span style={{ fontSize: 10, color: 'var(--gray)' }}>{done}/{total} · {pct}%</span>
    </div>
  )
}

/* ─── Componente principal ───────────────────────────────────── */
export default function Tarefas() {
  const [tasks,    setTasks]   = useState<Task[]>([])
  const [view,     setView]    = useState<'Kanban' | 'Lista'>('Kanban')
  const [open,     setOpen]    = useState(false)
  const [editId,   setEditId]  = useState<string | null>(null)
  const [form,     setForm]    = useState<Omit<Task, 'id'>>(blank())
  const [mTab,     setMTab]    = useState(0)
  const [newSub,   setNewSub]  = useState('')
  const [newChk,   setNewChk]  = useState('')
  const [fResp,    setFResp]   = useState('')
  const [fPrio,    setFPrio]   = useState('')
  const [fStatus,  setFStatus] = useState('')

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE); if (s) setTasks(JSON.parse(s)) } catch {}
  }, [])

  function persist(next: Task[]) {
    setTasks(next)
    try { localStorage.setItem(STORAGE, JSON.stringify(next)) } catch {}
  }

  function openNew(status: Status = 'A Fazer') {
    setForm(blank(status)); setEditId(null); setOpen(true); setMTab(0); setNewSub(''); setNewChk('')
  }
  function openEdit(t: Task) {
    setForm({ ...t }); setEditId(t.id); setOpen(true); setMTab(0); setNewSub(''); setNewChk('')
  }
  function closeModal() { setOpen(false) }

  function saveTask() {
    if (!form.titulo.trim()) return
    if (editId) {
      persist(tasks.map(t => t.id === editId ? { id: editId, ...form } : t))
    } else {
      persist([...tasks, { id: uid(), ...form }])
    }
    closeModal()
  }
  function deleteTask(id: string) { persist(tasks.filter(t => t.id !== id)) }
  function moveTask(id: string, dir: 1 | -1) {
    persist(tasks.map(t => {
      if (t.id !== id) return t
      const ci = STATUSES.indexOf(t.status)
      const ni = Math.max(0, Math.min(STATUSES.length - 1, ci + dir))
      return { ...t, status: STATUSES[ni] }
    }))
  }

  /* form helpers */
  const F = (patch: Partial<Omit<Task, 'id'>>) => setForm(f => ({ ...f, ...patch }))
  function addSub()  { if (!newSub.trim()) return; F({ subtarefas: [...form.subtarefas, { id: uid(), titulo: newSub.trim(), feita: false }] }); setNewSub('') }
  function toggleSub(id: string) { F({ subtarefas: form.subtarefas.map(s => s.id === id ? { ...s, feita: !s.feita } : s) }) }
  function removeSub(id: string) { F({ subtarefas: form.subtarefas.filter(s => s.id !== id) }) }
  function addChk()  { if (!newChk.trim()) return; F({ checklist: [...form.checklist, { id: uid(), item: newChk.trim(), feito: false }] }); setNewChk('') }
  function toggleChk(id: string) { F({ checklist: form.checklist.map(c => c.id === id ? { ...c, feito: !c.feito } : c) }) }
  function removeChk(id: string) { F({ checklist: form.checklist.filter(c => c.id !== id) }) }
  function toggleTag(tag: string)  { F({ tags: form.tags.includes(tag) ? form.tags.filter(t => t !== tag) : [...form.tags, tag] }) }
  function togglePart(p: string)   { F({ participantes: form.participantes.includes(p) ? form.participantes.filter(x => x !== p) : [...form.participantes, p] }) }

  /* filters */
  const filtered = tasks.filter(t => {
    if (fResp   && t.responsavel !== fResp)  return false
    if (fPrio   && t.prioridade  !== fPrio)  return false
    if (fStatus && t.status      !== fStatus) return false
    return true
  })
  const counts   = STATUSES.map(s => filtered.filter(t => t.status === s).length)
  const lateCount = filtered.filter(t => isLate(t)).length

  return (
    <div className="dash-wrap negocios-wrap">

      {/* Toolbar */}
      <div className="negocios-toolbar">
        <div>
          <p className="pg-title">Tarefas</p>
          <p className="pg-sub">
            {tasks.length} tarefas &nbsp;·&nbsp;
            {lateCount > 0
              ? <span style={{ color: '#dc2626', fontWeight: 600 }}>{lateCount} atrasadas</span>
              : <span>sem atrasos</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="view-switcher">
            {(['Kanban', 'Lista'] as const).map(v => (
              <button key={v} type="button"
                className={`view-btn${view === v ? ' active' : ''}`}
                onClick={() => setView(v)}>{v}</button>
            ))}
          </div>
          <button type="button" className="btn btn-navy" onClick={() => openNew()}>+ Nova Tarefa</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="m-bar" style={{ marginBottom: 14 }}>
        {[
          { label: 'Total',        val: String(filtered.length) },
          { label: 'A Fazer',      val: String(counts[0]) },
          { label: 'Em Andamento', val: String(counts[1]) },
          { label: 'Em Revisão',   val: String(counts[2]) },
          { label: 'Concluídas',   val: String(counts[3]) },
          { label: 'Atrasadas',    val: String(lateCount)  },
        ].map((m, i, arr) => (
          <div key={m.label} className="d-contents">
            <div className="m-item">
              <div className="m-label">{m.label}</div>
              <div className="m-val" style={m.label === 'Atrasadas' && lateCount > 0 ? { color: '#dc2626' } : {}}>
                {m.val}
              </div>
            </div>
            {i < arr.length - 1 && <div className="m-sep" />}
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select className="feed-input" style={{ width: 200 }} value={fResp} onChange={e => setFResp(e.target.value)}
          title="Filtrar por responsável">
          <option value="">Todos os responsáveis</option>
          {COLAB.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="feed-input" style={{ width: 170 }} value={fPrio} onChange={e => setFPrio(e.target.value)}
          title="Filtrar por prioridade">
          <option value="">Todas as prioridades</option>
          {(['Urgente', 'Alta', 'Média', 'Baixa'] as Priority[]).map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="feed-input" style={{ width: 170 }} value={fStatus} onChange={e => setFStatus(e.target.value)}
          title="Filtrar por status">
          <option value="">Todos os status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        {(fResp || fPrio || fStatus) && (
          <button type="button" className="btn btn-outline btn-sm"
            onClick={() => { setFResp(''); setFPrio(''); setFStatus('') }}>
            ✕ Limpar filtros
          </button>
        )}
      </div>

      {/* ── KANBAN ────────────────────────────────────────────── */}
      {view === 'Kanban' && (
        <div className="kanban" style={{ gridTemplateColumns: `repeat(${STATUSES.length}, 1fr)` }}>
          {STATUSES.map((status, ci) => {
            const col = filtered.filter(t => t.status === status)
            return (
              <div key={status} className="k-col">
                <div className="k-col-head"
                  style={{ borderTop: `3px solid ${STATUS_CLR[status]}`, paddingBottom: 4 }}>
                  <div className="k-col-title" style={{ color: STATUS_CLR[status] }}>
                    {status} <span className="k-count">{col.length}</span>
                  </div>
                </div>

                {col.map(task => {
                  const subDone = task.subtarefas.filter(s => s.feita).length
                  const chkDone = task.checklist.filter(c => c.feito).length
                  const late    = isLate(task)
                  return (
                    <div key={task.id} className="k-card"
                      style={{ cursor: 'pointer', borderLeft: `3px solid ${STATUS_CLR[task.status]}` }}
                      onClick={() => openEdit(task)}>

                      <div className="k-card-title-row">
                        <div className="k-card-title">{task.titulo}</div>
                        <button type="button" className="k-card-del"
                          onClick={e => { e.stopPropagation(); deleteTask(task.id) }}>×</button>
                      </div>

                      {task.responsavel && (
                        <div className="card-hint" style={{ marginBottom: 4 }}>👤 {task.responsavel}</div>
                      )}
                      {task.participantes.length > 0 && (
                        <div className="card-hint" style={{ marginBottom: 4 }}>
                          👥 {task.participantes.length} participante{task.participantes.length > 1 ? 's' : ''}
                        </div>
                      )}
                      {task.vinculoNome && (
                        <div className="card-hint" style={{ marginBottom: 4 }}>
                          {task.vinculoTipo === 'lead' ? '🙋' : '💼'} {task.vinculoNome}
                        </div>
                      )}

                      <div className="k-card-tags">
                        <span className={PRIO_CLS[task.prioridade]}>{task.prioridade}</span>
                        {late && <span className="badge badge-red">Atrasada</span>}
                        {task.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="badge"
                            style={{ background: TAG_CLR[tag] || '#6b7280', color: '#fff' }}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      {task.prazo && (
                        <div className="k-card-meta">
                          <span className="card-hint" style={late ? { color: '#dc2626' } : {}}>
                            📅 {fmtDate(task.prazo)}
                          </span>
                          {task.estimativa && (
                            <span className="card-hint" style={{ marginLeft: 8 }}>
                              ⏱ {task.estimativa}h
                            </span>
                          )}
                        </div>
                      )}

                      {task.subtarefas.length > 0 && (
                        <ProgBar done={subDone} total={task.subtarefas.length} />
                      )}
                      {task.checklist.length > 0 && (
                        <ProgBar done={chkDone} total={task.checklist.length} />
                      )}

                      <div className="k-card-moves" onClick={e => e.stopPropagation()}>
                        {ci > 0 && (
                          <button type="button" className="btn btn-outline btn-sm"
                            onClick={() => moveTask(task.id, -1)}>← Voltar</button>
                        )}
                        {ci < STATUSES.length - 1 && (
                          <button type="button" className="btn btn-navy btn-sm"
                            onClick={() => moveTask(task.id, 1)}>Avançar →</button>
                        )}
                      </div>
                    </div>
                  )
                })}

                <button type="button" className="btn btn-outline btn-sm btn-full"
                  onClick={() => openNew(status)}>+ Adicionar</button>
              </div>
            )
          })}
        </div>
      )}

      {/* ── LISTA ─────────────────────────────────────────────── */}
      {view === 'Lista' && (
        filtered.length === 0 ? (
          <div className="card txt-center p-xl">
            <p className="pg-sub">Nenhuma tarefa encontrada.</p>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Tarefa</th>
                <th>Responsável</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Prazo</th>
                <th>Vínculo</th>
                <th>Progresso</th>
                <th aria-label="Ações"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => {
                const subDone = task.subtarefas.filter(s => s.feita).length
                const late    = isLate(task)
                return (
                  <tr key={task.id} style={{ cursor: 'pointer' }} onClick={() => openEdit(task)}>
                    <td>
                      <p className="font-semibold">{task.titulo}</p>
                      {task.tags.map(tag => (
                        <span key={tag} className="badge"
                          style={{ background: TAG_CLR[tag] || '#6b7280', color: '#fff', marginRight: 3, fontSize: 10 }}>
                          {tag}
                        </span>
                      ))}
                    </td>
                    <td>{task.responsavel || '—'}</td>
                    <td><span className={PRIO_CLS[task.prioridade]}>{task.prioridade}</span></td>
                    <td>
                      <span className="badge"
                        style={{ background: STATUS_CLR[task.status], color: '#fff' }}>
                        {task.status}
                      </span>
                    </td>
                    <td className="card-hint" style={late ? { color: '#dc2626' } : {}}>
                      {fmtDate(task.prazo)}
                      {late && <span className="badge badge-red" style={{ marginLeft: 4 }}>Atrasada</span>}
                    </td>
                    <td className="card-hint">
                      {task.vinculoNome
                        ? `${task.vinculoTipo === 'lead' ? '🙋' : '💼'} ${task.vinculoNome}`
                        : '—'}
                    </td>
                    <td>
                      {task.subtarefas.length > 0
                        ? <ProgBar done={subDone} total={task.subtarefas.length} />
                        : <span className="card-hint">—</span>}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button type="button" className="btn btn-outline btn-sm"
                        onClick={() => deleteTask(task.id)}>Excluir</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )
      )}

      {/* ── MODAL ─────────────────────────────────────────────── */}
      {open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box"
            style={{ maxWidth: 700, width: '95vw', maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}
            onClick={e => e.stopPropagation()}>

            {/* Header + Tabs */}
            <div style={{ padding: '16px 20px 0', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: 'var(--navy)' }}>
                  {editId ? '✏️ Editar Tarefa' : '+ Nova Tarefa'}
                </p>
                <button type="button" className="k-card-del" style={{ fontSize: 20 }} onClick={closeModal}>×</button>
              </div>
              <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
                {M_TABS.map((tab, i) => (
                  <button key={tab} type="button"
                    style={{
                      padding: '8px 14px', fontSize: 12, fontWeight: 600, border: 'none', background: 'none',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                      borderBottom: mTab === i ? '2px solid var(--navy)' : '2px solid transparent',
                      color: mTab === i ? 'var(--navy)' : 'var(--gray)',
                    }}
                    onClick={() => setMTab(i)}>
                    {tab}
                    {tab === 'Subtarefas' && form.subtarefas.length > 0 && (
                      <span style={{ marginLeft: 4, background: 'var(--navy)', color: '#fff', borderRadius: 10, padding: '1px 5px', fontSize: 10 }}>
                        {form.subtarefas.length}
                      </span>
                    )}
                    {tab === 'Checklist' && form.checklist.length > 0 && (
                      <span style={{ marginLeft: 4, background: '#62974B', color: '#fff', borderRadius: 10, padding: '1px 5px', fontSize: 10 }}>
                        {form.checklist.filter(c => c.feito).length}/{form.checklist.length}
                      </span>
                    )}
                    {tab === 'Vínculos' && form.vinculoNome && (
                      <span style={{ marginLeft: 4, background: '#e65100', color: '#fff', borderRadius: 10, padding: '1px 5px', fontSize: 10 }}>1</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Body scrollável */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

              {/* ── TAB 0: Geral ─────────────────────────── */}
              {mTab === 0 && (
                <div className="modal-form">
                  <label className="modal-label">Título *</label>
                  <input className="feed-input" placeholder="Descreva a tarefa..." autoFocus
                    value={form.titulo} onChange={e => F({ titulo: e.target.value })} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label className="modal-label">Status</label>
                      <select className="feed-input" value={form.status}
                        onChange={e => F({ status: e.target.value as Status })}
                        title="Status da tarefa">
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="modal-label">Prioridade</label>
                      <select className="feed-input" value={form.prioridade}
                        onChange={e => F({ prioridade: e.target.value as Priority })}
                        title="Prioridade da tarefa">
                        {(['Urgente', 'Alta', 'Média', 'Baixa'] as Priority[]).map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label className="modal-label">Delegado por / Criador</label>
                      <select className="feed-input" value={form.criador}
                        onChange={e => F({ criador: e.target.value })}
                        title="Quem delegou a tarefa">
                        {COLAB.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="modal-label">Responsável</label>
                      <select className="feed-input" value={form.responsavel}
                        onChange={e => F({ responsavel: e.target.value })}
                        title="Quem vai executar">
                        <option value="">— Selecionar —</option>
                        {COLAB.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <label className="modal-label">Participantes / Observadores</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, background: '#fafafa' }}>
                    {COLAB.map(c => (
                      <label key={c} style={{
                        display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                        cursor: 'pointer', padding: '3px 10px', borderRadius: 12,
                        background: form.participantes.includes(c) ? 'var(--navy)' : '#fff',
                        color: form.participantes.includes(c) ? '#fff' : '#374151',
                        border: '1px solid var(--border)', userSelect: 'none',
                      }}>
                        <input type="checkbox" style={{ display: 'none' }}
                          checked={form.participantes.includes(c)}
                          onChange={() => togglePart(c)} />
                        {c.split(' ').slice(0, 2).join(' ')}
                      </label>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label className="modal-label">📅 Data de Início</label>
                      <input className="feed-input" type="date"
                        value={form.dataInicio} onChange={e => F({ dataInicio: e.target.value })} />
                    </div>
                    <div>
                      <label className="modal-label">⏰ Prazo / Deadline</label>
                      <input className="feed-input" type="date"
                        value={form.prazo} onChange={e => F({ prazo: e.target.value })} />
                    </div>
                  </div>

                  <label className="modal-label">Tags</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {TAGS.map(tag => (
                      <button key={tag} type="button"
                        style={{
                          padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          background: form.tags.includes(tag) ? (TAG_CLR[tag] || '#6b7280') : '#fff',
                          color: form.tags.includes(tag) ? '#fff' : (TAG_CLR[tag] || '#6b7280'),
                          border: `1.5px solid ${TAG_CLR[tag] || '#6b7280'}`,
                          transition: 'all .15s',
                        }}
                        onClick={() => toggleTag(tag)}>{tag}</button>
                    ))}
                  </div>

                  <label className="modal-label">Descrição</label>
                  <textarea className="feed-textarea" rows={3}
                    placeholder="Contexto, instruções, detalhes da tarefa..."
                    value={form.descricao} onChange={e => F({ descricao: e.target.value })} />
                </div>
              )}

              {/* ── TAB 1: Vínculos ──────────────────────── */}
              {mTab === 1 && (
                <div className="modal-form">
                  <label className="modal-label">Vincular esta tarefa a</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {([
                      { val: '' as const,       label: '🚫 Nenhum'              },
                      { val: 'lead' as const,   label: '🙋 Lead / CRM'          },
                      { val: 'negocio' as const, label: '💼 Negócio / Pipeline' },
                    ]).map(opt => (
                      <button key={opt.val} type="button"
                        style={{
                          flex: 1, padding: '10px 6px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          background: form.vinculoTipo === opt.val ? 'var(--navy)' : '#fff',
                          color: form.vinculoTipo === opt.val ? '#fff' : 'var(--navy)',
                          border: '1.5px solid var(--navy)',
                        }}
                        onClick={() => F({ vinculoTipo: opt.val, vinculoId: '', vinculoNome: '' })}>
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {form.vinculoTipo === 'lead' && (
                    <>
                      <label className="modal-label">Selecionar Lead</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {LEADS.map(l => (
                          <div key={l.id}
                            style={{
                              padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                              border: `2px solid ${form.vinculoId === l.id ? 'var(--navy)' : 'var(--border)'}`,
                              background: form.vinculoId === l.id ? '#eef2ff' : '#fff',
                            }}
                            onClick={() => F({ vinculoId: l.id, vinculoNome: l.nome })}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{l.nome}</p>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--gray)' }}>{l.empresa}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {form.vinculoTipo === 'negocio' && (
                    <>
                      <label className="modal-label">Selecionar Negócio</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {NEGOCIOS.map(n => (
                          <div key={n.id}
                            style={{
                              padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                              border: `2px solid ${form.vinculoId === n.id ? 'var(--navy)' : 'var(--border)'}`,
                              background: form.vinculoId === n.id ? '#eef2ff' : '#fff',
                            }}
                            onClick={() => F({ vinculoId: n.id, vinculoNome: n.nome })}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{n.nome}</p>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--gray)' }}>{n.valor}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {form.vinculoTipo === '' && (
                    <div style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--gray)', fontSize: 13 }}>
                      Selecione Lead/CRM ou Negócio/Pipeline para vincular esta tarefa a um registro.
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 2: Subtarefas ────────────────────── */}
              {mTab === 2 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p className="pg-sub" style={{ margin: 0 }}>
                      {form.subtarefas.filter(s => s.feita).length}/{form.subtarefas.length} concluídas
                    </p>
                  </div>
                  {form.subtarefas.length > 0 && (
                    <ProgBar done={form.subtarefas.filter(s => s.feita).length} total={form.subtarefas.length} />
                  )}
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {form.subtarefas.map(s => (
                      <div key={s.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '9px 12px', border: '1px solid var(--border)',
                        borderRadius: 8, background: s.feita ? '#f0fdf4' : '#fff',
                      }}>
                        <input type="checkbox" checked={s.feita} onChange={() => toggleSub(s.id)}
                          style={{ width: 16, height: 16, accentColor: '#62974B', cursor: 'pointer', flexShrink: 0 }} />
                        <span style={{
                          flex: 1, fontSize: 13,
                          textDecoration: s.feita ? 'line-through' : 'none',
                          color: s.feita ? 'var(--gray)' : '#374151',
                        }}>
                          {s.titulo}
                        </span>
                        <button type="button" className="k-card-del" onClick={() => removeSub(s.id)}>×</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <input className="feed-input" style={{ flex: 1 }} placeholder="Nova subtarefa..."
                      value={newSub} onChange={e => setNewSub(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSub()} />
                    <button type="button" className="btn btn-navy" onClick={addSub}>+ Adicionar</button>
                  </div>
                </div>
              )}

              {/* ── TAB 3: Checklist ─────────────────────── */}
              {mTab === 3 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p className="pg-sub" style={{ margin: 0 }}>
                      {form.checklist.filter(c => c.feito).length}/{form.checklist.length} itens concluídos
                    </p>
                  </div>
                  {form.checklist.length > 0 && (
                    <ProgBar done={form.checklist.filter(c => c.feito).length} total={form.checklist.length} />
                  )}
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {form.checklist.map(c => (
                      <div key={c.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '9px 12px', border: '1px solid var(--border)',
                        borderRadius: 8, background: c.feito ? '#f0fdf4' : '#fff',
                      }}>
                        <input type="checkbox" checked={c.feito} onChange={() => toggleChk(c.id)}
                          style={{ width: 16, height: 16, accentColor: '#62974B', cursor: 'pointer', flexShrink: 0 }} />
                        <span style={{
                          flex: 1, fontSize: 13,
                          textDecoration: c.feito ? 'line-through' : 'none',
                          color: c.feito ? 'var(--gray)' : '#374151',
                        }}>
                          {c.item}
                        </span>
                        <button type="button" className="k-card-del" onClick={() => removeChk(c.id)}>×</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <input className="feed-input" style={{ flex: 1 }} placeholder="Novo item do checklist..."
                      value={newChk} onChange={e => setNewChk(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addChk()} />
                    <button type="button" className="btn btn-navy" onClick={addChk}>+ Adicionar</button>
                  </div>
                </div>
              )}

              {/* ── TAB 4: Tempo ─────────────────────────── */}
              {mTab === 4 && (
                <div className="modal-form">
                  <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 16 }}>
                    Controle de horas e delegação da tarefa.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label className="modal-label">⏱ Estimativa (horas)</label>
                      <input className="feed-input" type="number" min="0" step="0.5" placeholder="Ex: 4"
                        value={form.estimativa} onChange={e => F({ estimativa: e.target.value })} />
                    </div>
                    <div>
                      <label className="modal-label">✅ Horas Gastas</label>
                      <input className="feed-input" type="number" min="0" step="0.5" placeholder="Ex: 2.5"
                        value={form.horasGastas} onChange={e => F({ horasGastas: e.target.value })} />
                    </div>
                  </div>
                  {form.estimativa && form.horasGastas && (
                    <div style={{
                      padding: '10px 14px', borderRadius: 8, marginTop: 4,
                      background: Number(form.horasGastas) > Number(form.estimativa) ? '#fef2f2' : '#f0fdf4',
                      border: `1px solid ${Number(form.horasGastas) > Number(form.estimativa) ? '#fca5a5' : '#86efac'}`,
                    }}>
                      <p style={{
                        margin: 0, fontSize: 13,
                        color: Number(form.horasGastas) > Number(form.estimativa) ? '#dc2626' : '#16a34a',
                        fontWeight: 600,
                      }}>
                        {Number(form.horasGastas) > Number(form.estimativa)
                          ? `⚠️ Excedeu em ${(Number(form.horasGastas) - Number(form.estimativa)).toFixed(1)}h`
                          : `✅ Restam ${(Number(form.estimativa) - Number(form.horasGastas)).toFixed(1)}h`}
                      </p>
                    </div>
                  )}

                  <label className="modal-label" style={{ marginTop: 16 }}>Delegado por</label>
                  <select className="feed-input" value={form.criador}
                    onChange={e => F({ criador: e.target.value })}
                    title="Quem delegou a tarefa">
                    {COLAB.map(c => <option key={c}>{c}</option>)}
                  </select>

                  <div style={{
                    padding: '12px 14px', borderRadius: 8, background: '#fafafa',
                    border: '1px solid var(--border)', marginTop: 4,
                  }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.8 }}>
                      <strong>Responsável:</strong> {form.responsavel || '—'}<br />
                      <strong>Delegado por:</strong> {form.criador}<br />
                      <strong>Início:</strong> {fmtDate(form.dataInicio)} &nbsp;→&nbsp; <strong>Prazo:</strong> {fmtDate(form.prazo)}<br />
                      <strong>Participantes:</strong> {form.participantes.length > 0 ? form.participantes.join(', ') : '—'}<br />
                      <strong>Subtarefas:</strong> {form.subtarefas.filter(s => s.feita).length}/{form.subtarefas.length} concluídas<br />
                      <strong>Checklist:</strong> {form.checklist.filter(c => c.feito).length}/{form.checklist.length} itens
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button>
              <button type="button" className="btn btn-navy" onClick={saveTask} disabled={!form.titulo.trim()}>
                {editId ? '💾 Salvar Alterações' : '+ Criar Tarefa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
