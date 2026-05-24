# RETOMAR — Sistema Inove Prime · 22/05/2026

**Sistema em produção:** https://sistema.gcj.adv.br  
**Código-fonte local:** `y:\Projeto Claude\SISTEMA-GESTAO-INOVE\0 - INOVE-PRIME\inove-prime\`  
**VPS:** `root@129.121.39.150` porta `22022` · PM2: `inove-prime` porta 3001

---

## O QUE FOI FEITO HOJE (22/05)

### Auth funcional
- Cookie `inove-session` (base64 + httpOnly, 8h)
- **Único usuário ativo:** `admin@gcj.adv.br` / `Inove2026!`
- Middleware protege todas as rotas → redireciona para `/login` sem cookie
- Logout no dropdown do perfil (TopNav)

### Layout completo
- **TopNav:** logo colorida (`logo-nav.png`) em `<img>` simples, fundo branco, 8 links horizontais, busca + notificações + perfil com dropdown
- **Sidebar navy:** 4 seções com ícones lucide, item ativo com borda verde
- **Header:** linha de 3px navy (sem duplicar controles)

### Estrutura de navegação (Bitrix24-style)
- Removido link "Pipelines" separado do TopNav
- Agora: **"Negócios"** → `/negocios` → abre Kanban com seletor de pipeline integrado
- Dropdown do pipeline tem opção "+ Pipelines e túneis de vendas" → `/negocios/pipelines`

### Páginas criadas / atualizadas
| Rota | Status |
|------|--------|
| `/dashboard` | ✅ Completo |
| `/login` | ✅ Funcional |
| `/crm/leads` | ✅ Dados de exemplo |
| `/negocios` | ✅ Kanban Bitrix24 com seletor de pipeline |
| `/negocios/gcj-juridico` | ✅ Reescrito com CSS limpo (sem inline styles) |
| `/negocios/pipelines` | ✅ **NOVA** — gestão de funis com fases coloridas |
| `/processos/monitoramento` | ✅ Placeholder |
| `/documentos` | ✅ Placeholder |
| `/financeiro` | ✅ Placeholder |
| `/rh` | ✅ Placeholder |
| `/mensagens` | ✅ Placeholder client-side |
| `/configuracoes` | ✅ Placeholder com tabs |

### Correções visuais (hoje)
- `-webkit-font-smoothing: antialiased` → texto sem sombra/borrado
- Fontes aumentadas globalmente: tabelas 12px, badges 11px, botões 12px
- Logo: `<Image>` Next.js → `<img>` simples (evita quebra em produção)

---

## ESTADO DO CSS — classes principais (`app/globals.css`)

```
Variáveis: --navy #1F3763 · --green #62974B · --gray #606062
           --border #E2E8EF · --light #F5F7FA

Layout:    .dash-wrap · .app-sidebar · .top-nav · .top-nav-brand · .top-nav-logo
Sidebar:   .sb-item · .sb-item.active · .sb-label · .sb-sep · .sb-icon
Cards:     .card · .card-label · .card-val · .card-hint
Tabelas:   .tbl th (navy, 10.5px) · .tbl td (12px)
Badges:    .badge-green · .badge-navy · .badge-orange · .badge-urg · .badge-ok
Botões:    .btn · .btn-primary · .btn-outline · .btn-sm
Kanban:    .kanban · .k-col · .k-card · .k-card.g · .k-card-title · .k-card-meta
Métricas:  .m-bar · .m-item · .m-label · .m-val
Pipeline:  .pipeline-selector-wrap · .pipeline-dropdown-panel · .view-switcher
Neg detalhe: .neg-header-card · .neg-grid · .detail-grid · .metric-row · .tl-wrap
Pipelines:   .pl-card · .pl-card-head · .pl-fases · .pl-fase
Breadcrumb:  .breadcrumb · .breadcrumb-link
```

---

## DEPLOY — Comandos padrão (Git Bash / bash)

```bash
# Subir arquivo
cat "Y:/Projeto Claude/SISTEMA-GESTAO-INOVE/0 - INOVE-PRIME/inove-prime/ARQUIVO" | \
  plink -P 22022 -pw 'Gcj2026admin!' \
  -hostkey "ssh-ed25519 255 SHA256:jlF06l7fCl/PjAL+1IQjvX1yXFWZ07XNWEo+w4yhbU0" \
  -batch root@129.121.39.150 'cat > /var/www/inove-prime/DESTINO'

