import { handleMovements } from "./movements";
import { secrets } from './secrets';

function processThreads() {
  const threadsToProcess: GoogleAppsScript.Gmail.GmailThread[] = GmailApp.search("label:scriptprocess is:unread");

  const movsFolder = DriveApp.getFolderById(secrets.folderId);
  const ss: GoogleAppsScript.Spreadsheet.Spreadsheet = SpreadsheetApp.openById(secrets.spreadsheetId);
  const s: GoogleAppsScript.Spreadsheet.Sheet = ss.getSheetByName('Sheet10');
  Logger.log(ss.getName(), s.getName());

  for (let thread of threadsToProcess) {
    for (let msg of thread.getMessages()) {
      Logger.log(msg.getSubject());
      switch (msg.getSubject()) {
        case 'Extrato Combinado':
        case 'EXTRATO REFEIÇÃO PASS':
          //          Logger.log(msg.getFrom(), msg.getSubject());

          //          var attachments = msg.getAttachments({includeInlineImages: false});
          //          for (var k = 0; k < attachments.length; k++) {
          //            var attachment = attachments[k];
          //            Logger.log(attachment.getName());
          //          }

          break;

        case 'Documentos em formato digital':
          const from: string = msg.getFrom();
          for (let attachment of msg.getAttachments({ includeInlineImages: false })) {
            handleMovements(attachment, from, s);
            movsFolder.createFile(attachment.copyBlob());
          }
          break;

        default:
      }
      GmailApp.markThreadRead(thread);
    }
  }
}

