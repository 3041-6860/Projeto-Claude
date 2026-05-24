'use client'
import { useState } from 'react'
import Link from 'next/link'

/* ─── Tipos ──────────────────────────────────────────────── */
interface Colaborador {
  nome: string; cargo: string; dept: string
  adm: string; status: string; ferias: boolean; ativo: boolean
}

/* ─── Dados iniciais ─────────────────────────────────────── */
const inicial: Colaborador[] = [
  { nome: 'Guilherme C. Junqueira', cargo: 'Advogado Sênior',    dept: 'Jurídico',   adm: '01/03/2020', status: 'Ativo',   ferias: false, ativo: true },
  { nome: 'Fernanda Oliveira',      cargo: 'Advogada Plena',      dept: 'Jurídico',   adm: '15/08/2021', status: 'Ativo',   ferias: false, ativo: true },
  { nome: 'Ana Paula Souza',        cargo: 'Advogada Associada',  dept: 'Jurídico',   adm: '02/01/2023', status: 'Ativo',   ferias: true,  ativo: true },
  { nome: 'Carlos Eduardo Lima',    cargo: 'Gerente Comercial',   dept: 'Comercial',  adm: '10/06/2019', status: 'Ativo',   ferias: false, ativo: true },
  { nome: 'Mariana Santos',         cargo: 'Analista Financeira', dept: 'Financeiro', adm: '20/11/2022', status: 'Ativo',   ferias: true,  ativo: true },
  { nome: 'Roberto Carvalho',       cargo: 'Técnico de TI',       dept: 'TI',         adm: '05/04/2023', status: 'Ativo',   ferias: false, ativo: true },
  { nome: 'Patrícia Nunes',         cargo: 'Assistente Jurídico', dept: 'Jurídico',   adm: '11/09/2024', status: 'Ativo',   ferias: false, ativo: true },
  { nome: 'André Martins',          cargo: 'Estagiário',          dept: 'Jurídico',   adm: '01/02/2026', status: 'Estágio', ferias: false, ativo: true },
]

const depts    = ['Jurídico', 'Comercial', 'Financeiro', 'TI', 'Administrativo']
const perfis   = ['Administrador', 'Operacional', 'Jurídico', 'Comercial', 'Financeiro']
const contratos= ['CLT', 'PJ', 'Estágio', 'Temporário']
const motivosD = ['Pedido de demissão', 'Demissão sem justa causa', 'Demissão com justa causa', 'Fim de contrato', 'Acordo', 'Aposentadoria']
const avisosD  = ['Trabalhado', 'Indenizado', 'Dispensado']

const checklistDeslig = [
  'Equipamentos devolvidos',
  'Crachá / cartão de acesso devolvido',
  'Acessos ao sistema revogados',
  'E-mail corporativo desativado',
  'Documentos e TRCT entregues',
  'Entrevista de desligamento realizada',
]

