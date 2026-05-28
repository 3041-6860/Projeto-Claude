# Registro de Manutenção — IVI WhatsApp Completo (n8n)

> **Data da manutenção:** 27/05/2026  
> **Realizado por:** Claude Code (Sonnet 4.6) + operacional@gcj.adv.br  
> **Status final:** ✅ Workflow ativo e funcionando

---

## 1. Acessos do Sistema

### 🖥️ Servidor VPS (Oracle Cloud)

| Campo | Valor |
|---|---|
| **IP** | `129.121.39.150` |
| **Provedor** | Oracle Cloud (AS31898) — Vinhedo, SP |
| **SSH Porta** | `22022` |
| **Usuário SSH** | `root` |
| **Senha SSH** | `Gcj@30416860` |
| **Console Oracle** | https://cloud.oracle.com |
| **Obs. Oracle** | ⚠️ Credenciais do console não confirmadas — ver seção "Acessos com problema" |

**Conectar via terminal:**
```bash
ssh -p 22022 root@129.121.39.150
# Senha: Gcj@30416860
```

**Conectar via PuTTY (Windows):**
```
Host: 129.121.39.150
Porta: 22022
Usuário: root
Senha: Gcj@30416860
Fingerprint: ssh-ed25519 255 SHA256:jlF06l7fCl/PjAL+1IQjvX1yXFWZ07XNWEo+w4yhbU0
```

---

### 🔄 n8n (Automação)

| Campo | Valor |
|---|---|
| **URL** | http://129.121.39.150:5678 |
| **Workflow** | IVI WhatsApp Completo |
| **Workflow ID** | `7aThlO57zWbcBxif` |
| **API Key n8n** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDVkNDA0Ni04NzUxLTQ4NzgtYjc5ZC1mZGE1NmI1N2RkOTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMzk5ZjMzZTAtN2I3My00MGU1LWEyODUtODBjZDUxNDM5YWFjIiwiaWF0IjoxNzc5ODg2NTQ2LCJleHAiOjE3ODc2MzA0MDB9._ueuv8hLOObCpdeYzibmvIdfaLRsTMLzU30SAJzc5EM` |
| **API Key Label** | "Whats IVI" |
| **API Key Validade** | 27/07/2026 (exp: 1787630400) |

**Como acessar a API do n8n:**
```bash
curl -H "X-N8N-API-KEY: <chave acima>" http://129.121.39.150:5678/api/v1/workflows
```

---

### 📱 Evolution API (WhatsApp)

| Campo | Valor |
|---|---|
| **URL interna** | `http://172.18.0.3:8080` (Docker — acessível apenas dentro do servidor) |
| **Instância** | `IVI-WhatsApp` |
| **API Key** | `77e0577e5b61a954accf488930462ce4b39653aa3c4efdf56dc694cf5b3d628d` |
| **Credential n8n** | "Evolution API Key" (id: `P084BNqEwbsWvNB7`) |

> ⚠️ A Evolution API **não é acessível externamente** — apenas dentro do servidor via rede Docker.

---

### 🐳 Containers Docker no Servidor

```
traefik           — Reverse proxy (porta 80/443)
evolution-api     — WhatsApp API (porta 8080 interna)
evolution-postgres — Banco de dados da Evolution
evolution-redis   — Cache da Evolution
```

> ℹ️ O **n8n NÃO está em Docker** — roda direto como processo Node.js (PID variável).

---

### 📁 Arquivos do Projeto

| Arquivo | Descrição |
|---|---|
| `IVI - N8N/Projeto Claudeivi_workflow.json` | Export completo do workflow (com metadados) |
| `IVI - N8N/wf_final_pronto_para_importar.json` | JSON limpo para importar no n8n se necessário |

---

## 2. O que foi feito nesta manutenção

### ✅ Bugs corrigidos

| # | Bug | Correção |
|---|---|---|
| 1 | **6 estados presos no `staticData`** — conversas travadas há 3-4 semanas sem limpar | Estados removidos manualmente |
| 2 | **Estados nunca expiravam** — `menu_enviado`, `fora_horario_menu` e `atendente_iniciou` nunca eram limpos pelo scheduler | Adicionada expiração de 24h para `menu_enviado` e `fora_horario_menu`; `atendente_iniciou` agora recebe aviso de espera após 3h igual ao `aguardando_atendente` |
| 3 | **Nó `Menu Fora Horario` órfão** — existia no canvas mas nenhum nó apontava para ele | Nó removido |
| 4 | **Opção inválida fora do horário** — qualquer resposta diferente de "1" caía direto na resposta de "outros assuntos" | Adicionado nó `Fora Horario Opcao 2` com re-prompt para opções inválidas |
| 5 | **API key hardcoded** — chave da Evolution API exposta em texto puro em 13 nós HTTP | Migrado para Credential "Evolution API Key" no n8n |

