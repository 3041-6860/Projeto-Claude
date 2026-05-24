# 📋 Retomada — Inove Prime
**Atualizado em:** 24/05/2026  
**Sistema:** https://sistema.gcj.adv.br  
**Repositório:** https://github.com/3041-6860/Projeto-Claude  

---

## 🚨 ATENÇÃO — Deploy pendente

O site pode ainda estar exibindo código antigo. **Antes de testar qualquer funcionalidade**, verificar no terminal do cPanel:

```bash
tail -f /tmp/deploy.log
```

Se o log não mostrar atividade recente, o cron parou. Executar manualmente:

```bash
cd /root/inove-deploy && git pull && bash b
```

O `bash b` demora ~3 min (aparece `PRONTO` no log quando terminar).  
Após isso, o auto-deploy volta a funcionar sozinho a cada 5 minutos.

---

## ✅ O QUE ESTÁ PRONTO (código no GitHub)

### 🏠 Dashboard
| Item | Status |
|------|--------|
| Banner dinâmico (Bom dia/Boa tarde/Boa noite por horário) | ✅ |
| Data por extenso atualizada em tempo real | ✅ |
| Nome do usuário logado no banner | ✅ |
| 12 KPIs em 3 linhas (métricas fixas — aguarda dados reais) | ✅ |
| Acesso Rápido com 6 módulos | ✅ |
| Feed + Comunicados no painel lateral | ✅ |

### 👥 CRM / Leads (`/crm/leads`)
| Item | Status |
|------|--------|
| Kanban estilo Bitrix24 (6 colunas padrão) | ✅ |
| Fases dinâmicas: + Nova fase no final | ✅ |
| Fases dinâmicas: botão **+** entre colunas (inserir no meio) | ✅ |
| Excluir fases customizadas (× no cabeçalho) | ✅ |
| Painel lateral com timeline de atividades | ✅ |
| Tipos de atividade: nota, ligação, e-mail, tarefa | ✅ |
| Vista Lista com filtros | ✅ |
| Modal criação de lead (dados completos) | ✅ |
| Filtros por status, origem, responsável, busca | ✅ |

### 💼 Negócios / Pipelines (`/negocios`)
| Item | Status |
|------|--------|
| 3 pipelines: GCJ Jurídico, IVI Negócios, Grupo Inove | ✅ |
| Fases dinâmicas por pipeline (inserir em qualquer posição) | ✅ |
| Vista Kanban + Lista + Atividades (em breve) | ✅ |
| Métricas: valor total, negócios, fechados, prospecção | ✅ |

### ✅ Tarefas (`/tarefas`)
| Item | Status |
|------|--------|
| Kanban 4 colunas padrão + fases dinâmicas | ✅ |
| Modal 5 abas: Geral, Vínculos, Subtarefas, Checklist, Tempo | ✅ |
| Delegação, participantes, tags, estimativa de horas | ✅ |
| Vínculos com Lead ou Negócio | ✅ |
| Avançar/Voltar card entre colunas | ✅ |
| Vista Lista com filtros | ✅ |
| Indicador de tarefas atrasadas | ✅ |

### 👤 RH (`/rh`)
| Item | Status |
|------|--------|
| Lista de colaboradores | ✅ |
| Modal admissão (dados pessoais + profissionais + benefícios) | ✅ |
| Modal desligamento (checklist 6 itens) | ✅ |
| **↳ Onboarding** (`/rh/onboarding`) — controle de acesso RH/Gestor | ✅ |
| **↳ Ponto Eletrônico** (`/rh/ponto`) — 4 abas | ✅ |
| **↳ Férias & Ausências** (`/rh/ferias`) — 4 abas | ✅ |
| **↳ Organograma** (`/rh/organograma`) — visual em árvore | ✅ |
| **↳ Relatórios RH** (`/rh/relatorios`) — por colaborador + período | ✅ |

### 📣 Marketing (`/marketing`)
| Item | Status |
|------|--------|
| Kanban de campanhas (4 fases) | ✅ |

### ⚙️ Configurações (`/configuracoes`)
| Item | Status |
|------|--------|
| 7 abas: Usuários, Perfis & Permissões, Integrações, Notificações, Aparência, Segurança, Sistema | ✅ |
| Matriz de permissões (14 módulos × 5 perfis × 4 níveis) | ✅ |

### 🔐 Sistema / Auth
| Item | Status |
|------|--------|
| Login com logo embutida | ✅ |
| Session cookie com `role` (admin, rh, gestor) | ✅ |
| Controle de acesso: Onboarding restrito a RH/Gestor | ✅ |
| Auto-deploy via cron GitHub → Servidor (a cada 5 min) | ✅ |
| Sidebar com submenus dinâmicos para RH | ✅ |

