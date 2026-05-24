'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

/* ── Estrutura de colunas (sem dados fixos) ── */
const PIPELINES: Record<string, { titulo: string; colunas: { titulo: string }[] }> = {
  'gcj-juridico': {
    titulo: 'GCJ Jurídico',
    colunas: [
      { titulo: 'Prospecção'   },
      { titulo: 'Qualificação' },
      { titulo: 'Proposta'     },
      { titulo: 'Negociação'   },
      { titulo: 'Fechado ✓'   },
    ],
  },
  'ivi-negocios': {
    titulo: 'IVI – NEGÓCIOS',
    colunas: [
      { titulo: 'Novo Contato'  },
      { titulo: 'Em Análise'    },
      { titulo: 'Documentação'  },
      { titulo: 'Protocolo'     },
      { titulo: 'Deferido ✓'   },
    ],
  },
  'grupo-inove': {
    titulo: 'Grupo Inove Prime',
    colunas: [
      { titulo: 'Prospecção' },
      { titulo: 'Proposta'   },
      { titulo: 'Negociação' },
      { titulo: 'Contrato'   },
      { titulo: 'Fechado ✓'  },
    ],
  },
}

type Card = { id: string; titulo: string; empresa: string; valor: string; prazo: string }
type CardsMap = Record<string, Card[][]>

const STORAGE_KEY      = 'inove-negocios-cards'
const CUSTOM_COLS_KEY  = 'inove-negocios-colunas'
const CORES_NOVAS      = ['#06b6d4','#84cc16','#f97316','#ec4899','#a855f7','#14b8a6','#f43f5e','#0ea5e9']
const PADRAO_COUNTS: Record<string,number> = Object.fromEntries(
  Object.entries(PIPELINES).map(([k, v]) => [k, v.colunas.length])
)

const pipelineOptions = [
  { key: 'gcj-juridico', label: 'GCJ Jurídico'      },
  { key: 'ivi-negocios', label: 'IVI – NEGÓCIOS'     },
  { key: 'grupo-inove',  label: 'Grupo Inove Prime'  },
]

const views = ['Kanban', 'Lista', 'Atividades']

function emptyMap(): CardsMap {
  const m: CardsMap = {}
  for (const k of Object.keys(PIPELINES)) {
    m[k] = PIPELINES[k].colunas.map(() => [])
  }
  return m
}

