import { workspace } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

export function createLanguageClient(): LanguageClient {
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
