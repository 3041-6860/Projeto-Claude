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

## Status Atual

| Arquivo | Situação |
| --- | --- |
| `server.js` | ✅ Completo — auth + scraper + agendador integrado |
| `config.js` | ✅ Suporta variáveis de ambiente (PORT, SESSION_SECRET, etc.) |
| `modulos/auth.js` | ✅ bcryptjs, sessão, 3 perfis |
| `modulos/busca.js` | ✅ DataJud API — consulta elástica por CNPJ |
| `modulos/agendador.js` | ✅ Cron diário + triagem inicial automática |
| `modulos/scraper.js` | ✅ Bearer token manual + validação de expiração |
| `modulos/captura.js` | ✅ Captura automática via puppeteer-core CDP |
| `modulos/banco.js` | ✅ Deduplicação por número CNJ |
| `modulos/detalhes.js` | ✅ Notas editáveis por processo |
| `public/` | ✅ login.html, index.html, admin.html |
| `ecosystem.config.js` | ✅ PM2 — compatível Linux e Windows |
| `dados/processos.json` | ⚠️ 0 processos — busca completa rodou, nenhum resultado |
| `node_modules/` | ✅ Instalado |

---

## Problema em aberto — Busca retorna 0 resultados

A busca de 2026-05-12 rodou (banco marcado) mas salvou 0 processos. Causa ainda não identificada — pode ser filtros restritivos ou formato da resposta da API PDPJ.

**Para diagnosticar:** usar o botão **"Testar token na API"** na sidebar da interface (adicionado em 2026-05-14). Ele consulta a Porto Seguro na API e mostra:
- Quantos processos a API retornou
- Quantos foram filtrados por período / classe / tribunal / "já tem advogado"
- Amostra do primeiro processo retornado (para verificar estrutura)

---

## O que ainda falta

- [ ] **Rodar diagnóstico com token válido** — clicar "Testar token na API" e analisar por que processos são filtrados
- [ ] **Ajustar filtros se necessário** — `DATA_INICIO` em `scraper.js` está fixo em `2026-01-01`; pode precisar recuar
- [ ] **Alertas** — e-mail/WhatsApp para processos novos (não implementado)
- [ ] **Deploy VPS** — sincronizar as mudanças locais com o servidor em produção (`juris.gcj.adv.br`)

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

---

## Deploy no VPS Hostgator

### Pré-requisitos no servidor

```bash
# Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2
sudo npm install -g pm2
pm2 startup   # seguir instrução que aparecer
```

### Subir os arquivos

Copiar via SFTP (excluir `node_modules/`, `dados/debug_*.txt`, arquivos `.bat` e `.vbs`):

```text
juris-search/
├── server.js, config.js, regras.json, package.json, package-lock.json
├── ecosystem.config.js
├── modulos/
└── public/
```

### Instalar e iniciar

```bash
cd /var/www/juris-search   # ou o caminho que preferir
npm install --omit=dev
pm2 start ecosystem.config.js
pm2 save
```

### Variáveis de ambiente (obrigatórias em produção)

```bash
pm2 set gcj-juris-search:NODE_ENV production
pm2 set gcj-juris-search:SESSION_SECRET "string-aleatoria-longa-aqui"
# PORT padrão é 3000 — não precisa mudar se usar nginx como proxy
```

Ou adicionar no `ecosystem.config.js` sob `env`:

```js
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  SESSION_SECRET: 'string-aleatoria-longa-aqui',
}
```

### Nginx (proxy reverso + domínio)

```nginx
server {
    listen 80;
    server_name juris.gcj.adv.br;   # ← seu domínio

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/juris-search /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d juris.gcj.adv.br
```

### Observação: captura automática de token

O `modulos/captura.js` abre o Chrome para capturar o Bearer token. Isso **não funciona no servidor** (sem display). No VPS, use apenas o campo de token manual na interface — o usuário obtém o token no próprio computador e cola na UI.
