# 📋 Retomada — Inove Prime
**Atualizado em:** 24/05/2026  
**Sistema:** https://sistema.gcj.adv.br  
**Repositório:** https://github.com/3041-6860/Projeto-Claude  

---

## 🚨 ATENÇÃO — Como fazer deploy

O site **não atualiza automaticamente**. Sempre que houver mudanças no GitHub, rodar no terminal do cPanel:

```bash
cd /root/inove-deploy
git pull
bash b
cat /tmp/deploy.log
```

Aguardar `PRONTO` no log (~3 min). Depois: **Ctrl+Shift+R** no browser.

> ⚠️ O `git pull` é obrigatório antes do `bash b` — sem ele, o build usa código antigo.

---

## ✅ O QUE ESTÁ PRONTO (código no GitHub + deploy confirmado)

### 🏠 Dashboard
| Item | Status |
|------|--------|
| Banner dinâmico (Bom dia/Boa tarde/Boa noite por horário) | ✅ |
| Data por extenso atualizada em tempo real | ✅ |
| Nome do usuário logado no banner | ✅ |
| 12 KPIs em 3 linhas (todos em "—" aguardando dados reais) | ✅ |
| Acesso Rápido com 6 módulos | ✅ |
| Comunicados (painel vazio, pronto para usar) | ✅ |

### ⏰ Barra Superior (TopNav)
| Item | Status |
|------|--------|
| Relógio ao vivo (HH:MM, atualiza a cada segundo) | ✅ |
| Ponto virtual no dropdown do avatar (Entrada/Almoço/Retorno/Saída) | ✅ |
| Registro automático com hora atual | ✅ |
| Controle de permissão: gestor autoriza registros pendentes | ✅ |
| Foto de perfil no avatar (carrega do localStorage) | ✅ |

### 👤 Meu Perfil (`/perfil`)
| Item | Status |
|------|--------|
| Upload de foto (armazenada em localStorage) | ✅ |
| Campos: telefone, nascimento, cargo, departamento, bio | ✅ |
| Cartão Ponto — tabela últimos 7 dias com total de horas | ✅ |
| Link na Sidebar (seção Sistema) e no dropdown do avatar | ✅ |

### 👥 CRM / Leads (`/crm/leads`)
| Item | Status |
|------|--------|
| Kanban estilo Bitrix24 (6 colunas padrão) | ✅ |
| Fases dinâmicas: + Nova fase no final | ✅ |
| Fases dinâmicas: botão **+** entre colunas (inserir no meio) | ✅ |
| Excluir fases customizadas (× no cabeçalho) | ✅ |
| Painel lateral com timeline de atividades | ✅ |
| Modal criação de lead (dados completos) | ✅ |
| Filtros por status, origem, responsável, busca | ✅ |

### 💼 Negócios / Pipelines (`/negocios`)
| Item | Status |
|------|--------|
| 3 pipelines: GCJ Jurídico, IVI Negócios, Grupo Inove | ✅ |
| Fases dinâmicas por pipeline (inserir em qualquer posição) | ✅ |
| Vista Kanban + Lista | ✅ |

### ✅ Tarefas (`/tarefas`)
| Item | Status |
|------|--------|
| Kanban 4 colunas padrão + fases dinâmicas | ✅ |
| Modal 5 abas: Geral, Vínculos, Subtarefas, Checklist, Tempo | ✅ |
| Delegação, participantes, tags, estimativa de horas | ✅ |
| Inserir fase em qualquer posição | ✅ |

### 💰 Financeiro (`/financeiro`)
| Item | Status |
|------|--------|
| Cadastro real de lançamentos (receitas e despesas) | ✅ |
| Modal com: descrição, tipo, categoria, valor, data, status, obs | ✅ |
| KPIs calculados automaticamente (receita, despesa, saldo, a receber) | ✅ |
| Filtros por tipo, categoria e status | ✅ |
| Editar e excluir lançamentos | ✅ |
| Dados salvos em localStorage | ✅ |

### 👤 RH (`/rh`)
| Item | Status |
|------|--------|
| Lista de colaboradores, modal admissão/desligamento | ✅ |
| **↳ Onboarding** (`/rh/onboarding`) — acesso restrito RH/Gestor/Admin | ✅ |
| **↳ Ponto Eletrônico** (`/rh/ponto`) | ✅ |
| **↳ Férias & Ausências** (`/rh/ferias`) | ✅ |
| **↳ Organograma** (`/rh/organograma`) | ✅ |
| **↳ Relatórios RH** (`/rh/relatorios`) | ✅ |

