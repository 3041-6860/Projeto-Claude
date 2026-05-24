# CHECKPOINT — Tudo que foi construído no Inove Prime
**Data:** 23/05/2026 | **Ambiente:** Next.js 14, TypeScript, Tailwind + CSS customizado

---

## RESUMO EXECUTIVO

Sistema de gestão jurídica em Next.js construído do zero.
- **12 módulos** funcionais com UI completa
- **12 arquivos** prontos para deploy (aguardando SSH)
- Dados em **localStorage** (sem banco de dados por enquanto)
- Deploy no VPS via **plink + base64**

---

## ARQUIVOS LOCAIS — caminho base

```
X:\PROJETO CLAUDE\SISTEMA-GESTAO-INOVE\0 - INOVE-PRIME\inove-prime\
```

---

## MÓDULO 1 — Configurações
**Arquivo:** `app/(app)/configuracoes/page.tsx`

### 7 abas construídas:

**Aba 1 — Usuários**
- Tabela de usuários com: nome, email, perfil, status (ativo/inativo), último acesso
- Botão + Novo Usuário

**Aba 2 — Perfis & Permissões**
- 5 perfis definidos: Administrador, Sócio, Advogado, Assistente, Externo
- Botão "Editar permissões" abre modal

**Modal de Permissões**
- 14 módulos: Dashboard, Feed, Negócios, CRM/Leads, Calendário, Documentos, Financeiro, RH, Tarefas, Marketing, Mensagens, Configurações, Onboarding, Relatórios
- 4 níveis por módulo: Nenhum / Ver / Editar / Total
- Configuração padrão sensata por perfil (Administrador = Total em tudo, Externo = quase nada)
- Agrupamento visual: Principal / Módulos / Comunicação / Sistema

**Aba 3 — Integrações**
- Google Calendar (status: não conectado)
- Microsoft 365 (status: não conectado)
- WhatsApp Business API (status: não conectado)
- Google Drive (status: não conectado)

**Aba 4 — Notificações**
- Toggles por tipo (novas tarefas, vencimentos, aprovações, etc.)
- Canais: Email / Push / SMS

**Aba 5 — Aparência**
- Upload de logo
- Seletor de cor primária
- Preview do banner em tempo real

**Aba 6 — Segurança**
- Mínimo de caracteres da senha (slider)
- Tempo de sessão (slider)
- 2FA toggle
- Log de acessos recentes

**Aba 7 — Sistema**
- Informações técnicas (versão, uptime, etc.)
- Modo manutenção
- Backup manual

---

## MÓDULO 2 — RH Principal
**Arquivo:** `app/(app)/rh/page.tsx`

### Funcionalidades:
- Tabela de colaboradores com filtro por departamento e tipo de contrato
- Indicador de colaboradores ativos/inativos
- Toolbar com botões: Ponto, Férias, Organograma, + Admitir colaborador

### Modal Admissão (formulário completo):
**Dados Pessoais:** Nome, CPF, Data de nascimento, Email, Telefone, Endereço
**Dados Profissionais:** Cargo, Departamento, Tipo de contrato (CLT/PJ/Estágio/Sócio), Data admissão, Salário, Perfil de acesso
**Benefícios:** checkboxes — Vale Transporte, Vale Refeição, Plano de Saúde, Odontológico, Seguro de Vida
→ Salvar adiciona à lista em tempo real

### Modal Desligamento:
- Motivo do desligamento (select)
- Aviso prévio (trabalhado/indenizado/dispensado)
- Data do desligamento
- Observações
- Checklist de 6 itens a verificar:
  - Devolução de equipamentos
  - Acesso ao sistema revogado
  - Cartão de ponto encerrado
  - Documentação assinada
  - Rescisão calculada
  - Carta de referência emitida
- Contador: X/6 itens verificados
→ Confirmar marca colaborador como inativo na lista

---

## MÓDULO 3 — Ponto Eletrônico
**Arquivo:** `app/(app)/rh/ponto/page.tsx`

### 4 abas:

