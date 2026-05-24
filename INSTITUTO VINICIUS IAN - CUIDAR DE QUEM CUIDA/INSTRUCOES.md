# 📋 Como configurar o limite de 50 vagas

## Visão geral

O formulário usa o **Google Apps Script** para controlar as vagas.
Cada inscrição fica salva numa **planilha do Google Sheets** — você pode ver em tempo real, exportar como Excel ou compartilhar com a equipe.

---

## Passo a passo (5 minutos)

### 1. Abrir o Google Apps Script

Acesse **[script.google.com](https://script.google.com)** e entre com sua conta Google.

---

### 2. Criar um novo projeto

- Clique em **"Novo projeto"**
- No editor que abrir, **apague todo o código** que aparecer por padrão
- Copie todo o conteúdo do arquivo `apps-script.js` e cole aqui
- Clique no ícone de **salvar** 💾 (ou Ctrl+S)

---

### 3. Vincular a uma planilha

- No menu, clique em **Recursos > Serviços avançados do Google** (ou acesse o ícone do Google Sheets no editor)
- Alternativamente: no menu lateral, clique em **"Serviços"** e vincule ao Google Sheets

> ⚠️ **Importante:** O script precisa estar vinculado a uma planilha do Google.
> Se não tiver uma, crie uma em [sheets.google.com](https://sheets.google.com) e, dentro do Apps Script, vá em **Extensões > Apps Script** a partir dessa planilha.

**Forma mais fácil:**
1. Crie uma planilha em [sheets.google.com](https://sheets.google.com) com o nome **"Cuidar de Quem Cuida — Inscrições"**
2. No menu dessa planilha: **Extensões > Apps Script**
3. Cole o código do arquivo `apps-script.js` no editor
4. Salve

---

### 4. Publicar o script

1. Clique em **"Implantar"** (botão azul no canto superior direito)
2. Selecione **"Novo implantação"**
3. Clique no ícone de engrenagem ⚙ ao lado de "Selecionar tipo"
4. Escolha **"Aplicativo da Web"**
5. Preencha:
   - **Descrição:** `Formulário Cuidar de Quem Cuida`
   - **Executar como:** `Eu (seu e-mail)`
   - **Quem tem acesso:** `Qualquer pessoa`
6. Clique em **"Implantar"**
7. Se pedir autorização, clique em **"Autorizar acesso"** e confirme com sua conta Google

> 📌 Uma URL será gerada, parecida com:
> `https://script.google.com/macros/s/AKfycb.../exec`
>
> **Copie essa URL** — você vai precisar no próximo passo.

---

### 5. Colar a URL no formulário

Abra o arquivo `index.html` neste projeto e procure esta linha (está no final, dentro da tag `<script>`):

```javascript
const SCRIPT_URL = ""; // Cole aqui a URL do seu Google Apps Script
```

Substitua pelas aspas com a URL copiada:

```javascript
const SCRIPT_URL = "https://script.google.com/macros/s/SUA_URL_AQUI/exec";
```

Salve o arquivo.

---

### 6. Testar

Abra o `index.html` no navegador (ou acesse pelo Netlify após publicar) e:

- A contagem de vagas deve aparecer no topo (ex: "👤 50 vagas disponíveis")
- Faça uma inscrição de teste
- Vá até a planilha do Google — a linha deve aparecer na aba **"Inscrições"**

---

## 👀 Como acompanhar as inscrições

Basta abrir a planilha do Google — ela atualiza automaticamente a cada nova inscrição.

Você pode:
- Ver em tempo real no navegador ou no app Google Sheets (celular)
- Exportar como Excel: **Arquivo > Fazer download > Microsoft Excel**
- Compartilhar com a equipe: **Compartilhar** (botão verde no canto)

---

## ⚡ O que acontece quando as 50 vagas acabam?

- O formulário some automaticamente
- Uma mensagem de **"Vagas esgotadas"** aparece no lugar
- Nenhuma inscrição nova consegue ser salva, mesmo se alguém tentar

---

## 🛠 Precisa mudar o limite de 50?

No arquivo `apps-script.js`, procure:

```javascript
const LIMITE = 50;
```

Mude para o número que quiser e **reimplante** o script (Implantar > Gerenciar implantações > Editar > Nova versão > Implantar).

No `index.html`, procure também:

```javascript
const LIMITE = 50;
```

E atualize para o mesmo valor.

---

## ❓ Dúvidas frequentes

**A planilha não criou a aba "Inscrições"**
> A aba é criada automaticamente na primeira inscrição. Pode fazer um teste enviando o formulário.

**Aparece erro de autorização**
> Vá em [script.google.com](https://script.google.com), abra o projeto, clique em Executar > doGet. Autorize o acesso. Depois reimplante.

**O contador de vagas não aparece / está errado**
> Verifique se o `SCRIPT_URL` no `index.html` está correto (sem espaços extras, com as aspas).

---

*Instituto Vinícius Ian — Cuidar de Quem Cuida, 30 de maio de 2025*
