# 📋 Status do Projeto — Inove Prime
**Sistema de Gestão GCJ · sistema.gcj.adv.br**
Última atualização: 23/05/2026

---

## 🔗 Acesso ao servidor

| Recurso           | Valor                                      |
|-------------------|--------------------------------------------|
| Sistema online    | https://sistema.gcj.adv.br                 |
| IP do servidor    | `170.187.131.141`                          |
| Usuário SSH       | `root`                                     |
| Senha SSH/VPS     | `Gcj2026admin!`                            |
| Processo PM2      | `inove-prime`                              |
| Porta da app      | 3001                                       |
| Diretório         | `/var/www/inove-prime`                     |
| Arquivos locais   | `X:\PROJETO CLAUDE\SISTEMA-GESTAO-INOVE\0 - INOVE-PRIME\inove-prime` |

---

## 🔴 Bloqueio SSH — aguardando administrador HostGator

- SSH bloqueado desde **23/05/2026** após reboot do servidor
- Porta 22 e ping sem resposta (bloqueio externo confirmado)
- Já executado no console sem efeito: `service fail2ban stop`, `iptables -F`, `iptables -P INPUT ACCEPT`
- **Causa:** firewall de rede da HostGator (nível externo ao servidor)

### ✅ Como liberar quando tiver acesso admin:
```
Opção A: Painel HostGator → VPS → Firewall de rede → liberar porta 22
Opção B: Console web KVM → digitar: service ssh restart
```

### Testar SSH após liberação:
```powershell
Test-NetConnection -ComputerName 170.187.131.141 -Port 22
```

---

## 📦 12 ARQUIVOS PRONTOS PARA DEPLOY (fila completa)

> ⚠️ Alguns precisam criar diretórios novos no servidor antes do deploy.

### Passo 0 — Criar diretórios novos no servidor (via console KVM ou SSH)
```bash
mkdir -p /var/www/inove-prime/app/\(app\)/rh/ponto
mkdir -p /var/www/inove-prime/app/\(app\)/rh/ferias
mkdir -p /var/www/inove-prime/app/\(app\)/rh/organograma
mkdir -p /var/www/inove-prime/app/\(app\)/rh/relatorios
```

### Lista completa de arquivos

| # | Arquivo no servidor | Caminho local | O que mudou |
|---|---|---|---|
| 1 | `/var/www/inove-prime/app/globals.css` | `app/globals.css` | Modal CSS, logo banner, botão ×, badges novos |
| 2 | `/var/www/inove-prime/app/(app)/dashboard/page.tsx` | `app/(app)/dashboard/page.tsx` | Logo branco no banner |
| 3 | `/var/www/inove-prime/app/(app)/negocios/page.tsx` | `app/(app)/negocios/page.tsx` | Kanban funcional, dados zerados, localStorage |
| 4 | `/var/www/inove-prime/app/(app)/marketing/page.tsx` | `app/(app)/marketing/page.tsx` | **NOVA** — kanban de campanhas, modal criação |
| 5 | `/var/www/inove-prime/app/(app)/configuracoes/page.tsx` | `app/(app)/configuracoes/page.tsx` | **RECONSTRUÍDA** — 7 abas completas + matriz de permissões |
| 6 | `/var/www/inove-prime/app/(app)/rh/page.tsx` | `app/(app)/rh/page.tsx` | Modais admissão + desligamento funcionais |
| 7 | `/var/www/inove-prime/app/(app)/rh/ponto/page.tsx` | `app/(app)/rh/ponto/page.tsx` | **NOVA** — ponto eletrônico 4 abas |
| 8 | `/var/www/inove-prime/app/(app)/rh/ferias/page.tsx` | `app/(app)/rh/ferias/page.tsx` | **NOVA** — férias e ausências, aprovação |
| 9 | `/var/www/inove-prime/app/(app)/rh/organograma/page.tsx` | `app/(app)/rh/organograma/page.tsx` | **NOVA** — organograma visual CEO → departamentos |
| 10 | `/var/www/inove-prime/app/(app)/tarefas/page.tsx` | `app/(app)/tarefas/page.tsx` | **RECONSTRUÍDA v2** — modal 5 abas, subtarefas, checklist, CRM |
| 11 | `/var/www/inove-prime/app/(app)/rh/relatorios/page.tsx` | `app/(app)/rh/relatorios/page.tsx` | **NOVA** — relatórios individuais de trabalho |
| 12 | `/var/www/inove-prime/components/Sidebar.tsx` | `components/Sidebar.tsx` | Submenus RH + ícones novos |

---

