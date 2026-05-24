const categorias = ['Contratos', 'Petições', 'Procurações', 'Pareceres', 'Relatórios', 'Outros']

const docs = [
  { nome: 'Contrato Prestação Serviços — GCJ 2026',   cat: 'Contratos',  autor: 'Dr. Guilherme', data: '20/05/26', status: 'Aprovado',         tipo: 'DOCX' },
  { nome: 'Petição Inicial — Processo 0034567',       cat: 'Petições',   autor: 'Dra. Fernanda', data: '20/05/26', status: 'Aguardando revisão', tipo: 'PDF'  },
  { nome: 'Procuração ad judicia — Maria dos Santos', cat: 'Procurações',autor: 'Dr. Guilherme', data: '18/05/26', status: 'Aprovado',         tipo: 'PDF'  },
  { nome: 'Parecer Tributário — Empresa XYZ',         cat: 'Pareceres',  autor: 'Dra. Ana Paula',data: '17/05/26', status: 'Em elaboração',    tipo: 'DOCX' },
  { nome: 'Relatório Mensal — Maio 2026',             cat: 'Relatórios', autor: 'Operacional',   data: '16/05/26', status: 'Aprovado',         tipo: 'PDF'  },
  { nome: 'Contrato Honorários — Construtora Alfa',   cat: 'Contratos',  autor: 'Dr. Guilherme', data: '15/05/26', status: 'Aguardando revisão', tipo: 'DOCX' },
  { nome: 'Petição de Contestação — João Silva',      cat: 'Petições',   autor: 'Dra. Fernanda', data: '14/05/26', status: 'Aprovado',         tipo: 'PDF'  },
]

const statusMap: Record<string, string> = {
  'Aprovado':          'badge badge-green',
  'Aguardando revisão':'badge badge-orange',
  'Em elaboração':     'badge badge-navy',
}

const tipoColor: Record<string, string> = { 'PDF': '#c62828', 'DOCX': '#0059b3' }

export default function Documentos() {
  return (
    <div className="dash-wrap">
      <div className="pg-toolbar">
        <div>
          <p className="pg-title">Documentos — Biblioteca</p>
          <p className="pg-sub">412 documentos · 6 aguardando revisão</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline">⬆ Importar</button>
          <button className="btn btn-navy">+ Novo Documento</button>
        </div>
      </div>

      <div className="m-bar mb-3">
        {[
          { label: 'Total', val: '412' },
          { label: 'Contratos', val: '98' },
          { label: 'Petições', val: '134' },
          { label: 'Revisão Pendente', val: '6' },
          { label: 'Este mês', val: '23' },
        ].map((m, i, arr) => (
          <>
            <div key={m.label} className="m-item">
              <div className="m-label">{m.label}</div>
              <div className="m-val">{m.val}</div>
            </div>
            {i < arr.length - 1 && <div key={`sep-${i}`} className="m-sep" />}
          </>
        ))}
      </div>

      <div className="filter-bar">
        <select defaultValue="">
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c}>{c}</option>)}
        </select>
        <select defaultValue="">
          <option value="">Todos os status</option>
          <option>Aprovado</option>
          <option>Aguardando revisão</option>
          <option>Em elaboração</option>
        </select>
        <input type="text" placeholder="Buscar por nome ou autor…" style={{ minWidth: 220 }} />
      </div>

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
          {docs.map((d) => (
            <tr key={d.nome}>
              <td>
                <span className="badge" style={{ background: tipoColor[d.tipo] + '22', color: tipoColor[d.tipo], fontWeight: 700 }}>
                  {d.tipo}
                </span>
              </td>
              <td className="font-semibold">{d.nome}</td>
              <td>{d.cat}</td>
              <td>{d.autor}</td>
              <td style={{ color: 'var(--gray)' }}>{d.data}</td>
              <td><span className={statusMap[d.status]}>{d.status}</span></td>
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
    </div>
  )
}
