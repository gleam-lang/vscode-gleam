import { CompletionItem, TextDocumentPositionParams } from "vscode-languageserver/node";

export const onCompletion = (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    return [];
}

export const resolveCompletion = (item: CompletionItem): CompletionItem => {
    return item;
}