## ⚙️ Como fazer o deploy (plink + base64) — ordem recomendada

```powershell
# Variáveis de ambiente
$IP   = "170.187.131.141"
$PASS = "Gcj2026admin!"
$APP  = '/var/www/inove-prime/app/\(app\)'
$BASE = 'X:\PROJETO CLAUDE\SISTEMA-GESTAO-INOVE\0 - INOVE-PRIME\inove-prime'

# Converter arquivo para base64
$bytes = [System.IO.File]::ReadAllBytes("$BASE\app\globals.css")
$b64   = [Convert]::ToBase64String($bytes)

# Enviar em chunks de 28.000 chars (primeiro chunk)
$chunk = $b64.Substring(0, [Math]::Min(28000, $b64.Length))
echo $chunk | plink -pw $PASS root@$IP "cat > /tmp/_f"

# Chunks subsequentes (se arquivo > 28000 chars)
# echo $chunk2 | plink -pw $PASS root@$IP "cat >> /tmp/_f"

# Decodificar no servidor
# Para globals.css:
plink -pw $PASS root@$IP "base64 -d /tmp/_f > /var/www/inove-prime/app/globals.css"

# Para arquivos dentro de (app):
plink -pw $PASS root@$IP "base64 -d /tmp/_f > $APP/dashboard/page.tsx"

# Após todos os arquivos:
plink -pw $PASS root@$IP "cd /var/www/inove-prime && npm run build && pm2 restart inove-prime"
```

---

## ✅ O que está funcionando NO AR (sistema.gcj.adv.br)

| Módulo | Status |
|---|---|
| Dashboard | ✅ no ar (KPIs com —, logo pendente) |
| Feed | ✅ no ar |
| Negócios / Pipeline | ✅ no ar (versão antiga, kanban novo pendente deploy) |
| CRM / Leads | ✅ no ar |
| Calendário | ✅ no ar |
| Documentos | ✅ no ar |
| Financeiro | ✅ no ar (básico) |
| RH | ✅ no ar (versão sem modais admissão) |
| Mensagens / Messenger | ✅ no ar |
| Configurações | ✅ no ar (versão antiga) |

## 🟡 O que está pronto localmente mas NÃO deployado

| Módulo | Arquivo | Funcionalidades |
|---|---|---|
| CSS global | `app/globals.css` | Todos os novos estilos |
| Dashboard | `dashboard/page.tsx` | Logo branco no banner |
| Negócios | `negocios/page.tsx` | Kanban funcional com localStorage |
| Marketing | `marketing/page.tsx` | Kanban de campanhas |
| Configurações | `configuracoes/page.tsx` | 7 abas, permissões por perfil |
| RH principal | `rh/page.tsx` | Modal admissão + desligamento |
| Ponto Eletrônico | `rh/ponto/page.tsx` | 4 abas: Hoje, Semana, Banco de Horas, Relatório |
| Férias | `rh/ferias/page.tsx` | Solicitações com aprovação, Calendário, Saldos, Histórico |
| Organograma | `rh/organograma/page.tsx` | Árvore CEO → 5 departamentos |
| Tarefas v2 | `tarefas/page.tsx` | Modal 5 abas, subtarefas, checklist, vínculos CRM |
| Relatórios RH | `rh/relatorios/page.tsx` | Relatório individual por colaborador |
| Sidebar | `components/Sidebar.tsx` | Todos os submenus RH |

---

## 📐 Arquitetura atual do sistema

```
app/
├── globals.css                    ← estilos globais (custom properties + classes)
├── layout.tsx                     ← shell: Sidebar + conteúdo
└── (app)/
    ├── dashboard/page.tsx         ← início com KPIs e feed rápido
    ├── feed/page.tsx              ← feed social interno
    ├── negocios/page.tsx          ← kanban de negócios/pipeline
    ├── crm/leads/page.tsx         ← CRM de leads
    ├── calendario/page.tsx        ← calendário de eventos
    ├── documentos/page.tsx        ← gestão de documentos
    ├── financeiro/page.tsx        ← financeiro básico
    ├── marketing/page.tsx         ← campanhas de marketing
    ├── tarefas/page.tsx           ← gestão de tarefas (v2 completa)
    ├── mensagens/page.tsx         ← messenger interno
    ├── configuracoes/page.tsx     ← configurações do sistema (7 abas)
    └── rh/
        ├── page.tsx               ← lista colaboradores + admissão/desligamento
        ├── ponto/page.tsx         ← ponto eletrônico
        ├── ferias/page.tsx        ← férias e ausências
        ├── organograma/page.tsx   ← organograma visual
        └── relatorios/page.tsx    ← relatórios de trabalho individuais

components/
└── Sidebar.tsx                    ← menu lateral com todos os módulos
```

