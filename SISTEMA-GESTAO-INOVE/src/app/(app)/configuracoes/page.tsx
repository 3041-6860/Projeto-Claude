'use client'
import { useState } from 'react'

/* ─── Dados ──────────────────────────────────────────────── */
const tabs = ['Usuários', 'Perfis & Permissões', 'Integrações', 'Notificações', 'Aparência', 'Segurança', 'Sistema']

const usuarios = [
  { nome: 'Administrador',       email: 'admin@gcj.adv.br',  perfil: 'Administrador', status: 'Ativo', ultimo: '—' },
  { nome: 'Sandra Otto',         email: 'sandra',            perfil: 'Administrador', status: 'Ativo', ultimo: '—' },
  { nome: 'Rodrigo Gonçalves',   email: 'rodrigo',           perfil: 'Administrador', status: 'Ativo', ultimo: '—' },
]

const perfis = [
  { nome: 'Administrador', desc: 'Acesso total ao sistema',                   usuarios: 1, cor: '#c62828' },
  { nome: 'Operacional',   desc: 'Processos, documentos e financeiro',        usuarios: 2, cor: 'var(--navy)' },
  { nome: 'Jurídico',      desc: 'Processos, documentos e CRM',               usuarios: 8, cor: 'var(--green)' },
  { nome: 'Comercial',     desc: 'CRM, negócios e relatórios comerciais',     usuarios: 3, cor: '#e65100' },
  { nome: 'Financeiro',    desc: 'Módulo financeiro somente leitura/edição',  usuarios: 2, cor: '#0059b3' },
]

const integracoes = [
  { nome: 'WhatsApp Business API', status: 'Conectado',       icone: '💬', desc: 'n8n — recebe e envia mensagens' },
  { nome: 'Bitrix24',              status: 'Conectado',       icone: '🔗', desc: 'CRM e pipeline sincronizados' },
  { nome: 'PDPJ — Tribunal',       status: 'Conectado',       icone: '⚖️', desc: 'Monitoramento automático de processos' },
  { nome: 'Google Drive',          status: 'Não configurado', icone: '📁', desc: 'Backup automático de documentos' },
  { nome: 'Gmail',                 status: 'Não configurado', icone: '📧', desc: 'Envio de notificações por e-mail' },
  { nome: 'Google Calendar',       status: 'Não configurado', icone: '📅', desc: 'Sincronização de agenda e prazos' },
  { nome: 'Microsoft 365',         status: 'Não configurado', icone: '📊', desc: 'Outlook, Teams e OneDrive' },
]

const notifGrupos = [
  {
    grupo: 'Tarefas & Processos', icone: '📋',
    itens: [
      { id: 'tarefa_atrib',   label: 'Tarefa atribuída a mim',          email: true,  push: true  },
      { id: 'tarefa_prazo',   label: 'Prazo de tarefa vencendo (24h)',  email: true,  push: true  },
      { id: 'proc_mov',       label: 'Movimentação em processo',        email: true,  push: false },
      { id: 'proc_prazo',     label: 'Prazo processual vencendo (48h)', email: true,  push: true  },
    ],
  },
  {
    grupo: 'RH & Equipe', icone: '👥',
    itens: [
      { id: 'ferias_sol',    label: 'Solicitação de férias pendente',  email: true,  push: true  },
      { id: 'ponto_atraso',  label: 'Colaborador com atraso no ponto', email: false, push: true  },
      { id: 'aniv',          label: 'Aniversário de colaborador',       email: true,  push: false },
    ],
  },
  {
    grupo: 'Financeiro', icone: '💰',
    itens: [
      { id: 'fin_venc',   label: 'Título a vencer (3 dias)',    email: true,  push: true  },
      { id: 'fin_inadim', label: 'Novo título em atraso',        email: true,  push: true  },
      { id: 'fin_meta',   label: 'Meta mensal atingida',         email: true,  push: true  },
    ],
  },
  {
    grupo: 'Sistema', icone: '⚙️',
    itens: [
      { id: 'sis_backup', label: 'Backup concluído',          email: true,  push: false },
      { id: 'sis_login',  label: 'Novo login detectado',      email: true,  push: true  },
      { id: 'sis_erro',   label: 'Erro crítico no sistema',   email: true,  push: true  },
    ],
  },
]

