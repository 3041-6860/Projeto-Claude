# 📋 Status do Projeto — Cuidar de Quem Cuida
**Instituto Vinícius Ian**
Atualizado em: 23/05/2026

---

## ✅ Status: CONCLUÍDO E EM PRODUÇÃO

---

## 🔗 Links de Acesso

| Recurso | Link |
|---|---|
| **Formulário público** | https://cuidar-quem-cuida.netlify.app |
| **Painel Netlify** | https://app.netlify.com/projects/cuidar-quem-cuida/overview |
| **Google Apps Script** | https://script.google.com |
| **Planilha de inscrições** | Abrir pelo Google Sheets (vinculada ao Apps Script) |

---

## 📅 Detalhes do Evento

| Campo | Valor |
|---|---|
| **Nome** | Cuidar de Quem Cuida |
| **Data** | Sábado, 30 de maio de 2026 |
| **Horário** | 13h às 18h |
| **Local** | Espaço Cultura · Norte Shopping Blumenau |
| **Vagas** | 50 |
| **Público** | Mães de crianças atípicas |

---

## ⚙️ Como funciona

- O formulário tem **4 etapas** com barra de progresso
- Ao enviar, os dados são salvos automaticamente na **planilha Google Sheets**
- A mãe recebe **e-mail de confirmação** automático
- Uma **cópia** de cada inscrição é enviada para `rodrigo@institutoviniciusian.org.br`
- Ao atingir **50 inscrições**, o formulário exibe tela de **"Vagas Esgotadas"** automaticamente

---

## 🔧 Configurações técnicas

| Item | Valor |
|---|---|
| **Hosting** | Netlify (drag & drop) |
| **Backend** | Google Apps Script |
| **Banco de dados** | Google Sheets — aba "Inscrições" |
| **E-mail de cópia** | rodrigo@institutoviniciusian.org.br |
| **Limite de vagas** | 50 (alterar `LIMITE` no apps-script.js) |
| **URL do Script** | https://script.google.com/macros/s/AKfycbyyrSPSP86g7m4P_5fFlnS6cSU4rP30NRfgT86kqBPR9tSPrdupngWDRIUJZc_F34V1/exec |

---

## 📁 Arquivos do Projeto

| Arquivo | Descrição |
|---|---|
| `index.html` | Formulário completo (frontend) |
| `apps-script.js` | Backend Google Apps Script (colar no Google) |
| `logo.png` | Logo do Instituto Vinícius Ian |
| `personagem.png` | Mascote (mãe e filho) |
| `INSTRUCOES.md` | Guia detalhado de configuração |
| `STATUS DO PROJETO.md` | Este arquivo |

---

## 🔄 Como atualizar o formulário no futuro

### Alterar o limite de vagas
1. Editar `apps-script.js` — mudar `const LIMITE = 50`
2. Colar código atualizado no Google Apps Script → Nova versão → Implantar

### Alterar textos ou visual
1. Editar `index.html`
2. Arrastar pasta para o Netlify

### Reimplantar do zero (novo evento)
1. Criar nova planilha no Google Sheets
2. Colar `apps-script.js` no Apps Script → Implantar → copiar nova URL
3. Colar nova URL em `index.html` na variável `SCRIPT_URL`
4. Arrastar pasta para o Netlify

---

## 📞 Contatos do Projeto

| Papel | E-mail |
|---|---|
| Monitoramento de inscrições | rodrigo@institutoviniciusian.org.br |
| Operacional GCJ | operacional@gcj.adv.br |
