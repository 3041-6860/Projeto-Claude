'use client'
import { useState, useEffect } from 'react'

const categorias = ['Contratos', 'Petições', 'Procurações', 'Pareceres', 'Relatórios', 'Outros']
const STORAGE_KEY = 'inove-documentos-v1'

interface Doc {
  id: string
  nome: string
  cat: string
  autor: string
  data: string   // DD/MM/AA
  status: string
  tipo: 'PDF' | 'DOCX' | 'XLSX' | 'TXT'
}

const statusMap: Record<string, string> = {
  'Aprovado':           'badge badge-green',
  'Aguardando revisão': 'badge badge-orange',
  'Em elaboração':      'badge badge-navy',
}

const tipoColor: Record<string, string> = {
  PDF:  '#c62828',
  DOCX: '#0059b3',
  XLSX: '#059669',
  TXT:  '#6b7280',
}

export default function Documentos() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [filtCat,    setFiltCat]    = useState('')
  const [filtStatus, setFiltStatus] = useState('')
  const [busca,      setBusca]      = useState('')

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      if (s) setDocs(JSON.parse(s))
    } catch {}
  }, [])

  const filtrados = docs.filter(d =>
    (!filtCat    || d.cat    === filtCat)    &&
    (!filtStatus || d.status === filtStatus) &&
    (!busca      || d.nome.toLowerCase().includes(busca.toLowerCase()) ||
                    d.autor.toLowerCase().includes(busca.toLowerCase()))
  )

  const totalContratos = docs.filter(d => d.cat === 'Contratos').length
  const totalPeticoes  = docs.filter(d => d.cat === 'Petições').length
  const totalRevisao   = docs.filter(d => d.status === 'Aguardando revisão').length

  // Este mês: data formato DD/MM/AA — comparar mês/ano
  const now = new Date()
  const mesAtual = `${String(now.getMonth() + 1).padStart(2,'0')}/${String(now.getFullYear()).slice(2)}`
  const esteMes = docs.filter(d => d.data.slice(3) === mesAtual).length

  return (
    <div className="dash-wrap">
      <div className="pg-toolbar">
        <div>
          <p className="pg-title">Documentos — Biblioteca</p>
          <p className="pg-sub">
            {docs.length} documento{docs.length !== 1 ? 's' : ''}
            {totalRevisao > 0 && ` · ${totalRevisao} aguardando revisão`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline">⬆ Importar</button>
          <button className="btn btn-navy">+ Novo Documento</button>
        </div>
      </div>

      <div className="m-bar mb-3">
        {[
          { label: 'Total',            val: String(docs.length)      },
          { label: 'Contratos',        val: String(totalContratos)   },
          { label: 'Petições',         val: String(totalPeticoes)    },
          { label: 'Revisão Pendente', val: String(totalRevisao)     },
          { label: 'Este mês',         val: String(esteMes)          },
        ].map((m, i, arr) => (
          <div key={m.label} style={{ display: 'contents' }}>
            <div className="m-item">
              <div className="m-label">{m.label}</div>
              <div className="m-val">{m.val}</div>
            </div>
            {i < arr.length - 1 && <div className="m-sep" />}
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <select value={filtCat} onChange={e => setFiltCat(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filtStatus} onChange={e => setFiltStatus(e.target.value)}>
          <option value="">Todos os status</option>
          <option>Aprovado</option>
          <option>Aguardando revisão</option>
          <option>Em elaboração</option>
        </select>
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou autor…"
          style={{ minWidth: 220 }}
        />
      </div>

      {filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: 13 }}>
          {docs.length === 0
            ? 'Nenhum documento cadastrado ainda. Clique em "+ Novo Documento" para começar.'
            : 'Nenhum documento corresponde aos filtros aplicados.'}
        </div>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Nome do Documento</th>
              <th>Categoria</th>
              <th>Autor</th>
              <th>Data</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((d) => (
              <tr key={d.id}>
                <td>
                  <span className="badge" style={{ background: (tipoColor[d.tipo] ?? '#6b7280') + '22', color: tipoColor[d.tipo] ?? '#6b7280', fontWeight: 700 }}>
                    {d.tipo}
                  </span>
                </td>
                <td className="font-semibold">{d.nome}</td>
                <td>{d.cat}</td>
                <td>{d.autor}</td>
                <td style={{ color: 'var(--gray)' }}>{d.data}</td>
                <td><span className={statusMap[d.status] ?? 'badge badge-gray'}>{d.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-outline btn-sm">Ver</button>
                    <button className="btn btn-outline btn-sm">⬇</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
