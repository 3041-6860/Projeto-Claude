import Link from 'next/link'

const processos = [
  { numero: '5020084-07.2022.8.26.0001', vara: '1ª Vara Cível',      tipo: 'Indenização', status: 'Em andamento', prazo: '30/05/26' },
  { numero: '0012345-88.2024.8.26.0100', vara: '3ª Vara Trabalhista', tipo: 'Trabalhista', status: 'Aguardando',   prazo: '15/06/26' },
  { numero: '0034567-11.2023.8.21.0001', vara: '2ª Vara Cível',      tipo: 'Cobrança',    status: 'Urgente',      prazo: '25/05/26' },
]

const dadosCliente = [
  ['OAB',       '123.456/SP'],
  ['CNPJ',      '12.345.678/0001-90'],
  ['E-mail',    'operacional@gcj.adv.br'],
  ['Telefone',  '(11) 99999-0000'],
  ['Endereço',  'Av. Paulista, 1000 – São Paulo/SP'],
  ['Contato',   'Guilherme C. Junqueira'],
]

const metricas = [
  { label: 'Processos ativos', val: '3',   cor: 'val-navy'  },
  { label: 'Documentos',       val: '12',  cor: 'val-gray'  },
  { label: 'Prazo crítico',    val: '3 d', cor: 'val-navy'  },
  { label: 'Valor contrato',   val: '48K', cor: 'val-green' },
]

const timeline = [
  { data: '20/05/26', texto: 'Petição inicial protocolada — Processo nº 0034567', green: true  },
  { data: '18/05/26', texto: 'Reunião com cliente — alinhamento estratégico',      green: false },
  { data: '15/05/26', texto: 'Proposta comercial enviada — R$ 48.000/ano',         green: true  },
  { data: '10/05/26', texto: 'Primeiro contato via WhatsApp',                      green: false },
]

const statusMap: Record<string, string> = {
  'Em andamento': 'badge badge-navy',
  'Aguardando':   'badge badge-orange',
  'Urgente':      'badge badge-urg',
}

export default function GcjJuridico() {
  return (
    <div className="dash-wrap">

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/negocios" className="breadcrumb-link">Negócios</Link>
        <span className="breadcrumb-sep">›</span>
        <span>GCJ Advocacia</span>
      </div>

      {/* Header do negócio */}
      <div className="neg-header-card card mb-3">
        <div className="neg-header-body">
          <div>
            <p className="pg-title mb-1">GCJ Advocacia — Gestão Jurídica Completa</p>
            <p className="pg-sub">Contrato anual · Responsável: Dr. Guilherme C. Junqueira</p>
            <div className="neg-badges">
              <span className="badge badge-green">Prospecção ativa</span>
              <span className="badge badge-navy">Contrato em elaboração</span>
            </div>
          </div>
          <div className="neg-valor-block">
            <div className="card-label">Valor do Contrato</div>
            <div className="card-val val-green">R$ 48.000</div>
            <div className="card-hint">12x R$ 4.000 / ano</div>
          </div>
        </div>
      </div>

      <div className="neg-grid">

        {/* Coluna principal */}
        <div className="neg-col-main">

          {/* Dados do cliente */}
          <div className="card mb-3">
            <div className="card-label">Dados do Cliente</div>
            <div className="detail-grid">
              {dadosCliente.map(([k, v]) => (
                <div key={k} className="detail-row">
                  <span className="detail-key">{k}:</span>
                  <span className="detail-val">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Processos vinculados */}
          <div className="card">
            <div className="pg-toolbar mb-2">
              <div className="card-label">Processos Vinculados</div>
              <button type="button" className="btn btn-outline btn-sm">+ Vincular</button>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Vara</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Próximo Prazo</th>
                </tr>
              </thead>
              <tbody>
                {processos.map((p) => (
                  <tr key={p.numero}>
                    <td className="neg-num">{p.numero}</td>
                    <td>{p.vara}</td>
                    <td>{p.tipo}</td>
                    <td><span className={statusMap[p.status]}>{p.status}</span></td>
                    <td className={p.status === 'Urgente' ? 'neg-urgente' : ''}>{p.prazo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coluna lateral */}
        <div className="neg-col-side">

          {/* Métricas */}
          <div className="card mb-3">
            <div className="card-label">Métricas do Negócio</div>
            {metricas.map((m) => (
              <div key={m.label} className="metric-row">
                <span className="metric-label">{m.label}</span>
                <span className={`metric-val ${m.cor}`}>{m.val}</span>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-label">Histórico</div>
            <div className="tl-wrap">
              <div className="tl-line" />
              {timeline.map((t, i) => (
                <div key={i} className="tl-item">
                  <div className={`tl-dot${t.green ? ' tl-dot-g' : ''}`} />
                  <div>
                    <div className="tl-date">{t.data}</div>
                    <div className="tl-text">{t.texto}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
