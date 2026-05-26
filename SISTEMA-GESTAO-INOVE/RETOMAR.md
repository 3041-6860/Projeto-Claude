# 📋 Retomada — Inove Prime
**Atualizado em:** 26/05/2026 — noite  
**Sistema:** https://sistema.gcj.adv.br  
**Repositório:** https://github.com/3041-6860/Projeto-Claude  

---

## 🚨 ATENÇÃO — Como fazer deploy

### ✅ Deploy manual (método que funciona agora)
No terminal SSH do servidor:

```bash
cd /root/inove-deploy
git pull origin main
bash b
cat /tmp/deploy.log   # aguardar PRONTO (~3 min)
```

> ⚠️ GitHub Actions está configurado para o IP errado (`170.187.131.141`). O servidor real é `129.121.39.150`. Usar deploy manual por enquanto.

---

## 📍 Acesso ao Servidor

| | |
|--|--|
| **Site** | https://sistema.gcj.adv.br |
| **IP SSH** | 129.121.39.150 |
| **Porta SSH** | **22022** (não é 22!) |
| **Usuário SSH** | root |
| **Senha SSH** | Gcj2026admin! |
| **Painel Hostgator** | https://www.hostgator.com.br → login → Meus Produtos → VPS |
| **App dir** | /var/www/inove-prime |
| **Repo deploy** | /root/inove-deploy |
| **Log deploy** | /tmp/deploy.log |
| **PM2** | `pm2 status` / `pm2 restart inove-prime` |
| **Nginx config** | /etc/nginx/conf.d/inove-prime.conf |
| **App porta** | 3001 (nginx faz proxy 80/443 → 3001) |

---

## 🔐 Logins do Sistema

| Usuário | Senha | Perfil |
|---------|-------|--------|
| `admin` | `1234` | Administrador |
| `admin@gcj.adv.br` | `Inove2026!` | Administrador GCJ |
| `sandra` | `Sandra2026!` | Sandra Otto (RH) |
| `rodrigo` | `Rodrigo2026!` | Rodrigo Gonçalves (Comercial) |

> ⚠️ **ATENÇÃO:** `admin` + `Inove2026!` **NÃO funciona**. A senha do `admin` simples é `1234`.

---

## 🔴 TAREFA PRIORITÁRIA AMANHÃ

### Módulo Jurídico não aparece no menu lateral

**Diagnóstico:** O código está correto, deployado e compilado no servidor. O problema é o **cookie de sessão antigo** — foi criado antes do sistema de roles estar ativo.

**Solução rápida (30 segundos):**
1. Entrar em https://sistema.gcj.adv.br
2. Clicar em **Meu Perfil → Sair** (logout)
3. Fazer login com `admin` / `1234`
4. O módulo **Jurídico** deve aparecer na sidebar

**Se ainda não aparecer:**
- F12 → Application → Storage → **Clear site data**
- Fazer login novamente

**Verificar após o login:**
- [ ] Seção "Jurídico" aparece no menu lateral
- [ ] Olhinho (👁️) aparece no campo senha da tela de login
- [ ] Clicar em "Jurídico" abre o dashboard do módulo
- [ ] Submenus (Processos, Clientes, Prazos...) aparecem ao entrar na seção

---

## ✅ O QUE ESTÁ PRONTO (completo no sistema)

### 🏠 Dashboard
- Banner dinâmico (Bom dia/Boa tarde/Boa noite), data por extenso, nome do usuário
- 12 KPIs em 3 linhas (aguardando dados reais)
- Acesso Rápido com 6 módulos, Comunicados / Feed da Equipe

### ⏰ Barra Superior (TopNav)
- Relógio ao vivo (HH:MM, atualiza a cada segundo)
- Ponto virtual no dropdown do avatar
- Controle de permissão: gestor autoriza registros pendentes
- Foto de perfil no avatar

### 👤 Meu Perfil (`/perfil`)
- Upload de foto (localStorage), campos editáveis, Cartão Ponto (últimos 7 dias)

### 👥 CRM / Leads (`/crm/leads`)
- Kanban estilo Bitrix24, fases dinâmicas, painel lateral com timeline, filtros

### 💼 Negócios / Pipelines (`/negocios`)
- 3 pipelines: GCJ Jurídico, IVI Negócios, Grupo Inove — fases dinâmicas

