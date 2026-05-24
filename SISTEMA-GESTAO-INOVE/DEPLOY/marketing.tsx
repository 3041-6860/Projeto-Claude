'use client'
import { useState, useEffect } from 'react'

type CampaignStatus = 'Planejada' | 'Ativa' | 'Pausada' | 'Encerrada'

type Campaign = {
  id: string
  nome: string
  canal: string
  objetivo: string
  orcamento: string
  inicio: string
  fim: string
  status: CampaignStatus
}

const STORAGE_KEY = 'inove-marketing'
const views    = ['Lista', 'Kanban']
const canais   = ['Instagram', 'Facebook', 'Google Ads', 'WhatsApp', 'Email', 'LinkedIn', 'Outro']
const statuses: CampaignStatus[] = ['Planejada', 'Ativa', 'Pausada', 'Encerrada']

const statusClass: Record<CampaignStatus, string> = {
  Ativa:     'badge badge-green',
  Pausada:   'badge badge-orange',
  Encerrada: 'badge badge-gray',
  Planejada: 'badge badge-navy',
}

const canalClass: Record<string, string> = {
  Instagram:    'badge badge-orange',
  Facebook:     'badge badge-navy',
  'Google Ads': 'badge badge-wait',
  WhatsApp:     'badge badge-green',
  Email:        'badge badge-gray',
  LinkedIn:     'badge badge-navy',
  Outro:        'badge badge-gray',
}

// Cor do cabeçalho kanban por status
const statusHeadClass: Record<CampaignStatus, string> = {
  Planejada: 'k-head-0',
  Ativa:     'k-head-4',
  Pausada:   'k-head-2',
  Encerrada: 'k-head-5',
}

const emptyForm = () => ({
  nome: '', canal: 'Instagram', objetivo: '', orcamento: '',
  inicio: '', fim: '', status: 'Ativa' as CampaignStatus,
})

export default function Marketing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [view, setView]           = useState('Lista')
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState(emptyForm())

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setCampaigns(JSON.parse(saved))
    } catch {}
  }, [])

  function save(next: Campaign[]) {
    setCampaigns(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }

  function addCampaign() {
    if (!form.nome.trim()) return
    const c: Campaign = { id: Date.now().toString(), ...form, nome: form.nome.trim() }
    save([...campaigns, c])
    setModal(false)
    setForm(emptyForm())
  }

  function removeCampaign(id: string) {
    save(campaigns.filter(c => c.id !== id))
  }

  const ativas     = campaigns.filter(c => c.status === 'Ativa').length
  const planejadas = campaigns.filter(c => c.status === 'Planejada').length
  const encerradas = campaigns.filter(c => c.status === 'Encerrada').length

  return (
    <div className="dash-wrap negocios-wrap">

      {/* Toolbar */}
      <div className="negocios-toolbar">
        <p className="pg-title">Marketing</p>
        <button type="button" className="btn btn-navy" onClick={() => { setForm(emptyForm()); setModal(true) }}>
          + Nova Campanha
        </button>
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
          { label: 'Total campanhas', val: String(campaigns.length) },
          { label: 'Ativas',          val: String(ativas)           },
          { label: 'Planejadas',      val: String(planejadas)       },
          { label: 'Encerradas',      val: String(encerradas)       },
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

      {/* Lista */}
      {view === 'Lista' && (
        campaigns.length === 0 ? (
          <div className="card txt-center p-xl">
            <p className="pg-sub">Nenhuma campanha cadastrada. Clique em + Nova Campanha para começar.</p>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Campanha</th>
                <th>Canal</th>
                <th>Objetivo</th>
                <th>Orçamento</th>
                <th>Período</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td className="font-semibold">{c.nome}</td>
                  <td><span className={canalClass[c.canal] ?? 'badge badge-gray'}>{c.canal}</span></td>
                  <td>{c.objetivo || '—'}</td>
                  <td className="val-green font-bold-7">{c.orcamento || '—'}</td>
                  <td className="card-hint">
                    {c.inicio ? new Date(c.inicio).toLocaleDateString('pt-BR') : '—'}
                    {c.fim    ? ` → ${new Date(c.fim).toLocaleDateString('pt-BR')}` : ''}
                  </td>
                  <td><span className={statusClass[c.status]}>{c.status}</span></td>
                  <td>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => removeCampaign(c.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {/* Kanban */}
      {view === 'Kanban' && (
        <div className="kanban">
          {statuses.map(status => {
            const items = campaigns.filter(c => c.status === status)
            return (
              <div key={status} className="k-col">
                <div className={`k-col-head ${statusHeadClass[status]}`}>
                  <div className="k-col-title">
                    {status}
                    <span className="k-count">{items.length}</span>
                  </div>
                </div>
                {items.map(c => (
                  <div key={c.id} className="k-card">
                    <div className="k-card-title-row">
                      <div className="k-card-title">{c.nome}</div>
                      <button type="button" className="k-card-del" onClick={() => removeCampaign(c.id)}>×</button>
                    </div>
                    <div className="k-card-tags">
                      <span className={canalClass[c.canal] ?? 'badge badge-gray'}>{c.canal}</span>
                    </div>
                    {c.objetivo && <div className="card-hint">{c.objetivo}</div>}
                    <div className="k-card-meta">
                      {c.orcamento && <span className="val-green font-bold-7">{c.orcamento}</span>}
                      {c.inicio && (
                        <span className="card-hint">
                          {new Date(c.inicio).toLocaleDateString('pt-BR')}
                          {c.fim ? ` → ${new Date(c.fim).toLocaleDateString('pt-BR')}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Nova Campanha</div>
            <div className="modal-form">
              <label className="modal-label">Nome da campanha *</label>
              <input className="feed-input" placeholder="Nome da campanha..."
                value={form.nome} autoFocus
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addCampaign()} />

              <label className="modal-label">Canal</label>
              <select className="feed-input" value={form.canal}
                onChange={e => setForm(f => ({ ...f, canal: e.target.value }))}>
                {canais.map(c => <option key={c}>{c}</option>)}
              </select>

              <label className="modal-label">Objetivo</label>
              <input className="feed-input" placeholder="Ex: Geração de leads, reconhecimento de marca..."
                value={form.objetivo}
                onChange={e => setForm(f => ({ ...f, objetivo: e.target.value }))} />

              <label className="modal-label">Orçamento</label>
              <input className="feed-input" placeholder="R$ 0,00"
                value={form.orcamento}
                onChange={e => setForm(f => ({ ...f, orcamento: e.target.value }))} />

              <div className="modal-grid-2">
                <div>
                  <label className="modal-label">Data início</label>
                  <input className="feed-input" type="date"
                    value={form.inicio}
                    onChange={e => setForm(f => ({ ...f, inicio: e.target.value }))} />
                </div>
                <div>
                  <label className="modal-label">Data fim</label>
                  <input className="feed-input" type="date"
                    value={form.fim}
                    onChange={e => setForm(f => ({ ...f, fim: e.target.value }))} />
                </div>
              </div>

              <label className="modal-label">Status</label>
              <select className="feed-input" value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as CampaignStatus }))}>
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
              <button type="button" className="btn btn-navy" onClick={addCampaign} disabled={!form.nome.trim()}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