# Caminhos com parênteses — aspas simples no destino remoto:
'cat > "/var/www/inove-prime/app/(app)/negocios/page.tsx"'

# Build + restart
plink -P 22022 -pw 'Gcj2026admin!' \
  -hostkey "ssh-ed25519 255 SHA256:jlF06l7fCl/PjAL+1IQjvX1yXFWZ07XNWEo+w4yhbU0" \
  -batch root@129.121.39.150 \
  'cd /var/www/inove-prime && npm run build 2>&1 | tail -20 && pm2 restart inove-prime'
```

---

## PRÓXIMOS PASSOS (retomar amanhã)

### 1 — Verificar após deploy de hoje
- [ ] Logo `logo-nav.png` aparecendo corretamente no TopNav
- [ ] Fontes maiores OK em todas as telas (dashboard, CRM, negócios, etc.)
- [ ] Página `/negocios/pipelines` acessível pelo dropdown

### 2 — Módulos a desenvolver (telas reais com dados)
- [ ] **CRM / Leads** — modal de novo lead, filtros funcionais, pipeline de leads
- [ ] **Financeiro** — lançamentos, contas a pagar/receber, gráfico mensal
- [ ] **Documentos** — upload, geração de minutas, vinculação a processos
- [ ] **Processos** — integrar JurisSearch (busca PJe), alertas de prazo
- [ ] **RH** — cadastro de colaboradores, controle de ponto/férias
- [ ] **Mensagens** — integrar n8n/WhatsApp (IVI)
- [ ] **Configurações** — gestão de usuários e permissões por módulo

### 3 — Funcionalidades transversais
- [ ] **Kanban de tarefas** reutilizável em todos os módulos
- [ ] Notificações reais (badge "3" no sino ainda é estático)
- [ ] Pesquisa global funcional
- [ ] **Auth multi-usuário** — hoje só 1 admin hardcoded

### 4 — Páginas ainda não criadas
- [ ] `/marketing` — placeholder faltando
- [ ] `/tarefas` — placeholder faltando
- [ ] `/juris-ia` — módulo de IA jurídica

---

## ARQUIVOS CHAVE

```
inove-prime/
├── app/
│   ├── globals.css                        ← TODAS as classes CSS (fonte única de estilo)
│   ├── layout.tsx                         ← root layout + Montserrat
│   ├── page.tsx                           ← redirect → /dashboard
│   ├── login/page.tsx                     ← login com useActionState
│   ├── actions/auth.ts                    ← login() + logout() server actions
│   └── (app)/
│       ├── layout.tsx                     ← TopNav + Header + Sidebar + <main>
│       ├── dashboard/page.tsx
│       ├── crm/leads/page.tsx
│       ├── negocios/
│       │   ├── page.tsx                   ← Kanban com seletor pipeline (Bitrix24-style)
│       │   ├── pipelines/page.tsx         ← Gestão de funis (criado hoje)
│       │   └── gcj-juridico/page.tsx      ← Detalhe negócio (reescrito hoje)
│       ├── processos/monitoramento/page.tsx
│       ├── documentos/page.tsx
│       ├── financeiro/page.tsx
│       ├── rh/page.tsx
│       ├── mensagens/page.tsx
│       └── configuracoes/page.tsx
├── components/
│   ├── TopNav.tsx                         ← <img> logo + 8 links + dropdown perfil
│   ├── Header.tsx                         ← linha navy 3px
│   └── Sidebar.tsx                        ← nav com lucide icons
├── middleware.ts                          ← proteção de rotas por cookie
└── public/
    ├── logo-nav.png                       ← logo Bitrix colorida (usada no TopNav)
    ├── logo-branco.png                    ← logo branca (não usada atualmente)
    └── logo-preto.png
```

---

*Gerado em 22/05/2026 — para continuar, abrir este arquivo e referenciar ao Claude*