### ✅ Tarefas (`/tarefas`)
- Kanban + modal 5 abas (Geral, Vínculos, Subtarefas, Checklist, Tempo)

### 💰 Financeiro (`/financeiro`)
- Lançamentos reais (receitas/despesas), KPIs calculados, filtros, editar/excluir

### 👥 RH (`/rh`)
- Colaboradores, Onboarding, Ponto Eletrônico, Férias, Organograma, Relatórios
- Todos sem dados falsos — leem do localStorage

### 📣 Marketing (`/marketing`)
- Kanban de campanhas

### ⚙️ Configurações (`/configuracoes`)
- 7 abas, matriz de permissões (14 módulos × 5 perfis)
- Usuários reais (sem fake data)

### 🔐 Auth
- Login com `logo-color.png`
- Olhinho show/hide senha ← **adicionado hoje**
- Session cookie com `role`, controle de acesso por perfil

### ⚖️ Jurídico (`/datajuri`) — módulo GCJ Jurídico
- 21 páginas: Dashboard, Processos (CRUD + detalhe + novo), Clientes, Prazos,
  Agenda, Tarefas, Financeiro/Honorários, Documentos, Contratos, Serviços,
  Relatórios, Baixa, Admin (escritório/equipe/config)
- API DataJud (`/api/datajud`) — consulta ao CNJ por número de processo
- Sub-navegação na Sidebar com seção "Jurídico" e sub-itens expansíveis
- Acesso restrito: apenas `admin` e `juridico`

---

## 🚧 O QUE AINDA PRECISA SER FEITO

### 💰 Financeiro — Alta prioridade
- [ ] Contas a Pagar / Receber com controle de vencimentos
- [ ] Fluxo de Caixa com projeção mensal
- [ ] DRE (Demonstrativo de Resultado)
- [ ] Gráficos de receita × despesa × margem
- [ ] Exportar relatório (CSV/PDF)

### 🏠 Dashboard
- [ ] KPIs com dados reais (conectar Financeiro, CRM, Tarefas, RH)
- [ ] Widget "Próximas tarefas do dia"
- [ ] Widget "Leads recentes"

### 📅 Calendário (`/calendario`)
- [ ] Persistência em localStorage
- [ ] Criar evento clicando no dia
- [ ] Visualização semana / dia

### 📋 Documentos (`/documentos`)
- [ ] Upload real de arquivos, download/preview, filtros

### 💬 Mensagens (`/mensagens`)
- [ ] Chat em tempo real, grupos por departamento

### 🔧 Infraestrutura — Corrigir
- [ ] **GitHub Actions** — atualizar secret `VPS_HOST` para `129.121.39.150` e `VPS_PORT` para `22022`
- [ ] **Migrar localStorage → Supabase** (dados persistem entre dispositivos)
- [ ] Notificações push / e-mail

---

## 🗂️ Estrutura do Projeto

```
y:/PROJETO CODEX/Projeto-Claude/
├── SISTEMA-GESTAO-INOVE/src/     ← código principal (EDITAR AQUI)
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   ├── crm/leads/
│   │   │   ├── negocios/
│   │   │   ├── tarefas/
│   │   │   ├── financeiro/
│   │   │   ├── rh/
│   │   │   ├── marketing/
│   │   │   ├── configuracoes/
│   │   │   ├── perfil/
│   │   │   └── datajuri/         ← módulo Jurídico
│   │   ├── api/datajud/          ← consulta CNJ
│   │   ├── login/
│   │   └── actions/auth.ts       ← logins e senhas
│   ├── components/               ← TopNav, Sidebar, etc.
│   ├── lib/datajuri/             ← storage do módulo Jurídico
│   └── public/                   ← logo-color.png, logo-nav.png
└── b                             ← script de deploy no VPS
```

---

## 🔄 Como retomar na próxima sessão

1. **Verificar o módulo Jurídico** → logout + login com `admin` / `1234`
2. **Se precisar deployar** → SSH `root@129.121.39.150 -p 22022` → `cd /root/inove-deploy && git pull origin main && bash b`
3. **Escolher próximo módulo** (sugestão: Financeiro avançado)

---

*Atualizado pela sessão de desenvolvimento — 26/05/2026 noite*