---

## 🏗️ Detalhes de cada módulo construído

### Configurações (`/configuracoes`)
7 abas completas:
- **Usuários** — tabela de usuários, status ativo/inativo, último acesso
- **Perfis & Permissões** — 5 perfis: Administrador, Sócio, Advogado, Assistente, Externo
- **Matriz de Permissões** — 14 módulos × 4 níveis (Nenhum/Ver/Editar/Total) por perfil, modal de edição
- **Integrações** — Google Calendar, Microsoft 365, WhatsApp, Google Drive (com status)
- **Notificações** — toggles por tipo e canal (email/push/SMS)
- **Aparência** — logo, cor primária, preview do banner em tempo real
- **Segurança** — política de senhas, 2FA, log de acessos
- **Sistema** — informações técnicas, manutenção, backup

### RH Principal (`/rh`)
- Tabela de colaboradores com filtros por departamento/contrato
- **Modal Admissão**: dados pessoais (CPF, nascimento, email), dados profissionais (cargo, dept, contrato, salário, perfil), benefícios
- **Modal Desligamento**: motivo, aviso prévio, data, checklist de 6 itens (devolução equipamentos, etc.)
- Botões para acessar Ponto, Férias e Organograma

### Ponto Eletrônico (`/rh/ponto`)
4 abas:
- **Hoje** — tabela de registros do dia com status (Presente/Atrasado/Ausente/Home Office/Férias)
- **Semana** — grade visual 5 dias × colaboradores
- **Banco de Horas** — saldo positivo/negativo por colaborador
- **Relatório** — ranking de pontualidade mensal

### Férias & Ausências (`/rh/ferias`)
4 abas:
- **Solicitações** — lista com botões Aprovar/Recusar funcionais
- **Calendário** — visão mensal de quem está ausente
- **Saldos** — dias disponíveis por colaborador, alertas de vencimento
- **Histórico** — registro de todas as férias tiradas

### Organograma (`/rh/organograma`)
- Árvore visual: CEO no topo
- 5 departamentos com header colorido: Jurídico, Comercial, Financeiro, TI, Administrativo
- Gerente destacado, membros listados, vagas em aberto com ícone pontilhado
- Resumo KPI de colaboradores por departamento

### Tarefas (`/tarefas`) — v2 completa
Modal com 5 abas:
- **Geral**: título, status (4 colunas), prioridade, criador/delegador, responsável, participantes, datas início+fim, tags, descrição
- **Vínculos**: link para Lead/CRM ou Negócio/Pipeline
- **Subtarefas**: lista com checkbox + barra de progresso
- **Checklist**: itens de checklist + barra de progresso
- **Tempo**: estimativa vs. horas gastas, alerta de estouro, resumo de delegação

Kanban: 4 colunas (A Fazer / Em Andamento / Em Revisão / Concluído)
Lista: tabela com filtros por responsável, prioridade, status
Clique no card abre edição completa

### Relatórios de Trabalho RH (`/rh/relatorios`)
- Seletor de colaborador + período
- Card de identificação com cargo e departamento
- KPIs: atribuídas, concluídas, em andamento, atrasadas, taxa de conclusão %
- Gráficos CSS: por status e por prioridade
- Painel de horas: estimadas vs. realizadas + alerta de estouro
- Subtarefas + checklist com progresso
- Vínculos trabalhados (leads/negócios)
- 3 abas: Responsável / Participei / Delegações
- Tabela completa com progresso por linha

---

## 🗺️ Roadmap pós-deploy

### Próximos módulos a construir
- [ ] **Financeiro completo** — DRE, Contas a Pagar/Receber, Fluxo de Caixa, Budget vs. Realizado, gráficos
- [ ] **Dashboard KPIs reais** — conectar aos dados de localStorage dos módulos
- [ ] **Marketing completo** — calendário de conteúdo, métricas de campanhas

### Integrações futuras
- [ ] Google Calendar OAuth (Client ID + Client Secret)
- [ ] Microsoft 365 OAuth (Azure App Registration)
- [ ] WhatsApp Business API (via n8n ou Meta API)
- [ ] Google Drive backup automático

### Backend / Auth
- [ ] Migrar localStorage → Supabase (banco real + auth multi-usuário)
- [ ] JWT por perfil de acesso (respeitando a matriz de permissões já configurada)
- [ ] API Routes Next.js para cada módulo
