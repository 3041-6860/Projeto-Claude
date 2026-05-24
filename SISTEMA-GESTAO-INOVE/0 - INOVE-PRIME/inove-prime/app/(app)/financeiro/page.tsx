const lancamentos = [
  { desc: 'Honorários GCJ Advocacia — Mai/26',   tipo: 'Receita',  cat: 'Honorários',   valor: 4000,  data: '20/05/26', status: 'Recebido' },
  { desc: 'Honorários Construtora Alfa',          tipo: 'Receita',  cat: 'Honorários',   valor: 7083,  data: '19/05/26', status: 'Recebido' },
  { desc: 'Aluguel — Sede Inove Prime',           tipo: 'Despesa',  cat: 'Infraestrutura', valor: -3500, data: '18/05/26', status: 'Pago'     },
  { desc: 'Folha de Pagamento — Mai/26',          tipo: 'Despesa',  cat: 'RH',           valor: -52000,data: '15/05/26', status: 'Pago'     },
  { desc: 'Honorários Clínica Saúde & Vida',      tipo: 'Receita',  cat: 'Honorários',   valor: 2000,  data: '15/05/26', status: 'Pendente' },
  { desc: 'Software Jurídico — Licença Anual',    tipo: 'Despesa',  cat: 'TI',           valor: -1200, data: '10/05/26', status: 'Pago'     },
  { desc: 'Honorários Agropecuária Martins',      tipo: 'Receita',  cat: 'Honorários',   valor: 2333,  data: '05/05/26', status: 'Recebido' },
]

const statusMap: Record<string, string> = {
  'Recebido': 'badge badge-green',
  'Pago':     'badge badge-navy',
  'Pendente': 'badge badge-orange',
}

function fmt(v: number) {
  return (v < 0 ? '- ' : '+ ') + 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

export default function Financeiro() {
  return (
    <div className="dash-wrap">
      <div className="pg-toolbar">
        <div>
          <p className="pg-title">Financeiro — Fluxo de Caixa</p>
          <p className="pg-sub">Maio de 2026 · Dados consolidados até 22/05/2026</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline">Exportar</button>
          <button className="btn btn-navy">+ Lançamento</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 mb-3">
        {[
          { label: 'Receita (mês)',   val: 'R$ 2,4M', hint: 'Acumulado mai/26',      valClass: 'val-green' },
          { label: 'Despesas (mês)', val: 'R$ 1,8M', hint: 'Fixas + variáveis',      valClass: 'val-navy'  },
          { label: 'Saldo',          val: 'R$ 600K', hint: 'Resultado do mês',        valClass: 'val-green' },
          { label: 'A Receber',      val: 'R$ 85K',  hint: '6 faturas em aberto',     valClass: 'val-navy'  },
        ].map((c) => (
          <div key={c.label} className="card">
            <p className="card-label">{c.label}</p>
            <p className={`card-val ${c.valClass}`}>{c.val}</p>
            <p className="card-hint">{c.hint}</p>
          </div>
        ))}
      </div>

      <div className="m-bar mb-3">
        {[
          { label: 'Honorários',     val: 'R$ 124K' },
          { label: 'Serviços',       val: 'R$ 48K'  },
          { label: 'Despesas Fixas', val: 'R$ 56K'  },
          { label: 'Investimentos',  val: 'R$ 12K'  },
          { label: 'Margem Líq.',    val: '25%'     },
        ].map((m, i, arr) => (
          <>
            <div key={m.label} className="m-item">
              <div className="m-label">{m.label}</div>
              <div className="m-val g">{m.val}</div>
            </div>
            {i < arr.length - 1 && <div key={`sep-${i}`} className="m-sep" />}
          </>
        ))}
      </div>

      <div className="filter-bar">
        <select defaultValue=""><option value="">Receitas e Despesas</option><option>Receita</option><option>Despesa</option></select>
        <select defaultValue=""><option value="">Todas as categorias</option><option>Honorários</option><option>RH</option><option>Infraestrutura</option><option>TI</option></select>
        <select defaultValue=""><option value="">Todos os status</option><option>Recebido</option><option>Pago</option><option>Pendente</option></select>
      </div>

      <table className="tbl">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Valor</th>
            <th>Data</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lancamentos.map((l, i) => (
            <tr key={i}>
              <td className="font-semibold">{l.desc}</td>
              <td>
                <span className={l.tipo === 'Receita' ? 'badge badge-green' : 'badge badge-red'}>
                  {l.tipo}
                </span>
              </td>
              <td>{l.cat}</td>
              <td className={`font-bold-7 ${l.valor > 0 ? 'val-green' : 'val-red'}`}>
                {fmt(l.valor)}
              </td>
              <td className="val-gray">{l.data}</td>
              <td><span className={statusMap[l.status]}>{l.status}</span></td>
              <td><button className="btn btn-outline btn-sm">Ver</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
