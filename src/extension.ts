'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, window, workspace, Disposable, commands, Range, TextEditorRevealType, StatusBarItem, StatusBarAlignment } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    let configuration = workspace.getConfiguration("typewriterScrollMode");
    let enabled = configuration.get<boolean>("enable");

    let controller = new TypewriterModeController(enabled);

    context.subscriptions.push(controller);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class TypewriterModeController {

    private _disposable: Disposable;

    private _enable: boolean;

    private _statusBarItem: StatusBarItem;

    constructor(enabled: boolean) {
        this._enable = enabled;
        if (!this._statusBarItem) {
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        }

        let editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
        } else {
            let doc = editor.document;
            if ((doc.languageId === 'markdown') || (doc.languageId === 'plaintext')) {
                if (enabled) {
                    this._statusBarItem.text = "typewriter ON";
                } else {
                    this._statusBarItem.text = "typewriter OFF";
                }
                this._statusBarItem.show();
            }
        }

        let subscriptions: Disposable[] = [];

        workspace.onDidChangeConfiguration(this._onConfigurationChanged, this, subscriptions);

        window.onDidChangeTextEditorSelection(this._onTextDocumentSelectionChanged, this, subscriptions);

        this._disposable = Disposable.from(...subscriptions);

        commands.registerCommand("typewriterScrollMode.toggleEnabled", () => {
            this._toggleEnabled();
        });
    }

    dispose() {
        this._disposable.dispose();
        this._statusBarItem.dispose();
    }

    private _onTextDocumentSelectionChanged() {
        let editor = window.activeTextEditor;
        if (!this._enable || !editor) {
            this._statusBarItem.hide();
            return;
        }

        let doc = editor.document;
        if ((doc.languageId === 'markdown') || (doc.languageId === 'plaintext')) {
            let selection = editor.selection;

            let range = new Range(selection.active, selection.active);
            editor.revealRange(range, TextEditorRevealType.InCenter);
            this._statusBarItem.show();
        } else {
            this._statusBarItem.hide();
        }
    }

    private _onConfigurationChanged() {
        let configuration = workspace.getConfiguration('typewriterScrollMode');

        if (configuration.get('on')) {
            this._enable = true;
            this._statusBarItem.text = "Typewriter ON";
        } else {
            this._enable = false;
            this._statusBarItem.text = "Typewriter OFF";
        }

        this._statusBarItem.show();
    }

    private _toggleEnabled() {
        this._enable = !this._enable;

        let configuration = workspace.getConfiguration('typewriterScrollMode');
        configuration.update('enable', this._enable);

        if (this._enable) {
            window.showInformationMessage("Typewriter scroll mode is toggled on!");
            this._statusBarItem.text = "Typewriter ON";
        } else {
            window.showInformationMessage("Typewriter scroll mode is toggled off!");
            this._statusBarItem.text = "Typewriter OFF";
        }

        this._statusBarItem.show();
    }
}