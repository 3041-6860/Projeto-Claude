# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão Geral

Este repositório pertence ao escritório **GCJ Advocacia / Gonçalves Consultoria Jurídica** (`operacional@gcj.adv.br`). Contém dois tipos de conteúdo:

1. **Documentos jurídicos** — pastas de clientes na raiz de `y:\PROJETO CLAUDE\`
2. **Sistemas de software** — todos dentro de `4 - SISTEMA-GESTAO-INOVE\`, um por negócio

### Estrutura de pastas

```
y:\PROJETO CLAUDE\
  4 - SISTEMA-GESTAO-INOVE\            ← Sistema "mãe" Inove Prime
    1 - GCJ-JURIDICO\                  ← Pipeline Jurídico GCJ
      datajuri\                        ← Next.js (gestão de escritório)
      JURIS-IA\                        ← FastAPI (Juris Assistente IA)
      datajuri-start.bat / .ps1
    2 - JURIS-SEARCH\                  ← Sistema de prospecção CNJ
    3 - ESG-CRM\                       ← CRM diagnóstico ESG
    wireframe-sistema-gestao-negocios.html
  IVI - N8N\                           ← automação WhatsApp→n8n→Bitrix24
  RECURSOS GCJ\                        ← logo, contrato modelo, folha timbrada
  SISTEMAS\                            ← esta pasta (índice e referência)
  [pastas de clientes na raiz]
```

Os STATUS.md de cada sistema estão dentro das suas respectivas pastas em `4 - SISTEMA-GESTAO-INOVE\`.

---

## Sistemas de Software

### Sistema 1 — GCJ JurisSearch
**Localização:** `y:\SANDRA\juris-search\`  
**Stack:** Node.js + Express + node-fetch + PM2  
**Objetivo:** Monitora o Portal CNJ buscando processos de seguradoras (por CNPJ) para prospecção de clientes.

```bat
cd "y:\SANDRA\juris-search"
iniciar-gcj.bat        # inicia via PM2 (gerenciador com menu)
node server.js         # ou rodar diretamente → http://localhost:3000
```

Arquitetura:
- `server.js` — API REST (Express, porta 3000)
- `config.js` — API key DataJud + porta + cron
- `modulos/banco.js` — armazenamento JSON em `dados/processos.json`
- `modulos/scraper.js` — busca via node-fetch com Bearer token manual do CNJ
- `modulos/detalhes.js` — detalhes por processo em `dados/detalhes.json`
- `public/index.html` — interface web (UI token CNJ)

O token CNJ é obtido manualmente pelo usuário no DevTools do portal e inserido na UI (~54 min de validade).

### Sistema 2 — GCJ Jurídico / DataJuri (Pipeline Jurídico — Inove Prime)
**Localização:** `y:\PROJETO CLAUDE\4 - SISTEMA-GESTAO-INOVE\1 - GCJ-JURIDICO\datajuri\`  
**Stack:** Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui  
**Objetivo:** Gestão completa do escritório — processos, clientes, prazos, agenda, financeiro, documentos, contratos, relatórios. Integrado ao pipeline GCJ Jurídico do Sistema Inove Prime.

```bash
"y:\PROJETO CLAUDE\4 - SISTEMA-GESTAO-INOVE\1 - GCJ-JURIDICO\datajuri-start.bat"   # via bat configurado
# ou manualmente:
cd "y:\PROJETO CLAUDE\4 - SISTEMA-GESTAO-INOVE\1 - GCJ-JURIDICO\datajuri"
npm run dev                     # → http://localhost:3000
```

- Dados persistidos em `localStorage` (browser) — sem banco de dados ainda
- Sem autenticação implementada
- Integração com DataJud CNJ via rota interna `/api/datajud`
- Pendente: migração para banco real (SQLite ou Supabase), autenticação, deploy

### Sistema 3 — ESG Compass CRM
**Localização:** `y:\SANDRA\ESG\SISTEMA\`  
**Stack:** PHP + MySQL + HTML/CSS/JS (hospedagem cPanel)  
**Objetivo:** CRM de diagnóstico ESG para clientes da Sandra Otto Advocacia.

- Sem servidor de desenvolvimento local — deploy direto no cPanel
- `esg_final/` é a versão atual recomendada (v2)
- `install.sql` cria o banco; `config.php` requer credenciais preenchidas
- Deploy pendente em `crm.sandraottoadvocacia.adv.br`

---

## Estrutura de Documentos Jurídicos

As pastas de clientes seguem este padrão numérico:

```
[NOME DO CLIENTE]/
  1 - ANÁLISES/          ← análises e linhas do tempo
  2 - DECISÕES/          ← sentenças e acórdãos
  3 - DOCS/              ← documentos do cliente e da parte contrária
  4 - DOCS PROCESSO/     ← peças do processo (B.O., laudos, depoimentos)
  5 - DOCS REPRESENTAÇÃO/ ← procuração, contrato de honorários
  6 - PETIÇOES/          ← petições elaboradas pelo escritório
  7 - CUMPRIMENTO DE SENTENÇA/ ← fase de execução
  8 - DOWNLOAD PROCESSO POR FASE/ ← downloads compilados do e-SAJ
```

---

## RTK (Otimização de Tokens)

Este ambiente tem RTK configurado globalmente. Prefixar comandos com `rtk` para economia de tokens:

```bash
rtk git status
rtk git log
rtk git diff
```
