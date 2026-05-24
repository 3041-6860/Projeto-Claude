/**
 * ═══════════════════════════════════════════════════════════
 *  Cuidar de Quem Cuida — Google Apps Script
 *  Instituto Vinícius Ian
 * ═══════════════════════════════════════════════════════════
 *
 *  Como usar:
 *  1. Acesse script.google.com e crie um novo projeto
 *  2. Cole TODO este código no editor
 *  3. Clique em "Implantar" > "Novo implantação"
 *  4. Tipo: "Aplicativo da Web"
 *  5. Executar como: Eu (sua conta)
 *  6. Quem tem acesso: Qualquer pessoa
 *  7. Copie a URL gerada e cole no arquivo index.html
 *     na variável SCRIPT_URL
 *
 *  As inscrições aparecem automaticamente na aba "Inscrições"
 *  da planilha do Google Sheets vinculada ao projeto.
 * ═══════════════════════════════════════════════════════════
 */

// ─── Configurações ─────────────────────────────────────────
const LIMITE       = 50;
const NOME_ABA     = "Inscrições";
const EMAIL_COPIA  = "rodrigo@institutoviniciusian.org.br"; // e-mail que recebe cópia de toda inscrição

// ─── Ponto de entrada (GET) ─────────────────────────────────
function doGet(e) {
  try {
    const acao = (e.parameter.action || "count").toLowerCase();

    if (acao === "count") {
      return responder_(contarVagas_());
    }

    if (acao === "submit") {
      return responder_(salvarInscricao_(e.parameter));
    }

    return responder_({ erro: "Ação desconhecida: " + acao });

  } catch (err) {
    return responder_({ erro: err.toString() });
  }
}

// ─── Verifica quantas vagas restam ─────────────────────────
function contarVagas_() {
  const aba    = obterOuCriarAba_();
  const total  = Math.max(0, aba.getLastRow() - 1);

  return {
    total:       total,
    disponiveis: Math.max(0, LIMITE - total),
    esgotado:    total >= LIMITE,
  };
}

// ─── Salva uma nova inscrição ───────────────────────────────
function salvarInscricao_(params) {
  const aba    = obterOuCriarAba_();
  const total  = Math.max(0, aba.getLastRow() - 1);

  if (total >= LIMITE) {
    return { erro: "esgotado", disponiveis: 0 };
  }

  const numero    = total + 1;
  const numFormatado = "#" + String(numero).padStart(3, "0"); // #001, #002...
  const agora     = new Date();
  const dataHora  = Utilities.formatDate(agora, "America/Sao_Paulo", "dd/MM/yyyy HH:mm:ss");

  const linha = [
    numFormatado,
    dataHora,
    limpar_(params.nome),
    limpar_(params.telefone),
    limpar_(params.email),
    limpar_(params.cidade),
    limpar_(params.nascimento),
    limpar_(params.filho_nome),
    params.nivel_suporte ? limpar_(params.nivel_suporte) : "(não informado)",
    params.filho_junto   ? limpar_(params.filho_junto)   : "(não informado)",
    limpar_(params.observacoes),
  ];

  aba.appendRow(linha);

  // Zebrado nas linhas pares
  const numLinha = aba.getLastRow();
  if (numLinha % 2 === 0) {
    aba.getRange(numLinha, 1, 1, linha.length).setBackground("#F8FAFC");
  }

  // Envia e-mail de confirmação para a inscrita
  const emailMae = limpar_(params.email);
  if (emailMae) {
    enviarEmailConfirmacao_(emailMae, numFormatado, params, dataHora);
  }

  return {
    ok:          true,
    numero:      numFormatado,
    disponiveis: LIMITE - numero,
  };
}

