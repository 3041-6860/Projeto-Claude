# Índice dos Sistemas — GCJ / Sandra Otto

> Arquivos completos de cada sistema em `y:\PROJETO CLAUDE\SISTEMAS\`

---

## Sistema 1 — GCJ JurisSearch

**Pasta:** `y:\SANDRA\juris-search\`
**Status completo:** `4 - SISTEMA-GESTAO-INOVE\2 - JURIS-SEARCH\STATUS.md`
**Stack:** Node.js + Express + PM2
**URL produção:** <https://juris.gcj.adv.br>
**URL local:** <http://localhost:3000>
**Login padrão:** admin / gcj2026

**Como rodar:**

```bat
cd "y:\SANDRA\juris-search"
node server.js
REM ou: iniciar-gcj.bat (via PM2)
```

**O que faz:** Monitora o Portal CNJ buscando processos de seguradoras em que a parte está sem advogado — prospecção de clientes.

**Situação atual:**

- ✅ Deploy no VPS concluído — <https://juris.gcj.adv.br> (PM2 + Traefik + SSL)
- ✅ Autenticação com 3 perfis (admin/advogado/visualizador)
- ✅ Fix do erro 503 aplicado em `captura.js` e `scraper.js`
- ⚠️ Confirmar fix com token válido — testar "Testar token na API" na sidebar
- ⚠️ Sincronizar fix do 503 no VPS (`pm2 restart gcj-juris-search`)
- ❌ Alertas (e-mail/WhatsApp) ainda não implementados

---

## Sistema 2 — GCJ Jurídico (Pipeline Jurídico — Inove Prime)

**Pasta:** `y:\PROJETO CLAUDE\4 - SISTEMA-GESTAO-INOVE\GCJ-JURIDICO\`
**Status completo:** `4 - SISTEMA-GESTAO-INOVE\1 - GCJ-JURIDICO\STATUS.md`
**Stack:** Next.js 15 + TypeScript + Tailwind + shadcn/ui (DataJuri) + FastAPI Python (Juris IA)
**URL local:** <http://localhost:3000>

**Como rodar:**

```bat
"y:\PROJETO CLAUDE\4 - SISTEMA-GESTAO-INOVE\1 - GCJ-JURIDICO\datajuri-start.bat"
REM ou: cd "y:\PROJETO CLAUDE\4 - SISTEMA-GESTAO-INOVE\1 - GCJ-JURIDICO\datajuri" && npm run dev
```

**O que faz:** Pipeline jurídico do Sistema Inove Prime. Contém o DataJuri (gestão de escritório — processos, clientes, prazos, agenda, financeiro, documentos, contratos) e o Juris Assistente IA (análise de casos PCD e geração de peças com Claude Opus).

**Situação atual:**

- ✅ Todos os módulos implementados (dashboard, processos, clientes, financeiro etc.)
- ✅ Consulta DataJud por número CNJ
- ⚠️ Dados em localStorage — sem banco real ainda
- ❌ Sem autenticação
- ❌ Sem deploy em produção
- ❌ Integração com JurisSearch não feita

---

## Sistema 3 — ESG Compass CRM

**Pasta:** `y:\SANDRA\ESG\SISTEMA\`
**Status completo:** `4 - SISTEMA-GESTAO-INOVE\3 - ESG-CRM\STATUS.md`
**Stack:** PHP + MySQL + HTML/CSS/JS (cPanel)
**URL produção (pendente):** <https://crm.sandraottoadvocacia.adv.br>

**Como rodar:** Não tem servidor local — deploy direto no cPanel.

**O que faz:** CRM de diagnóstico ESG para clientes da Sandra Otto Advocacia.

**Situação atual:**

- ✅ Código completo — versão recomendada: `esg_final/` (v2)
- ❌ Deploy no cPanel ainda não realizado
- ❌ Credenciais do banco (`config.php`) ainda não preenchidas

**Passos para deploy:**

1. Criar banco `sandrao_esgcrm` no MySQL do cPanel
2. Criar subdomínio `crm.sandraottoadvocacia.adv.br`
3. Rodar `install.sql` no phpMyAdmin
4. Preencher `config.php` com usuário/senha do banco
5. Upload dos arquivos via Gerenciador de Arquivos do cPanel

---

## Resumo rápido

| Sistema     | Onde roda         | Situação                                   |
| ----------- | ----------------- | ------------------------------------------ |
| JurisSearch | VPS + local       | ✅ Em produção — confirmar fix 503          |
| DataJuri    | Local             | ✅ Funcional — banco real e deploy pendentes |
| ESG CRM     | cPanel (pendente) | ✅ Código pronto — deploy pendente          |
