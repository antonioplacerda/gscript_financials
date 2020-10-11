import { pdfToText } from "./pdfToText";

export function handleMovements(attachment: GoogleAppsScript.Gmail.GmailAttachment, from: string, sheet: GoogleAppsScript.Spreadsheet.Sheet) {
  // Logger.log(attachment, from);
  let filetext = pdfToText(attachment, { keepTextfile: true, textResult: true });
  filetext.replace(/[\n\r]+/, '\n');

  const reAmount = /([0-9]+,\d{2})/;
  const reCurrency = /(\w+)/;
  const reDate = /(\d{2,4}\/\d{2}\/\d{2,4})/;

  let textRows = filetext.split('\n');
  for (let i = 0; i < textRows.length; i++) {
    if (textRows[i].trim() == 'Informamos que, relativamente à conta de Depósitos à Ordem acima mencionada, efetuámos o(s) seguinte(s) movimento(s):') {
      i++;
      Logger.log('Opperation type');
      Logger.log(textRows[i]);
      let re = null;
      let reAlt = null;
      let re2 = null;

      switch (textRows[i].trim()) {
        case 'Operação: TRANSFERÊNCIA A CRÉDITO':
          re = /Montante da Transferência ([0-9]+,\d{2}) (\w+) Ordenante da Transferência (.*) IBAN da Conta do Ordenante (.*) Descritivo da Transferência na Conta (.*) Referência do Ordenante .* Data do Movimento (\d{2,4}\/\d{2}\/\d{2,4}) Data Valor da Operação (\d{2,4}\/\d{2}\/\d{2,4})/;
          reAlt = /Montante da Transferência ([0-9]+,\d{2}) (\w+) Ordenante da Transferência (.*) Descritivo da Transferência na Conta (.*) IBAN da Conta do Ordenante (.*) Instituição de Crédito Ordenante .* Data do Movimento (\d{2,4}\/\d{2}\/\d{2,4}) Data Valor da Operação (\d{2,4}\/\d{2}\/\d{2,4})/;
          break;
        case 'Operação: Transferência MB WAY':
          // Debito
          re = /N\/Referencia (\d+) Montante ([0-9]+,\d{2}) (\w+) Data do Movimento (\d{2,4}\/\d{2}\/\d{2,4}) Data valor (\d{2,4}\/\d{2}\/\d{2,4})/
          // Credito
          reAlt = /N\/Referencia (\d+) Montante ([0-9 ]+,\d{2}) (\w+) Data do Movimento (\d{2,4}\/\d{2}\/\d{2,4}) Data valor (\d{2,4}\/\d{2}\/\d{2,4})/;
          break;
        case 'Operação: TRANSFERÊNCIA PONTUAL A DÉBITO':
          re = /Montante da Transferência ([0-9 ]+,\d{2}) (\w+) Descritivo da Transferência na Conta a Debitar (.*) IBAN da Conta do Destinatário (.*) Instituição de Crédito de Destino (.*) Data do Movimento (\d{2,4}\/\d{2}\/\d{2,4}) Data Valor da Operação (\d{2,4}\/\d{2}\/\d{2,4})/;
          break;
        case 'Operação: PAGAMENTO DE SERVICOS':
          re = /Montante Debitado ([0-9 ]+,\d{2}) (\w+) Descritivo do Movimento (.*) Data do Movimento (\d{2,4}\/\d{2}\/\d{2,4}) Data Valor da Operação (\d{2,4}\/\d{2}\/\d{2,4})/;
          break;
        case 'Operação: Débito Directo SEPA':
          re = /Montante Debitado ([0-9 ]+,\d{2}) (\w+) Descritivo do Movimento (.*)/;
          re2 = /Data do Movimento (\d{2,4}\/\d{2}\/\d{2,4}) Data Valor da Operação (\d{2,4}\/\d{2}\/\d{2,4})/;
          break;
        case 'Operação: TRANSFERÊNCIA PERMANENTE DE FUNDOS A DÉBITO':
          re = /Montante da Transferência ([0-9 ]+,\d{2}) (\w+) Descritivo da Transferência na Conta a Debitar (.*) IBAN da Conta do Destinatário (.*) Instituição de Crédito de Destino (.*) Descritivo (.*) Periodicidade da Transferência (.*) Data de Validade da Instrução Permanente (\d{2,4}\/\d{2}\/\d{2,4}) Data do Movimento (\d{2,4}\/\d{2}\/\d{2,4}) Data Valor da Operação (\d{2,4}\/\d{2}\/\d{2,4})/;
          break;
      }

      if (re != null) {
        continue;
      }

      let match = null;
      while (match == null && i < textRows.length) {
        i++;
        match = re.exec(textRows[i]);
        if (match == null && reAlt != null) {
          match = reAlt.exec(textRows[i]);
        }
      }
      var match2 = null;
      while (match2 == null && re2 != null && i < textRows.length) {
        i++;
        match2 = re2.exec(textRows[i]);
      }
      if (match) {
        Logger.log(match);
        sheet.appendRow(match);
      }
      if (match2) {
        Logger.log(match2);
        sheet.appendRow(match2);
      }

    }
  }
}
