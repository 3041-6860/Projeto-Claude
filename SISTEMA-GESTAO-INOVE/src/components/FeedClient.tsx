'use client'

import { useState, useEffect } from 'react'

type PostType = 'mensagem' | 'evento' | 'arquivo'
type VisType  = 'todos' | 'pessoas' | 'pipeline'

interface Visibility {
  type:      VisType
  people?:   string[]
  pipeline?: string
}

interface Comment {
  id:        string
  author:    string
  initials:  string
  content:   string
  timestamp: string
}

interface Post {
  id:          string
  type:        PostType
  author:      string
  initials:    string
  avatarClass: string
  content:     string
  eventTitle?: string
  eventDate?:  string
  fileName?:   string
  timestamp:   string
  likes:       number
  views:       number
  liked:       boolean
  comments:    Comment[]
  showComments:boolean
  visibility:  Visibility
}

// ─── Dados estáticos do sistema ──────────────────────────────────────────────
const TEAM = [
  { name: 'Sandra Otto',        initials: 'SO'  },
  { name: 'Rodrigo Gonçalves',  initials: 'RG'  },
  { name: 'Administrador GCJ',  initials: 'GCJ' },
]

const PIPELINES = [
  { key: 'gcj-juridico', label: 'GCJ Jurídico'      },
  { key: 'ivi-negocios',  label: 'IVI – Negócios'    },
  { key: 'grupo-inove',   label: 'Grupo Inove Prime' },
]

const STORAGE_KEY = 'inove-feed-posts-v3'

function visLabel(v?: Visibility): string {
  if (!v || v.type === 'todos') return 'visível para todos'
  if (v.type === 'pessoas')
    return v.people?.length ? `para: ${v.people.join(', ')}` : 'visível para todos'
  if (v.type === 'pipeline') {
    const pl = PIPELINES.find(p => p.key === v.pipeline)
    return pl ? `pipeline: ${pl.label}` : 'pipeline'
  }
  return 'visível para todos'
}

