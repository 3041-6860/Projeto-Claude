# Juris Assistente IA — GCJ Jurídico

**Pipeline:** GCJ Jurídico (Inove Prime)
**Repositório:** https://github.com/3041-6860/Projeto-Juris-Assistent
**Localização local:** `c:\Users\sandr\OneDrive\Área de Trabalho\Projeto Juris Assistent`
**Stack:** FastAPI (Python 3.11+) + Claude Opus 4.7 (Anthropic) + Uvicorn
**URL local:** http://localhost:8000

---

## O que faz

Módulo de inteligência artificial integrado ao pipeline GCJ Jurídico:
- Análise automática de casos PCD (deficiência, TEA, doenças graves)
- Identificação de direitos aplicáveis com base legal (Lei 8.742/93, Lei 7.713/88, etc.)
- Geração de 17+ tipos de peças processuais (petição inicial, recurso, habeas corpus, etc.)
- Busca na base de conhecimento jurídico interno

## Endpoints principais

| Endpoint | Método | Descrição |
|---|---|---|
| `/publico/perguntar` | POST | Consulta pública (sem autenticação) |
| `/interno/analisar` | POST | Análise completa de caso |
| `/interno/gerar-peca` | POST | Geração de peça processual |
| `/interno/buscar` | GET | Busca na base de conhecimento |

## Como iniciar

```bash
cd "c:\Users\sandr\OneDrive\Área de Trabalho\Projeto Juris Assistent"
set ANTHROPIC_API_KEY=sua_chave
uvicorn src.api:app --reload
# Acesse http://localhost:8000
```

## Status

- [x] Sistema desenvolvido e funcional
- [x] Integrado ao Claude Opus 4.7 com thinking adaptativo e cache de prompt
- [ ] Integração via API ao DataJuri (Next.js → FastAPI)
- [ ] Deploy junto ao Sistema Inove Prime (Hostgator)
- [ ] Autenticação unificada com o sistema mãe
