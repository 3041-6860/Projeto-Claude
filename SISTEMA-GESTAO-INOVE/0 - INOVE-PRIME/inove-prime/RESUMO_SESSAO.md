# Inove Prime — Resumo da Sessão · 23/05/2026

## ✅ O que foi feito (arquivos prontos localmente)

### 1. Dashboard — logo no banner
- **Arquivo:** `app/(app)/dashboard/page.tsx`
- Removidos os 3 KPIs do banner (R$ 2,4M / 48 / 34)
- Substituído por `<img src="/logo-branco.png">` centralizado

### 2. CSS global — modal + logo + kanban
- **Arquivo:** `app/globals.css`
- Adicionado CSS do modal: `.modal-overlay`, `.modal-box`, `.modal-form`, `.modal-label`, `.modal-actions`, `.modal-grid-2`
- Adicionado CSS do logo no banner: `.dash-banner-logo`, `.dash-banner-logo-img`
- Adicionado CSS dos cards: `.k-card-title-row`, `.k-card-del`, `.k-card-moves`

### 3. Negócios — kanban funcional + dados zerados
- **Arquivo:** `app/(app)/negocios/page.tsx`
- Todos os dados mock removidos — começa **vazio**
- Botão **+ Adicionar** em cada coluna → abre modal
- Modal: título, empresa, valor, prazo
- Botão **×** para excluir cada card
- Dados salvos em `localStorage` (persistem ao recarregar)

### 4. Tarefas — página nova
- **Arquivo:** `app/(app)/tarefas/page.tsx` *(criado do zero)*
- Kanban 3 colunas: A Fazer · Em Andamento · Concluído
- Botões **← Voltar** / **Avançar →** para mover tarefas
- Modal: título, responsável, prioridade (Alta/Média/Baixa), prazo, descrição
- Badge **Atrasada** automático quando prazo vence
- Vista Lista com tabela completa

### 5. Marketing — página nova
- **Arquivo:** `app/(app)/marketing/page.tsx` *(criado do zero)*
- Kanban 4 colunas: Planejada · Ativa · Pausada · Encerrada
- Modal: nome, canal (Instagram/Facebook/Google Ads etc.), objetivo, orçamento, datas, status
- Vista Lista com tabela

---

## ❌ O que NÃO foi deployado (servidor inacessível)

### Problema de SSH
O servidor VPS ficou offline, voltou, mas o SSH (porta 22) ficou bloqueado.

**Comandos já rodados no console do servidor:**
1. `service fail2ban stop` ✓
2. `iptables -F` ✓
3. `iptables -P INPUT ACCEPT` ✓

**Resultado:** SSH ainda não conecta — provavelmente **firewall da HostGator** (nível de rede, fora do servidor).

---

## 🔧 O que precisa ser feito na próxima sessão

### Passo 1 — Resolver o SSH
**Opção A (mais fácil):** Acessar o painel HostGator → VPS → Firewall de rede → Liberar porta 22 de todos os IPs.

**Opção B:** No console do servidor digitar `service ssh restart` e tentar SSH novamente.

**Opção C:** Usar FTP para subir os arquivos (verificar se porta 21 está acessível).

### Passo 2 — Deploy dos 5 arquivos pendentes
Quando o SSH voltar, rodar o deploy de:
1. `app/globals.css`
2. `app/(app)/dashboard/page.tsx`
3. `app/(app)/negocios/page.tsx`
4. `app/(app)/tarefas/page.tsx` *(novo)*
5. `app/(app)/marketing/page.tsx` *(novo)*

### Passo 3 — Verificar sidebar
Confirmar se `/tarefas` e `/marketing` já estão nos links da sidebar (`components/Sidebar.tsx`).

---

## 📋 Diagnóstico completo do sistema

### ✅ Páginas funcionando
| Página | Caminho |
|--------|---------|
| Dashboard | `/dashboard` |
| Negócios | `/negocios` |
| CRM – Leads | `/crm/leads` |
| Financeiro | `/financeiro` |
| Calendário | `/calendario` |
| Documentos | `/documentos` |
| Processos | `/processos` |
| RH | `/rh` |
| Mensagens | `/mensagens` |
| Feed | `/feed` |
| Configurações | `/configuracoes` |

### ❌ Páginas faltando (eram 404, agora criadas mas não deployadas)
| Página | Status |
|--------|--------|
| Tarefas `/tarefas` | ✅ Criada localmente, aguarda deploy |
| Marketing `/marketing` | ✅ Criada localmente, aguarda deploy |

### 🔧 Integrações pendentes (longo prazo)
| Integração | O que precisa |
|------------|---------------|
| Google Calendar OAuth | Client ID + Client Secret |
| Microsoft 365 / Outlook | Azure App Registration |
| WhatsApp Business | API Meta ou n8n |
| Google Drive backup | OAuth2 Drive API |
| Auth multi-usuário | Backend real (Supabase ou Next.js API) |

---

## 📁 Arquivos locais
Projeto em: `X:\PROJETO CLAUDE\SISTEMA-GESTAO-INOVE\0 - INOVE-PRIME\inove-prime`
Servidor: `root@170.187.131.141` · `/var/www/inove-prime`
Site: https://sistema.gcj.adv.br
PM2: processo `inove-prime` porta 3001
