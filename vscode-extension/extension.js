'use strict';

const vscode = require('vscode');

/** Force .syn files onto the synth language id so TextMate grammar loads. */
function ensureSynthLanguage(doc) {
  if (!doc || doc.uri.scheme !== 'file') return;
  const path = doc.uri.fsPath || doc.fileName || '';
  if (path.endsWith('.syn') && doc.languageId !== 'synth') {
    vscode.languages.setTextDocumentLanguage(doc, 'synth');
  }
}

function activate(context) {
  for (const doc of vscode.workspace.textDocuments) {
    ensureSynthLanguage(doc);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(ensureSynthLanguage)
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