### 📣 Marketing (`/marketing`)
| Item | Status |
|------|--------|
| Kanban de campanhas (4 fases fixas) | ✅ |

### ⚙️ Configurações (`/configuracoes`)
| Item | Status |
|------|--------|
| 7 abas + matriz de permissões (14 módulos × 5 perfis) | ✅ |

### 🔐 Sistema / Auth
| Item | Status |
|------|--------|
| Login com logo | ✅ |
| Session cookie com `role` | ✅ |
| Controle de acesso por perfil | ✅ |

**Logins disponíveis:**
| Usuário | Senha | Perfil |
|---------|-------|--------|
| `admin` | `1234` | Administrador |
| `admin@gcj.adv.br` | `Inove2026!` | Administrador |
| `rh` | `rh1234` | RH |
| `gestor` | `gestor1234` | Gestor |

---

## 🚧 O QUE AINDA PRECISA SER FEITO

### 🏠 Dashboard — Prioridade média
- [ ] KPIs com dados reais (conectar Financeiro, CRM, Tarefas, RH)
- [ ] Widget "Próximas tarefas do dia"
- [ ] Widget "Leads recentes"
- [ ] Gráfico de receita × despesa

### 💰 Financeiro — Próxima sessão sugerida
- [ ] Contas a Pagar / Receber com controle de vencimentos
- [ ] Fluxo de Caixa com projeção mensal
- [ ] DRE (Demonstrativo de Resultado)
- [ ] Gráficos de receita × despesa × margem
- [ ] Exportar relatório (CSV/PDF)

### 📅 Calendário (`/calendario`)
- [ ] Persistência de eventos em localStorage
- [ ] Criar evento clicando no dia
- [ ] Visualização semana / dia
- [ ] Sincronizar com módulo de Tarefas

### 📣 Marketing (`/marketing`)
- [ ] Fases dinâmicas no kanban (mesmo padrão CRM/Tarefas)
- [ ] Métricas de campanha (cliques, conversões, leads gerados)

### 📋 Documentos (`/documentos`)
- [ ] Upload real de arquivos
- [ ] Download / preview (PDF, DOCX)
- [ ] Categorias, tags e filtros funcionando
- [ ] Vincular a leads ou negócios

### 💬 Mensagens / Messenger (`/mensagens`)
- [ ] Chat em tempo real
- [ ] Grupos por departamento

### ⚖️ Processos Jurídicos (`/processos`)
- [ ] Cadastro completo de processos
- [ ] Controle de prazos e alertas

### 👥 CRM / Leads — Melhorias
- [ ] Integração: mover lead vira negócio no módulo Negócios
- [ ] Importar leads via CSV
- [ ] Relatório de funil (taxas de conversão)

### 🔐 Infraestrutura — Futuro
- [ ] **Migrar localStorage → Supabase** (dados não se perdem ao limpar browser)
- [ ] Ponto virtual: painel gestor para ver todos os funcionários
- [ ] Notificações push / e-mail
- [ ] Logs de auditoria
- [ ] Backup automático

---

## 📍 Acesso ao Servidor

| | |
|--|--|
| **Site** | https://sistema.gcj.adv.br |
| **IP** | 170.187.131.141 |
| **cPanel terminal** | Funciona sempre |
| **App dir** | /var/www/inove-prime |
| **Repo deploy** | /root/inove-deploy |
| **Log deploy** | /tmp/deploy.log |

---

## 🔄 Próxima sessão — por onde começar

1. **Verificar deploy** → `git pull && bash b` no cPanel se necessário
2. **Confirmar no browser** → Ctrl+Shift+R e testar:
   - Relógio ao vivo na barra superior
   - Ponto virtual no avatar (Entrada → Almoço → Retorno → Saída)
   - Página Meu Perfil com upload de foto
   - Financeiro com dados reais (sem hardcode)
3. **Escolher próximo módulo** (sugestão: Financeiro avançado ou Calendário)

---

*Atualizado pela sessão de desenvolvimento — 24/05/2026*