### ✅ Estado final do workflow

```
Nome:       IVI WhatsApp Completo
ID:         7aThlO57zWbcBxif
Ativo:      true
Versão:     96eec6fd-fa87-4ccb-ae72-2ad755439109
Atualizado: 27/05/2026 15:36:14 UTC
Nós total:  47
  └── 13 nós HTTP com credential (sem hardcoded)
  └──  0 nós com API key exposta
```

---

## 3. Como funciona o workflow (referência)

### Estados de uma conversa

| Estado | Significado | Expira automaticamente? |
|---|---|---|
| `menu_enviado` | Menu foi enviado, aguardando escolha | ✅ Após 24h |
| `aguardando_atendente` | Cliente escolheu opção 2 ou 3, aguardando humano | ✅ Aviso após 3h (horário comercial) |
| `aguardando_cliente` | Atendente respondeu, esperando cliente | ✅ Aviso 3h + encerra 15min depois |
| `atendente_iniciou` | Atendente enviou a primeira mensagem | ✅ Aviso após 3h (horário comercial) |
| `fora_horario_menu` | Menu fora do horário enviado | ✅ Após 24h |

### Horário comercial
- Segunda a sexta, **8h às 18h (BRT)**
- Fora do horário: cliente recebe menu com 2 opções

### Encerramento manual pelo atendente
- Atendente digita `*fim*` → workflow envia mensagem de encerramento e limpa o estado

### Scheduler (a cada 15 minutos)
- Verifica todos os estados ativos e aplica expiração/avisos

---

## 4. Como reiniciar o n8n se cair

### Via SSH
```bash
ssh -p 22022 root@129.121.39.150
# Senha: Gcj@30416860

# Verificar se está rodando:
ps aux | grep n8n | grep -v grep

# Se não estiver rodando — iniciar:
nohup n8n start > /root/n8n.log 2>&1 &

# Ou via pm2 (se instalado):
pm2 restart n8n

# Ou via systemctl:
systemctl restart n8n
```

### Via n8n API (verificar se está online)
```bash
curl http://129.121.39.150:5678/healthz
```

---

## 5. Como reimportar o workflow se necessário

1. Acesse http://129.121.39.150:5678
2. Menu hambúrguer → **Import from file**
3. Selecione o arquivo `wf_final_pronto_para_importar.json`
4. Confirme substituição

**Ou via API:**
```bash
curl -X PUT \
  -H "X-N8N-API-KEY: <api-key-n8n>" \
  -H "Content-Type: application/json" \
  -d "@wf_final_pronto_para_importar.json" \
  http://129.121.39.150:5678/api/v1/workflows/7aThlO57zWbcBxif
```

---

## 6. Acessos com problema ⚠️

### Oracle Cloud Console
- **URL:** https://cloud.oracle.com
- **Status:** ❌ Não foi possível acessar durante esta manutenção
- **Motivo:** Cloud Account Name não localizado / credenciais não confirmadas
- **Para que serve:** Reiniciar o servidor se ele travar completamente
- **Como resolver:** Procurar no email de criação da conta Oracle pelo campo `Cloud Account Name`

### SSH após problema de memória
- **Status:** ❌ SSH ficou inacessível temporariamente
- **Motivo provável:** `fail2ban` bloqueou o IP após múltiplas tentativas de autenticação falhas durante o diagnóstico, E o servidor ficou sobrecarregado pelo processo `next build` consumindo ~38% da RAM
- **Solução aplicada:** Aguardar o servidor recuperar automaticamente (levou ~20 minutos)
- **Prevenção:** Evitar múltiplas tentativas de conexão SSH em sequência

---

## 7. Incidente desta manutenção

**O que aconteceu:**
1. Durante a migração da API key, o servidor ficou com pouca memória disponível (processo `next build` consumindo ~38% da RAM)
2. O n8n parou de responder com erro `"Database is not ready!"`
3. Em seguida, SSH e todas as portas ficaram inacessíveis por ~20 minutos
4. O servidor se recuperou sozinho (processo `next build` terminou)
5. A migração foi concluída com sucesso logo após a recuperação

**Impacto:** ~20 minutos de indisponibilidade do atendimento WhatsApp

**Recomendação:** Considerar aumentar a RAM do servidor (estava usando >60% antes do `next build`) ou usar um servidor separado para builds.

---

*Documento gerado automaticamente em 27/05/2026*
