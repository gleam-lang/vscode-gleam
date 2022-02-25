import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";
import { provideDocumentFormattingEdits } from "./formatter";
import { createLanguageClient } from "./lsp";

let client: LanguageClient | undefined;

export function activate(_context: vscode.ExtensionContext) {
  vscode.languages.registerDocumentFormattingEditProvider("gleam", {
    provideDocumentFormattingEdits,
  });

  // Start the client. This will also launch the server
  client = createLanguageClient();
  client.start();
}

// this method is called when your extension is deactivated
export function deactivate(): Thenable<void> | undefined {
  if (client) {
    return client.stop();
  }
  return undefined;
}
