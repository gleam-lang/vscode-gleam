import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	TextDocumentSyncKind,
	InitializeResult
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { documentSettings, onConfigurationChanged } from './settings';
import { validateTextDocument } from './validation';
import { onCompletion, resolveCompletion } from './completion';

export let connection = createConnection(ProposedFeatures.all);
export let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

export let hasConfigurationCapability: boolean = true;
export let hasWorkspaceFolderCapability: boolean = true;
export let hasDiagnosticRelatedInformationCapability: boolean = false;

// Setup & Initialize
connection.onInitialize((params: InitializeParams) => {
	let capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			}
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {
	connection.client.register(DidChangeConfigurationNotification.type, undefined);
	connection.workspace.onDidChangeWorkspaceFolders(_event => {
		connection.console.log('Workspace folder change event received.');
	});
});

documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

connection.onCompletion(onCompletion);

connection.onDidChangeConfiguration(onConfigurationChanged)

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(resolveCompletion);

documents.listen(connection);
connection.listen();