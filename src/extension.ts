// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as cp from "child_process";

export function activate(_context: vscode.ExtensionContext) {
  console.log('"VS Code-Gleam" started');
  vscode.languages.registerDocumentFormattingEditProvider("gleam", {
    provideDocumentFormattingEdits,
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}

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
