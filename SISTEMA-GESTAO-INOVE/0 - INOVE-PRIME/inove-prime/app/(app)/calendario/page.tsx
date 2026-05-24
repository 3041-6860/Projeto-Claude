'use client'

import { useState, useEffect } from 'react'

type ViewMode  = 'mes' | 'semana' | 'dia'
type EventType = 'reuniao' | 'tarefa' | 'prazo' | 'audiencia' | 'evento'

interface CalEvent {
  id: string
  titulo: string
  tipo: EventType
  data: string
  horaInicio: string
  horaFim: string
  descricao: string
  local: string
  participantes: string
  allDay: boolean
}

const TIPOS: { key: EventType; label: string }[] = [
  { key: 'reuniao',   label: 'Reunião'   },
  { key: 'tarefa',    label: 'Tarefa'    },
  { key: 'prazo',     label: 'Prazo'     },
  { key: 'audiencia', label: 'Audiência' },
  { key: 'evento',    label: 'Evento'    },
]

const DIAS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MESES  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const COLORS: Record<EventType, string> = { reuniao:'#1F3763', tarefa:'#62974B', prazo:'#c62828', audiencia:'#e65100', evento:'#6a1b9a' }
const HOURS  = Array.from({ length: 13 }, (_, i) => i + 7)
const KEY    = 'inove-calendario'

const MOCK: CalEvent[] = [
  { id:'1', titulo:'Reunião de Diretoria',      tipo:'reuniao',   data:'2026-05-22', horaInicio:'14:00', horaFim:'15:30', descricao:'Pauta: resultados Q1 e planejamento Q2', local:'Sala A',              participantes:'Sandra, Rodrigo',   allDay:false },
  { id:'2', titulo:'Prazo — Renovação Licença', tipo:'prazo',     data:'2026-05-27', horaInicio:'18:00', horaFim:'18:00', descricao:'Vencimento da licença de software',        local:'',                   participantes:'',                  allDay:true  },
  { id:'3', titulo:'Treinamento RH',            tipo:'evento',    data:'2026-05-29', horaInicio:'09:00', horaFim:'12:00', descricao:'Integração de novos colaboradores',         local:'Sala Treinamento',   participantes:'Equipe RH',         allDay:false },
  { id:'4', titulo:'Entrega Rel. Financeiro',   tipo:'tarefa',    data:'2026-05-30', horaInicio:'17:00', horaFim:'17:00', descricao:'Fechamento mensal',                         local:'',                   participantes:'',                  allDay:false },
  { id:'5', titulo:'Reunião com Marketing',     tipo:'reuniao',   data:'2026-06-03', horaInicio:'10:00', horaFim:'11:00', descricao:'Revisão das campanhas de junho',            local:'Online',             participantes:'Equipe Marketing',  allDay:false },
]

const EMPTY: Omit<CalEvent,'id'> = { titulo:'', tipo:'reuniao', data:'', horaInicio:'09:00', horaFim:'10:00', descricao:'', local:'', participantes:'', allDay:false }

