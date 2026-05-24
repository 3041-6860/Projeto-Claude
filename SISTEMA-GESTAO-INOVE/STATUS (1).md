# Sistema de Gestão Integrado — Grupo Inove Prime
## STATUS DE DESENVOLVIMENTO

**Atualizado em:** 21/05/2026  
**Wireframe aprovado:** v1.1  
**Fase atual:** Pré-desenvolvimento — aguardando aprovação da diretoria

---

## VERSÕES DO WIREFRAME

| Versão | Arquivo | Data | Descrição |
|--------|---------|------|-----------|
| v1.0 | `wireframe-v1.0.html` | 20/05/2026 | Versão base — 11 telas, identidade GCJ ajustada, cores fortalecidas |
| v1.1 | `wireframe-v1.0 (1).html` | 21/05/2026 | **Versão atual** — 12 telas, Tela Marketing adicionada (posição 6 na nav) |
| working | `wireframe-sistema-gestao-negocios.html` | — | Arquivo de trabalho (sempre a versão mais atual) |

> **Regra de versão:** Antes de qualquer alteração grande no wireframe, copiar o working para `wireframe-vX.X.html` com a data. O arquivo working nunca é a versão definitiva.

---

## STACK TECNOLÓGICA (definir antes de iniciar)

| Camada | Opção sugerida | Decisão |
|--------|---------------|---------|
| Frontend | Next.js 16 (já scaffolado em `datajuri/`) | ⬜ Confirmar |
| Backend / API | FastAPI (Python) ou Next.js API Routes | ⬜ Decidir |
| Banco de dados | PostgreSQL (Supabase ou self-hosted) | ⬜ Decidir |
| Autenticação | NextAuth.js ou Supabase Auth | ⬜ Decidir |
| IA (Juris IA) | Claude API — Sonnet/Opus via Anthropic SDK | ✅ Definido |
| Deploy | Hostgator VPS | ✅ Definido |
| Mensageria WhatsApp | n8n + API Meta (já existe no IVI) | ⬜ Confirmar reuso |

---

## MÓDULOS E TAREFAS POR TELA

---

### MÓDULO 0 — Infraestrutura Base
> Pré-requisito para todos os outros módulos

- [ ] Criar banco de dados (tabelas: usuários, negócios, permissões)
- [ ] Configurar autenticação (login, sessão, roles)
- [ ] Criar layout base: header + sidebar dinâmica + área de conteúdo
- [ ] Implementar troca de identidade visual por negócio (CSS variáveis por contexto)
- [ ] Configurar roteamento por negócio (`/pipelines/gcj-juridico`, `/pipelines/esg-crm` etc.)
- [ ] Deploy inicial no Hostgator (ambiente de desenvolvimento)

---

### TELA 1 — Dashboard do Sistema Mãe

- [ ] Cards de métricas consolidadas (buscar dados de todos os negócios)
- [ ] Lista de negócios ativos com status
- [ ] Acesso rápido a módulos (Financeiro, RH, Mensageria, Permissões)
- [ ] Widget de alertas críticos (prazos, tarefas, aprovações pendentes)
- [ ] Gráfico de desempenho por negócio

---

### TELA 2 — Negócios / Pipelines (Kanban)

- [ ] Listagem de todos os negócios/pipelines do usuário logado
- [ ] Kanban interativo com drag-and-drop entre colunas
- [ ] Filtros por responsável, tag, período
- [ ] Criar novo negócio (formulário: nome, tipo, logo, cor, responsável)
- [ ] Métricas por coluna (contagem de cards)
- [ ] Clique no card → redireciona para o negócio específico (Tela 3)

---

### TELA 3 — Negócio Específico (Página do Negócio)

- [ ] Header com identidade visual própria por negócio (logo, cor, tagline)
- [ ] Abas: Visão Geral, Documentos, Financeiro, Tarefas, Contatos
- [ ] Métricas resumidas do negócio
- [ ] Lista de tarefas abertas
- [ ] Linha do tempo de atividades recentes

