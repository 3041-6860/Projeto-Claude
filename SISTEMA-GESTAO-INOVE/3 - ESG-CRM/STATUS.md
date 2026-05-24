# Sistema 3 — ESG Compass CRM

**Localização:** `y:\SANDRA\ESG\SISTEMA\`
**Stack:** PHP + MySQL + HTML/CSS/JS (hospedagem cPanel)
**Objetivo:** CRM de diagnóstico e gestão ESG para clientes da Sandra Otto Advocacia. URL final: `https://crm.sandraottoadvocacia.adv.br`

---

## Status Atual

| Arquivo | Situação |
|---|---|
| `esg_crm_cpanel/` (v1) | ✅ Completo — versão inicial para cPanel |
| `esg_final/` (v2) | ✅ Completo — versão atualizada com novas tabelas |
| `install.sql` | ✅ Script de criação do banco (4 tabelas) |
| `update.sql` | ✅ Script de atualização (v1 → v2) |
| `tabelas_novas.sql` | ✅ Tabelas adicionais da v2 |
| `config.php` | ✅ Presente — precisa preencher credenciais |
| `api.php` | ✅ Backend da API |
| `index.html` | ✅ Frontend (SPA) |
| `.htaccess` | ✅ Configurado |
| Deploy no cPanel | ❌ Ainda não feito |

---

## O que ainda falta

- [ ] **Deploy no cPanel** — seguir o LEIAME.txt:
  1. Criar banco `sandrao_esgcrm` no MySQL do cPanel
  2. Criar subdomínio `crm.sandraottoadvocacia.adv.br`
  3. Executar `install.sql` no phpMyAdmin
  4. Preencher `config.php` com credenciais do banco
  5. Upload dos arquivos via Gerenciador de Arquivos
  6. Testar: `https://crm.sandraottoadvocacia.adv.br`
- [ ] **Definir qual versão usar** — `esg_crm_cpanel` (v1) ou `esg_final` (v2 com mais tabelas). Recomendado: v2 (`esg_final`).
- [ ] **Se upgrading da v1 para v2** — rodar `update.sql` e `tabelas_novas.sql` no banco existente.
- [ ] **Configurar senha admin** no primeiro acesso.

---

## Estrutura do Banco (v1)

4 tabelas criadas pelo `install.sql` (consultar arquivo para detalhes).

## Notas

- Sistema standalone — não depende de Node.js nem npm
- Hospedagem compatível com qualquer cPanel com PHP + MySQL
- LEIAME.txt com instruções completas em: `esg_crm_cpanel/esg_crm_php/LEIAME.txt`
