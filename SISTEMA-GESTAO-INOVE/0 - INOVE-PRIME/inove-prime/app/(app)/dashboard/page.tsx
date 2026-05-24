import Link from "next/link";
import { cookies } from "next/headers";
import FeedClient from "@/components/FeedClient";
import DashBanner from "@/components/DashBanner";

const metricas1 = [
  { label: "Faturamento",   value: "R$ 2,4M", hint: "Receita consolidada mai/26",   progress: 72, valClass: "val-green", colorKey: "green" },
  { label: "Despesas",      value: "R$ 1,1M", hint: "Custo operacional mai/26",     progress: 45, valClass: "val-gray",  colorKey: "gray"  },
  { label: "Resultado",     value: "R$ 1,3M", hint: "Margem líquida do período",    progress: 54, valClass: "val-navy",  colorKey: "navy"  },
  { label: "Colaboradores", value: "48",       hint: "Ativos em todas as unidades",  progress: 85, valClass: "val-navy",  colorKey: "navy"  },
];

const metricas2 = [
  { label: "Clientes Ativos", value: "—",  hint: "Aguardando integração CRM",    progress: 0,  valClass: "val-gray", colorKey: "gray" },
  { label: "Contratos",       value: "—",  hint: "Aguardando integração",        progress: 0,  valClass: "val-gray", colorKey: "gray" },
  { label: "Tarefas",         value: "34", hint: "Pendentes — 6 com prazo hoje", progress: 40, valClass: "val-gray", colorKey: "gray" },
  { label: "Reuniões Hoje",   value: "3",  hint: "Próxima: 14h · Sala A",        progress: 30, valClass: "val-navy", colorKey: "navy" },
];

const metricas3 = [
  { label: "NPS / Satisfação",  value: "—",  hint: "Aguardando integração", progress: 0,  valClass: "val-gray", colorKey: "gray" },
  { label: "Campanhas Ativas",  value: "12", hint: "Marketing — mai/26",    progress: 60, valClass: "val-navy", colorKey: "navy" },
  { label: "Tickets em Aberto", value: "—",  hint: "Aguardando integração", progress: 0,  valClass: "val-gray", colorKey: "gray" },
  { label: "Projetos Ativos",   value: "—",  hint: "Aguardando integração", progress: 0,  valClass: "val-gray", colorKey: "gray" },
];

// Cada módulo com sua cor sólida exclusiva
const modules = [
  { icon: "📅", label: "Calendário",  hint: "Agenda e eventos",         href: "/calendario", cls: "dash-mod-navy"   },
  { icon: "💰", label: "Financeiro",  hint: "Fluxo e faturas",          href: "/financeiro", cls: "dash-mod-green"  },
  { icon: "📋", label: "Documentos",  hint: "Arquivos e contratos",     href: "/documentos", cls: "dash-mod-blue"   },
  { icon: "✅", label: "Tarefas",     hint: "Pendentes e em progresso", href: "/tarefas",    cls: "dash-mod-purple" },
  { icon: "👤", label: "RH",          hint: "Equipe e colaboradores",   href: "/rh",         cls: "dash-mod-orange" },
  { icon: "📣", label: "Marketing",   hint: "Campanhas e leads",        href: "/marketing",  cls: "dash-mod-teal"   },
];

const comunicados = [
  { alertClass: "alert alert-navy",   icon: "📌", bold: "Reunião de diretoria",  text: " — Sex, 23/05 às 14h · Sala A" },
  { alertClass: "alert alert-green",  icon: "✅", bold: "Novo colaborador",       text: " incorporado à equipe de Financeiro" },
  { alertClass: "alert alert-orange", icon: "⚠️", bold: "Renovação de licença", text: " de software vence em 5 dias" },
];

function cardClasses(c: { value: string; colorKey: string }) {
  const base = `card card-top-${c.colorKey}`
  if (c.value === "—") return base + " card-pending"
  if (c.colorKey === "green") return base + " card-bg-green"
  if (c.colorKey === "navy")  return base + " card-bg-navy"
  return base
}

function MetricRow({ items }: { items: typeof metricas1 }) {
  return (
    <div className="grid grid-cols-4 gap-2.5 mb-2.5">
      {items.map((c) => (
        <div key={c.label} className={cardClasses(c)}>
          <p className="card-label">{c.label}</p>
          <p className={`card-val ${c.valClass}`}>{c.value}</p>
          <p className="card-hint">{c.hint}</p>
          {c.value !== "—" && c.progress > 0 && (
            <div className="prog">
              <div className={`prog-fill prog-fill-${c.colorKey}`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function Dashboard() {
  const store = await cookies();
  const session = store.get("inove-session");
  let userName = "equipe";
  if (session) {
    try {
      const u = JSON.parse(Buffer.from(session.value, "base64").toString());
      if (u?.name) userName = u.name;
    } catch {}
  }

  return (
    <div className="dash-wrap">

      {/* Banner de boas-vindas dinâmico */}
      <DashBanner userName={userName} />

      {/* Linhas de métricas */}
      <MetricRow items={metricas1} />
      <MetricRow items={metricas2} />
      <MetricRow items={metricas3} />

      {/* Layout 2 colunas: Feed + Painel lateral */}
      <div className="dash-feed-layout">

        {/* Feed */}
        <FeedClient />

        {/* Painel lateral */}
        <div className="dash-side">

          {/* Acesso Rápido */}
          <div className="card mb-3">
            <div className="card-header card-header-navy">
              🧭 &nbsp; Acesso Rápido
            </div>
            <div className="grid grid-cols-2 gap-2">
              {modules.map((m) => (
                <Link key={m.href} href={m.href} className={`dash-module-btn ${m.cls}`}>
                  <span className="dash-module-icon">{m.icon}</span>
                  <div>
                    <div className="dash-module-label">{m.label}</div>
                    <div className="dash-module-hint">{m.hint}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Comunicados */}
          <div className="card">
            <div className="card-header card-header-orange">
              📢 &nbsp; Comunicados
            </div>
            {comunicados.map((c, i) => (
              <div key={i} className={c.alertClass}>
                <span className="flex-shrink-0">{c.icon}</span>
                <span>
                  {c.bold && <b>{c.bold}</b>}
                  {c.text}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
