'use client'
import Link from 'next/link'

/* ─── Estrutura hierárquica ──────────────────────────────── */
const ceo = {
  nome: 'Guilherme C. Junqueira',
  cargo: 'Sócio Principal / CEO',
  dept: 'Diretoria',
  adm: '01/03/2020',
  email: 'guilherme@gcj.adv.br',
}

const departamentos = [
  {
    nome: 'Jurídico',
    icone: '⚖️',
    cor: '#1F3763',
    gerente: 'Fernanda Oliveira',
    cargo_gerente: 'Advogada Sênior',
    total: 22,
    membros: [
      { nome: 'Fernanda Oliveira',  cargo: 'Advogada Sênior',    tipo: 'CLT',     adm: '15/08/2021' },
      { nome: 'Ana Paula Souza',    cargo: 'Advogada Associada', tipo: 'CLT',     adm: '02/01/2023' },
      { nome: 'Bruno Alves',        cargo: 'Advogado Associado', tipo: 'CLT',     adm: '08/07/2022' },
      { nome: 'Patrícia Nunes',     cargo: 'Assistente Jurídico',tipo: 'CLT',     adm: '11/09/2024' },
      { nome: 'André Martins',      cargo: 'Estagiário',         tipo: 'Estágio', adm: '01/02/2026' },
      { nome: '+ 17 colaboradores', cargo: '',                   tipo: '',        adm: '' },
    ],
  },
  {
    nome: 'Comercial',
    icone: '💼',
    cor: '#e65100',
    gerente: 'Carlos Eduardo Lima',
    cargo_gerente: 'Gerente Comercial',
    total: 3,
    membros: [
      { nome: 'Carlos Eduardo Lima', cargo: 'Gerente Comercial', tipo: 'CLT', adm: '10/06/2019' },
      { nome: 'Vaga em aberto',      cargo: 'Analista Comercial',tipo: '',    adm: '' },
      { nome: 'Vaga em aberto',      cargo: 'SDR',               tipo: '',    adm: '' },
    ],
  },
  {
    nome: 'Financeiro',
    icone: '💰',
    cor: '#0059b3',
    gerente: 'Mariana Santos',
    cargo_gerente: 'Analista Financeira',
    total: 2,
    membros: [
      { nome: 'Mariana Santos',    cargo: 'Analista Financeira', tipo: 'CLT', adm: '20/11/2022' },
      { nome: 'Vaga em aberto',   cargo: 'Aux. Financeiro',      tipo: '',    adm: '' },
    ],
  },
  {
    nome: 'TI',
    icone: '💻',
    cor: '#4a148c',
    gerente: 'Roberto Carvalho',
    cargo_gerente: 'Técnico de TI',
    total: 1,
    membros: [
      { nome: 'Roberto Carvalho', cargo: 'Técnico de TI', tipo: 'CLT', adm: '05/04/2023' },
    ],
  },
  {
    nome: 'Administrativo',
    icone: '🗂️',
    cor: '#62974B',
    gerente: 'Operacional GCJ',
    cargo_gerente: 'Operacional',
    total: 2,
    membros: [
      { nome: 'Operacional GCJ',  cargo: 'Operacional',  tipo: 'CLT', adm: '01/01/2021' },
      { nome: 'Vaga em aberto',   cargo: 'Recepcionista', tipo: '',   adm: '' },
    ],
  },
]

function Avatar({ nome, size = 36, bg = 'var(--navy)' }: { nome: string; size?: number; bg?: string }) {
  const initials = nome.split(' ').filter(n => n.length > 1).map(n => n[0]).slice(0, 2).join('')
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.28, fontWeight: 700, flexShrink: 0 }}>
      {initials || '?'}
    </div>
  )
}