const logAcessos: { usuario: string; acao: string; ip: string; data: string; ok: boolean }[] = []

/* ─── Módulos do sistema ─────────────────────────────────── */
const modulos = [
  { id: 'dashboard',    label: 'Dashboard',          icone: '🏠', grupo: 'Principal'    },
  { id: 'feed',         label: 'Feed',               icone: '📰', grupo: 'Principal'    },
  { id: 'negocios',     label: 'Negócios / Pipelines',icone: '💼', grupo: 'Principal'    },
  { id: 'crm',          label: 'CRM / Leads',        icone: '👥', grupo: 'Principal'    },
  { id: 'calendario',   label: 'Calendário',         icone: '📅', grupo: 'Principal'    },
  { id: 'documentos',   label: 'Documentos',         icone: '📄', grupo: 'Módulos'      },
  { id: 'financeiro',   label: 'Financeiro',         icone: '💰', grupo: 'Módulos'      },
  { id: 'rh',           label: 'RH',                 icone: '👤', grupo: 'Módulos'      },
  { id: 'rh_ponto',     label: '↳ Ponto Eletrônico', icone: '🕐', grupo: 'Módulos'      },
  { id: 'rh_ferias',    label: '↳ Férias',           icone: '🌴', grupo: 'Módulos'      },
  { id: 'marketing',    label: 'Marketing',          icone: '📣', grupo: 'Módulos'      },
  { id: 'tarefas',      label: 'Tarefas',            icone: '✅', grupo: 'Módulos'      },
  { id: 'mensagens',    label: 'Mensagens',          icone: '💬', grupo: 'Comunicação'  },
  { id: 'datajuri',     label: 'Jurídico',                icone: '⚖️', grupo: 'Jurídico'     },
  { id: 'configuracoes',label: 'Configurações',      icone: '⚙️', grupo: 'Sistema'      },
]

type Nivel = 'none' | 'read' | 'edit' | 'full'

const niveisConfig: Record<Nivel, { label: string; emoji: string; bg: string; color: string }> = {
  none: { label: 'Sem acesso', emoji: '❌', bg: '#fce8e8', color: '#c62828' },
  read: { label: 'Leitura',   emoji: '👁️', bg: '#f0f0f0', color: '#606062' },
  edit: { label: 'Edição',    emoji: '✏️',  bg: '#fff3e0', color: '#bf360c' },
  full: { label: 'Total',     emoji: '✅',  bg: '#eaf3e5', color: '#4d7a38' },
}

const permissoesDefault: Record<string, Record<string, Nivel>> = {
  Administrador: { dashboard:'full', feed:'full', negocios:'full', crm:'full', calendario:'full', documentos:'full', financeiro:'full', rh:'full', rh_ponto:'full', rh_ferias:'full', marketing:'full', tarefas:'full', mensagens:'full', datajuri:'full', configuracoes:'full' },
  Operacional:   { dashboard:'read', feed:'full', negocios:'edit', crm:'edit', calendario:'full', documentos:'full', financeiro:'full', rh:'read', rh_ponto:'read', rh_ferias:'read', marketing:'edit', tarefas:'full', mensagens:'full', datajuri:'none', configuracoes:'none' },
  Jurídico:      { dashboard:'read', feed:'full', negocios:'edit', crm:'full', calendario:'full', documentos:'full', financeiro:'none', rh:'none', rh_ponto:'none', rh_ferias:'read', marketing:'none', tarefas:'full', mensagens:'full', datajuri:'full', configuracoes:'none' },
  Comercial:     { dashboard:'read', feed:'full', negocios:'full', crm:'full', calendario:'read', documentos:'read', financeiro:'none', rh:'none', rh_ponto:'none', rh_ferias:'read', marketing:'full', tarefas:'edit', mensagens:'full', datajuri:'none', configuracoes:'none' },
  Financeiro:    { dashboard:'read', feed:'read', negocios:'none', crm:'none', calendario:'read', documentos:'read', financeiro:'full', rh:'none', rh_ponto:'none', rh_ferias:'none', marketing:'none', tarefas:'read', mensagens:'full', datajuri:'none', configuracoes:'none' },
}

