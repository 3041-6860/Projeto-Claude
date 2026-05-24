# Sistema 1 — GCJ JurisSearch

**Localização:** `y:\SANDRA\juris-search\`
**Stack:** Node.js + Express + node-fetch + node-cron + bcryptjs + puppeteer-core
**Versão:** 2.0.0
**Objetivo:** Monitorar o DataJud (CNJ) buscando processos de seguradoras (por CNPJ) em que outra parte está sem advogado, para prospecção de clientes.

---

## Arquitetura dos módulos

```text
server.js            → API REST (Express, porta 3000) + auth middleware
config.js            → chave DataJud, porta, horário busca, session secret
                       (tudo sobrescrito por variáveis de ambiente em produção)
regras.json          → filtros de busca (polo, classes, assuntos)
modulos/
  auth.js            → login/sessão com bcryptjs; 3 perfis: admin/advogado/visualizador
  banco.js           → armazenamento JSON em dados/processos.json
  detalhes.js        → notas por processo em dados/detalhes.json
  busca.js           → DataJud API pública (api-publica.datajud.cnj.jus.br) com APIKey
  agendador.js       → cron diário; ao iniciar checa se busca do dia foi feita;
                       usa busca.js — NÃO depende de token manual
  scraper.js         → Portal CNJ (portaldeservicos.pdpj.jus.br) via Bearer token manual
  captura.js         → captura automática do Bearer token via puppeteer-core CDP
dados/
  processos.json     → banco principal (não apagar)
  usuarios.json      → usuários e hashes bcrypt
public/
  login.html         → tela de login
  index.html         → interface principal
  admin.html         → painel de usuários (somente admin)
```

**Mecanismo de busca ativo:**

| | `scraper.js` + `agendador.js` |
| --- | --- |
| API | Portal CNJ PDPJ (`portaldeservicos.pdpj.jus.br/api/v2`) |
| Ativação | Cron diário + botão `/api/scraping` |
| Token | Bearer token do portal CNJ via certificado OAB (54 min de validade) |
| Captura do token | Bookmarklet no Chrome (relay via `/api/token/relay`) ou cola manual |

> `busca.js` (DataJud APIKey) existe mas **não está integrado** ao agendador — DataJud retornou 0 resultados nos testes, abandonado.

---

## Status Atual (18/05/2026)

| Arquivo | Situação |
| --- | --- |
| `server.js` | ✅ Completo — auth + scraper + agendador integrado |
| `config.js` | ✅ Suporta variáveis de ambiente |
| `modulos/auth.js` | ✅ bcryptjs, sessão, 3 perfis |
| `modulos/busca.js` | ❌ DataJud API — **abandonado** (campo partes.documento removido da API pública, retorna sempre 0) |
| `modulos/agendador.js` | ✅ Cron diário + verificação ao iniciar |
| `modulos/scraper.js` | ✅ Portal CNJ PDPJ — Bearer token + fix 503 + **persistência de token no disco** |
| `modulos/captura.js` | ✅ Captura automática via puppeteer-core CDP |
| `modulos/banco.js` | ✅ Deduplicação por número CNJ |
| `modulos/detalhes.js` | ✅ Notas editáveis por processo |
| `public/` | ✅ login.html, index.html (com botão "Testar token"), admin.html |
| `GCJ_JurisSearch.vbs` | ✅ Inicia servidor oculto (sem janela) + abre browser |
| `dados/processos.json` | ⚠️ 0 processos — triagem rodou em 15/05, token expirou durante varredura |
| `dados/auth_token.json` | ✅ Token persistido no disco — recuperado automaticamente ao reiniciar |
| `CLAUDE.md` | ✅ Contexto completo para o Claude Code |
| **VPS/produção** | 🚫 **Desconsiderado** — uso apenas localhost |

---

## Histórico do problema "0 resultados"

1. **DataJud (`busca.js`)** → `partes.documento` removido da API pública → sempre 0 → **abandonado**
2. **Portal CNJ PDPJ (`scraper.js`)** → fix do 503 aplicado (não enviar `&page=&size=` na pág 0)
3. **Triagem 15/05/2026** → rodou mas retornou 0 → causa provável: **token expirou** durante varredura das 6 seguradoras (54 min de limite)

---

## Próximo passo imediato

1. Abrir `GCJ_JurisSearch.vbs` → servidor sobe oculto + browser abre
2. Obter token Bearer no Chrome (bookmarklet "★ GCJ Token CNJ")
3. Colar token na interface → botão **"Testar token na API"** na sidebar
4. Verificar resultado: quantos processos a API retorna antes dos filtros
5. Se OK → rodar **"Triagem inicial completa"** (acompanhar para ver se token aguenta)

---

## O que ainda falta

- [ ] **Confirmar com token válido** — testar "Testar token na API" e ver se API retorna processos
- [ ] **Ajustar DATA_INICIO_PADRAO** em `scraper.js` se necessário (atual: `2020-01-01`)
- [ ] **Alertas** — e-mail/WhatsApp para processos novos (não implementado)

---

## Como Rodar (local — Windows)

```bat
cd "y:\SANDRA\juris-search"
node server.js
REM Acesse http://localhost:3000
REM Login padrão: admin / gcj2026
```

Ou via PM2:

```bat
iniciar-gcj.bat
```

