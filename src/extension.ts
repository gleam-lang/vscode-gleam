// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from 'path';

import {
  TransportKind,
	LanguageClient,
	LanguageClientOptions,
	ServerOptions
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  console.log('"VS Code-Gleam" started');
  vscode.languages.registerDocumentFormattingEditProvider("gleam", {
    provideDocumentFormattingEdits,
  });

  // Language Server
	const serverModule = context.asAbsolutePath(
		path.join('lsp', 'out', 'server.js')
	);
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ language: 'gleam' }],
		synchronize: {
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	client = new LanguageClient(
		'gleamLanguageServer',
		'Gleam Language Server',
		serverOptions,
		clientOptions
	);

	client.start();
  console.log("Gleam Language Server Started")
}

// this method is called when your extension is deactivated
export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

function provideDocumentFormattingEdits(
  document: vscode.TextDocument
): vscode.TextEdit[] {
  const text = document.getText();
  const spawnOpts = { input: text, encoding: "utf8", timeout: 5000 };
  const childProcess = cp.spawnSync("gleam", ["format", "--stdin"], spawnOpts);
  if (childProcess.status == 0) {
    const startPos = new vscode.Position(0, 0);
    const lineCount = document.lineCount;
    const endPos = new vscode.Position(lineCount + 2, 0);
    const range = new vscode.Range(startPos, endPos);
    const validRange = document.validateRange(range);
    return [
      vscode.TextEdit.replace(validRange, childProcess.stdout.toString()),
    ];
  } else {
    vscode.window.showErrorMessage("Error formatting Gleam file");
    console.error(
      "Error formatting Gleam file",
      childProcess.stderr.toString()
    );
    return [];
  }
}
