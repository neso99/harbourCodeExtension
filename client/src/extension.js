var vscode = require('vscode');
var path = require('path');
var validation = require('./validation.js');
var decorator = require('./decorator.js');
var client = require('vscode-languageclient');
var fs = require("fs");

var diagnosticCollection;


function activate(context) {
	vscode.languages.setLanguageConfiguration('harbour', {
		indentationRules: {
			increaseIndentPattern: /^\s*((?:(?:static|init|exit)\s+)?(?:proc(?:e(?:d(?:u(?:r(?:e)?)?)?)?)?|func(?:t(?:i(?:o(?:n)?)?)?)?)|class|method|if|else(?:if)?|for|if|try|case|otherwise|(?:do\s+)?while|switch|begin)\b/i,
			decreaseIndentPattern: /^\s*(end[a-z]*|next|else|elseif)\b/i
		}
	});
	validation.activate(context);
	decorator.activate(context);
	
	var serverModuleDbg = context.asAbsolutePath(path.join('..','server'));
	var serverModule = context.asAbsolutePath('server');
	var debugOptions = { execArgv: ["--nolazy", "--inspect-brk=21780"] };
	var serverOptions = {
		run : { module: serverModule, transport: client.TransportKind.ipc },
		debug: { module: serverModuleDbg, transport: client.TransportKind.ipc , options: debugOptions }
	} 
	var clientOptions = {
		documentSelector: ['harbour'],
		synchronize: {
			configurationSection: ['harbour','search']
		}
	}
	var cl = new client.LanguageClient('HarbourServer', 'Harbour Server', serverOptions, clientOptions);
	context.subscriptions.push(cl.start());
	vscode.commands.registerCommand('harbour.getdbgcode', GetDbgCode);
}	

function GetDbgCode() {
	fs.readFile(path.resolve(__dirname, path.join('..','extra','dbg_lib.prg')),(err,data) =>
    {
        if(!err)
			vscode.workspace.openTextDocument({
				content: data.toString(), 
				language: 'harbour'}).then(doc => {
					vscode.window.showTextDocument(doc);
				})
    });
}

function deactivate() {
	 validation.deactivate();
}

exports.activate = activate;
exports.deactivate = deactivate;

