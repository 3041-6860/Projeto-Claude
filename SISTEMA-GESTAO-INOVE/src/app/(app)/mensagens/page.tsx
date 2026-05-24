'use client'
import { useState } from 'react'

const contatos = [
  { nome: 'Guilherme Junqueira', canal: 'Interno',  ult: 'Reunião amanhã às 9h',              hora: '14:32', nao_lidas: 0, ativo: true  },
  { nome: 'Maria dos Santos',    canal: 'WhatsApp',  ult: 'Obrigada pela atualização!',        hora: '13:15', nao_lidas: 2, ativo: false },
  { nome: 'Fernanda Oliveira',   canal: 'Interno',  ult: 'Petição enviada para revisão',       hora: '11:48', nao_lidas: 1, ativo: false },
  { nome: 'João Carlos Pereira', canal: 'WhatsApp',  ult: 'Quando sai a decisão?',             hora: '10:02', nao_lidas: 3, ativo: false },
  { nome: 'Ana Paula Souza',     canal: 'Interno',  ult: 'Aprovado ✓',                        hora: '09:30', nao_lidas: 0, ativo: false },
  { nome: 'Roberto Almeida',     canal: 'WhatsApp',  ult: 'Pode me ligar amanhã?',             hora: 'Ontem', nao_lidas: 0, ativo: false },
  { nome: 'Equipe Jurídico',     canal: 'Grupo',    ult: 'Guilherme: prazo confirmado',        hora: 'Ontem', nao_lidas: 5, ativo: false },
]

const msgs = [
  { hora: '12:50', texto: 'Boa tarde! Queria saber sobre meu processo.',                              meu: false },
  { hora: '12:55', texto: 'Boa tarde, Maria! Seu processo está em andamento. Temos audiência marcada para 10/06.', meu: true  },
  { hora: '13:00', texto: 'Preciso levar algum documento?',                                            meu: false },
  { hora: '13:05', texto: 'Sim, por favor leve RG, CPF e comprovante de residência.',                  meu: true  },
  { hora: '13:15', texto: 'Obrigada pela atualização!',                                                meu: false },
]

function canalClass(canal: string) {
  if (canal === 'WhatsApp') return 'msg-canal msg-canal-wpp'
  if (canal === 'Grupo')    return 'msg-canal msg-canal-grupo'
  return 'msg-canal msg-canal-interno'
}

export default function Mensagens() {
  const [ativo, setAtivo] = useState(1)

  return (
    <div className="msg-wrap">

      {/* Lista de contatos */}
      <div className="msg-list">
        <div className="msg-search-wrap">
          <input type="text" placeholder="Buscar…" className="msg-search" />
        </div>
        <div className="msg-contacts">
          {contatos.map((c, i) => (
            <div
              key={c.nome}
              onClick={() => setAtivo(i)}
              className={`msg-contact${i === ativo ? ' active' : ''}`}
            >
              <div className="msg-contact-avatar">
                {c.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="msg-contact-info">
                <div className="msg-contact-row">
                  <span className="msg-contact-name">{c.nome}</span>
                  <span className="msg-contact-time">{c.hora}</span>
                </div>
                <div className="msg-contact-row">
                  <span className="msg-contact-preview">{c.ult}</span>
                  {c.nao_lidas > 0 && (
                    <span className="msg-unread-badge">{c.nao_lidas}</span>
                  )}
                </div>
                <span className={canalClass(c.canal)}>{c.canal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de chat */}
      <div className="msg-chat">

        {/* Header do chat */}
        <div className="msg-chat-header">
          <div className="msg-header-avatar">
            {contatos[ativo].nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div className="msg-header-name">{contatos[ativo].nome}</div>
            <div className="msg-header-status">{contatos[ativo].canal} · Online</div>
          </div>
        </div>

        {/* Mensagens */}
        <div className="msg-messages">
          {msgs.map((m, i) => (
            <div key={i} className={`msg-bubble-wrap${m.meu ? ' mine' : ''}`}>
              <div className={`msg-bubble${m.meu ? ' mine' : ''}`}>
                <div>{m.texto}</div>
                <div className="msg-bubble-time">{m.hora}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="msg-input-area">
          <input
            type="text"
            placeholder="Digite uma mensagem…"
            className="msg-text-input"
          />
          <button type="button" className="btn btn-navy btn-sm">Enviar</button>
        </div>

      </div>
    </div>
  )
}