function toKey(y:number, m:number, d:number) { return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` }
function todayKey() { const t=new Date(); return toKey(t.getFullYear(),t.getMonth(),t.getDate()) }
function daysIn(y:number,m:number) { return new Date(y,m+1,0).getDate() }
function firstDay(y:number,m:number) { return new Date(y,m,1).getDay() }

export default function Calendario() {
  const [view,       setView]       = useState<ViewMode>('mes')
  const [year,       setYear]       = useState(2026)
  const [month,      setMonth]      = useState(4)
  const [events,     setEvents]     = useState<CalEvent[]>([])
  const [showModal,  setShowModal]  = useState(false)
  const [form,       setForm]       = useState<Omit<CalEvent,'id'>>(EMPTY)
  const [editId,     setEditId]     = useState<string|null>(null)
  const [selDay,     setSelDay]     = useState<string|null>(null)
  const [detail,     setDetail]     = useState<CalEvent|null>(null)

  useEffect(() => {
    try { const s=localStorage.getItem(KEY); setEvents(s?JSON.parse(s):MOCK) }
    catch { setEvents(MOCK) }
  }, [])

  function save(ev:CalEvent[]) {
    setEvents(ev)
    try { localStorage.setItem(KEY,JSON.stringify(ev)) } catch {}
  }

  function openNew(data='') { setEditId(null); setForm({...EMPTY,data}); setShowModal(true) }
  function openEdit(e:CalEvent) { setEditId(e.id); setForm({titulo:e.titulo,tipo:e.tipo,data:e.data,horaInicio:e.horaInicio,horaFim:e.horaFim,descricao:e.descricao,local:e.local,participantes:e.participantes,allDay:e.allDay}); setDetail(null); setShowModal(true) }
  function handleSave() {
    if (!form.titulo.trim()||!form.data) return
    save(editId ? events.map(e=>e.id===editId?{...form,id:editId}:e) : [...events,{...form,id:Date.now().toString()}])
    setShowModal(false)
  }
  function handleDelete(id:string) { save(events.filter(e=>e.id!==id)); setDetail(null) }

  function evForDay(k:string) { return events.filter(e=>e.data===k).sort((a,b)=>a.horaInicio.localeCompare(b.horaInicio)) }

  function prevMonth() { month===0 ? (setMonth(11),setYear(y=>y-1)) : setMonth(m=>m-1) }
  function nextMonth() { month===11? (setMonth(0), setYear(y=>y+1)) : setMonth(m=>m+1) }

  const today  = todayKey()
  const cells  = [...Array(firstDay(year,month)).fill(null), ...Array.from({length:daysIn(year,month)},(_,i)=>i+1)]
  while(cells.length%7!==0) cells.push(null)

  function weekOf(key:string) {
    const base=new Date(key+'T12:00:00'), dow=base.getDay()
    return Array.from({length:7},(_,i)=>{ const d=new Date(base); d.setDate(base.getDate()-dow+i); return toKey(d.getFullYear(),d.getMonth(),d.getDate()) })
  }
  const weekDays = weekOf(selDay||today)
  const dayKey   = selDay||today

  return (
    <div className="dash-wrap">

      {/* ── Toolbar ── */}
      <div className="pg-toolbar">
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <div>
            <p className="pg-title">Calendário</p>
            <p className="pg-sub">Agenda consolidada do grupo</p>
          </div>
          <div className="cal-nav">
            <button type="button" className="cal-nav-btn" onClick={prevMonth}>‹</button>
            <span className="cal-nav-title">{MESES[month]} {year}</span>
            <button type="button" className="cal-nav-btn" onClick={nextMonth}>›</button>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={()=>{setYear(new Date().getFullYear());setMonth(new Date().getMonth())}}>Hoje</button>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div className="view-switcher">
            {(['mes','semana','dia'] as ViewMode[]).map(v=>(
              <button key={v} type="button" className={`view-btn${view===v?' active':''}`} onClick={()=>setView(v)}>
                {v==='mes'?'Mês':v==='semana'?'Semana':'Dia'}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-outline btn-sm">🔗 Google</button>
          <button type="button" className="btn btn-outline btn-sm">🔗 Outlook</button>
          <button type="button" className="btn btn-navy" onClick={()=>openNew()}>+ Novo</button>
        </div>
      </div>

      {/* Legenda */}
      <div className="cal-legend">
        {TIPOS.map(t=>(
          <span key={t.key} className="cal-legend-item">
            <span className="cal-legend-dot" style={{background:COLORS[t.key]}} />
            {t.label}
          </span>
        ))}
      </div>

      {/* ── MÊS ── */}
      {view==='mes' && (
        <div className="cal-month">
          <div className="cal-month-head">{DIAS.map(d=><div key={d} className="cal-month-dow">{d}</div>)}</div>
          <div className="cal-month-grid">
            {cells.map((day,idx)=>{
              const k=day?toKey(year,month,day):''
              const evs=day?evForDay(k):[]
              return (
                <div key={idx}
                  className={`cal-cell${day?' cal-cell-active':''}${k===today?' cal-cell-today':''}${k===selDay?' cal-cell-sel':''}`}
                  onClick={()=>day&&setSelDay(k)}
                  onDoubleClick={()=>day&&openNew(k)}>
                  {day&&<>
                    <span className={`cal-day-num${k===today?' cal-day-today':''}`}>{day}</span>
                    <div className="cal-events-list">
                      {evs.slice(0,3).map(e=>(
                        <div key={e.id} className={`cal-event-chip cal-chip-${e.tipo}`}
                          onClick={ev=>{ev.stopPropagation();setDetail(e)}}>
                          {!e.allDay&&<span>{e.horaInicio}</span>} {e.titulo}
                        </div>
                      ))}
                      {evs.length>3&&<div className="cal-more">+{evs.length-3} mais</div>}
                    </div>
                  </>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── SEMANA ── */}
      {view==='semana'&&(
        <div className="cal-week-wrap">
          <div className="cal-week-head">
            <div className="cal-week-hour-col"/>
            {weekDays.map(k=>{
              const [,,d]=k.split('-')
              const dow=DIAS[new Date(k+'T12:00:00').getDay()]
              return (
                <div key={k} className={`cal-week-col-head${k===today?' cal-week-today':''}`}>
                  <div className="cal-week-dow">{dow}</div>
                  <div className={`cal-week-dnum${k===today?' cal-day-today':''}`}>{parseInt(d)}</div>
                </div>
              )
            })}
          </div>
          <div className="cal-week-body">
            {HOURS.map(h=>(
              <div key={h} className="cal-week-row">
                <div className="cal-week-hour">{String(h).padStart(2,'0')}h</div>
                {weekDays.map(k=>{
                  const evs=evForDay(k).filter(e=>!e.allDay&&parseInt(e.horaInicio.split(':')[0])===h)
                  return (
                    <div key={k} className="cal-week-cell" onDoubleClick={()=>openNew(k)}>
                      {evs.map(e=>(
                        <div key={e.id} className={`cal-week-event cal-ev-${e.tipo}`} onClick={()=>setDetail(e)}>
                          <strong>{e.horaInicio}</strong> {e.titulo}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DIA ── */}
      {view==='dia'&&(
        <div className="cal-day-wrap">
          <div className="cal-day-head">
            {(()=>{
              const [y,m,d]=dayKey.split('-')
              const dow=DIAS[new Date(dayKey+'T12:00:00').getDay()]
              return <h2 className="cal-day-title">{dow}, {parseInt(d)} de {MESES[parseInt(m)-1]} de {y}</h2>
            })()}
          </div>
          <div className="cal-day-body">
            {HOURS.map(h=>{
              const evs=evForDay(dayKey).filter(e=>!e.allDay&&parseInt(e.horaInicio.split(':')[0])===h)
              return (
                <div key={h} className="cal-week-row">
                  <div className="cal-week-hour">{String(h).padStart(2,'0')}h</div>
                  <div className="cal-day-cell" onDoubleClick={()=>openNew(dayKey)}>
                    {evs.map(e=>(
                      <div key={e.id} className={`cal-day-event cal-ev-${e.tipo}`} onClick={()=>setDetail(e)}>
                        <strong>{e.horaInicio} – {e.horaFim}</strong> &nbsp;{e.titulo}
                        {e.local&&<span className="cal-day-local"> · {e.local}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── MODAL CRIAR/EDITAR ── */}
      {showModal&&(
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editId?'Editar evento':'Novo evento'}</h3>
              <button type="button" className="modal-close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="cal-form-row" style={{marginBottom:12}}>
                {TIPOS.map(t=>(
                  <button key={t.key} type="button"
                    className={`cal-type-btn cal-type-${t.key}${form.tipo===t.key?' active':''}`}
                    onClick={()=>setForm(f=>({...f,tipo:t.key}))}>
                    {t.label}
                  </button>
                ))}
              </div>
              <input className="feed-input" style={{marginBottom:10,display:'block',width:'100%'}} placeholder="Título *" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
                <input className="feed-input" type="date"  value={form.data}       onChange={e=>setForm(f=>({...f,data:e.target.value}))}/>
                <input className="feed-input" type="time"  value={form.horaInicio} disabled={form.allDay} onChange={e=>setForm(f=>({...f,horaInicio:e.target.value}))}/>
                <input className="feed-input" type="time"  value={form.horaFim}    disabled={form.allDay} onChange={e=>setForm(f=>({...f,horaFim:e.target.value}))}/>
              </div>
              <label className="cal-check-label" style={{marginBottom:10}}>
                <input type="checkbox" checked={form.allDay} onChange={e=>setForm(f=>({...f,allDay:e.target.checked}))}/>
                Dia inteiro
              </label>
              <input className="feed-input" style={{marginBottom:8,display:'block',width:'100%'}} placeholder="Local / Link" value={form.local} onChange={e=>setForm(f=>({...f,local:e.target.value}))}/>
              <input className="feed-input" style={{marginBottom:8,display:'block',width:'100%'}} placeholder="Participantes" value={form.participantes} onChange={e=>setForm(f=>({...f,participantes:e.target.value}))}/>
              <textarea className="feed-textarea" rows={3} placeholder="Descrição / Pauta" value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))}/>
            </div>
            <div className="modal-footer">
              {editId&&<button type="button" className="btn btn-danger-outline" onClick={()=>{editId&&handleDelete(editId);setShowModal(false)}}>Excluir</button>}
              <button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancelar</button>
              <button type="button" className="btn btn-navy"    onClick={handleSave} disabled={!form.titulo||!form.data}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETALHE ── */}
      {detail&&(
        <div className="modal-overlay" onClick={()=>setDetail(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className={`modal-header cal-detail-header-${detail.tipo}`}>
              <div>
                <span className={`badge cal-chip-${detail.tipo}`} style={{marginBottom:4,display:'inline-block'}}>{TIPOS.find(t=>t.key===detail.tipo)?.label}</span>
                <h3 className="modal-title">{detail.titulo}</h3>
              </div>
              <button type="button" className="modal-close" onClick={()=>setDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="cal-detail-row">
                <span>📅</span>
                <span>{detail.data.split('-').reverse().join('/')} {!detail.allDay&&`· ${detail.horaInicio} – ${detail.horaFim}`}</span>
              </div>
              {detail.local&&<div className="cal-detail-row"><span>📍</span><span>{detail.local}</span></div>}
              {detail.participantes&&<div className="cal-detail-row"><span>👥</span><span>{detail.participantes}</span></div>}
              {detail.descricao&&<div className="cal-detail-row"><span>📝</span><span>{detail.descricao}</span></div>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={()=>openEdit(detail)}>Editar</button>
              <button type="button" className="btn btn-danger-outline" onClick={()=>handleDelete(detail.id)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
