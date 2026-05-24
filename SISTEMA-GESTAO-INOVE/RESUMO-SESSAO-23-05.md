# 📋 Resumo da Sessão — 23/05/2026
**Sistema:** Inove Prime · sistema.gcj.adv.br

---

## ✅ O QUE ESTÁ PRONTO (código no GitHub, só falta deploy)

Todo o código está correto no GitHub:
**Repositório:** https://github.com/3041-6860/Projeto-Claude

| Arquivo | O que muda |
|---|---|
| `components/TopNav.tsx` | Remove GCJ hardcoded, mostra nome/email do usuário logado |
| `components/Sidebar.tsx` | Submenus do RH só aparecem dentro de `/rh` |
| `app/(app)/layout.tsx` | Lê cookie de sessão e passa usuário ao TopNav |
| `app/login/page.tsx` | Logo embutida em base64, aceita login `admin/1234` |
| `app/(app)/crm/leads/page.tsx` | CRM completo estilo Bitrix24 (kanban, painel lateral, timeline) |
| `app/(app)/financeiro/page.tsx` | Módulo Financeiro |
| `app/(app)/calendario/page.tsx` | Calendário |
| `app/(app)/mensagens/page.tsx` | Messenger |
| `app/(app)/feed/page.tsx` | Feed da equipe |
| `app/(app)/onboarding/page.tsx` | Onboarding |
| `app/(app)/documentos/page.tsx` | Documentos |
| `components/Header.tsx` | Componente de cabeçalho |

---

## ❌ O QUE NÃO FUNCIONOU (problema de deploy)

### Problema raiz identificado:
Os scripts de deploy (`.sh`) foram criados no Windows com quebras de linha **CRLF**.  
O servidor Linux ignora silenciosamente comandos com CRLF → nada acontece, nenhum erro visível.

**Scripts corrigidos para LF e enviados ao GitHub:**
- `b` (script de rebuild rápido) — na raiz do repo
- `auto-deploy.sh` — corrige o cron automaticamente
- `go-deploy.sh` — limpa .next antes de buildar

### Por que o auto-deploy não funciona:
O arquivo `/root/auto-deploy.sh` no servidor foi copiado com CRLF durante a instalação.  
O cron roda esse arquivo a cada 5 min, mas ele falha silenciosamente por causa do CRLF.

---

## 🔧 O QUE PRECISA SER FEITO (UMA VEZ)

### No terminal do cPanel, digitar 3 linhas:

```
cd /root/inove-deploy
```
```
git pull
```
```
bash b
```

**O que o `bash b` faz:**
1. Copia o `auto-deploy.sh` corrigido (LF) para `/root/` → conserta o cron para sempre
2. Limpa o build antigo (`.next`)
3. Copia todos os arquivos novos do GitHub
4. Faz `npm run build` (~3 minutos, vai aparecer texto)
5. Reinicia o PM2

**Depois disso:** qualquer nova mudança no código se publica sozinha em até 5 minutos.

---

## 📍 Acesso ao servidor

| | |
|---|---|
| **Site** | https://sistema.gcj.adv.br |
| **IP** | 170.187.131.141 |
| **SSH user** | root |
| **SSH senha** | Gcj2026admin! |
| **App dir** | /var/www/inove-prime |
| **Repo no servidor** | /root/inove-deploy |
| **Log do deploy** | /tmp/deploy.log |

---

## 🚀 Próximas funcionalidades a desenvolver

- [ ] Módulo Financeiro — lançamentos, fluxo de caixa, relatórios
- [ ] Dashboard — KPIs com dados reais do CRM
- [ ] Gestão de usuários (admin)
- [ ] Documentos — upload e gestão de arquivos
- [ ] Integração CRM → Pipeline de Negócios