export default function Negocios() {
  const [pipelineKey,    setPipelineKey]    = useState('gcj-juridico')
  const [view,           setView]           = useState('Kanban')
  const [dropOpen,       setDropOpen]       = useState(false)
  const [cardsMap,       setCardsMap]       = useState<CardsMap>(emptyMap)
  const [modal,          setModal]          = useState<{ colIdx: number } | null>(null)
  const [form,           setForm]           = useState({ titulo: '', empresa: '', valor: '', prazo: '' })
  const [customColsMap,  setCustomColsMap]  = useState<Record<string, {titulo:string}[]>>({})
  const [adicionandoFase, setAdicionandoFase] = useState(false)
  const [novaFaseNome,   setNovaFaseNome]   = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setCardsMap(JSON.parse(saved))
      const savedCols = localStorage.getItem(CUSTOM_COLS_KEY)
      if (savedCols) setCustomColsMap(JSON.parse(savedCols))
    } catch {}
  }, [])

  function saveCards(next: CardsMap) {
    setCardsMap(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }

  function saveCustomCols(next: Record<string, {titulo:string}[]>) {
    setCustomColsMap(next)
    try { localStorage.setItem(CUSTOM_COLS_KEY, JSON.stringify(next)) } catch {}
  }

  function addCol() {
    const nome = novaFaseNome.trim()
    if (!nome) return
    const newCustom = [...(customColsMap[pipelineKey] ?? []), { titulo: nome }]
    saveCustomCols({ ...customColsMap, [pipelineKey]: newCustom })
    const nextCards: CardsMap = JSON.parse(JSON.stringify(cardsMap))
    if (!nextCards[pipelineKey]) nextCards[pipelineKey] = PIPELINES[pipelineKey].colunas.map(() => [])
    nextCards[pipelineKey].push([])
    saveCards(nextCards)
    setNovaFaseNome('')
    setAdicionandoFase(false)
  }

  function removeCol(ci: number) {
    if (ci < PADRAO_COUNTS[pipelineKey]) return
    const customIdx = ci - PADRAO_COUNTS[pipelineKey]
    const newCustom = [...(customColsMap[pipelineKey] ?? [])]
    newCustom.splice(customIdx, 1)
    saveCustomCols({ ...customColsMap, [pipelineKey]: newCustom })
    const nextCards: CardsMap = JSON.parse(JSON.stringify(cardsMap))
    if (nextCards[pipelineKey]) {
      const orphans = nextCards[pipelineKey][ci] ?? []
      nextCards[pipelineKey].splice(ci, 1)
      if (orphans.length > 0 && nextCards[pipelineKey][0]) nextCards[pipelineKey][0].push(...orphans)
    }
    saveCards(nextCards)
  }

  function openModal(colIdx: number) {
    setForm({ titulo: '', empresa: '', valor: '', prazo: '' })
    setModal({ colIdx })
  }

  function addCard() {
    if (!form.titulo.trim() || modal === null) return
    const card: Card = {
      id: Date.now().toString(),
      titulo:  form.titulo.trim(),
      empresa: form.empresa.trim(),
      valor:   form.valor.trim(),
      prazo:   form.prazo,
    }
    const next: CardsMap = JSON.parse(JSON.stringify(cardsMap))
    next[pipelineKey][modal.colIdx].push(card)
    saveCards(next)
    setModal(null)
  }

  function removeCard(colIdx: number, cardId: string) {
    const next: CardsMap = JSON.parse(JSON.stringify(cardsMap))
    next[pipelineKey][colIdx] = next[pipelineKey][colIdx].filter(c => c.id !== cardId)
    saveCards(next)
  }

  const pipeline    = PIPELINES[pipelineKey]
  const efectiveCols = [
    ...pipeline.colunas,
    ...(customColsMap[pipelineKey] ?? [])
  ]
  const cards = efectiveCols.map((_, i) => (cardsMap[pipelineKey] ?? [])[i] ?? [])
  const allCards  = cards.flat()

  const totalValor = allCards.reduce((s, c) => {
    const n = parseFloat(c.valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0
    return s + n
  }, 0)

  return (
    <div className="dash-wrap negocios-wrap">

      {/* Toolbar */}
      <div className="negocios-toolbar">
        <p className="pg-title">Negócios</p>

        <button type="button" className="btn btn-navy" onClick={() => openModal(0)}>
          + Criar
        </button>

        {/* Seletor de pipeline */}
        <div className="pipeline-selector-wrap">
          <button type="button" className="pipeline-selector-btn" onClick={() => setDropOpen(v => !v)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            {pipeline.titulo}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {dropOpen && (
            <div className="pipeline-dropdown-panel">
              <div className="pipeline-dropdown-label">Pipelines</div>
              {pipelineOptions.map(opt => (
                <button key={opt.key} type="button"
                  className={`pipeline-option${opt.key === pipelineKey ? ' active' : ''}`}
                  onClick={() => { setPipelineKey(opt.key); setDropOpen(false) }}>
                  {opt.label}
                </button>
              ))}
              <div className="pipeline-dropdown-sep" />
              <Link href="/negocios/pipelines" className="pipeline-add-btn" onClick={() => setDropOpen(false)}>
                + Pipelines e túneis de vendas
              </Link>
            </div>
          )}
        </div>

        {/* Views */}
        <div className="view-switcher">
          {views.map(v => (
            <button key={v} type="button"
              className={`view-btn${v === view ? ' active' : ''}`}
              onClick={() => setView(v)}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas */}
      <div className="m-bar">
        {[
          { label: 'Pipeline total', val: `R$ ${totalValor.toLocaleString('pt-BR')}` },
          { label: 'Negócios',       val: String(allCards.length)                     },
          { label: 'Fechados (mês)', val: String(cards[efectiveCols.length - 1]?.length ?? 0) },
          { label: 'Prospecção',     val: String(cards[0]?.length ?? 0)               },
        ].map((m, i, arr) => (
          <div key={m.label} className="d-contents">
            <div className="m-item">
              <div className="m-label">{m.label}</div>
              <div className="m-val">{m.val}</div>
            </div>
            {i < arr.length - 1 && <div className="m-sep" />}
          </div>
        ))}
      </div>

      {/* Kanban */}
      {view === 'Kanban' && (
        <div style={{ display:'flex', gap:12, overflowX:'auto', alignItems:'flex-start', paddingBottom:8 }}>
          {efectiveCols.map((col, ci) => {
            const isCustom = ci >= PADRAO_COUNTS[pipelineKey]
            const cor = isCustom
              ? CORES_NOVAS[(ci - PADRAO_COUNTS[pipelineKey]) % CORES_NOVAS.length]
              : undefined
            return (
              <div key={ci + '-' + col.titulo} className="k-col" style={{ minWidth:220, flexShrink:0 }}>
                <div className={`k-col-head k-head-${Math.min(ci, 4)}`}
                  style={isCustom ? { borderTop:`3px solid ${cor}` } : {}}>
                  <div className="k-col-title" style={isCustom ? { color: cor } : {}}>
                    {col.titulo}
                    <span className="k-count">{cards[ci]?.length ?? 0}</span>
                  </div>
                  {isCustom && (
                    <button type="button" onClick={() => removeCol(ci)} title="Excluir fase"
                      style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af',
                        fontSize:14, lineHeight:1, padding:'0 2px', marginLeft:4 }}>×</button>
                  )}
                </div>

                {(cards[ci] ?? []).map(card => (
                  <div key={card.id} className="k-card">
                    <div className="k-card-title-row">
                      <div className="k-card-title">{card.titulo}</div>
                      <button type="button" className="k-card-del" onClick={() => removeCard(ci, card.id)}>×</button>
                    </div>
                    {card.empresa && <div className="card-hint">{card.empresa}</div>}
                    <div className="k-card-meta">
                      {card.valor && <span className="val-green font-bold-7">{card.valor}</span>}
                      {card.prazo && <span className="card-hint">{new Date(card.prazo).toLocaleDateString('pt-BR')}</span>}
                    </div>
                  </div>
                ))}

                <button type="button" className="btn btn-outline btn-sm btn-full" onClick={() => openModal(ci)}>
                  + Adicionar
                </button>
              </div>
            )
          })}

          {/* + Nova fase */}
          <div style={{ minWidth:180, flexShrink:0 }}>
            {adicionandoFase ? (
              <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:8, padding:12 }}>
                <input autoFocus value={novaFaseNome}
                  onChange={e => setNovaFaseNome(e.target.value)}
                  onKeyDown={e => { if (e.key==='Enter') addCol(); if (e.key==='Escape') { setAdicionandoFase(false); setNovaFaseNome('') } }}
                  placeholder="Nome da fase…"
                  style={{ width:'100%', padding:'6px 8px', border:'1px solid var(--border)', borderRadius:6,
                    fontSize:13, outline:'none', marginBottom:8, boxSizing:'border-box' }} />
                <div style={{ display:'flex', gap:6 }}>
                  <button type="button" className="btn btn-navy btn-sm" style={{ flex:1 }} onClick={addCol}>
                    Adicionar
                  </button>
                  <button type="button" className="btn btn-outline btn-sm"
                    onClick={() => { setAdicionandoFase(false); setNovaFaseNome('') }}>✕</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setAdicionandoFase(true)}
                style={{ width:'100%', height:56, border:'2px dashed #d1d5db', borderRadius:8,
                  background:'transparent', color:'#6b7280', fontSize:13, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                  transition:'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='var(--navy)'; (e.currentTarget as HTMLButtonElement).style.color='var(--navy)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='#d1d5db'; (e.currentTarget as HTMLButtonElement).style.color='#6b7280' }}>
                + Nova fase
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista */}
      {view === 'Lista' && (
        <table className="tbl">
          <thead>
            <tr><th>Negócio</th><th>Empresa</th><th>Valor</th><th>Fase</th><th>Prazo</th><th></th></tr>
          </thead>
          <tbody>
            {allCards.length === 0 && (
              <tr><td colSpan={6} className="txt-center val-gray">Nenhum negócio cadastrado.</td></tr>
            )}
            {efectiveCols.flatMap((col, ci) =>
              (cards[ci] ?? []).map(card => (
                <tr key={card.id}>
                  <td className="font-semibold">{card.titulo}</td>
                  <td>{card.empresa || '—'}</td>
                  <td className="val-green font-semibold">{card.valor || '—'}</td>
                  <td><span className="badge badge-navy">{col.titulo}</span></td>
                  <td className="card-hint">{card.prazo ? new Date(card.prazo).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => removeCard(ci, card.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {view === 'Atividades' && (
        <div className="card txt-center p-xl">
          <p className="pg-title">📅 Atividades em breve</p>
          <p className="pg-sub">Esta visualização será implementada na próxima versão.</p>
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              Novo negócio &mdash; <span className="val-gray">{efectiveCols[modal.colIdx]?.titulo}</span>
            </div>
            <div className="modal-form">
              <label className="modal-label">Título *</label>
              <input className="feed-input" placeholder="Nome do negócio..."
                value={form.titulo} autoFocus
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addCard()} />

              <label className="modal-label">Empresa / Cliente</label>
              <input className="feed-input" placeholder="Nome da empresa ou cliente..."
                value={form.empresa}
                onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))} />

              <label className="modal-label">Valor estimado</label>
              <input className="feed-input" placeholder="R$ 0,00"
                value={form.valor}
                onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} />

              <label className="modal-label">Prazo</label>
              <input className="feed-input" type="date"
                value={form.prazo}
                onChange={e => setForm(f => ({ ...f, prazo: e.target.value }))} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancelar</button>
              <button type="button" className="btn btn-navy" onClick={addCard} disabled={!form.titulo.trim()}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