export default function Organograma() {
  return (
    <div className="dash-wrap">

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 13, color: 'var(--gray)' }}>
        <Link href="/rh" style={{ color: 'var(--navy)', fontWeight: 600 }}>RH</Link>
        <span>›</span>
        <span>Organograma</span>
      </div>

      {/* Toolbar */}
      <div className="pg-toolbar">
        <div>
          <p className="pg-title">Organograma</p>
          <p className="pg-sub">Estrutura hierárquica da empresa · {departamentos.reduce((a, d) => a + d.total, 0) + 1} colaboradores</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-outline btn-sm">📤 Exportar PDF</button>
          <Link href="/rh" className="btn btn-navy btn-sm">+ Novo colaborador</Link>
        </div>
      </div>

      {/* Árvore hierárquica */}
      <div style={{ overflowX: 'auto', paddingBottom: 20 }}>
        <div style={{ minWidth: 900 }}>

          {/* CEO */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
            <div style={{ background: 'linear-gradient(135deg, #1F3763, #2a5298)', borderRadius: 12, padding: '16px 24px', minWidth: 260, textAlign: 'center', boxShadow: '0 4px 16px rgba(31,55,99,.25)', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Avatar nome={ceo.nome} size={48} bg="rgba(255,255,255,.2)" />
                <div>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0 }}>{ceo.nome}</p>
                  <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 12, marginTop: 2 }}>{ceo.cargo}</p>
                  <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 8, background: 'rgba(98,151,75,.35)', color: '#b8e0a0', fontSize: 11, fontWeight: 600 }}>CEO · Diretoria</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conector CEO → Departamentos */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 2, height: 28, background: 'var(--border)' }} />
          </div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
            <div style={{ width: `${departamentos.length * 200 - 100}px`, height: 2, background: 'var(--border)', maxWidth: '90%' }} />
          </div>

          {/* Departamentos */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto' }}>
            {departamentos.map((d) => (
              <div key={d.nome} style={{ minWidth: 190, maxWidth: 210, flexShrink: 0 }}>

                {/* Conector vertical */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
                  <div style={{ width: 2, height: 24, background: 'var(--border)' }} />
                </div>

                {/* Card do departamento */}
                <div style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.08)', border: '1px solid var(--border)' }}>

                  {/* Header colorido */}
                  <div style={{ background: d.cor, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{d.icone}</span>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: 0 }}>{d.nome}</p>
                      <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 11, marginTop: 1 }}>{d.total} colaboradores</p>
                    </div>
                  </div>

                  {/* Gerente */}
                  <div style={{ background: '#fff', padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar nome={d.gerente} size={28} bg={d.cor} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: 0 }}>{d.gerente}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray)', marginTop: 1 }}>{d.cargo_gerente}</p>
                    </div>
                  </div>

                  {/* Membros */}
                  <div style={{ background: '#fff' }}>
                    {d.membros.slice(1).map((m, i) => (
                      <div key={i} style={{ padding: '8px 14px', borderBottom: i < d.membros.length - 2 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {m.tipo ? (
                          <>
                            <Avatar nome={m.nome} size={22} bg={m.tipo === 'Estágio' ? '#62974B' : '#6b7280'} />
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.nome}</p>
                              <p style={{ fontSize: 10, color: 'var(--gray)', marginTop: 1 }}>{m.cargo}</p>
                            </div>
                          </>
                        ) : m.nome.startsWith('+') ? (
                          <p style={{ fontSize: 11, color: 'var(--gray)', margin: 0, fontStyle: 'italic' }}>{m.nome}</p>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 10, color: '#ccc' }}>+</span>
                            </div>
                            <div>
                              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>{m.cargo}</p>
                              <p style={{ fontSize: 10, color: '#c6ddd4' }}>Vaga em aberto</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-5 gap-2.5 mt-4">
            {departamentos.map(d => (
              <div key={d.nome} className="card" style={{ borderTop: `3px solid ${d.cor}`, textAlign: 'center' }}>
                <p style={{ fontSize: 20 }}>{d.icone}</p>
                <p className="card-label">{d.nome}</p>
                <p className="card-val" style={{ fontSize: 22, color: d.cor }}>{d.total}</p>
                <p className="card-hint">colaboradores</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
