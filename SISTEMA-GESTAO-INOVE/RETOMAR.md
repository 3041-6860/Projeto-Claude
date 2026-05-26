# 📋 Retomada — Inove Prime
**Atualizado em:** 26/05/2026  
**Sistema:** https://sistema.gcj.adv.br  
**Repositório:** https://github.com/3041-6860/Projeto-Claude  

---

## 🚨 ATENÇÃO — Como fazer deploy

### ✅ Deploy automático (GitHub Actions)
Basta fazer `push` para o GitHub — o sistema atualiza sozinho em ~3 min.

```
git add -A && git commit -m "msg" && git push
```

O GitHub Actions conecta via SSH no VPS (170.187.131.141) e roda `bash b`.

### 🔧 Deploy manual (fallback — se o automático falhar)
No terminal do cPanel VPS ou SSH:

```bash
cd /root/inove-deploy
git pull origin main
bash b
cat /tmp/deploy.log
```

Aguardar `PRONTO` no log (~3 min). Depois: **Ctrl+Shift+R** no browser.

> ⚠️ Se aparecer erro "local changes would be overwritten": `git checkout b && git pull origin main && bash b`

---

## 📍 Acesso ao Servidor

| | |
|--|--|
| **Site** | https://sistema.gcj.adv.br |
| **IP SSH** | 170.187.131.141 |
| **Usuário SSH** | root |
| **Senha SSH** | Gcj@admim2026 |
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
| `admin` ou `admin@gcj.adv.br` | `Inove2026!` | Administrador |
| `sandra` | `sandra1234` | RH |
| `rodrigo` | `rodrigo1234` | Gestor Comercial |

> Os 3 usuários reais: **Administrador**, **Sandra Otto (RH)**, **Rodrigo Gonçalves (Comercial)**

---

## ✅ O QUE FOI FEITO NESTA SESSÃO (26/05/2026 — tarde)

### 🛠️ Infraestrutura
- [x] **VPS recuperado** — terminal estava travado/congelado, reiniciado pelo painel Hostgator
- [x] **Domínio `sistema.gcj.adv.br` corrigido** — nginx tinha `inoveprime.com.br` como server_name, corrigido com `sed`
- [x] **HTTPS/SSL configurado** — Certbot/Let's Encrypt instalado e ativo para `sistema.gcj.adv.br`
- [x] **GitHub Actions funcionando** — secret `VPS_PASS` atualizado com senha correta (`Gcj@admim2026`)
- [x] **Script deploy `b` atualizado** — adicionado `cp -rf src/public/ → /var/www/inove-prime/public/`

### 🎨 Visual
- [x] **Logo login corrigida** — removido base64 embutido, agora referencia `/logo-color.png` direto
- [x] `src/public/logo-color.png` e `logo-nav.png` adicionados ao projeto

### 🧹 Remoção de dados falsos (mock data)
- [x] **Ponto Eletrônico** — removidos 9 funcionários falsos, agora lê `inove-ponto-v1` do localStorage
- [x] **Configurações** — removidos 5 usuários falsos, substituídos pelos 3 reais; logs de acesso zerados
- [x] **Organograma** — corrigida classe Tailwind dinâmica que quebrava em produção

---

## ✅ O QUE ESTÁ PRONTO (completo no sistema)

### 🏠 Dashboard
- Banner dinâmico (Bom dia/Boa tarde/Boa noite), data por extenso, nome do usuário
- 12 KPIs em 3 linhas (aguardando dados reais)
- Acesso Rápido com 6 módulos, Comunicados

### ⏰ Barra Superior (TopNav)
- Relógio ao vivo (HH:MM, atualiza a cada segundo)
- Ponto virtual no dropdown do avatar (Entrada/Almoço/Retorno/Saída com hora automática)
- Controle de permissão: gestor autoriza registros pendentes
- Foto de perfil no avatar

### 👤 Meu Perfil (`/perfil`)
- Upload de foto (localStorage), campos editáveis, Cartão Ponto (últimos 7 dias)

### 👥 CRM / Leads (`/crm/leads`)
- Kanban Bitrix24, fases dinâmicas, painel lateral com timeline, filtros

### 💼 Negócios / Pipelines (`/negocios`)
- 3 pipelines: GCJ Jurídico, IVI Negócios, Grupo Inove — fases dinâmicas

### ✅ Tarefas (`/tarefas`)
- Kanban + modal 5 abas (Geral, Vínculos, Subtarefas, Checklist, Tempo)