/* ─── Toggle helper ─────────────────────────────────────── */
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
        background: on ? 'var(--green)' : 'var(--border)',
        position: 'relative', transition: 'background .2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 18 : 3,
        width: 14, height: 14, borderRadius: '50%',
        background: '#fff', transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
      }} />
    </button>
  )
}

/* ─── Página ─────────────────────────────────────────────── */
export default function Configuracoes() {
  const [tab, setTab] = useState(0)

  // Perfis state
  const [perfilEditando, setPerfilEditando] = useState<string | null>(null)
  const [permissoes, setPermissoes] = useState<Record<string, Record<string, Nivel>>>(() =>
    JSON.parse(JSON.stringify(permissoesDefault))
  )
  const [permTemp, setPermTemp] = useState<Record<string, Nivel>>({})

  function abrirModal(nomePerfil: string) {
    setPermTemp({ ...permissoes[nomePerfil] })
    setPerfilEditando(nomePerfil)
  }
  function salvarPermissoes() {
    if (!perfilEditando) return
    setPermissoes(prev => ({ ...prev, [perfilEditando]: { ...permTemp } }))
    setPerfilEditando(null)
  }

  // Notificações state
  const [notifs, setNotifs] = useState(() => {
    const map: Record<string, { email: boolean; push: boolean }> = {}
    notifGrupos.forEach(g => g.itens.forEach(i => { map[i.id] = { email: i.email, push: i.push } }))
    return map
  })

  // Aparência state
  const [tema, setTema] = useState('navy')
  const [nomeEmpresa, setNomeEmpresa] = useState('GCJ Advocacia')
  const [descEmpresa, setDescEmpresa] = useState('Gestão Jurídica Inteligente')

  // Segurança state
  const [senhaMin, setSenhaMin]       = useState(8)
  const [expiraSenha, setExpiraSenha] = useState(90)
  const [sessaoMin, setSessaoMin]     = useState(480)
  const [twoFA, setTwoFA]             = useState(false)

  const temas = [
    { id: 'navy',  label: 'Azul Marinho', cor: '#1F3763' },
    { id: 'green', label: 'Verde',        cor: '#62974B' },
    { id: 'dark',  label: 'Escuro',       cor: '#1a1a2e' },
    { id: 'slate', label: 'Cinza',        cor: '#475569' },
  ]

  return (
    <div className="dash-wrap">
      <div className="pg-toolbar">
        <div>
          <p className="pg-title">Configurações</p>
          <p className="pg-sub">Gerencie usuários, perfis, integrações e parâmetros do sistema</p>
        </div>
      </div>

      <div className="tabs" style={{ flexWrap: 'wrap' }}>
        {tabs.map((t, i) => (
          <div key={t} className={`tab ${i === tab ? 'on' : ''}`} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>

      {/* ── Tab 0: Usuários ── */}
      {tab === 0 && (
        <div>
          <div className="pg-toolbar mb-3">
            <p className="card-label">{usuarios.length} usuários cadastrados</p>
            <button className="btn btn-navy btn-sm">+ Novo Usuário</button>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Último acesso</th><th></th></tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.email}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                        {u.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-semibold">{u.nome}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--navy)' }}>{u.email}</td>
                  <td><span className="badge badge-navy">{u.perfil}</span></td>
                  <td><span className="badge badge-green">{u.status}</span></td>
                  <td style={{ color: 'var(--gray)' }}>{u.ultimo}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-outline btn-sm">Editar</button>
                      <button className="btn btn-outline btn-sm">Resetar senha</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab 1: Perfis & Permissões ── */}
      {tab === 1 && (
        <div className="flex flex-col gap-3">

          {/* Cards dos perfis */}
          <div className="grid grid-cols-3 gap-3">
            {perfis.map((p) => (
              <div key={p.nome} className="card" style={{ borderLeft: `4px solid ${p.cor}` }}>
                <div className="flex justify-between items-start mb-1">
                  <p className="mod-title">{p.nome}</p>
                  <span className="badge badge-gray">{p.usuarios} usuários</span>
                </div>
                <p className="card-hint mb-3">{p.desc}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {modulos.slice(0, 5).map(m => {
                    const n = permissoes[p.nome]?.[m.id] ?? 'none'
                    const cfg = niveisConfig[n]
                    return (
                      <span key={m.id} title={`${m.label}: ${cfg.label}`}
                        style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: cfg.bg, color: cfg.color, fontWeight: 600 }}>
                        {m.icone} {cfg.emoji}
                      </span>
                    )
                  })}
                  <span style={{ fontSize: 10, color: 'var(--gray)' }}>+{modulos.length - 5}</span>
                </div>
                <button type="button" onClick={() => abrirModal(p.nome)} className="btn btn-outline btn-sm">✏️ Editar permissões</button>
              </div>
            ))}
            <div className="card" style={{ borderLeft: '4px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button type="button" className="btn btn-navy btn-sm">+ Novo Perfil</button>
            </div>
          </div>

          {/* Matriz visão geral */}
          <div className="card">
            <p className="mod-title mb-3">📊 Visão geral das permissões</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 10px', background: 'var(--navy)', color: '#fff', fontWeight: 700, borderRadius: '4px 0 0 0', whiteSpace: 'nowrap' }}>Módulo</th>
                    {perfis.map(p => (
                      <th key={p.nome} style={{ padding: '8px 12px', background: 'var(--navy)', color: '#fff', fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: p.cor, marginRight: 5 }} />
                        {p.nome}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modulos.map((m, idx) => (
                    <tr key={m.id} style={{ background: idx % 2 === 0 ? '#fff' : 'var(--light)' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 500, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ marginRight: 6 }}>{m.icone}</span>{m.label}
                      </td>
                      {perfis.map(p => {
                        const n = permissoes[p.nome]?.[m.id] ?? 'none'
                        const cfg = niveisConfig[n]
                        return (
                          <td key={p.nome} style={{ textAlign: 'center', padding: '5px 8px', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 8, background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}>
                              {cfg.emoji} {cfg.label}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Integrações ── */}
      {tab === 2 && (
        <div className="flex flex-col gap-3">
          <div className="alert alert-navy">
            <span>ℹ️</span>
            <span>Integrações marcadas como <strong>Não configurado</strong> requerem credenciais — acesse a documentação de cada serviço para obter as chaves de API.</span>
          </div>
          {integracoes.map((int) => (
            <div key={int.nome} className="card flex justify-between items-center">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>{int.icone}</span>
                <div>
                  <p className="mod-title">{int.nome}</p>
                  <p className="card-hint">{int.desc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={int.status === 'Conectado' ? 'badge badge-green' : 'badge badge-gray'}>{int.status}</span>
                <button className="btn btn-outline btn-sm">
                  {int.status === 'Conectado' ? 'Configurar' : 'Conectar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 3: Notificações ── */}
      {tab === 3 && (
        <div className="flex flex-col gap-3">
          <div className="alert alert-navy">
            <span>ℹ️</span>
            <span>Configure quais alertas você deseja receber por <strong>e-mail</strong> e por <strong>notificação push</strong> no sistema.</span>
          </div>

          {notifGrupos.map((g) => (
            <div key={g.grupo} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>{g.icone}</span>
                <p className="mod-title" style={{ margin: 0 }}>{g.grupo}</p>
              </div>

              {/* Cabeçalho da coluna */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', gap: 8, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                <span className="card-label" style={{ margin: 0 }}>Alerta</span>
                <span className="card-label" style={{ margin: 0, textAlign: 'center' }}>E-mail</span>
                <span className="card-label" style={{ margin: 0, textAlign: 'center' }}>Push</span>
              </div>

              {g.itens.map((item) => (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', gap: 8, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: '#374151' }}>{item.label}</span>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Toggle on={notifs[item.id]?.email ?? false} onChange={() =>
                      setNotifs(prev => ({ ...prev, [item.id]: { ...prev[item.id], email: !prev[item.id].email } }))
                    } />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Toggle on={notifs[item.id]?.push ?? false} onChange={() =>
                      setNotifs(prev => ({ ...prev, [item.id]: { ...prev[item.id], push: !prev[item.id].push } }))
                    } />
                  </div>
                </div>
              ))}
            </div>
          ))}

          <button className="btn btn-navy" style={{ alignSelf: 'flex-start' }}>Salvar preferências</button>
        </div>
      )}

      {/* ── Tab 4: Aparência ── */}
      {tab === 4 && (
        <div className="grid grid-cols-2 gap-3">

          {/* Logo */}
          <div className="card col-span-2">
            <p className="card-label mb-3">Logo da Empresa</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: 10, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 700 }}>
                GCJ
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>Formatos aceitos: PNG, SVG · Tamanho máx: 2MB</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-navy btn-sm">Enviar logo</button>
                  <button className="btn btn-outline btn-sm">Remover</button>
                </div>
              </div>
            </div>
          </div>

          {/* Nome e descrição */}
          <div className="card">
            <p className="card-label mb-2">Nome do Sistema</p>
            <input
              type="text"
              value={nomeEmpresa}
              onChange={e => setNomeEmpresa(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: 13, outline: 'none' }}
            />
          </div>
          <div className="card">
            <p className="card-label mb-2">Subtítulo / Slogan</p>
            <input
              type="text"
              value={descEmpresa}
              onChange={e => setDescEmpresa(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: 13, outline: 'none' }}
            />
          </div>

          {/* Tema de cores */}
          <div className="card col-span-2">
            <p className="card-label mb-3">Tema de Cores</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {temas.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTema(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
                    border: tema === t.id ? `2px solid ${t.cor}` : '2px solid var(--border)',
                    background: tema === t.id ? `${t.cor}14` : '#fff',
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                    color: tema === t.id ? t.cor : 'var(--gray)',
                    transition: 'all .15s',
                  }}
                >
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: t.cor, flexShrink: 0 }} />
                  {t.label}
                  {tema === t.id && <span style={{ marginLeft: 4 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Pré-visualização */}
          <div className="card col-span-2">
            <p className="card-label mb-3">Pré-visualização do Banner</p>
            <div style={{ background: `linear-gradient(135deg, ${temas.find(t => t.id === tema)?.cor} 0%, #2a5298 55%, var(--green) 100%)`, borderRadius: 10, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Bom dia, Guilherme! 👋</p>
                <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 13, marginTop: 3 }}>Sexta-feira, 23 de maio de 2026</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 8, padding: '8px 14px' }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{nomeEmpresa}</p>
                <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>{descEmpresa}</p>
              </div>
            </div>
          </div>

          <button className="btn btn-navy" style={{ gridColumn: 'span 2', justifySelf: 'start' }}>Salvar aparência</button>
        </div>
      )}

      {/* ── Tab 5: Segurança ── */}
      {tab === 5 && (
        <div className="flex flex-col gap-3">

          {/* Alerta de tentativa suspeita */}
          <div className="alert alert-red">
            <span>🚨</span>
            <span><strong>Atenção:</strong> 1 tentativa de acesso não autorizada detectada em 22/05/26 às 03:17 — IP: 203.0.113.42</span>
          </div>

          {/* Política de senhas */}
          <div className="card">
            <p className="mod-title mb-3">🔑 Política de Senhas</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="card-label mb-1">Tamanho mínimo (caracteres)</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="range" min={6} max={20} value={senhaMin} onChange={e => setSenhaMin(+e.target.value)} style={{ flex: 1 }} />
                  <span style={{ fontWeight: 700, color: 'var(--navy)', minWidth: 24, textAlign: 'right' }}>{senhaMin}</span>
                </div>
              </div>
              <div>
                <p className="card-label mb-1">Expiração de senha (dias)</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="range" min={0} max={365} step={30} value={expiraSenha} onChange={e => setExpiraSenha(+e.target.value)} style={{ flex: 1 }} />
                  <span style={{ fontWeight: 700, color: 'var(--navy)', minWidth: 32, textAlign: 'right' }}>{expiraSenha === 0 ? 'Nunca' : `${expiraSenha}d`}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
              {['Letras maiúsculas', 'Números', 'Caracteres especiais'].map(r => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--navy)' }} />
                  {r}
                </label>
              ))}
            </div>
          </div>

          {/* Sessão */}
          <div className="card">
            <p className="mod-title mb-3">🕐 Sessão & Acesso</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="card-label mb-1">Timeout de inatividade (minutos)</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="range" min={15} max={480} step={15} value={sessaoMin} onChange={e => setSessaoMin(+e.target.value)} style={{ flex: 1 }} />
                  <span style={{ fontWeight: 700, color: 'var(--navy)', minWidth: 40, textAlign: 'right' }}>{sessaoMin >= 60 ? `${sessaoMin / 60}h` : `${sessaoMin}min`}</span>
                </div>
              </div>
              <div>
                <p className="card-label mb-2">Autenticação em dois fatores (2FA)</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Toggle on={twoFA} onChange={() => setTwoFA(!twoFA)} />
                  <span style={{ fontSize: 13, color: twoFA ? 'var(--green)' : 'var(--gray)' }}>
                    {twoFA ? 'Ativado — requer código no login' : 'Desativado'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Log de acessos */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p className="mod-title" style={{ margin: 0 }}>📋 Log de Acessos Recentes</p>
              <button className="btn btn-outline btn-sm">Exportar log completo</button>
            </div>
            <table className="tbl">
              <thead>
                <tr><th>Usuário</th><th>Ação</th><th>IP</th><th>Data/Hora</th><th>Status</th></tr>
              </thead>
              <tbody>
                {logAcessos.map((l, i) => (
                  <tr key={i}>
                    <td className="font-semibold">{l.usuario}</td>
                    <td>{l.acao}</td>
                    <td style={{ color: 'var(--gray)', fontFamily: 'monospace' }}>{l.ip}</td>
                    <td style={{ color: 'var(--gray)' }}>{l.data}</td>
                    <td>
                      <span className={l.ok ? 'badge badge-green' : 'badge badge-red'}>
                        {l.ok ? 'OK' : '⚠️ Bloqueado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="btn btn-navy" style={{ alignSelf: 'flex-start' }}>Salvar configurações de segurança</button>
        </div>
      )}

      {/* ── Tab 6: Sistema ── */}
      {tab === 6 && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { titulo: 'Nome do Sistema',  val: 'Inove Prime — Sistema de Gestão' },
            { titulo: 'Fuso Horário',     val: 'América/São_Paulo (UTC-3)' },
            { titulo: 'Idioma',           val: 'Português (Brasil)' },
            { titulo: 'Versão',           val: '1.0.0 — Build 20260522' },
          ].map((s) => (
            <div key={s.titulo} className="card">
              <p className="card-label">{s.titulo}</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)', marginTop: 4 }}>{s.val}</p>
            </div>
          ))}

          {/* Uso do sistema */}
          <div className="card col-span-2">
            <p className="card-label mb-3">Uso do Sistema — últimos 30 dias</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Logins',          val: '312',  hint: '+18% vs mês anterior', cor: 'val-navy'  },
                { label: 'Tarefas criadas', val: '87',   hint: '64 concluídas (74%)',   cor: 'val-green' },
                { label: 'Documentos',      val: '143',  hint: 'Gerados no período',     cor: 'val-navy'  },
                { label: 'Uptime',          val: '99,8%', hint: '2h de manutenção',      cor: 'val-green' },
              ].map(m => (
                <div key={m.label} className="card" style={{ boxShadow: 'none', background: 'var(--light)' }}>
                  <p className="card-label">{m.label}</p>
                  <p className={`card-val ${m.cor}`} style={{ fontSize: 20 }}>{m.val}</p>
                  <p className="card-hint">{m.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card col-span-2">
            <p className="card-label mb-2">Ações do Sistema</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-outline">📦 Exportar todos os dados</button>
              <button className="btn btn-outline">💾 Gerar backup</button>
              <button className="btn btn-outline">📋 Ver logs do servidor</button>
              <button className="btn btn-outline" style={{ color: '#c62828', borderColor: '#c62828' }}>🗑️ Limpar cache</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de permissões ── */}
      {perfilEditando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>

            {/* Header */}
            <div style={{ background: perfis.find(p => p.nome === perfilEditando)?.cor ?? 'var(--navy)', padding: '18px 24px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: 0 }}>✏️ Editar permissões — {perfilEditando}</p>
                <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 3 }}>
                  {perfis.find(p => p.nome === perfilEditando)?.desc}
                </p>
              </div>
              <button type="button" onClick={() => setPerfilEditando(null)}
                style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ×
              </button>
            </div>

            {/* Legenda */}
            <div style={{ display: 'flex', gap: 12, padding: '12px 24px', background: 'var(--light)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
              {(Object.entries(niveisConfig) as [Nivel, typeof niveisConfig[Nivel]][]).map(([k, v]) => (
                <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                  <span style={{ padding: '1px 7px', borderRadius: 8, background: v.bg, color: v.color, fontWeight: 700 }}>{v.emoji} {v.label}</span>
                </span>
              ))}
            </div>

            {/* Corpo com scroll */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
              {['Principal', 'Módulos', 'Jurídico', 'Comunicação', 'Sistema'].map(grupo => {
                const modsGrupo = modulos.filter(m => m.grupo === grupo)
                return (
                  <div key={grupo}>
                    <p style={{ padding: '10px 24px 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gray)', background: 'var(--light)', borderBottom: '1px solid var(--border)' }}>{grupo}</p>
                    {modsGrupo.map(m => {
                      const atual = permTemp[m.id] ?? 'none'
                      return (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 24px', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>
                            <span style={{ marginRight: 8 }}>{m.icone}</span>{m.label}
                          </span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {(Object.entries(niveisConfig) as [Nivel, typeof niveisConfig[Nivel]][]).map(([k, v]) => (
                              <button type="button" key={k} onClick={() => setPermTemp(prev => ({ ...prev, [m.id]: k }))}
                                style={{
                                  padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                  background: atual === k ? v.bg : '#f9f9f9',
                                  color: atual === k ? v.color : '#aaa',
                                  border: atual === k ? `1.5px solid ${v.color}` : '1.5px solid #e5e7eb',
                                  transition: 'all .12s',
                                }}>
                                {v.emoji} {v.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fff', borderRadius: '0 0 12px 12px' }}>
              <button type="button" onClick={() => setPerfilEditando(null)} className="btn btn-outline">Cancelar</button>
              <button type="button" onClick={salvarPermissoes} className="btn btn-navy">💾 Salvar permissões</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
