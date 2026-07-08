'use strict';

const vscode = require('vscode');

function isSynDocument(doc) {
  if (!doc || doc.uri.scheme !== 'file') return false;
  const filePath = (doc.uri.fsPath || doc.fileName || '').toLowerCase();
  return filePath.endsWith('.syn');
}

/** Force .syn files onto the synth language id so TextMate grammar loads. */
function ensureSynthLanguage(doc) {
  if (!isSynDocument(doc)) return;
  if (doc.languageId !== 'synth') {
    vscode.languages.setTextDocumentLanguage(doc, 'synth');
  }
}

function activate(context) {
  for (const doc of vscode.workspace.textDocuments) {
    ensureSynthLanguage(doc);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(ensureSynthLanguage),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) ensureSynthLanguage(editor.document);
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