**Hoje**
- Tabela com todos colaboradores
- Colunas: Nome, Entrada, Saída, Intervalo, Total de horas, Status
- Status: Presente / Atrasado / Ausente / Home Office / Férias
- Badges coloridos por status
- Botão marcar entrada/saída (funcional)

**Semana**
- Grade visual: 5 dias × colaboradores
- Cada célula mostra status do dia com cor

**Banco de Horas**
- Saldo de horas extras por colaborador
- Saldo positivo (verde) ou negativo (vermelho)
- Histórico de créditos e débitos

**Relatório**
- Ranking de pontualidade mensal
- % de presença por colaborador
- Total de horas trabalhadas
- Comparativo com meta

---

## MÓDULO 4 — Férias & Ausências
**Arquivo:** `app/(app)/rh/ferias/page.tsx`

### 4 abas:

**Solicitações**
- Lista de solicitações pendentes/aprovadas/recusadas
- Badge de status colorido
- Botões Aprovar ✓ / Recusar ✗ funcionais (alteram status em tempo real)
- Dados: colaborador, período, tipo (férias/licença/abono), dias

**Calendário**
- Grade mensal
- Células marcadas com nome de quem está ausente
- Navegação por mês

**Saldos**
- Dias disponíveis por colaborador
- Barra de consumo
- Alertas: ⚠️ saldo vencendo em 30 dias, 🔴 saldo vencido

**Histórico**
- Tabela de todas as ausências anteriores
- Filtro por colaborador e ano

---

## MÓDULO 5 — Organograma
**Arquivo:** `app/(app)/rh/organograma/page.tsx`

### Estrutura visual:
```
                    [CEO - Guilherme C. Junqueira]
                              │
          ┌───────┬───────────┼───────────┬───────┐
       Jurídico Comercial  Financeiro   TI    Administrativo
```

- Header colorido por departamento (cor customizada por área)
- Gerente com avatar destacado
- Lista de membros com tipo (CLT / Estágio)
- Vagas em aberto com círculo pontilhado
- Cards KPI no rodapé: total por departamento
- Botão "Exportar PDF"

---

## MÓDULO 6 — Tarefas v2 (completa)
**Arquivo:** `app/(app)/tarefas/page.tsx`

### Kanban — 4 colunas:
- A Fazer | Em Andamento | Em Revisão | Concluído
- Cards clicáveis → abre edição completa
- Barras de progresso de subtarefas/checklist no card
- Tag do vínculo CRM/Negócio visível no card
- Botões Avançar/Voltar para mover entre colunas

### Modal — 5 abas:

**Aba Geral:**
- Título (obrigatório)
- Status + Prioridade (Urgente/Alta/Média/Baixa)
- Criador/Delegador + Responsável (listas de colaboradores)
- Participantes/Observadores (multi-select com chips clicáveis)
- Data de Início + Prazo/Deadline
- Tags coloridas (Jurídico, Financeiro, Urgente, Cliente, Interno, Marketing, RH, TI)
- Descrição

**Aba Vínculos:**
- Nenhum / Lead CRM / Negócio Pipeline
- Seleção visual de lead ou negócio da lista

**Aba Subtarefas:**
- Adicionar subtarefas com Enter ou botão
- Checkbox individual
- Barra de progresso X/Y (%)
- Remover subtarefa

**Aba Checklist:**
- Igual às subtarefas mas para itens de checklist
- Barra de progresso separada

**Aba Tempo:**
- Estimativa de horas + horas gastas
- Alerta visual: excedeu X horas / restam Y horas
- Resumo: responsável, delegador, datas, participantes, progresso

### Visualização Lista:
- Tabela com: tarefa, responsável, prioridade, status, prazo, vínculo, progresso
- Filtros: responsável, prioridade, status
- Click na linha → edição
- KPI bar no topo

---

## MÓDULO 7 — Relatórios de Trabalho RH
**Arquivo:** `app/(app)/rh/relatorios/page.tsx`