/* ─── Campo de formulário helper ─────────────────────────── */
function Campo({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--gray)', marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#c62828' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle = { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }
const selectStyle = { ...inputStyle, background: '#fff', cursor: 'pointer' }

/* ─── Página ─────────────────────────────────────────────── */
export default function RH() {
  const [lista, setLista]               = useState<Colaborador[]>(inicial)
  const [filtDept, setFiltDept]         = useState('')
  const [filtStatus, setFiltStatus]     = useState('')
  const [busca, setBusca]               = useState('')

  // Modais
  const [modalAdm, setModalAdm]         = useState(false)
  const [modalDeslig, setModalDeslig]   = useState<Colaborador | null>(null)

  // Form admissão
  const [admNome, setAdmNome]           = useState('')
  const [admCargo, setAdmCargo]         = useState('')
  const [admDept, setAdmDept]           = useState('')
  const [admContrato, setAdmContrato]   = useState('CLT')
  const [admDataAdm, setAdmDataAdm]     = useState('')
  const [admEmail, setAdmEmail]         = useState('')
  const [admCPF, setAdmCPF]             = useState('')
  const [admNasc, setAdmNasc]           = useState('')
  const [admSalario, setAdmSalario]     = useState('')
  const [admPerfil, setAdmPerfil]       = useState('')
  const [admBeneficios, setAdmBeneficios] = useState<string[]>([])

  // Form desligamento
  const [dMotivo, setDMotivo]           = useState('')
  const [dAviso, setDAviso]             = useState('Trabalhado')
  const [dData, setDData]               = useState('')
  const [dObs, setDObs]                 = useState('')
  const [dChecklist, setDChecklist]     = useState<string[]>([])

  const ativos = lista.filter(c => c.ativo)
  const filtrados = ativos.filter(c =>
    (!filtDept   || c.dept === filtDept) &&
    (!filtStatus || c.status === filtStatus) &&
    (!busca      || c.nome.toLowerCase().includes(busca.toLowerCase()) || c.cargo.toLowerCase().includes(busca.toLowerCase()))
  )

  function admitir() {
    if (!admNome || !admCargo || !admDept || !admDataAdm) return
    const novo: Colaborador = { nome: admNome, cargo: admCargo, dept: admDept, adm: admDataAdm, status: admContrato === 'Estágio' ? 'Estágio' : 'Ativo', ferias: false, ativo: true }
    setLista(prev => [...prev, novo])
    setModalAdm(false)
    setAdmNome(''); setAdmCargo(''); setAdmDept(''); setAdmDataAdm(''); setAdmEmail(''); setAdmCPF(''); setAdmNasc(''); setAdmSalario(''); setAdmPerfil(''); setAdmBeneficios([])
  }

  function dispensar() {
    if (!modalDeslig || !dMotivo || !dData) return
    setLista(prev => prev.map(c => c.nome === modalDeslig.nome ? { ...c, ativo: false, status: 'Desligado' } : c))
    setModalDeslig(null)
    setDMotivo(''); setDData(''); setDObs(''); setDChecklist([])
  }

  function toggleBeneficio(b: string) {
    setAdmBeneficios(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])
  }
  function toggleCheck(c: string) {
    setDChecklist(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  return (
    <div className="dash-wrap">

      {/* Toolbar */}
      <div className="pg-toolbar">
        <div>
          <p className="pg-title">RH — Colaboradores</p>
          <p className="pg-sub">{ativos.length} colaboradores ativos · 3 férias pendentes de aprovação</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/rh/ponto"        className="btn btn-outline btn-sm">🕐 Ponto</Link>
          <Link href="/rh/ferias"       className="btn btn-outline btn-sm">🌴 Férias</Link>
          <Link href="/rh/organograma"  className="btn btn-outline btn-sm">🏢 Organograma</Link>
          <button type="button" onClick={() => setModalAdm(true)} className="btn btn-navy btn-sm">+ Admitir colaborador</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2.5 mb-3">
        {[
          { label: 'Total',      val: String(ativos.length), hint: 'Colaboradores ativos',    valClass: 'val-navy'  },
          { label: 'Jurídico',   val: String(ativos.filter(c => c.dept === 'Jurídico').length), hint: 'Advogados e estagiários', valClass: 'val-navy' },
          { label: 'Férias',     val: '3',   hint: 'Pendentes de aprovação',  valClass: 'val-green' },
          { label: 'Folha/mês', val: '52K', hint: 'Total bruto mai/26',      valClass: 'val-gray'  },
        ].map((c) => (
          <div key={c.label} className="card">
            <p className="card-label">{c.label}</p>
            <p className={`card-val ${c.valClass}`}>{c.val}</p>
            <p className="card-hint">{c.hint}</p>
          </div>
        ))}
      </div>

      <div className="alert alert-orange mb-3">
        <span>⚠️</span>
        <span>3 solicitações de férias aguardam aprovação da diretoria — Ana Paula Souza, Mariana Santos e Bruno Alves.</span>
      </div>

      {/* Filtros */}
      <div className="filter-bar">
        <select title="Filtrar por departamento" value={filtDept} onChange={e => setFiltDept(e.target.value)}>
          <option value="">Todos os departamentos</option>
          {depts.map(d => <option key={d}>{d}</option>)}
        </select>
        <select title="Filtrar por status" value={filtStatus} onChange={e => setFiltStatus(e.target.value)}>
          <option value="">Todos os status</option>
          <option>Ativo</option>
          <option>Estágio</option>
          <option>Férias</option>
        </select>
        <input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou cargo…" style={{ minWidth: 200 }} />
      </div>

      {/* Tabela */}
      <table className="tbl">
        <thead>
          <tr>
            <th>Nome</th><th>Cargo</th><th>Departamento</th>
            <th>Admissão</th><th>Status</th><th>Férias</th>
            <th aria-label="Ações"></th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((c) => (
            <tr key={c.nome}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    {c.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <span className="font-semibold">{c.nome}</span>
                </div>
              </td>
              <td>{c.cargo}</td>
              <td>{c.dept}</td>
              <td style={{ color: 'var(--gray)' }}>{c.adm}</td>
              <td><span className={c.status === 'Ativo' ? 'badge badge-green' : 'badge badge-navy'}>{c.status}</span></td>
              <td>{c.ferias ? <span className="badge badge-orange">Pendente</span> : <span className="val-gray">—</span>}</td>
              <td>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button type="button" className="btn btn-outline btn-sm">Ver</button>
                  <button type="button" onClick={() => setModalDeslig(c)} className="btn btn-sm" style={{ background: '#fff', color: '#c62828', border: '1px solid #c62828', padding: '5px 11px', fontSize: 12, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                    Dispensar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Modal Admissão ── */}
      {modalAdm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 640, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>

            <div style={{ background: 'var(--navy)', padding: '18px 24px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: 0 }}>👤 Admitir Colaborador</p>
                <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 3 }}>Preencha os dados do novo colaborador</p>
              </div>
              <button type="button" onClick={() => setModalAdm(false)} style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Dados pessoais */}
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--navy)', paddingBottom: 6, borderBottom: '2px solid var(--border)' }}>Dados Pessoais</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <Campo label="Nome completo" required>
                    <input style={inputStyle} value={admNome} onChange={e => setAdmNome(e.target.value)} placeholder="Nome completo" />
                  </Campo>
                </div>
                <Campo label="CPF">
                  <input style={inputStyle} value={admCPF} onChange={e => setAdmCPF(e.target.value)} placeholder="000.000.000-00" />
                </Campo>
                <Campo label="Data de nascimento">
                  <input style={inputStyle} type="date" value={admNasc} onChange={e => setAdmNasc(e.target.value)} />
                </Campo>
                <div style={{ gridColumn: 'span 2' }}>
                  <Campo label="E-mail corporativo">
                    <input style={inputStyle} type="email" value={admEmail} onChange={e => setAdmEmail(e.target.value)} placeholder="nome@empresa.com.br" />
                  </Campo>
                </div>
              </div>

              {/* Dados profissionais */}
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--navy)', paddingBottom: 6, borderBottom: '2px solid var(--border)', marginTop: 4 }}>Dados Profissionais</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Campo label="Cargo" required>
                  <input style={inputStyle} value={admCargo} onChange={e => setAdmCargo(e.target.value)} placeholder="Ex: Advogado Associado" />
                </Campo>
                <Campo label="Departamento" required>
                  <select style={selectStyle} value={admDept} onChange={e => setAdmDept(e.target.value)}>
                    <option value="">Selecione…</option>
                    {depts.map(d => <option key={d}>{d}</option>)}
                  </select>
                </Campo>
                <Campo label="Tipo de contrato">
                  <select style={selectStyle} value={admContrato} onChange={e => setAdmContrato(e.target.value)}>
                    {contratos.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Campo>
                <Campo label="Data de admissão" required>
                  <input style={inputStyle} type="date" value={admDataAdm} onChange={e => setAdmDataAdm(e.target.value)} />
                </Campo>
                <Campo label="Salário bruto (R$)">
                  <input style={inputStyle} value={admSalario} onChange={e => setAdmSalario(e.target.value)} placeholder="0,00" />
                </Campo>
                <Campo label="Perfil de acesso">
                  <select style={selectStyle} value={admPerfil} onChange={e => setAdmPerfil(e.target.value)}>
                    <option value="">Selecione…</option>
                    {perfis.map(p => <option key={p}>{p}</option>)}
                  </select>
                </Campo>
              </div>

              {/* Benefícios */}
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--navy)', paddingBottom: 6, borderBottom: '2px solid var(--border)', marginTop: 4 }}>Benefícios</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['Vale Transporte', 'Vale Refeição', 'Plano de Saúde', 'Plano Odontológico', 'Seguro de Vida', 'Gympass'].map(b => (
                  <label key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', padding: '5px 10px', borderRadius: 6, border: `1px solid ${admBeneficios.includes(b) ? 'var(--navy)' : 'var(--border)'}`, background: admBeneficios.includes(b) ? '#edf1f9' : '#fff' }}>
                    <input type="checkbox" checked={admBeneficios.includes(b)} onChange={() => toggleBeneficio(b)} style={{ accentColor: 'var(--navy)' }} />
                    {b}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setModalAdm(false)} className="btn btn-outline">Cancelar</button>
              <button type="button" onClick={admitir} className="btn btn-navy">✅ Confirmar admissão</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Desligamento ── */}
      {modalDeslig && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 560, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>

            <div style={{ background: '#c62828', padding: '18px 24px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: 0 }}>🚪 Desligamento</p>
                <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 12, marginTop: 3 }}>{modalDeslig.nome} · {modalDeslig.cargo}</p>
              </div>
              <button type="button" onClick={() => setModalDeslig(null)} style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              <div className="alert alert-red" style={{ marginBottom: 0 }}>
                <span>⚠️</span>
                <span>Esta ação irá registrar o desligamento do colaborador e remover seu acesso ao sistema.</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Campo label="Motivo do desligamento" required>
                  <select style={selectStyle} value={dMotivo} onChange={e => setDMotivo(e.target.value)}>
                    <option value="">Selecione…</option>
                    {motivosD.map(m => <option key={m}>{m}</option>)}
                  </select>
                </Campo>
                <Campo label="Aviso prévio">
                  <select style={selectStyle} value={dAviso} onChange={e => setDAviso(e.target.value)}>
                    {avisosD.map(a => <option key={a}>{a}</option>)}
                  </select>
                </Campo>
                <div style={{ gridColumn: 'span 2' }}>
                  <Campo label="Data de desligamento" required>
                    <input style={inputStyle} type="date" value={dData} onChange={e => setDData(e.target.value)} />
                  </Campo>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <Campo label="Observações">
                    <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }} value={dObs} onChange={e => setDObs(e.target.value)} placeholder="Observações adicionais…" />
                  </Campo>
                </div>
              </div>

              {/* Checklist */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--navy)', paddingBottom: 6, borderBottom: '2px solid var(--border)', marginBottom: 10 }}>
                  Checklist de desligamento ({dChecklist.length}/{checklistDeslig.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {checklistDeslig.map(item => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer', padding: '8px 12px', borderRadius: 6, background: dChecklist.includes(item) ? '#eaf3e5' : 'var(--light)', border: `1px solid ${dChecklist.includes(item) ? 'var(--green)' : 'var(--border)'}` }}>
                      <input type="checkbox" checked={dChecklist.includes(item)} onChange={() => toggleCheck(item)} style={{ accentColor: 'var(--green)', width: 16, height: 16 }} />
                      <span style={{ color: dChecklist.includes(item) ? 'var(--green-dark)' : '#374151' }}>{item}</span>
                      {dChecklist.includes(item) && <span style={{ marginLeft: 'auto', fontSize: 14 }}>✅</span>}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--gray)' }}>
                {dChecklist.length < checklistDeslig.length && `⚠️ ${checklistDeslig.length - dChecklist.length} itens do checklist pendentes`}
                {dChecklist.length === checklistDeslig.length && '✅ Checklist completo'}
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setModalDeslig(null)} className="btn btn-outline">Cancelar</button>
                <button type="button" onClick={dispensar} className="btn btn-sm" style={{ background: '#c62828', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13 }}>
                  🚪 Confirmar desligamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