### 💰 Financeiro (`/financeiro`)
- Lançamentos reais (receitas/despesas), KPIs calculados, filtros, editar/excluir

### 👥 RH (`/rh`)
- Colaboradores, Onboarding, Ponto Eletrônico, Férias, Organograma, Relatórios
- **Todos sem dados falsos** — leem do localStorage

### 📣 Marketing (`/marketing`)
- Kanban de campanhas

### ⚙️ Configurações (`/configuracoes`)
- 7 abas, matriz de permissões (14 módulos × 5 perfis)
- **Usuários reais** (sem fake data), logs de acesso zerados

### 🔐 Auth
- Login com `logo-color.png`, session cookie com `role`, controle de acesso por perfil

### ⚖️ DataJuri — Módulo GCJ Jurídico (`/datajuri`) ← **NOVO (26/05/2026 tarde)**

- Integrado como módulo protegido dentro do Inove Prime
- Acesso restrito: apenas `admin` e `juridico` (guard no layout)
- **20 páginas** integradas: Dashboard, Processos (CRUD + detalhe + novo), Clientes, Prazos, Agenda, Tarefas, Financeiro/Honorários, Documentos, Contratos, Serviços, Relatórios, Baixa, Admin (escritório/equipe/config)
- **API DataJud** (`/api/datajud`) — consulta ao CNJ por número de processo
- **Sub-navegação** na Sidebar com seção "GCJ Jurídico" e sub-itens expansíveis
- **Matrix de permissões** em Configurações: Administrador=full, Jurídico=full, demais=none
- localStorage keys DataJuri: `datajuri_processos_lista`, `datajuri_clientes_lista`, etc.

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

### ⚖️ Processos Jurídicos (`/processos`)
- [ ] Cadastro completo, controle de prazos e alertas

### 🔐 Infraestrutura — Futuro
- [ ] **Migrar localStorage → Supabase** (dados persistem entre dispositivos)
- [ ] Notificações push / e-mail
- [ ] Logs de auditoria reais
- [ ] Backup automático

---

## 🗂️ Estrutura do Projeto

```
y:/PROJETO CODEX/Projeto-Claude/
├── SISTEMA-GESTAO-INOVE/src/     ← código principal (dev)
│   ├── app/
│   │   ├── (app)/                ← rotas protegidas
│   │   │   ├── dashboard/
│   │   │   ├── crm/leads/
│   │   │   ├── negocios/
│   │   │   ├── tarefas/
│   │   │   ├── financeiro/
│   │   │   ├── rh/
│   │   │   │   ├── ponto/        ← localStorage: inove-ponto-v1
│   │   │   │   ├── ferias/
│   │   │   │   ├── organograma/
│   │   │   │   └── relatorios/
│   │   │   ├── marketing/
│   │   │   ├── configuracoes/
│   │   │   └── perfil/
│   │   ├── login/
│   │   └── actions/auth.ts
│   ├── components/               ← TopNav, Sidebar, etc.
│   └── public/                   ← logo-color.png, logo-nav.png
├── 0 - INOVE-PRIME/inove-prime/  ← cópia idêntica para o VPS
│   ├── app/                      ← espelho de src/app/
│   ├── components/
│   └── public/
└── b                             ← script de deploy no VPS
```

### localStorage keys usadas:
| Chave | Módulo |
|-------|--------|
| `inove-ponto-v1` | Ponto Eletrônico |
| `inove-rh-colaboradores-v1` | RH Colaboradores |
| `inove-crm-leads-v2` | CRM Leads |
| `inove-negocios-v1` | Negócios/Pipelines |
| `inove-tarefas-v2` | Tarefas |
| `inove-financeiro-v1` | Financeiro |
| `inove-ferias-v1` | Férias & Ausências |
| `inove-comunicados-v1` | Comunicados |
| `inove-perfil-{email}` | Meu Perfil (por usuário) |
| `inove-ponto-pendente-v1` | Ponto pendente TopNav |

---

## 🔄 Como retomar na próxima sessão

1. **Verificar se o deploy automático está ativo** → Abrir GitHub → Actions → ver se há ✅ verde no último commit
2. **Testar o sistema** → https://sistema.gcj.adv.br → login `admin` / `Inove2026!`
3. **Se algo não carregou** → SSH no VPS → `cd /root/inove-deploy && git pull origin main && bash b`
4. **Escolher próximo módulo** (sugestão: Financeiro avançado)

---

*Atualizado pela sessão de desenvolvimento — 26/05/2026*