**Logins disponíveis:**
| Usuário | Senha | Perfil |
|---------|-------|--------|
| `admin` | `1234` | Administrador |
| `admin@gcj.adv.br` | `Inove2026!` | Administrador |
| `rh` | `rh1234` | RH |
| `gestor` | `gestor1234` | Gestor |

---

## 🚧 O QUE AINDA PRECISA SER FEITO

### 🏠 Dashboard
- [ ] KPIs com dados reais (conectar CRM, Financeiro, Tarefas)
- [ ] Gráfico de evolução de receita / despesas
- [ ] Widget "Próximas tarefas do dia"
- [ ] Widget "Leads recentes"

### 💰 Financeiro (`/financeiro`) — **PRIORITÁRIO**
> Módulo existe mas com dados **hardcoded** (lançamentos estáticos)

- [ ] Cadastro real de lançamentos (receitas e despesas)
- [ ] Contas a Pagar / Receber com vencimentos
- [ ] Fluxo de Caixa com projeção
- [ ] DRE (Demonstrativo de Resultado do Exercício)
- [ ] Gráficos de receita × despesa × margem
- [ ] Relatórios exportáveis

### 📅 Calendário (`/calendario`) — **PRIORITÁRIO**
> Módulo existe mas sem persistência real

- [ ] Persistência de eventos em localStorage (igual às tarefas)
- [ ] Integração com Google Calendar OAuth
- [ ] Visualização semana / dia além de mês
- [ ] Criar evento diretamente do calendário clicando no dia
- [ ] Sincronizar com módulo de Tarefas (tarefas com prazo aparecem no calendário)

### 📋 Documentos (`/documentos`)
> Lista estática apenas

- [ ] Upload real de arquivos
- [ ] Download / preview (PDF, DOCX)
- [ ] Categorias, tags e filtros funcionando
- [ ] Histórico de versões
- [ ] Vincular documentos a leads ou negócios

### 💬 Mensagens / Messenger (`/mensagens`)
- [ ] Chat em tempo real (WebSocket ou polling)
- [ ] Grupos por departamento
- [ ] Notificações de novas mensagens
- [ ] Compartilhar documentos no chat

### ⚖️ Processos Jurídicos (`/processos`)
> Módulo criado mas muito básico

- [ ] Cadastro completo de processos
- [ ] Controle de prazos e alertas
- [ ] Integração com Datajuri (futuro)
- [ ] Vincular processo a lead/cliente

### 📣 Marketing (`/marketing`)
- [ ] Kanban de campanhas com fases dinâmicas (+ Nova fase, mesmo padrão dos outros)
- [ ] Métricas de campanha (cliques, conversões, leads gerados)
- [ ] Vínculo com leads gerados no CRM

### 👥 CRM / Leads
- [ ] Integração CRM → Pipelines (mover lead vira negócio no Negócios)
- [ ] Relatório de funil (taxas de conversão entre fases)
- [ ] Importar leads via CSV

### 👤 RH — Onboarding
- [ ] Criar perfis de integração diferentes por função/empresa
- [ ] Envio de e-mail com link do cronograma para o colaborador
- [ ] Assinatura digital dos termos (em vez de marcar manualmente)

### 🔐 Sistema — Infraestrutura
- [ ] **Migrar localStorage → Supabase** (banco real + dados não se perdem ao limpar browser)
- [ ] Autenticação multi-usuário com permissões reais
- [ ] Notificações push / e-mail
- [ ] Backup automático dos dados
- [ ] Logs de auditoria (quem fez o quê e quando)

---

## 📍 Acesso ao Servidor

| | |
|--|--|
| **Site** | https://sistema.gcj.adv.br |
| **IP** | 170.187.131.141 |
| **SSH** | root / Gcj2026admin! (porta 22 pode estar bloqueada externamente) |
| **cPanel terminal** | Funciona sempre (conexão local) |
| **App dir** | /var/www/inove-prime |
| **Repo deploy** | /root/inove-deploy |
| **Log deploy** | /tmp/deploy.log |

---

## 🔄 Próxima sessão — por onde começar

1. **Verificar deploy** → `tail -f /tmp/deploy.log` no cPanel
2. **Testar funcionalidades recentes** no site ao vivo:
   - Banner dinâmico no Dashboard
   - Botão **+** e inserção de fases nos kanbans (CRM, Negócios, Tarefas)
   - Onboarding dentro do RH com controle de acesso
3. **Escolher próximo módulo a desenvolver** (sugestão: Financeiro ou Calendário, pois são os mais usados no dia a dia)

---

*Gerado automaticamente pela sessão de desenvolvimento — 24/05/2026*
