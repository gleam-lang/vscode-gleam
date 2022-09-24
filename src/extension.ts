import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { workspace } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient/node";

const EXTENSION_NS = "gleam";

let client: LanguageClient | undefined;

export async function activate(_context: vscode.ExtensionContext) {
  // Client may be undefined if no executable found 
  client = await createLanguageClient();
  // Start the client. This will also launch the server
  client?.start();
}

// this method is called when your extension is deactivated
export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}

async function createLanguageClient(): Promise<LanguageClient|undefined> {
  let command = await getGleamCommandPath();
  if(!command){
    let message =
    `Could not resolve Gleam executable. Please ensure it is available 
    on the PATH used by VS Code or set an explicit "gleam.path" setting to a valid Gleam executable.`;

    vscode.window.showErrorMessage(message);
    return;
  }

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
    command,
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

/** Returns the absolute path to a gleam command. */
export async function getGleamCommandPath(): Promise<string|undefined> {
  let command = getWorkspaceConfigGleamExePath();
  let workspaceFolders = vscode.workspace.workspaceFolders;
  if (!command || !workspaceFolders) {
    return command ?? "gleam";
  } else if (!path.isAbsolute(command)) {
    // if sent a relative path, iterate over workspace folders to try and resolve.
    for (let workspace of workspaceFolders) {
      let commandPath = path.resolve(workspace.uri.fsPath, command);
      if (await fileExists(commandPath)) {
        return commandPath;
      }
    }
    return undefined;
  } 
  return command;
}

function getWorkspaceConfigGleamExePath() {
  let exePath = vscode.workspace.getConfiguration(EXTENSION_NS)
    .get<string>("path");
  // it is possible for the path to be blank. In that case, return undefined
  if (typeof exePath === "string" && exePath.trim().length === 0) {
    return undefined;
  } else {
    return exePath;
  }
}

function fileExists(executableFilePath: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    fs.stat(executableFilePath, (err, stat) => {
      resolve(err == null && stat.isFile());
    });
  }).catch(() => {
    // ignore all errors
    return false;
  });
}