// ─── E-mail de confirmação ──────────────────────────────────
function enviarEmailConfirmacao_(emailMae, numFormatado, params, dataHora) {
  const nome      = limpar_(params.nome);
  const filhoNome = limpar_(params.filho_nome);
  const assunto   = "✅ Inscrição confirmada — Cuidar de Quem Cuida";

  const corpo = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;">

        <!-- Cabeçalho -->
        <tr>
          <td style="background:linear-gradient(135deg,#f97316,#fb923c);padding:36px 32px;text-align:center;">
            <p style="margin:0 0 8px 0;color:#ffffff;font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.9;">Instituto Vinícius Ian</p>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Cuidar de Quem Cuida</h1>
            <p style="margin:10px 0 0 0;color:#fff7ed;font-size:15px;">Sua inscrição foi confirmada! 🎉</p>
          </td>
        </tr>

        <!-- Saudação -->
        <tr>
          <td style="padding:24px 32px 0 32px;">
            <p style="margin:0;font-size:16px;color:#374151;">Olá, <strong>${nome}</strong>! 💛</p>
            <p style="margin:12px 0 0 0;font-size:15px;color:#6b7280;line-height:1.6;">
              Sua inscrição no evento <strong>Cuidar de Quem Cuida</strong> foi realizada com sucesso.
              Guarde este e-mail — ele é a sua confirmação de presença.
            </p>
          </td>
        </tr>

        <!-- Dados do evento -->
        <tr>
          <td style="padding:24px 32px 0 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-radius:10px;overflow:hidden;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 14px 0;font-size:14px;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:1px;">📅 Detalhes do Evento</p>
                <p style="margin:0 0 8px 0;font-size:15px;color:#374151;">📆 <strong>Sábado, 30 de maio de 2025</strong></p>
                <p style="margin:0 0 8px 0;font-size:15px;color:#374151;">🕐 <strong>13h às 18h</strong></p>
                <p style="margin:0;font-size:15px;color:#374151;">📍 <strong>Espaço Cultura · Norte Shopping Blumenau</strong></p>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Dados da inscrição -->
        <tr>
          <td style="padding:20px 32px 0 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;overflow:hidden;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 14px 0;font-size:14px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;">📋 Resumo da Inscrição</p>
                <p style="margin:0 0 6px 0;font-size:14px;color:#6b7280;">👩 Responsável: <strong style="color:#374151;">${nome}</strong></p>
                <p style="margin:0 0 6px 0;font-size:14px;color:#6b7280;">🧡 Filho(a): <strong style="color:#374151;">${filhoNome}</strong></p>
                <p style="margin:0;font-size:14px;color:#6b7280;">🕐 Inscrito em: <strong style="color:#374151;">${dataHora}</strong></p>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Aviso -->
        <tr>
          <td style="padding:20px 32px 0 32px;">
            <p style="margin:0;font-size:14px;color:#9ca3af;line-height:1.6;text-align:center;">
              Em caso de dúvidas, entre em contato com o Instituto Vinícius Ian.<br>
              <strong style="color:#f97316;">Não é necessário imprimir este e-mail.</strong>
            </p>
          </td>
        </tr>

        <!-- Rodapé -->
        <tr>
          <td style="padding:28px 32px 32px 32px;text-align:center;border-top:1px solid #f3f4f6;margin-top:24px;">
            <p style="margin:0;font-size:13px;color:#d1d5db;">Instituto Vinícius Ian · Blumenau – SC</p>
            <p style="margin:4px 0 0 0;font-size:12px;color:#e5e7eb;">Este é um e-mail automático gerado pelo sistema de inscrições.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // Envia para a mãe
  MailApp.sendEmail({
    to:      emailMae,
    subject: assunto,
    htmlBody: corpo,
  });

  // Envia cópia para o Instituto
  MailApp.sendEmail({
    to:      EMAIL_COPIA,
    subject: "[CÓPIA] " + assunto + " — " + nome,
    htmlBody: corpo,
  });
}

// ─── Cria ou retorna a aba de inscrições ────────────────────
function obterOuCriarAba_() {
  const ss  = SpreadsheetApp.getActiveSpreadsheet();
  let   aba = ss.getSheetByName(NOME_ABA);

  if (!aba) {
    aba = ss.insertSheet(NOME_ABA);

    const cabecalho = [
      "Nº", "Data/Hora", "Nome", "Telefone", "E-mail",
      "Cidade", "Nascimento", "Filho(a)", "Nível TEA",
      "Leva filho?", "Observações",
    ];

    aba.appendRow(cabecalho);

    const rangeCab = aba.getRange(1, 1, 1, cabecalho.length);
    rangeCab
      .setFontWeight("bold")
      .setBackground("#2563EB")
      .setFontColor("white")
      .setHorizontalAlignment("center");

    aba.setFrozenRows(1);

    aba.setColumnWidth(1, 55);   // Nº
    aba.setColumnWidth(2, 150);  // Data/Hora
    aba.setColumnWidth(3, 200);  // Nome
    aba.setColumnWidth(4, 140);  // Telefone
    aba.setColumnWidth(5, 210);  // E-mail
    aba.setColumnWidth(6, 130);  // Cidade
    aba.setColumnWidth(7, 110);  // Nascimento
    aba.setColumnWidth(8, 190);  // Filho(a)
    aba.setColumnWidth(9, 100);  // Nível TEA
    aba.setColumnWidth(10, 110); // Leva filho?
    aba.setColumnWidth(11, 280); // Observações
  }

  return aba;
}

// ─── Helpers ────────────────────────────────────────────────
function limpar_(valor) {
  return (valor || "").toString().trim();
}

function responder_(dados) {
  return ContentService
    .createTextOutput(JSON.stringify(dados))
    .setMimeType(ContentService.MimeType.JSON);
}
