'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const RH_STORAGE = 'inove-rh-colaboradores-v1'

interface Colaborador {
  nome: string; cargo: string; dept: string
  adm: string; status: string; ferias: boolean; ativo: boolean
}

const DEPT_CORES: Record<string, string> = {
  'Jurídico':      '#1F3763',
  'Comercial':     '#e65100',
  'Financeiro':    '#0059b3',
  'TI':            '#4a148c',
  'Administrativo':'#62974B',
  'RH':            '#9c27b0',
  'Marketing':     '#d81b60',
}

const DEPT_ICONS: Record<string, string> = {
  'Jurídico':      '⚖️',
  'Comercial':     '💼',
  'Financeiro':    '💰',
  'TI':            '💻',
  'Administrativo':'🗂️',
  'RH':            '👥',
  'Marketing':     '📣',
}

function corDept(dept: string) { return DEPT_CORES[dept] ?? '#6b7280' }
function iconeDept(dept: string) { return DEPT_ICONS[dept] ?? '🏢' }

function initials(nome: string) {
  return nome.split(' ').filter(n => n.length > 1).map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
}

function Avatar({ nome, size = 36, bg = 'var(--navy)' }: { nome: string; size?: number; bg?: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.28, fontWeight: 700, flexShrink: 0
    }}>
      {initials(nome)}
    </div>
  )
}

export default function Organograma() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])

  useEffect(() => {
    try {
      const s = localStorage.getItem(RH_STORAGE)
      if (s) setColaboradores((JSON.parse(s) as Colaborador[]).filter(c => c.ativo))
    } catch {}
  }, [])

  // Agrupar por departamento
  const deptMap = new Map<string, Colaborador[]>()
  for (const c of colaboradores) {
    if (!deptMap.has(c.dept)) deptMap.set(c.dept, [])
    deptMap.get(c.dept)!.push(c)
  }
  const depts = [...deptMap.entries()]

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
          <p className="pg-sub">
            {colaboradores.length > 0
              ? `${colaboradores.length} colaborador${colaboradores.length !== 1 ? 'es' : ''} ativo${colaboradores.length !== 1 ? 's' : ''} · ${depts.length} departamento${depts.length !== 1 ? 's' : ''}`
              : 'Nenhum colaborador cadastrado ainda'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-outline btn-sm">📤 Exportar PDF</button>
          <Link href="/rh" className="btn btn-navy btn-sm">+ Novo colaborador</Link>
        </div>
      </div>

      {/* Estado vazio */}
      {colaboradores.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          border: '2px dashed var(--border)', borderRadius: 12,
          color: '#9ca3af',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Organograma vazio
          </p>
          <p style={{ fontSize: 13, marginBottom: 20 }}>
            Admita colaboradores no módulo de RH para montar a estrutura da empresa automaticamente.
          </p>
          <Link href="/rh" className="btn btn-navy">+ Admitir colaborador</Link>
        </div>
      )}

      {/* Organograma dinâmico */}
      {colaboradores.length > 0 && (
        <div style={{ overflowX: 'auto', paddingBottom: 20 }}>
          <div style={{ minWidth: Math.max(600, depts.length * 220) }}>

            {/* Barra de departamentos */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {depts.map(([dept, membros]) => (
                <div key={dept} style={{ minWidth: 200, maxWidth: 240, flexShrink: 0 }}>
                  <div style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.08)', border: '1px solid var(--border)' }}>

                    {/* Header colorido */}
                    <div style={{ background: corDept(dept), padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{iconeDept(dept)}</span>
                      <div>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: 0 }}>{dept}</p>
                        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 11, marginTop: 1 }}>
                          {membros.length} colaborador{membros.length !== 1 ? 'es' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Membros */}
                    <div style={{ background: '#fff' }}>
                      {membros.map((m, i) => (
                        <div key={m.nome} style={{
                          padding: '8px 14px',
                          borderBottom: i < membros.length - 1 ? '1px solid var(--border)' : 'none',
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          <Avatar nome={m.nome} size={28} bg={corDept(dept)} />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.nome}</p>
                            <p style={{ fontSize: 10, color: 'var(--gray)', marginTop: 1 }}>
                              {m.cargo}
                              {m.status === 'Estágio' && (
                                <span style={{ marginLeft: 4, background: '#dcfce7', color: '#059669', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 700 }}>ESTÁGIO</span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo por departamento */}
            {depts.length > 0 && (
              <div className={`grid grid-cols-${Math.min(depts.length, 5)} gap-2.5 mt-4`}>
                {depts.map(([dept, membros]) => (
                  <div key={dept} className="card" style={{ borderTop: `3px solid ${corDept(dept)}`, textAlign: 'center' }}>
                    <p style={{ fontSize: 20 }}>{iconeDept(dept)}</p>
                    <p className="card-label">{dept}</p>
                    <p className="card-val" style={{ fontSize: 22, color: corDept(dept) }}>{membros.length}</p>
                    <p className="card-hint">colaborador{membros.length !== 1 ? 'es' : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
