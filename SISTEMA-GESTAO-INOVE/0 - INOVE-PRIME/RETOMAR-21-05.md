# Retomar — Sistema Inove Prime (sessão 21/05/2026)

## O que foi feito hoje

- TopNav branco implementado: logo colorida (navy+verde) + "Sistema" + 9 links que preenchem toda a largura (`flex:1`)
- Header navy mantido: logo branca + busca + avatar
- Sidebar navy-dark: 4 seções + ícones lucide + borda verde no item ativo
- Dashboard Sistema Mãe: 4 cards de métricas + 7 módulos + comunicados internos (sem bordas nos cards, apenas shadow — igual ao wireframe)
- Correção de cor: `a { color: inherit }` → texto dos cards de módulo não fica mais azul
- CSS migrado para classes em `globals.css` (sem inline styles desnecessários)
- Deploy em produção: https://sistema.gcj.adv.br/dashboard ✅
- PM2 online, build OK, Traefik + SSL funcionando

## Arquivos principais

| Arquivo | Função |
|---|---|
| `app/(app)/layout.tsx` | TopNav + Header + Sidebar + main |
| `components/TopNav.tsx` | Barra branca com logo-color.png + links flex:1 |
| `components/Header.tsx` | Barra navy 50px |
| `components/Sidebar.tsx` | Sidebar 220px navy-dark |
| `app/(app)/dashboard/page.tsx` | Dashboard Sistema Mãe |
| `app/globals.css` | Todas as CSS vars e classes do projeto |

## O que fazer amanhã

### Prioridade 1 — Auth funcional
O login existe visualmente mas não autentica nada. Implementar NextAuth com Credentials provider (email/senha simples, sem banco ainda).

### Prioridade 2 — Telas placeholder (em ordem do wireframe)
Criar `page.tsx` para cada rota seguindo fielmente o wireframe `wireframe-sistema-gestao-negocios.html`:

1. `/crm/leads` — tabela de leads com filtros e badges de status
2. `/negocios` — Kanban de pipelines (colunas + cards)
3. `/negocios/gcj-juridico` — tela de negócio específico com identidade visual própria
4. `/processos/monitoramento` — tabela de processos com alertas
5. `/documentos` — biblioteca de documentos
6. `/financeiro` — fluxo de caixa e faturas
7. `/rh` — colaboradores e organograma
8. `/mensagens` — chat interno + WhatsApp
9. `/configuracoes` — permissões e configurações

## Referências

- Wireframe: `Y:\PROJETO CLAUDE\SISTEMA-GESTAO-INOVE\wireframe-sistema-gestao-negocios.html`
- Código fonte: `y:\Projeto Claude\SISTEMA-GESTAO-INOVE\0 - INOVE-PRIME\inove-prime\`
- VPS: `root@129.121.39.150` porta `22022` senha `Gcj2026admin!`
- Deploy: pscp + `npm run build` + `pm2 restart inove-prime`
