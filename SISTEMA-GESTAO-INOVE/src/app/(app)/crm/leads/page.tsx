'use client'
import { useState, useEffect, useRef } from 'react'
import { Phone, Mail, Building2, Plus, X, ChevronDown, MessageSquare, PhoneCall, CheckSquare, Clock, User, Tag, DollarSign, Calendar, Filter, LayoutGrid, List, Send, Pencil, Trash2, MoreHorizontal } from 'lucide-react'

/* ───── tipos ───── */
interface Atividade {
  id: string; tipo: 'nota'|'ligacao'|'email'|'tarefa'; texto: string
  data: string; autor: string; concluida?: boolean
}
interface Lead {
  id: string; nome: string; empresa: string; email: string; fone: string
  status: string; origem: string; dataCriacao: string; valor: string
  responsavel: string; descricao: string; atividades: Atividade[]
  tags: string[]; cidade?: string; cargo?: string
}

/* ───── dados iniciais ───── */
const INICIAL: Lead[] = [
  { id:'1', nome:'Maria Aparecida Santos', empresa:'Confeitaria Doce Arte', email:'maria@docearte.com.br', fone:'(11) 98765-4321', status:'Novo', origem:'WhatsApp', dataCriacao:'20/05/26', valor:'8000', responsavel:'Ana Lima', descricao:'Interessada em assessoria jurídica para abertura de ME.', tags:['PF','Urgente'], cidade:'São Paulo', cargo:'Proprietária', atividades:[
    {id:'a1',tipo:'nota',texto:'Primeira conversa pelo WhatsApp. Cliente tem urgência para formalizar.',data:'20/05/26 09:15',autor:'Ana Lima'},
    {id:'a2',tipo:'ligacao',texto:'Ligação realizada. Agendada reunião para quarta.',data:'21/05/26 14:00',autor:'Ana Lima',concluida:true},
  ]},
  { id:'2', nome:'João Carlos Pereira', empresa:'Transportes JCP Ltda', email:'joao@jcptrans.com.br', fone:'(41) 99001-2233', status:'Qualificado', origem:'Indicação', dataCriacao:'19/05/26', valor:'55000', responsavel:'Carlos Souza', descricao:'Empresa de transporte com 12 funcionários. Precisa de gestão trabalhista.', tags:['PJ','Alto Valor'], cidade:'Curitiba', cargo:'Diretor', atividades:[
    {id:'b1',tipo:'nota',texto:'Indicação do cliente Roberto Costa. Empresa sólida.',data:'19/05/26 10:00',autor:'Carlos Souza'},
    {id:'b2',tipo:'email',texto:'Email enviado com apresentação dos serviços.',data:'20/05/26 08:30',autor:'Carlos Souza',concluida:true},
    {id:'b3',tipo:'tarefa',texto:'Preparar proposta comercial completa',data:'22/05/26',autor:'Carlos Souza',concluida:false},
  ]},
  { id:'3', nome:'Fernanda Oliveira Lima', empresa:'Clínica Saúde & Vida', email:'fernanda@saudevida.med', fone:'(21) 97654-8800', status:'Proposta', origem:'Site', dataCriacao:'18/05/26', valor:'12000', responsavel:'Ana Lima', descricao:'Clínica médica buscando adequação a normas regulatórias.', tags:['PJ','Saúde'], cidade:'Rio de Janeiro', cargo:'Diretora Médica', atividades:[
    {id:'c1',tipo:'email',texto:'Proposta enviada por email. Aguardando retorno.',data:'20/05/26 11:00',autor:'Ana Lima',concluida:true},
  ]},
  { id:'4', nome:'Roberto Almeida Costa', empresa:'Construtora Almeida SA', email:'roberto@almeida.eng.br', fone:'(31) 98881-5500', status:'Negociação', origem:'LinkedIn', dataCriacao:'17/05/26', valor:'85000', responsavel:'Carlos Souza', descricao:'Grande construtora. Contrato anual de consultoria jurídica.', tags:['PJ','Contrato Anual'], cidade:'Belo Horizonte', cargo:'CEO', atividades:[
    {id:'d1',tipo:'ligacao',texto:'Reunião presencial realizada. Cliente muito interessado.',data:'18/05/26 15:00',autor:'Carlos Souza',concluida:true},
    {id:'d2',tipo:'nota',texto:'Ajustar proposta: incluir cláusula de exclusividade.',data:'19/05/26 09:00',autor:'Carlos Souza'},
    {id:'d3',tipo:'tarefa',texto:'Enviar contrato revisado',data:'23/05/26',autor:'Carlos Souza',concluida:false},
  ]},
  { id:'5', nome:'Camila Souza Ferreira', empresa:'Boutique Camila Moda', email:'camila@camilamoda.com', fone:'(85) 99123-7700', status:'Perdido', origem:'WhatsApp', dataCriacao:'15/05/26', valor:'22000', responsavel:'Ana Lima', descricao:'Optou por escritório local.', tags:['PJ'], cidade:'Fortaleza', cargo:'Sócia', atividades:[
    {id:'e1',tipo:'nota',texto:'Cliente informou que contratou outro escritório.',data:'20/05/26 16:00',autor:'Ana Lima'},
  ]},
  { id:'6', nome:'André Luis Martins', empresa:'Agropecuária Martins', email:'andre@agromart.com.br', fone:'(67) 98765-1122', status:'Novo', origem:'Indicação', dataCriacao:'14/05/26', valor:'28000', responsavel:'Carlos Souza', descricao:'Fazendeiro com questões de regularização fundiária.', tags:['PF','Rural'], cidade:'Campo Grande', cargo:'Proprietário Rural', atividades:[]},
  { id:'7', nome:'Patrícia Nunes Barbosa', empresa:'Escola Infantil Alegria', email:'patricia@alegria.edu.br', fone:'(62) 99887-3344', status:'Qualificado', origem:'Google', dataCriacao:'12/05/26', valor:'18000', responsavel:'Ana Lima', descricao:'Escola particular buscando adequação trabalhista e tributária.', tags:['PJ','Educação'], cidade:'Goiânia', cargo:'Diretora', atividades:[
    {id:'f1',tipo:'email',texto:'Questionário de diagnóstico enviado.',data:'14/05/26 10:00',autor:'Ana Lima',concluida:true},
  ]},
  { id:'8', nome:'Carlos Eduardo Lima', empresa:'Rede Farmácias Saúde', email:'carlos@redesaude.com', fone:'(11) 97711-5500', status:'Ganho', origem:'LinkedIn', dataCriacao:'10/05/26', valor:'42000', responsavel:'Carlos Souza', descricao:'Contrato assinado. Parceria de longo prazo.', tags:['PJ','Recorrente'], cidade:'São Paulo', cargo:'Sócio-Diretor', atividades:[
    {id:'g1',tipo:'nota',texto:'Contrato assinado! Início em 01/06.',data:'20/05/26 09:00',autor:'Carlos Souza'},
  ]},
]

