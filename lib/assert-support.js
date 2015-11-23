'use strict';
var callSignature = require('call-signature');

module.exports.createPlugin = createPlugin;
module.exports.parse = callSignature.parse;
module.exports.generate = callSignature.generate;

function createPlugin(pluginFn) {
	var pluginArgs = [];
	if (Array.isArray(pluginFn)) {
		pluginArgs = pluginFn.slice(1);
		pluginFn = pluginFn[0];
	}
	return pluginFn.apply(null, pluginArgs);
}
