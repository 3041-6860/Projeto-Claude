# Sistema 2 — DataJuri (GCJ Sistema de Gestão)

**Localização:** `y:\PROJETO CLAUDE\4 - SISTEMA-GESTAO-INOVE\GCJ-JURIDICO\datajuri\`
**Stack:** Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
**Objetivo:** Sistema completo de gestão do escritório Gonçalves Consultoria Jurídica — processos, clientes, prazos, agenda, financeiro, documentos, contratos e relatórios. Integração com API pública do DataJud (CNJ) para monitoramento de processos por número CNJ.

---

## Status Atual

| Módulo | Situação |
|---|---|
| Dashboard | ✅ Completo (métricas, prazos, audiências, tarefas, processos recentes) |
| Processos (`/processos`) | ✅ Implementado |
| Processos → Novo (`/processos/novo`) | ✅ Implementado |
| Processos → Detalhe (`/processos/[id]`) | ✅ Implementado |
| Consulta Internet (`/processos/consulta-internet`) | ✅ Implementado (DataJud via `/api/datajud`) |
| Clientes | ✅ Implementado |
| Prazos | ✅ Implementado |
| Agenda | ✅ Implementado |
| Tarefas | ✅ Implementado |
| Financeiro | ✅ Implementado |
| Documentos | ✅ Implementado |
| Contratos | ✅ Implementado |
| Serviços | ✅ Implementado |
| Relatórios | ✅ Implementado |
| Baixa | ✅ Implementado |
| Admin → Escritório | ✅ Implementado |
| Admin → Equipe | ✅ Implementado |
| Admin → Configurações | ✅ Implementado |
| `node_modules/` | ✅ Instalado |
| API DataJud (`/api/datajud`) | ⚠️ Precisa verificar se rota existe |

---

## O que ainda falta

- [ ] **Verificar rota `/api/datajud`** — a página `consulta-internet` chama `POST /api/datajud` mas precisa confirmar se o arquivo `app/api/datajud/route.ts` existe.
- [ ] **Persistência real** — atualmente usa `localStorage` (browser). Para uso em equipe/multi-dispositivo, migrar para banco de dados (SQLite ou Supabase).
- [ ] **Deploy** — configurar deploy (Vercel recomendado pelo projeto, ou VPS próprio).
- [ ] **Autenticação** — sem login/senha ainda. Qualquer pessoa com acesso à URL vê todos os dados.
- [ ] **Integração com JurisSearch** — importar processos encontrados pelo Sistema 1 diretamente no DataJuri.

---

## Como Rodar

```bash
# Via bat (configurado):
y:\PROJETO CLAUDE\4 - SISTEMA-GESTAO-INOVE\GCJ-JURIDICO\datajuri-start.bat

# Ou manualmente:
cd "y:\PROJETO CLAUDE\4 - SISTEMA-GESTAO-INOVE\GCJ-JURIDICO\datajuri"
npm run dev
# Acesse http://localhost:3000
```
