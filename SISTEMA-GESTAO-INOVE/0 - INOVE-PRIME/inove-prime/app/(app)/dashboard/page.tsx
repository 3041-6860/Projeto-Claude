import Link from "next/link";
import { cookies } from "next/headers";
import FeedClient from "@/components/FeedClient";
import DashBanner from "@/components/DashBanner";

const metricas1 = [
  { label: "Faturamento",   value: "—", hint: "Cadastre lançamentos no Financeiro", progress: 0, valClass: "val-gray", colorKey: "gray" },
  { label: "Despesas",      value: "—", hint: "Cadastre lançamentos no Financeiro", progress: 0, valClass: "val-gray", colorKey: "gray" },
  { label: "Resultado",     value: "—", hint: "Calculado após lançamentos",         progress: 0, valClass: "val-gray", colorKey: "gray" },
  { label: "Colaboradores", value: "—", hint: "Cadastre colaboradores no RH",       progress: 0, valClass: "val-gray", colorKey: "gray" },
];

const metricas2 = [
  { label: "Clientes Ativos", value: "—", hint: "Cadastre leads no CRM",          progress: 0, valClass: "val-gray", colorKey: "gray" },
  { label: "Contratos",       value: "—", hint: "Aguardando módulo Documentos",   progress: 0, valClass: "val-gray", colorKey: "gray" },
  { label: "Tarefas",         value: "—", hint: "Cadastre tarefas no módulo",     progress: 0, valClass: "val-gray", colorKey: "gray" },
  { label: "Reuniões Hoje",   value: "—", hint: "Cadastre eventos no Calendário", progress: 0, valClass: "val-gray", colorKey: "gray" },
];

const metricas3 = [
  { label: "NPS / Satisfação",  value: "—", hint: "Aguardando integração",              progress: 0, valClass: "val-gray", colorKey: "gray" },
  { label: "Campanhas Ativas",  value: "—", hint: "Cadastre campanhas no Marketing",    progress: 0, valClass: "val-gray", colorKey: "gray" },
  { label: "Tickets em Aberto", value: "—", hint: "Aguardando integração",              progress: 0, valClass: "val-gray", colorKey: "gray" },
  { label: "Projetos Ativos",   value: "—", hint: "Aguardando integração",              progress: 0, valClass: "val-gray", colorKey: "gray" },
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

// Comunicados começam vazios — adicionar via Feed ou módulo de comunicados
const comunicados: { alertClass: string; icon: string; bold: string; text: string }[] = [];

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
            {comunicados.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center">
                Nenhum comunicado no momento.
              </p>
            ) : comunicados.map((c, i) => (
              <div key={i} className={c.alertClass}>
                <span className="shrink-0">{c.icon}</span>
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