### Filtros:
- Seletor de colaborador (todos do sistema)
- Período: Todos / Este Mês / Últimos 30 dias / Últimos 3 Meses
- Botão Exportar PDF

### Card do colaborador:
- Avatar com iniciais
- Nome, cargo, departamento
- Resumo do período

### KPIs individuais (5 cards):
- Total atribuídas, Concluídas, Em Andamento, Atrasadas, Taxa de Conclusão %

### Gráficos CSS horizontais:
- Por Status (4 barras)
- Por Prioridade (4 barras)
- Painel Horas: estimadas / realizadas / saldo (com alerta de estouro)

### Cards de produtividade:
- Subtarefas concluídas X/Y + barra
- Checklist concluído X/Y + barra
- Vínculos trabalhados (leads e negócios)

### Tabela com 3 abas:
- **Responsável** — tarefas onde é executor
- **Participei** — tarefas onde foi observador
- **Delegações** — tarefas que criou para outros
- Colunas: Tarefa, Prioridade, Status, Prazo, Estimativa, Realizado, Progresso
- Alerta ⚠️ se excedeu horas, badge "Atrasada" em vermelho

---

## SIDEBAR
**Arquivo:** `components/Sidebar.tsx`

### Estrutura atual:
```
PRINCIPAL
  ● Início
  ● Feed
  ● Negócios / Pipelines
  ● CRM / Leads
  ● Calendário

MÓDULOS
  ● Documentos
  ● Financeiro
  ● RH
    ↳ Organograma
    ↳ Ponto
    ↳ Férias
    ↳ Relatórios   ← NOVO (sessão atual)
  ● Onboarding
  ● Marketing
  ● Tarefas

COMUNICAÇÃO
  ● Messenger

SISTEMA
  ● Configurações
```

---

## TECNOLOGIAS USADAS

| Tecnologia | Uso |
|---|---|
| Next.js 14 App Router | Framework principal |
| TypeScript | Tipagem de todos os componentes |
| Tailwind CSS | Classes utilitárias |
| CSS customizado (globals.css) | --navy, --green, --gray, --border, classes .card, .badge, .btn, .tbl, .kanban, .modal-* |
| Lucide React | Ícones |
| localStorage | Persistência de dados (tarefas, configurações) |
| React useState/useEffect | Estado local dos componentes |

---

## DEPLOY — quando o SSH funcionar

### 1. Liberar SSH
```
Painel HostGator → VPS → Firewall → porta 22
```

### 2. Criar diretórios novos
```bash
mkdir -p /var/www/inove-prime/app/\(app\)/rh/ponto
mkdir -p /var/www/inove-prime/app/\(app\)/rh/ferias
mkdir -p /var/www/inove-prime/app/\(app\)/rh/organograma
mkdir -p /var/www/inove-prime/app/\(app\)/rh/relatorios
```

### 3. Deploy dos 12 arquivos (via plink + base64)
```powershell
# Para cada arquivo:
$bytes = [System.IO.File]::ReadAllBytes("CAMINHO_LOCAL")
$b64   = [Convert]::ToBase64String($bytes)
# Enviar em chunks de 28000 chars para /tmp/_f
# Decodificar no servidor para o destino correto
```

### 4. Build e restart
```bash
cd /var/www/inove-prime && npm run build && pm2 restart inove-prime
```

---

## PRÓXIMAS CONSTRUÇÕES (backlog)

### Urgente
- [ ] Financeiro completo (DRE, Contas a Pagar/Receber, Fluxo de Caixa, Budget, gráficos)
- [ ] Dashboard com KPIs reais (conectar dados dos módulos via localStorage)

### Médio prazo
- [ ] Marketing completo (calendário de conteúdo, métricas)
- [ ] Google Calendar OAuth real
- [ ] Microsoft 365 OAuth real

### Longo prazo
- [ ] Migrar localStorage → Supabase
- [ ] Auth multi-usuário com JWT
- [ ] WhatsApp Business API (n8n ou Meta)
- [ ] Mobile responsivo completo