---

### TELA 4 — Dashboard GCJ Jurídico (Pipeline Jurídico)

- [ ] Cards: processos ativos, prazos críticos, audiências, faturamento
- [ ] Barra de métricas diárias (andamentos, intimações, prazos)
- [ ] Lista de alertas em tempo real (prazos vencendo, audiências próximas)
- [ ] Integração com API CNJ / PDPJ para importar processos
- [ ] Aba Monitoramento → link para Tela 5
- [ ] Aba Agenda Processual → calendário de audiências
- [ ] Aba Documentos → link para Tela 6
- [ ] Aba Juris IA → link para Tela 11

---

### TELA 5 — Monitoramento Diário de Processos

- [ ] Tabela de processos com: número, cliente/parte, tribunal, fase, prazo, status
- [ ] Filtros: tribunal, fase, responsável, período
- [ ] Busca por número de processo
- [ ] Importação automática de andamentos via scraper (JurisSearch)
- [ ] Alertas: prazos vencidos (vermelho), audiências próximas (amarelo), andamentos novos (verde)
- [ ] Atualização automática (webhook ou polling a cada X horas)
- [ ] Exportação CSV / PDF

---

### TELA 6 — Documentos Jurídicos

- [ ] Biblioteca de modelos por tipo (petições, contratos, procurações, pareceres)
- [ ] Editor de documentos com campos dinâmicos (`{{nome_cliente}}`, `{{numero_processo}}`)
- [ ] Upload de documentos externos (PDF, DOCX)
- [ ] Workflow de aprovação: Rascunho → Revisão → Aprovado → Assinado
- [ ] Histórico de versões por documento
- [ ] Busca full-text nos documentos
- [ ] Integração com Juris IA para geração automática de peças (Tela 11)

---

### TELA 7 — Financeiro

- [ ] Fluxo de caixa por período e por negócio
- [ ] Cadastro de faturas (entrada / saída / comissão)
- [ ] Indicadores: receita, despesa, lucro, comissões
- [ ] Gráficos: barras mensais, pizza por negócio
- [ ] Tabela de lançamentos com filtros e exportação
- [ ] Alertas de vencimento (boletos, faturas)
- [ ] Integração com Tela 2 (pipeline) para honorários por caso

---

### TELA 8 — Recursos Humanos

- [ ] Cadastro de colaboradores (nome, cargo, negócio vinculado, acesso)
- [ ] Organograma visual interativo
- [ ] Gestão de férias (solicitação, aprovação, calendário)
- [ ] Avaliações de desempenho
- [ ] Processos seletivos abertos
- [ ] Vínculo colaborador ↔ negócio (definir quem acessa o quê)

---

### TELA MARKETING — Marketing (Campanhas e Comunicação)

- [ ] Dashboard de métricas: Leads gerados, Campanhas ativas, Taxa de conversão, Custo por lead
- [ ] Cards resumo: campanhas em andamento, leads qualificados, orçamento mensal utilizado
- [ ] Tabela de campanhas ativas (canal, leads, conversão, status: ativo / pausado)
- [ ] Funil de marketing visual (Visitantes → Leads → Qualificados → Convertidos)
- [ ] Agenda de próximas ações / lançamentos de campanha
- [ ] Integração com Meta Ads (leads via webhook)
- [ ] Integração com Google Ads (importação de métricas)
- [ ] Integração com E-mail Marketing (RD Station ou similar)
- [ ] Canal WhatsApp para campanhas de retenção (reuso n8n/IVI)
- [ ] Repasse automático de leads qualificados ao CRM

---

### TELA 9 — Mensageria

