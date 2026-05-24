import FeedClient from "@/components/FeedClient";

export default function FeedPage() {
  return (
    <div className="dash-wrap">
      <p className="pg-title">Feed — Comunicações</p>
      <p className="pg-sub">Comunicados, eventos e atualizações da equipe · visível para todos</p>

      <div className="feed-page-layout">
        {/* Feed principal */}
        <div className="feed-page-main">
          <FeedClient />
        </div>

        {/* Painel lateral */}
        <div className="feed-page-side">
          <div className="card mb-3">
            <p className="card-label mb-2">📢 &nbsp; Tipos de post</p>
            <div className="feed-legend">
              <div className="feed-legend-item">
                <span className="feed-legend-dot feed-ldot-msg" />
                <span>Mensagem — comunicados e avisos</span>
              </div>
              <div className="feed-legend-item">
                <span className="feed-legend-dot feed-ldot-ev" />
                <span>Evento — audiências, reuniões</span>
              </div>
              <div className="feed-legend-item">
                <span className="feed-legend-dot feed-ldot-arq" />
                <span>Arquivo — documentos compartilhados</span>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <p className="card-label mb-2">👥 &nbsp; Participantes</p>
            <div className="feed-members">
              {[
                { i: 'SO', label: 'Sandra Otto',         cls: 'feed-avatar-green' },
                { i: 'RG', label: 'Rodrigo Gonçalves',   cls: 'feed-avatar-navy'  },
                { i: 'AD', label: 'Administrador',        cls: 'feed-avatar-navy'  },
              ].map(m => (
                <div key={m.i} className="feed-member-row">
                  <div className={`feed-avatar feed-avatar-sm ${m.cls}`}>{m.i}</div>
                  <span className="feed-member-name">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <p className="card-label mb-2">⚡ &nbsp; Dica</p>
            <p className="card-hint" style={{ lineHeight: 1.6 }}>
              Use <b>@nome</b> para mencionar alguém. Posts de <b>Evento</b> aparecem automaticamente no Calendário.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