const COLUNAS_PADRAO = [
  {key:'Novo',       label:'Novo',       cor:'#3b82f6'},
  {key:'Qualificado',label:'Qualificado',cor:'#8b5cf6'},
  {key:'Proposta',   label:'Proposta',   cor:'#f59e0b'},
  {key:'Negociação', label:'Negociação', cor:'#ef4444'},
  {key:'Ganho',      label:'Ganho ✓',    cor:'#10b981'},
  {key:'Perdido',    label:'Perdido',    cor:'#6b7280'},
]
const KEYS_PADRAO = new Set(COLUNAS_PADRAO.map(c=>c.key))
const CORES_NOVAS = ['#06b6d4','#84cc16','#f97316','#ec4899','#a855f7','#14b8a6','#f43f5e','#0ea5e9']

const ORIGENS = ['WhatsApp','Indicação','Site','LinkedIn','Google','Instagram','Outros']
const RESPONSAVEIS = ['Ana Lima','Carlos Souza','Maria Santos','João Pereira']
const TAGS_OPCOES = ['PF','PJ','Urgente','Alto Valor','Recorrente','Rural','Saúde','Educação']

const origemCor: Record<string,string> = {
  WhatsApp:'#10b981', Indicação:'#3b82f6', Site:'#6b7280',
  LinkedIn:'#0077b5', Google:'#ef4444', Instagram:'#e1306c', Outros:'#8b5cf6'
}

function fmtValor(v:string){ const n=parseFloat(v)||0; return 'R$ '+n.toLocaleString('pt-BR',{minimumFractionDigits:0}) }
function initials(n:string){ return n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() }
function corAvatar(n:string){ const cores=['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#0077b5']; let h=0; for(const c of n) h+=c.charCodeAt(0); return cores[h%cores.length] }