- [ ] Chat interno em tempo real (WebSocket ou Supabase Realtime)
- [ ] Canais por negócio (GCJ Jurídico, ESG-CRM, etc.)
- [ ] Mensagens diretas entre colaboradores
- [ ] Integração WhatsApp via API Meta (reuso da estrutura n8n do IVI)
- [ ] Notificações automáticas do sistema (prazo criado, tarefa atribuída, aprovação pendente)
- [ ] Histórico de mensagens pesquisável

---

### TELA 10 — Permissões e Configurações

- [ ] Matriz de acesso: papel × módulo (Admin, Gestor, Colaborador, Visualizador)
- [ ] Criar/editar papéis personalizados
- [ ] Atribuir permissões por negócio (um colaborador pode ter roles diferentes em cada negócio)
- [ ] Log de auditoria (quem fez o quê e quando)
- [ ] Configurações gerais do sistema (nome da empresa, logo, fuso horário)
- [ ] Gerenciamento de integrações ativas (CNJ, WhatsApp, Claude API)

---

### TELA 11 — Juris Assistente IA (FastAPI + Claude)

- [ ] Formulário de entrada: dados do caso PCD (cliente, documentos, tipo de benefício)
- [ ] Upload de documentos para análise (laudos, relatórios, CNIS)
- [ ] Integração com Claude API (Sonnet para triagem rápida, Opus para análise completa)
- [ ] Prompt especializado: identificação de direitos, fundamentação jurídica
- [ ] Saídas geradas: análise do caso, peças processuais (inicial, recurso, recurso ordinário)
- [ ] Histórico de análises por processo
- [ ] Exportação das peças em DOCX / PDF
- [ ] Estimativa de probabilidade de êxito (campo opcional)
- [ ] FastAPI já planejado em `1 - GCJ-JURIDICO/JURIS-IA/`

---

## ORDEM SUGERIDA DE DESENVOLVIMENTO (MVP)

```
FASE 1 — Base (2–3 semanas)
  ✦ Módulo 0: infraestrutura, auth, layout, roteamento

FASE 2 — Jurídico Core (3–4 semanas)
  ✦ Tela 4: Dashboard GCJ
  ✦ Tela 5: Monitoramento de processos
  ✦ Tela 6: Documentos

FASE 3 — IA (2–3 semanas)
  ✦ Tela 11: Juris Assistente IA (FastAPI + Claude)

FASE 4 — Gestão (3–4 semanas)
  ✦ Tela 1: Dashboard sistema mãe
  ✦ Tela 2: Pipelines / Kanban
  ✦ Tela 7: Financeiro

FASE 5 — Expansão (3–4 semanas)
  ✦ Tela 8: RH
  ✦ Tela MKT: Marketing (campanhas, funil, integrações)
  ✦ Tela 9: Mensageria
  ✦ Tela 10: Permissões
  ✦ Tela 3: Negócio específico (genérico)
```

---

## INTEGRAÇÕES EXTERNAS NECESSÁRIAS

| Serviço | Finalidade | Status |
|---------|-----------|--------|
| API CNJ / PDPJ | Importar andamentos processuais | ⚠️ Em uso no JurisSearch (bug 503 pendente) |
| Claude API (Anthropic) | Juris IA — análise e geração de peças | ⬜ Configurar chave |
| API Meta (WhatsApp) | Mensageria + Marketing — canal WhatsApp por negócio | ⬜ Reusar do IVI/n8n |
| Meta Ads API | Marketing — importar leads e métricas de campanhas | ⬜ Configurar |
| Google Ads API | Marketing — importar métricas de campanhas | ⬜ Configurar |
| RD Station (ou similar) | Marketing — e-mail marketing e automações | ⬜ Decidir ferramenta |
| SMTP / e-mail | Notificações, alertas de prazo | ⬜ Configurar |
| Hostgator VPS | Deploy produção | ⬜ Configurar ambiente |

---

## LEGENDA

- ✅ Concluído
- ⚠️ Em andamento / com pendência
- ⬜ Não iniciado
- 🔴 Bloqueado
