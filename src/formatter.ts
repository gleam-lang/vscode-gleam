import { spawnSync } from "child_process";
import { TextDocument, TextEdit, Range, Position, window } from "vscode";

export function provideDocumentFormattingEdits(
  document: TextDocument
): TextEdit[] {
  let text = document.getText();
  let spawnOpts = { input: text, encoding: "utf8", timeout: 5000 };
  let childProcess = spawnSync("gleam", ["format", "--stdin"], spawnOpts);

  if (childProcess.status === 0) {
    let startPos = new Position(0, 0);
    let lineCount = document.lineCount;
    let endPos = new Position(lineCount + 2, 0);
    let range = new Range(startPos, endPos);
    let validRange = document.validateRange(range);
    return [TextEdit.replace(validRange, childProcess.stdout.toString())];
  } else {
    window.showErrorMessage("Error formatting Gleam file");
    console.error(
      "Error formatting Gleam file",
      childProcess.stderr.toString()
    );
    return [];
  }
}
