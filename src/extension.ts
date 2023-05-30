import * as vscode from "vscode";
import { workspace } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient | undefined;
let configureLang: vscode.Disposable | undefined;

export function activate(_context: vscode.ExtensionContext) {
  const onEnterRules = [...continueTypingCommentsOnNewline()];

  configureLang = vscode.languages.setLanguageConfiguration("gleam", {
    onEnterRules,
  });

  client = createLanguageClient();
  // Start the client. This will also launch the server
  client.start();
}

// this method is called when your extension is deactivated
export function deactivate(): Thenable<void> | undefined {
  configureLang?.dispose();

  return client?.stop();
}

function createLanguageClient(): LanguageClient {
  let clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "gleam" }],
    synchronize: {
      fileEvents: [
        workspace.createFileSystemWatcher("**/gleam.toml"),
        workspace.createFileSystemWatcher("**/manifest.toml"),
      ],
    },
  };

  let serverOptions: ServerOptions = {
    command: "gleam",
    args: ["lsp"],
    transport: TransportKind.stdio,
    options: {
      env: Object.assign(process.env, {
        GLEAM_LOG: "info",
        GLEAM_LOG_NOCOLOUR: "1",
      }),
    },
  };

  return new LanguageClient(
    "gleam_language_server",
    "Gleam Language Server",
    serverOptions,
    clientOptions
  );
}

/**
 * Returns the `OnEnterRule`s needed to configure typing comments on a newline.
 *
 * This makes it so when you press `Enter` while in a comment it will continue
 * the comment onto the next line.
 */
function continueTypingCommentsOnNewline(): vscode.OnEnterRule[] {
  const indentAction = vscode.IndentAction.None;

  return [
    {
      // Module doc single-line comment
      // e.g. ////|
      beforeText: /^\s*\/{4}.*$/,
      action: { indentAction, appendText: "//// " },
    },
    {
      // Doc single-line comment
      // e.g. ///|
      beforeText: /^\s*\/{3}.*$/,
      action: { indentAction, appendText: "/// " },
    },
  ];
}