export default function FeedClient() {
  const [posts,          setPosts]          = useState<Post[]>([])
  const [tab,            setTab]            = useState<PostType>('mensagem')
  const [draft,          setDraft]          = useState('')
  const [eventTitle,     setEventTitle]     = useState('')
  const [eventDate,      setEventDate]      = useState('')
  const [fileName,       setFileName]       = useState('')
  const [commentDraft,   setCommentDraft]   = useState<Record<string, string>>({})
  const [visType,        setVisType]        = useState<VisType>('todos')
  const [selPeople,      setSelPeople]      = useState<string[]>([])
  const [selPipeline,    setSelPipeline]    = useState<string>('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setPosts(JSON.parse(saved))
    } catch {
      // ignore
    }
  }, [])

  function save(updated: Post[]) {
    setPosts(updated)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch {}
  }

  function togglePerson(name: string) {
    setSelPeople(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  function buildVisibility(): Visibility {
    if (visType === 'pessoas')  return { type: 'pessoas',  people:   selPeople.length ? selPeople : undefined }
    if (visType === 'pipeline') return { type: 'pipeline', pipeline: selPipeline || undefined }
    return { type: 'todos' }
  }

  function handlePost() {
    if (!draft.trim() && tab === 'mensagem') return
    if (tab === 'evento' && !eventTitle.trim()) return

    const now = new Date()
    const ts  = `Hoje, ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`

    const newPost: Post = {
      id:          Date.now().toString(),
      type:        tab,
      author:      'Administrador',
      initials:    'AD',
      avatarClass: 'feed-avatar feed-avatar-navy',
      content:     draft,
      eventTitle:  tab === 'evento'  ? eventTitle : undefined,
      eventDate:   tab === 'evento'  ? eventDate  : undefined,
      fileName:    tab === 'arquivo' ? fileName   : undefined,
      timestamp:   ts,
      likes:       0,
      views:       0,
      liked:       false,
      comments:    [],
      showComments:false,
      visibility:  buildVisibility(),
    }
    save([newPost, ...posts])
    setDraft(''); setEventTitle(''); setEventDate(''); setFileName('')
  }

  function toggleLike(id: string) {
    save(posts.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ))
  }

  function toggleComments(id: string) {
    save(posts.map(p => p.id === id ? { ...p, showComments: !p.showComments } : p))
  }

  function addComment(postId: string) {
    const text = commentDraft[postId]?.trim()
    if (!text) return
    const now = new Date()
    const ts  = `Hoje, ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
    const comment: Comment = {
      id: Date.now().toString(), author: 'Administrador', initials: 'AD',
      content: text, timestamp: ts,
    }
    save(posts.map(p =>
      p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
    ))
    setCommentDraft(d => ({ ...d, [postId]: '' }))
  }

  const canPost =
    tab === 'mensagem' ? draft.trim().length > 0 :
    tab === 'evento'   ? eventTitle.trim().length > 0 :
    tab === 'arquivo'  ? fileName.trim().length > 0 : false

  // Texto dinâmico do banner
  const bannerSub =
    visType === 'pessoas'  ? 'Mensagem privada para pessoas específicas' :
    visType === 'pipeline' ? `Mensagem para pipeline${selPipeline ? ': ' + PIPELINES.find(p=>p.key===selPipeline)?.label : ''}` :
    'Comunicados, eventos e arquivos · visível para todos'

  // Estilo inline reutilizado nos pills de seleção
  function pillStyle(active: boolean): React.CSSProperties {
    return {
      display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
      fontSize: 12.5, fontWeight: active ? 600 : 400,
      padding: '4px 11px', borderRadius: 20,
      border: `1px solid ${active ? 'var(--navy)' : 'var(--border)'}`,
      background: active ? 'var(--navy)' : '#f5f7fa',
      color: active ? '#fff' : 'var(--gray)',
      transition: 'all .12s', userSelect: 'none',
    }
  }

  function targetPillStyle(active: boolean, color: 'green' | 'navy' = 'green'): React.CSSProperties {
    const bg  = color === 'green' ? 'var(--green)'      : 'var(--navy-mid)'
    const bdr = color === 'green' ? 'var(--green-dark)' : 'var(--navy)'
    return {
      display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
      fontSize: 12.5, fontWeight: active ? 600 : 400,
      padding: '4px 11px', borderRadius: 20,
      border: `1px solid ${active ? bdr : 'var(--border)'}`,
      background: active ? bg : '#f5f7fa',
      color: active ? '#fff' : 'var(--gray)',
      transition: 'all .12s', userSelect: 'none',
    }
  }

  return (
    <div className="feed-wrap">

      {/* ── Compositor ── */}
      <div className="feed-composer">

        {/* Banner */}
        <div className="feed-banner">
          <span className="feed-banner-icon">📣</span>
          <div>
            <div className="feed-banner-title">Feed da Equipe</div>
            <div className="feed-banner-sub">{bannerSub}</div>
          </div>
        </div>

        {/* Abas */}
        <div className="feed-tabs">
          {(['mensagem', 'evento', 'arquivo'] as PostType[]).map(t => (
            <button type="button" key={t}
              className={`feed-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'mensagem' ? '💬 Mensagem' : t === 'evento' ? '📅 Evento' : '📎 Arquivo'}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="feed-composer-body">
          {tab === 'mensagem' && (
            <textarea className="feed-textarea"
              placeholder="Escreva um comunicado, anúncio ou atualização..."
              value={draft} onChange={e => setDraft(e.target.value)} rows={3}
            />
          )}
          {tab === 'evento' && (
            <div className="feed-form-col">
              <input className="feed-input" placeholder="Título do evento..."
                value={eventTitle} onChange={e => setEventTitle(e.target.value)} />
              <input className="feed-input" type="datetime-local" aria-label="Data e hora"
                value={eventDate} onChange={e => setEventDate(e.target.value)} />
              <textarea className="feed-textarea" placeholder="Descrição (opcional)..."
                value={draft} onChange={e => setDraft(e.target.value)} rows={2} />
            </div>
          )}
          {tab === 'arquivo' && (
            <div className="feed-form-col">
              <input className="feed-input" placeholder="Nome ou descrição do arquivo..."
                value={fileName} onChange={e => setFileName(e.target.value)} />
              <textarea className="feed-textarea" placeholder="Comentário (opcional)..."
                value={draft} onChange={e => setDraft(e.target.value)} rows={2} />
            </div>
          )}
        </div>

        {/* ── Seletor de visibilidade ── */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Linha 1: tipo de visibilidade */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--gray)', minWidth: 36 }}>Para:</span>
            <label style={pillStyle(visType === 'todos')}
              onClick={() => { setVisType('todos'); setSelPeople([]); setSelPipeline('') }}>
              👥 Toda a equipe
            </label>
            <label style={pillStyle(visType === 'pessoas')}
              onClick={() => { setVisType('pessoas'); setSelPipeline('') }}>
              👤 Pessoas específicas
            </label>
            <label style={pillStyle(visType === 'pipeline')}
              onClick={() => { setVisType('pipeline'); setSelPeople([]) }}>
              🎯 Pipeline
            </label>
          </div>

          {/* Linha 2: seleção de pessoas */}
          {visType === 'pessoas' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingLeft: 44 }}>
              {TEAM.map(m => (
                <label key={m.name} style={targetPillStyle(selPeople.includes(m.name), 'green')}
                  onClick={() => togglePerson(m.name)}>
                  <span style={{ fontWeight: 700, fontSize: 11 }}>{m.initials}</span>
                  {m.name}
                </label>
              ))}
              {selPeople.length === 0 && (
                <span style={{ fontSize: 12, color: '#f59e0b', fontStyle: 'italic' }}>
                  Selecione ao menos uma pessoa
                </span>
              )}
            </div>
          )}

          {/* Linha 2: seleção de pipeline */}
          {visType === 'pipeline' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingLeft: 44 }}>
              {PIPELINES.map(pl => (
                <label key={pl.key} style={targetPillStyle(selPipeline === pl.key, 'navy')}
                  onClick={() => setSelPipeline(selPipeline === pl.key ? '' : pl.key)}>
                  {pl.label}
                </label>
              ))}
              {!selPipeline && (
                <span style={{ fontSize: 12, color: '#f59e0b', fontStyle: 'italic' }}>
                  Selecione um pipeline
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="feed-composer-footer">
          <span className="feed-composer-hint">
            {posts.length} publicações · {visLabel(buildVisibility())}
          </span>
          <button type="button" className="btn btn-navy btn-sm"
            onClick={handlePost} disabled={!canPost}>
            Publicar
          </button>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="feed-timeline">
        {posts.length === 0 && (
          <div className="feed-empty">Nenhuma publicação ainda. Seja o primeiro a postar!</div>
        )}

        {posts.map(post => {
          const vis = post.visibility
          const visInfo =
            !vis || vis.type === 'todos' ? null :
            vis.type === 'pessoas' && vis.people?.length
              ? `👤 ${vis.people.join(', ')}`
              : vis.type === 'pipeline' && vis.pipeline
              ? `🎯 ${PIPELINES.find(p => p.key === vis.pipeline)?.label ?? vis.pipeline}`
              : null

          return (
            <div key={post.id} className={`feed-post feed-post-${post.type}`}>
              {/* Header */}
              <div className="feed-post-header">
                <div className={post.avatarClass}>{post.initials}</div>
                <div className="feed-post-meta">
                  <span className="feed-post-author">{post.author}</span>
                  {post.type === 'evento'  && <span className="feed-post-type-badge badge badge-navy">Evento</span>}
                  {post.type === 'arquivo' && <span className="feed-post-type-badge badge badge-orange">Arquivo</span>}
                  <div className="feed-post-ts">{post.timestamp}</div>
                  {visInfo && (
                    <div style={{ fontSize: 11.5, color: 'var(--gray)', marginTop: 2 }}>{visInfo}</div>
                  )}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="feed-post-body">
                {post.type === 'evento' && post.eventTitle && (
                  <div className="feed-event-card">
                    <div className="feed-event-icon">📅</div>
                    <div>
                      <div className="feed-event-title">{post.eventTitle}</div>
                      {post.eventDate && (
                        <div className="feed-event-date">
                          {new Date(post.eventDate).toLocaleString('pt-BR', {
                            weekday:'long', day:'numeric', month:'long', year:'numeric',
                            hour:'2-digit', minute:'2-digit'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {post.type === 'arquivo' && post.fileName && (
                  <div className="feed-file-card">
                    <span className="feed-file-icon">📎</span>
                    <span className="feed-file-name">{post.fileName}</span>
                    <button type="button" className="btn btn-outline btn-sm feed-file-dl">Baixar</button>
                  </div>
                )}
                {post.content && <p className="feed-post-text">{post.content}</p>}
              </div>

              {/* Rodapé */}
              <div className="feed-post-footer">
                <div className="feed-post-actions">
                  <button type="button"
                    className={`feed-action-btn${post.liked ? ' liked' : ''}`}
                    onClick={() => toggleLike(post.id)}>
                    {post.liked ? '❤️' : '🤍'} {post.likes > 0 && post.likes}
                  </button>
                  <button type="button" className="feed-action-btn"
                    onClick={() => toggleComments(post.id)}>
                    💬 {post.comments.length > 0 && post.comments.length}
                  </button>
                </div>
                <span className="feed-views">👁 {post.views}</span>
              </div>

              {/* Comentários */}
              {post.showComments && (
                <div className="feed-comments">
                  {post.comments.map(c => (
                    <div key={c.id} className="feed-comment">
                      <div className="feed-avatar feed-avatar-sm feed-avatar-green">{c.initials}</div>
                      <div className="feed-comment-bubble">
                        <span className="feed-comment-author">{c.author}</span>
                        <span className="feed-comment-text">{c.content}</span>
                        <span className="feed-comment-ts">{c.timestamp}</span>
                      </div>
                    </div>
                  ))}
                  <div className="feed-comment feed-comment-reply">
                    <div className="feed-avatar feed-avatar-sm feed-avatar-navy">AD</div>
                    <div className="feed-comment-input-wrap">
                      <input className="feed-comment-input" placeholder="Adicionar comentário..."
                        value={commentDraft[post.id] || ''}
                        onChange={e => setCommentDraft(d => ({ ...d, [post.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addComment(post.id)} />
                      <button type="button" className="btn btn-navy btn-sm"
                        onClick={() => addComment(post.id)}>↵</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
