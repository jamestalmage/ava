'use strict';
module.exports.createPlugin = createPlugin;
module.exports.analyze = analyze;

function createPlugin(pluginFn) {
	var pluginArgs = [];
	if (Array.isArray(pluginFn)) {
		pluginArgs = pluginFn.slice(1);
		pluginFn = pluginFn[0];
	}
	return pluginFn.apply(null, pluginArgs);
}

var regex = /^\s*([A-Za-z$_][A-Za-z0-9$_]*)\s*\.\s*([A-Za-z$_][A-Za-z0-9$_]*)\s*\(\s*((?:[A-Za-z$_][A-Za-z0-9$_]*)|(?:\[\s*[A-Za-z$_][A-Za-z0-9$_]*\s*]))?((?:\s*,\s*(?:(?:[A-Za-z$_][A-Za-z0-9$_]*)|(?:\[\s*[A-Za-z$_][A-Za-z0-9$_]*\s*])))+)?\s*\)\s*$/;

function analyze(str) {
	var match = regex.exec(str);
	if (!match) {
		return null;
	}

	var object = match[1];
	var member = match[2];
	var args = match[4] || '';
	args = args.split(',');
	if (match[3]) {
		args[0] = match[3];
	}
	var trimmed = [];
	args.forEach(function (str) {
		var optional = false;
		str = str.replace(/\s+/g, '');
		if (!str.length) {
			return;
		}
		if (str.charAt(0) === '[' && str.charAt(str.length - 1) === ']') {
			optional = true;
			str = str.substring(1, str.length - 1);
		}
		trimmed.push({
			name: str,
			optional: optional
		});
	});

	return {
		object: object,
		member: member,
		args: trimmed
	};
}
