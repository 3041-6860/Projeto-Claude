# 📋 Retomada — Inove Prime

**Atualizado em:** 27/05/2026 — manhã  
**Sistema:** https://sistema.gcj.adv.br  
**Repositório:** https://github.com/3041-6860/Projeto-Claude

---

## 🚨 Deploy Manual (método que funciona)

```bash
# No servidor via PuTTY ou SSH:
cd /root/inove-deploy
git pull origin main
bash b
cat /tmp/deploy.log   # aguardar "PRONTO" (~3 min)
```

**Acesso SSH:**
- IP: `129.121.39.150` | Porta: `22022` | User: `root` | Senha: `Gcj2026admin!`
- ⚠️ Se a senha não funcionar: o servidor pode ter PasswordAuthentication desativado — use PuTTY com a chave SSH salva

**GitHub Actions:** agora com IP e porta corretos.  
Para ativar auto-deploy: Settings → Secrets → Actions → `VPS_PASS` = `Gcj2026admin!`

---

## 📍 Acesso ao Sistema

| Item | Detalhe |
|------|---------|
| **Site** | https://sistema.gcj.adv.br |
| **App dir** | /var/www/inove-prime |
| **Deploy repo** | /root/inove-deploy |
| **Porta app** | 3001 |

## 🔐 Logins do Sistema

| Usuário | Senha | Perfil |
|---------|-------|--------|
| `admin` | `1234` | Administrador |
| `admin@gcj.adv.br` | `Inove2026!` | Admin GCJ |
| `sandra` | `Sandra2026!` | Admin (RH) |
| `rodrigo` | `Rodrigo2026!` | Admin (Comercial) |

---

## ✅ Concluído nesta sessão (27/05)

### 🔴 Bug crítico resolvido — Módulo Jurídico não aparecia
- **Causa:** `layout.tsx` lia o `role` do cookie mas não passava ao `<Sidebar>`
- **Fix:** `<Sidebar role={user.role} />` — 1 linha alterada
- Commit: `2417607`

### 💰 Módulo Financeiro Avançado — 4 abas completas
- **Lançamentos** (melhorado): campos recorrência, centro de custo, data pagamento, status editável inline, filtro por mês
- **Contas a Pagar/Receber** (novo): sub-abas, ordenação por urgência, indicador de dias restantes, botão "Marcar Pago/Recebido"
- **Fluxo de Caixa** (novo): gráfico de barras mensal, tabela com acumulado anual, seletor de ano
- **DRE** (novo): Receita Bruta → Impostos → Receita Líquida → Lucro Bruto → EBITDA → Resultado Líquido, DRE por mês, margem líquida
- Commit: `7bbdb58`

### 🔧 GitHub Actions corrigido
- IP `170.187.131.141` → `129.121.39.150`, porta `22` → `22022`
- Commit: `986cab8`

---

## ✅ Módulos completos

- Dashboard com banner dinâmico, KPIs, acesso rápido
- TopNav com relógio ao vivo, ponto virtual
- Perfil com upload de foto
- CRM/Leads (Kanban)
- Negócios/Pipelines
- Tarefas (Kanban com modal 5 abas)
- **Financeiro Avançado** ✨ — Lançamentos + Contas + Fluxo de Caixa + DRE
- RH (funcionários, onboarding, ponto, férias)
- Marketing (Kanban de campanhas)
- Configurações (matriz 14×5 permissões)
- Autenticação com olhinho
- **Jurídico** — 21 páginas (processos, clientes, prazos, documentos, contratos, relatórios, API DataJud)

---

## 🚧 Ainda faltam

- **Dashboard KPIs com dados reais** (ler localStorage dos módulos)
- **Calendário com persistência** (salvar eventos no localStorage)
- **Gestão de documentos** (upload real de arquivos)
- **Mensagens** (chat em tempo real)
- **Migração localStorage → Supabase** (banco de dados real)

---

## 📁 Estrutura do Projeto

```
Projeto-Claude/
├── SISTEMA-GESTAO-INOVE/src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   ├── financeiro/       ← page.tsx — 4 abas avançadas ✨
│   │   │   ├── datajuri/         ← Módulo Jurídico — 21 páginas
│   │   │   ├── rh/, crm/, tarefas/, marketing/, ...
│   │   ├── api/datajud/
│   │   ├── login/
│   │   └── actions/auth.ts
│   ├── components/
│   │   ├── Sidebar.tsx           ← role={user.role} agora passado corretamente
│   │   └── TopNav.tsx
│   └── lib/datajuri/
└── b                             ← script de deploy no servidor
```

---

**Próxima sessão:** Deploy manual → testar Jurídico + Financeiro avançado → Dashboard KPIs reais
