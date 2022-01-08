import { DidChangeConfigurationParams, NotificationHandler } from 'vscode-languageserver/node';
import { connection, documents, hasConfigurationCapability } from './server';
import { validateTextDocument } from './validation';

export interface LanguageServerSettings {
	maxNumberOfProblems: number;
}

const defaultSettings: LanguageServerSettings = { maxNumberOfProblems: 1000 };
export let globalSettings: LanguageServerSettings = defaultSettings;

// Cache the settings of all open documents
export let documentSettings: Map<string, Thenable<LanguageServerSettings>> = new Map();

export const onConfigurationChanged: NotificationHandler<DidChangeConfigurationParams> = (change) => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <LanguageServerSettings>(
			(change.settings.gleamLanguageServer || defaultSettings)
		);
	}

	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
};

export const getDocumentSettings = (resource: string): Thenable<LanguageServerSettings> => {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'gleamLanguageServer'
		});
		documentSettings.set(resource, result);
	}
	return result;
}