/* ───── componente principal ───── */
export default function CrmLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [colunas, setColunas] = useState(COLUNAS_PADRAO)
  // insertPos: null=hidden, -1=append at end, N=insert before colunas[N]
  const [insertPos, setInsertPos] = useState<number|null>(null)
  const [novaFaseNome, setNovaFaseNome] = useState('')
  const [view, setView] = useState<'kanban'|'lista'>('kanban')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroOrigem, setFiltroOrigem] = useState('')
  const [filtroResp, setFiltroResp] = useState('')
  const [busca, setBusca] = useState('')
  const [leadAberto, setLeadAberto] = useState<Lead|null>(null)
  const [modalNovo, setModalNovo] = useState(false)
  const [novaAtividade, setNovaAtividade] = useState('')
  const [tipoAtiv, setTipoAtiv] = useState<'nota'|'ligacao'|'email'|'tarefa'>('nota')
  const [editandoLead, setEditandoLead] = useState(false)

  // Formulário novo lead
  const [form, setForm] = useState({ nome:'',empresa:'',email:'',fone:'',valor:'',origem:'WhatsApp',responsavel:'Ana Lima',status:'Novo',descricao:'',cidade:'',cargo:'',tags:[] as string[] })

  useEffect(()=>{
    const s = localStorage.getItem('inove-crm-leads')
    setLeads(s ? JSON.parse(s) : INICIAL)
    const c = localStorage.getItem('inove-crm-colunas')
    if(c) setColunas(JSON.parse(c))
  },[])

  function save(data:Lead[]){ setLeads(data); localStorage.setItem('inove-crm-leads',JSON.stringify(data)) }
  function saveColunas(data:typeof COLUNAS_PADRAO){ setColunas(data); localStorage.setItem('inove-crm-colunas',JSON.stringify(data)) }

  function confirmarFase(){
    const nome = novaFaseNome.trim()
    if(!nome) return
    const cor = CORES_NOVAS[(colunas.filter(c=>!KEYS_PADRAO.has(c.key)).length) % CORES_NOVAS.length]
    const novoItem = {key:nome, label:nome, cor}
    const idx = (insertPos === null || insertPos === -1) ? colunas.length : insertPos
    const novasColunas = [...colunas]
    novasColunas.splice(idx, 0, novoItem)
    saveColunas(novasColunas)
    setNovaFaseNome('')
    setInsertPos(null)
  }

  function cancelarFase(){
    setInsertPos(null)
    setNovaFaseNome('')
  }

  function excluirFase(key:string){
    if(KEYS_PADRAO.has(key)) return
    saveColunas(colunas.filter(c=>c.key!==key))
  }

  const leadsFiltrados = leads.filter(l=>{
    if(filtroStatus && l.status!==filtroStatus) return false
    if(filtroOrigem && l.origem!==filtroOrigem) return false
    if(filtroResp && l.responsavel!==filtroResp) return false
    if(busca && !l.nome.toLowerCase().includes(busca.toLowerCase()) && !l.empresa.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const totalPipeline = leads.filter(l=>l.status!=='Perdido').reduce((s,l)=>s+(parseFloat(l.valor)||0),0)

  function criarLead(){
    const novo:Lead = { ...form, id:Date.now().toString(), dataCriacao: new Date().toLocaleDateString('pt-BR').replace(/\//g,'/').slice(0,8)+'26', atividades:[], tags:form.tags }
    save([novo,...leads])
    setModalNovo(false)
    setForm({nome:'',empresa:'',email:'',fone:'',valor:'',origem:'WhatsApp',responsavel:'Ana Lima',status:'Novo',descricao:'',cidade:'',cargo:'',tags:[]})
  }

  function moverStatus(id:string, novoStatus:string){
    save(leads.map(l=>l.id===id?{...l,status:novoStatus}:l))
    if(leadAberto?.id===id) setLeadAberto(prev=>prev?{...prev,status:novoStatus}:null)
  }

  function adicionarAtividade(lead:Lead){
    if(!novaAtividade.trim()) return
    const ativ:Atividade = { id:Date.now().toString(), tipo:tipoAtiv, texto:novaAtividade, data:new Date().toLocaleDateString('pt-BR')+' '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}), autor:'Administrador', concluida:false }
    const updated = leads.map(l=>l.id===lead.id?{...l,atividades:[ativ,...l.atividades]}:l)
    save(updated)
    setLeadAberto({...lead,atividades:[ativ,...lead.atividades]})
    setNovaAtividade('')
  }

  function toggleAtiv(lead:Lead, ativId:string){
    const updated = leads.map(l=>l.id===lead.id?{...l,atividades:l.atividades.map(a=>a.id===ativId?{...a,concluida:!a.concluida}:a)}:l)
    save(updated)
    setLeadAberto(updated.find(l=>l.id===lead.id)||null)
  }

  function excluirLead(id:string){
    save(leads.filter(l=>l.id!==id))
    setLeadAberto(null)
  }

  const iconAtiv = {nota:MessageSquare, ligacao:PhoneCall, email:Mail, tarefa:CheckSquare}
  const corAtiv  = {nota:'#6b7280', ligacao:'#10b981', email:'#3b82f6', tarefa:'#f59e0b'}

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',gap:0}}>

      {/* ── TOOLBAR ── */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'0 0 14px 0',flexWrap:'wrap'}}>
        <h1 style={{fontSize:18,fontWeight:700,color:'var(--navy)',margin:0,marginRight:'auto'}}>CRM — Leads</h1>
        <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="🔍 Buscar…" style={{border:'1px solid var(--border)',borderRadius:7,padding:'6px 12px',fontSize:12,width:200,outline:'none'}}/>
        <select value={filtroStatus} onChange={e=>setFiltroStatus(e.target.value)} style={{border:'1px solid var(--border)',borderRadius:7,padding:'6px 10px',fontSize:12,outline:'none'}}>
          <option value="">Todos status</option>
          {colunas.map(c=><option key={c.key}>{c.key}</option>)}
        </select>
        <select value={filtroOrigem} onChange={e=>setFiltroOrigem(e.target.value)} style={{border:'1px solid var(--border)',borderRadius:7,padding:'6px 10px',fontSize:12,outline:'none'}}>
          <option value="">Todas origens</option>
          {ORIGENS.map(o=><option key={o}>{o}</option>)}
        </select>
        <select value={filtroResp} onChange={e=>setFiltroResp(e.target.value)} style={{border:'1px solid var(--border)',borderRadius:7,padding:'6px 10px',fontSize:12,outline:'none'}}>
          <option value="">Todos responsáveis</option>
          {RESPONSAVEIS.map(r=><option key={r}>{r}</option>)}
        </select>
        <div style={{display:'flex',border:'1px solid var(--border)',borderRadius:7,overflow:'hidden'}}>
          {(['kanban','lista'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{padding:'6px 12px',fontSize:12,border:'none',cursor:'pointer',background:view===v?'var(--navy)':'white',color:view===v?'white':'var(--navy)',display:'flex',alignItems:'center',gap:5}}>
              {v==='kanban'?<LayoutGrid size={13}/>:<List size={13}/>}
              {v.charAt(0).toUpperCase()+v.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={()=>setModalNovo(true)} style={{background:'var(--navy)',color:'white',border:'none',borderRadius:7,padding:'7px 16px',fontSize:12,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
          <Plus size={14}/> Novo Lead
        </button>
      </div>

      {/* ── MÉTRICAS ── */}
      <div style={{display:'flex',gap:1,background:'var(--border)',borderRadius:10,overflow:'hidden',marginBottom:16,flexShrink:0}}>
        {[
          {label:'Pipeline total', val:'R$ '+totalPipeline.toLocaleString('pt-BR'), cor:'var(--navy)'},
          {label:'Total', val:String(leads.length), cor:'#6b7280'},
          ...colunas.map(c=>({label:c.label, val:String(leads.filter(l=>l.status===c.key).length), cor:c.cor}))
        ].map(m=>(
          <div key={m.label} style={{flex:1,background:'white',padding:'10px 14px',textAlign:'center'}}>
            <div style={{fontSize:10,color:'#888',marginBottom:3}}>{m.label}</div>
            <div style={{fontSize:15,fontWeight:700,color:m.cor}}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* ── KANBAN ── */}
      {view==='kanban' && (
        <div style={{display:'flex',gap:0,overflowX:'auto',flex:1,alignItems:'flex-start',paddingBottom:8}}>
          {colunas.flatMap((col, ci)=>{
            const cards = leadsFiltrados.filter(l=>l.status===col.key)
            const tot = cards.reduce((s,l)=>s+(parseFloat(l.valor)||0),0)

            const column = (
              <div key={col.key} style={{minWidth:220,maxWidth:240,width:240,flexShrink:0,display:'flex',flexDirection:'column',gap:8,marginRight:10}}>
                {/* cabeçalho coluna */}
                <div style={{borderRadius:8,overflow:'hidden',background:'white',border:'1px solid var(--border)'}}>
                  <div style={{height:4,background:col.cor}}/>
                  <div style={{padding:'8px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:12,fontWeight:700,color:'var(--navy)'}}>{col.label}</span>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{background:col.cor+'20',color:col.cor,borderRadius:12,padding:'2px 8px',fontSize:11,fontWeight:700}}>{cards.length}</span>
                      {!KEYS_PADRAO.has(col.key) && (
                        <button onClick={()=>excluirFase(col.key)} title="Excluir fase" style={{background:'transparent',border:'none',cursor:'pointer',color:'#d1d5db',padding:2,display:'flex',alignItems:'center'}}
                          onMouseEnter={e=>(e.currentTarget.style.color='#ef4444')}
                          onMouseLeave={e=>(e.currentTarget.style.color='#d1d5db')}>
                          <X size={12}/>
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{padding:'0 12px 8px',fontSize:10,color:'#888'}}>{fmtValor(String(tot))}</div>
                </div>
                {/* cards */}
                {cards.map(lead=>(
                  <div key={lead.id} onClick={()=>setLeadAberto(lead)} style={{background:'white',border:'1px solid var(--border)',borderRadius:8,padding:'10px 12px',cursor:'pointer',transition:'box-shadow .15s'}}
                    onMouseEnter={e=>(e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)')}
                    onMouseLeave={e=>(e.currentTarget.style.boxShadow='none')}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:corAvatar(lead.nome),display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:11,fontWeight:700,flexShrink:0}}>{initials(lead.nome)}</div>
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:'var(--navy)',lineHeight:1.3}}>{lead.nome}</div>
                        <div style={{fontSize:10,color:'#888'}}>{lead.empresa}</div>
                      </div>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:'#10b981',marginBottom:6}}>{fmtValor(lead.valor)}</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:6}}>
                      <span style={{background:origemCor[lead.origem]+'20',color:origemCor[lead.origem],borderRadius:10,padding:'2px 7px',fontSize:10,fontWeight:600}}>{lead.origem}</span>
                      {lead.tags.slice(0,2).map(t=><span key={t} style={{background:'#f3f4f6',color:'#6b7280',borderRadius:10,padding:'2px 7px',fontSize:10}}>{t}</span>)}
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        <div style={{width:20,height:20,borderRadius:'50%',background:corAvatar(lead.responsavel),display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:8,fontWeight:700}}>{initials(lead.responsavel)}</div>
                        <span style={{fontSize:10,color:'#888'}}>{lead.responsavel.split(' ')[0]}</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        {lead.atividades.length>0 && <span style={{fontSize:10,color:'#888',display:'flex',alignItems:'center',gap:2}}><MessageSquare size={10}/>{lead.atividades.length}</span>}
                        <span style={{fontSize:10,color:'#aaa'}}>{lead.dataCriacao.slice(0,5)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={()=>{setForm(f=>({...f,status:col.key}));setModalNovo(true)}} style={{width:'100%',background:'transparent',border:'1px dashed #d1d5db',borderRadius:8,padding:'8px',fontSize:11,color:'#9ca3af',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                  <Plus size={12}/> Adicionar
                </button>
              </div>
            )

            if(ci===0) return [column]

            const insertZone = insertPos === ci ? (
              <div key={`ins-input-${ci}`} style={{minWidth:180,flexShrink:0,marginRight:10}}>
                <div style={{background:'white',border:'1px solid var(--border)',borderRadius:8,padding:12,display:'flex',flexDirection:'column',gap:8}}>
                  <p style={{margin:0,fontSize:11,color:'var(--gray)',fontWeight:600}}>Inserir antes de &ldquo;{col.label}&rdquo;</p>
                  <input autoFocus value={novaFaseNome} onChange={e=>setNovaFaseNome(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter')confirmarFase();if(e.key==='Escape')cancelarFase()}}
                    placeholder="Nome da fase…" style={{border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',fontSize:12,outline:'none',width:'100%',boxSizing:'border-box'}}/>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={confirmarFase} style={{flex:1,background:'var(--navy)',color:'white',border:'none',borderRadius:6,padding:'6px',fontSize:11,fontWeight:600,cursor:'pointer'}}>OK</button>
                    <button onClick={cancelarFase} style={{background:'white',border:'1px solid var(--border)',borderRadius:6,padding:'6px 10px',fontSize:11,cursor:'pointer',color:'#6b7280'}}><X size={12}/></button>
                  </div>
                </div>
              </div>
            ) : (
              <div key={`ins-btn-${ci}`} style={{width:16,flexShrink:0,display:'flex',alignItems:'flex-start',paddingTop:14,marginRight:4}}>
                <button onClick={()=>{setInsertPos(ci);setNovaFaseNome('')}} title="Inserir fase aqui"
                  style={{width:16,height:28,border:'1px dashed #d1d5db',borderRadius:4,background:'transparent',cursor:'pointer',color:'#9ca3af',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',padding:0,transition:'all .15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--navy)';e.currentTarget.style.color='var(--navy)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='#d1d5db';e.currentTarget.style.color='#9ca3af'}}>
                  +
                </button>
              </div>
            )

            return [insertZone, column]
          })}

          {/* + Nova fase no final */}
          {insertPos === null && (
            <div style={{minWidth:200,flexShrink:0}}>
              <button onClick={()=>{setInsertPos(-1);setNovaFaseNome('')}}
                style={{width:'100%',background:'transparent',border:'2px dashed #d1d5db',borderRadius:8,padding:'14px 12px',fontSize:12,color:'#9ca3af',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'all .15s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--navy)';e.currentTarget.style.color='var(--navy)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#d1d5db';e.currentTarget.style.color='#9ca3af'}}>
                <Plus size={14}/> Nova fase
              </button>
            </div>
          )}
          {insertPos === -1 && (
            <div style={{minWidth:200,flexShrink:0}}>
              <div style={{background:'white',border:'1px solid var(--border)',borderRadius:8,padding:12,display:'flex',flexDirection:'column',gap:8}}>
                <input autoFocus value={novaFaseNome} onChange={e=>setNovaFaseNome(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter')confirmarFase();if(e.key==='Escape')cancelarFase()}}
                  placeholder="Nome da fase…" style={{border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',fontSize:12,outline:'none',width:'100%',boxSizing:'border-box'}}/>
                <div style={{display:'flex',gap:6}}>
                  <button onClick={confirmarFase} style={{flex:1,background:'var(--navy)',color:'white',border:'none',borderRadius:6,padding:'6px',fontSize:11,fontWeight:600,cursor:'pointer'}}>Adicionar</button>
                  <button onClick={cancelarFase} style={{background:'white',border:'1px solid var(--border)',borderRadius:6,padding:'6px 10px',fontSize:11,cursor:'pointer',color:'#6b7280'}}><X size={12}/></button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LISTA ── */}
      {view==='lista' && (
        <div style={{flex:1,overflowY:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead>
              <tr style={{background:'#f8fafc',borderBottom:'2px solid var(--border)'}}>
                {['Lead','Empresa','Valor','Status','Origem','Responsável','Entrada',''].map(h=>(
                  <th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:600,color:'#6b7280',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leadsFiltrados.map(l=>(
                <tr key={l.id} style={{borderBottom:'1px solid var(--border)',cursor:'pointer'}}
                  onClick={()=>setLeadAberto(l)}
                  onMouseEnter={e=>(e.currentTarget.style.background='#f8fafc')}
                  onMouseLeave={e=>(e.currentTarget.style.background='white')}>
                  <td style={{padding:'10px 12px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:corAvatar(l.nome),display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:10,fontWeight:700,flexShrink:0}}>{initials(l.nome)}</div>
                      <div>
                        <div style={{fontWeight:600,color:'var(--navy)'}}>{l.nome}</div>
                        <div style={{fontSize:10,color:'#888'}}>{l.cargo}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'10px 12px',color:'#374151'}}>{l.empresa}</td>
                  <td style={{padding:'10px 12px',fontWeight:700,color:'#10b981'}}>{fmtValor(l.valor)}</td>
                  <td style={{padding:'10px 12px'}}>
                    <span style={{background:(colunas.find(c=>c.key===l.status)?.cor??'#6b7280')+'20',color:colunas.find(c=>c.key===l.status)?.cor??'#6b7280',borderRadius:12,padding:'3px 10px',fontSize:11,fontWeight:600}}>{l.status}</span>
                  </td>
                  <td style={{padding:'10px 12px'}}>
                    <span style={{background:origemCor[l.origem]+'20',color:origemCor[l.origem],borderRadius:12,padding:'3px 10px',fontSize:11,fontWeight:600}}>{l.origem}</span>
                  </td>
                  <td style={{padding:'10px 12px',color:'#374151',fontSize:11}}>{l.responsavel}</td>
                  <td style={{padding:'10px 12px',color:'#9ca3af',fontSize:11}}>{l.dataCriacao}</td>
                  <td style={{padding:'10px 12px'}}>
                    <button onClick={e=>{e.stopPropagation();setLeadAberto(l)}} style={{background:'transparent',border:'1px solid var(--border)',borderRadius:6,padding:'4px 10px',fontSize:11,cursor:'pointer',color:'var(--navy)'}}>Abrir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL DETALHE LEAD ── */}
      {leadAberto && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:100,display:'flex',justifyContent:'flex-end'}} onClick={()=>{setLeadAberto(null);setEditandoLead(false)}}>
          <div style={{width:520,height:'100%',background:'white',overflowY:'auto',boxShadow:'-4px 0 24px rgba(0,0,0,0.15)',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>

            {/* header painel */}
            <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:corAvatar(leadAberto.nome),display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:14,fontWeight:700,flexShrink:0}}>{initials(leadAberto.nome)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:700,color:'var(--navy)'}}>{leadAberto.nome}</div>
                <div style={{fontSize:12,color:'#888'}}>{leadAberto.empresa} {leadAberto.cargo?'· '+leadAberto.cargo:''}</div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <button onClick={()=>excluirLead(leadAberto.id)} style={{background:'transparent',border:'none',cursor:'pointer',color:'#ef4444',padding:4}}><Trash2 size={15}/></button>
                <button onClick={()=>{setLeadAberto(null);setEditandoLead(false)}} style={{background:'transparent',border:'none',cursor:'pointer',color:'#6b7280',padding:4}}><X size={18}/></button>
              </div>
            </div>

            {/* mover status */}
            <div style={{padding:'12px 20px',borderBottom:'1px solid var(--border)',display:'flex',gap:4,flexWrap:'wrap',flexShrink:0}}>
              {colunas.map(c=>(
                <button key={c.key} onClick={()=>moverStatus(leadAberto.id,c.key)}
                  style={{padding:'4px 12px',borderRadius:14,border:'none',cursor:'pointer',fontSize:11,fontWeight:600,
                    background:leadAberto.status===c.key?c.cor:'#f3f4f6',
                    color:leadAberto.status===c.key?'white':'#6b7280'}}>
                  {c.label}
                </button>
              ))}
            </div>

            {/* info cards */}
            <div style={{padding:'14px 20px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,borderBottom:'1px solid var(--border)',flexShrink:0}}>
              {[
                {icon:DollarSign, label:'Valor', val:fmtValor(leadAberto.valor), cor:'#10b981'},
                {icon:User, label:'Responsável', val:leadAberto.responsavel, cor:'var(--navy)'},
                {icon:Phone, label:'Telefone', val:leadAberto.fone, cor:'#374151'},
                {icon:Mail, label:'Email', val:leadAberto.email, cor:'#374151'},
                {icon:Building2, label:'Empresa', val:leadAberto.empresa, cor:'#374151'},
                {icon:Tag, label:'Origem', val:leadAberto.origem, cor:origemCor[leadAberto.origem]},
              ].map(({icon:Icon,label,val,cor})=>(
                <div key={label} style={{background:'#f8fafc',borderRadius:8,padding:'8px 12px',display:'flex',alignItems:'center',gap:8}}>
                  <Icon size={14} style={{color:cor,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:10,color:'#9ca3af'}}>{label}</div>
                    <div style={{fontSize:12,fontWeight:600,color:cor,wordBreak:'break-word'}}>{val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* tags */}
            {leadAberto.tags.length>0 && (
              <div style={{padding:'10px 20px',borderBottom:'1px solid var(--border)',display:'flex',gap:6,flexWrap:'wrap',flexShrink:0}}>
                {leadAberto.tags.map(t=><span key={t} style={{background:'#ede9fe',color:'#7c3aed',borderRadius:10,padding:'3px 10px',fontSize:11,fontWeight:600}}>{t}</span>)}
              </div>
            )}

            {/* descrição */}
            {leadAberto.descricao && (
              <div style={{padding:'12px 20px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
                <div style={{fontSize:11,color:'#9ca3af',marginBottom:4}}>Descrição</div>
                <div style={{fontSize:12,color:'#374151',lineHeight:1.5}}>{leadAberto.descricao}</div>
              </div>
            )}

            {/* nova atividade */}
            <div style={{padding:'14px 20px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
              <div style={{fontSize:12,fontWeight:600,color:'var(--navy)',marginBottom:8}}>Registrar atividade</div>
              <div style={{display:'flex',gap:6,marginBottom:8}}>
                {(['nota','ligacao','email','tarefa'] as const).map(t=>{
                  const Icon = iconAtiv[t]
                  return (
                    <button key={t} onClick={()=>setTipoAtiv(t)}
                      style={{flex:1,padding:'6px 4px',border:'1px solid',borderRadius:7,cursor:'pointer',fontSize:10,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:4,
                        borderColor:tipoAtiv===t?corAtiv[t]:'var(--border)',
                        background:tipoAtiv===t?corAtiv[t]+'15':'white',
                        color:tipoAtiv===t?corAtiv[t]:'#9ca3af'}}>
                      <Icon size={11}/>{t.charAt(0).toUpperCase()+t.slice(1)}
                    </button>
                  )
                })}
              </div>
              <div style={{display:'flex',gap:8}}>
                <textarea value={novaAtividade} onChange={e=>setNovaAtividade(e.target.value)}
                  placeholder={`Registrar ${tipoAtiv}...`} rows={2}
                  style={{flex:1,border:'1px solid var(--border)',borderRadius:7,padding:'8px 10px',fontSize:12,resize:'none',outline:'none'}}/>
                <button onClick={()=>adicionarAtividade(leadAberto)}
                  style={{background:'var(--navy)',color:'white',border:'none',borderRadius:7,padding:'0 14px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Send size={14}/>
                </button>
              </div>
            </div>

            {/* timeline de atividades */}
            <div style={{padding:'14px 20px',flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:'var(--navy)',marginBottom:10}}>Atividades ({leadAberto.atividades.length})</div>
              {leadAberto.atividades.length===0 && <div style={{fontSize:12,color:'#9ca3af',textAlign:'center',padding:'20px 0'}}>Nenhuma atividade registrada</div>}
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {leadAberto.atividades.map(a=>{
                  const Icon=iconAtiv[a.tipo]
                  return (
                    <div key={a.id} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:corAtiv[a.tipo]+'20',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>
                        <Icon size={13} style={{color:corAtiv[a.tipo]}}/>
                      </div>
                      <div style={{flex:1,background:'#f8fafc',borderRadius:8,padding:'8px 12px'}}>
                        <div style={{fontSize:12,color:'#374151',marginBottom:4,textDecoration:a.concluida?'line-through':'none'}}>{a.texto}</div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span style={{fontSize:10,color:'#9ca3af'}}>{a.data} · {a.autor}</span>
                          {a.tipo==='tarefa' && (
                            <button onClick={()=>toggleAtiv(leadAberto,a.id)}
                              style={{background:a.concluida?'#10b98120':'transparent',border:'1px solid',borderColor:a.concluida?'#10b981':'#d1d5db',borderRadius:5,padding:'2px 8px',fontSize:10,cursor:'pointer',color:a.concluida?'#10b981':'#6b7280'}}>
                              {a.concluida?'✓ Feito':'Concluir'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL NOVO LEAD ── */}
      {modalNovo && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setModalNovo(false)}>
          <div style={{background:'white',borderRadius:12,width:540,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h2 style={{margin:0,fontSize:16,fontWeight:700,color:'var(--navy)'}}>Novo Lead</h2>
              <button onClick={()=>setModalNovo(false)} style={{background:'transparent',border:'none',cursor:'pointer',color:'#6b7280'}}><X size={18}/></button>
            </div>
            <div style={{padding:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              {[
                {label:'Nome *',key:'nome',full:true},{label:'Empresa',key:'empresa',full:true},
                {label:'Email',key:'email'},{label:'Telefone',key:'fone'},
                {label:'Cargo',key:'cargo'},{label:'Cidade',key:'cidade'},
                {label:'Valor estimado (R$)',key:'valor'},{label:'Descrição',key:'descricao',full:true},
              ].map(({label,key,full})=>(
                <div key={key} style={full?{gridColumn:'span 2'}:{}}>
                  <label style={{fontSize:11,fontWeight:600,color:'#374151',display:'block',marginBottom:4}}>{label}</label>
                  {key==='descricao'
                    ? <textarea value={(form as any)[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} rows={2} style={{width:'100%',border:'1px solid var(--border)',borderRadius:7,padding:'8px 10px',fontSize:12,outline:'none',resize:'none',boxSizing:'border-box'}}/>
                    : <input value={(form as any)[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{width:'100%',border:'1px solid var(--border)',borderRadius:7,padding:'8px 10px',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
                  }
                </div>
              ))}
              {/* selects */}
              {[
                {label:'Origem',key:'origem',opts:ORIGENS},
                {label:'Responsável',key:'responsavel',opts:RESPONSAVEIS},
                {label:'Status inicial',key:'status',opts:colunas.map(c=>c.key)},
              ].map(({label,key,opts})=>(
                <div key={key}>
                  <label style={{fontSize:11,fontWeight:600,color:'#374151',display:'block',marginBottom:4}}>{label}</label>
                  <select value={(form as any)[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{width:'100%',border:'1px solid var(--border)',borderRadius:7,padding:'8px 10px',fontSize:12,outline:'none'}}>
                    {opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              {/* tags */}
              <div style={{gridColumn:'span 2'}}>
                <label style={{fontSize:11,fontWeight:600,color:'#374151',display:'block',marginBottom:6}}>Tags</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {TAGS_OPCOES.map(t=>(
                    <button key={t} type="button" onClick={()=>setForm(f=>({...f,tags:f.tags.includes(t)?f.tags.filter(x=>x!==t):[...f.tags,t]}))}
                      style={{padding:'4px 12px',borderRadius:14,border:'1px solid',cursor:'pointer',fontSize:11,fontWeight:600,
                        borderColor:form.tags.includes(t)?'#7c3aed':'#d1d5db',
                        background:form.tags.includes(t)?'#ede9fe':'white',
                        color:form.tags.includes(t)?'#7c3aed':'#6b7280'}}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{padding:'0 20px 20px',display:'flex',justifyContent:'flex-end',gap:10}}>
              <button onClick={()=>setModalNovo(false)} style={{background:'white',border:'1px solid var(--border)',borderRadius:7,padding:'8px 20px',fontSize:12,cursor:'pointer',color:'#374151'}}>Cancelar</button>
              <button onClick={criarLead} disabled={!form.nome} style={{background:'var(--navy)',color:'white',border:'none',borderRadius:7,padding:'8px 24px',fontSize:12,fontWeight:600,cursor:'pointer',opacity:form.nome?1:0.5}}>Criar Lead</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
