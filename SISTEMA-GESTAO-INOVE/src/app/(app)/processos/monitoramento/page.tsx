const alertas = [
  { tipo: 'red',    texto: 'Processo 0034567 — Prazo FATAL em 3 dias (25/05/26). Contestação obrigatória.' },
  { tipo: 'orange', texto: '3 processos com audiência agendada na semana de 27/05. Confirmar presença.' },
  { tipo: 'navy',   texto: '2 decisões publicadas aguardam leitura e manifestação.' },
]

const processos = [
  { numero: '5020084-07.2022.8.26.0001', parte: 'Maria dos Santos',    tipo: 'Indenização',   adv: 'Dr. Guilherme',  status: 'Em andamento', prazo: '10/06/26', dias: 19 },
  { numero: '0034567-11.2023.8.21.0001', parte: 'Construtora Alfa SA', tipo: 'Cobrança',      adv: 'Dra. Fernanda',  status: 'Urgente',      prazo: '25/05/26', dias: 3  },
  { numero: '0012345-88.2024.8.26.0100', parte: 'João Silva (Trab.)',  tipo: 'Trabalhista',   adv: 'Dr. Guilherme',  status: 'Aguardando',   prazo: '15/06/26', dias: 24 },
  { numero: '8800123-44.2023.8.26.0050', parte: 'Pedro Alves',         tipo: 'Previdenciário', adv: 'Dra. Ana Paula', status: 'Em andamento', prazo: '30/06/26', dias: 39 },
  { numero: '1122334-55.2022.8.26.0200', parte: 'Empresa XYZ Ltda',   tipo: 'Tributário',    adv: 'Dr. Guilherme',  status: 'Arquivado',    prazo: '—',        dias: 999},
  { numero: '9988776-33.2024.8.26.0100', parte: 'Carlos Mendes',       tipo: 'Indenização',   adv: 'Dra. Fernanda',  status: 'Em andamento', prazo: '05/07/26', dias: 44 },
]

const statusMap: Record<string, string> = {
  'Em andamento': 'badge badge-navy',
  'Aguardando':   'badge badge-orange',
  'Urgente':      'badge badge-urg',
  'Arquivado':    'badge badge-arc',
}

export default function ProcessosMonitoramento() {
  return (
    <div className="dash-wrap">
      <div className="pg-toolbar">
        <div>
          <p className="pg-title">Processos — Monitoramento</p>
          <p className="pg-sub">127 processos ativos · 8 prazos críticos · atualizado 22/05/2026</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline">Exportar</button>
          <button className="btn btn-navy">+ Novo Processo</button>
        </div>
      </div>

      {/* Alertas */}
      <div className="mb-3">
        {alertas.map((a, i) => (
          <div key={i} className={`alert alert-${a.tipo}`}>
            <span>⚠️</span>
            <span>{a.texto}</span>
          </div>
        ))}
      </div>

      {/* Métricas */}
      <div className="m-bar mb-3">
        {[
          { label: 'Total Ativos', val: '127' },
          { label: 'Prazos Críticos', val: '8'  },
          { label: 'Audiências/Semana', val: '3'  },
          { label: 'Decisões Pendentes', val: '2'  },
          { label: 'Arquivados', val: '41' },
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
        <select defaultValue=""><option value="">Todos os status</option><option>Em andamento</option><option>Urgente</option><option>Aguardando</option><option>Arquivado</option></select>
        <select defaultValue=""><option value="">Todos os advogados</option><option>Dr. Guilherme</option><option>Dra. Fernanda</option><option>Dra. Ana Paula</option></select>
        <select defaultValue=""><option value="">Todos os tipos</option><option>Indenização</option><option>Cobrança</option><option>Trabalhista</option><option>Previdenciário</option></select>
        <input type="text" placeholder="Buscar número ou parte…" style={{ minWidth: 220 }} />
      </div>

      <table className="tbl">
        <thead>
          <tr>
            <th>Número do Processo</th>
            <th>Parte</th>
            <th>Tipo</th>
            <th>Advogado</th>
            <th>Status</th>
            <th>Próximo Prazo</th>
            <th>Dias</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {processos.map((p) => (
            <tr key={p.numero}>
              <td style={{ fontFamily: 'monospace', color: 'var(--navy)', fontWeight: 600 }}>{p.numero}</td>
              <td className="font-semibold">{p.parte}</td>
              <td>{p.tipo}</td>
              <td>{p.adv}</td>
              <td><span className={statusMap[p.status]}>{p.status}</span></td>
              <td style={{ color: p.dias <= 5 ? '#c62828' : undefined, fontWeight: p.dias <= 5 ? 700 : undefined }}>
                {p.prazo}
              </td>
              <td style={{ textAlign: 'center' }}>
                {p.dias < 999 && (
                  <span className={`badge ${p.dias <= 5 ? 'badge-urg' : p.dias <= 15 ? 'badge-orange' : 'badge-gray'}`}>
                    {p.dias}d
                  </span>
                )}
              </td>
              <td><button className="btn btn-outline btn-sm">Abrir</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
