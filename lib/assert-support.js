'use strict';
var callSignature = require('call-signature');

module.exports = createEnhancedAssert;
module.exports.createPlugin = createPlugin;
module.exports.fixPattern = fixPattern;
module.exports.mergePlugin = mergePlugin;

function createEnhancedAssert(plugins) {
	var empower = require('empower');
	var powerAssertFormatter = require('power-assert-formatter');
	var powerAssertRenderers = require('power-assert-renderers');

	var patternArray = [];
	var target = {};

	plugins.forEach(function (plugin) {
		plugin = createPlugin(plugin);
		mergePlugin(plugin, target, patternArray);
	});

	empower(target,
		powerAssertFormatter({
			renderers: [
				powerAssertRenderers.AssertionRenderer,
				powerAssertRenderers.SuccinctRenderer
			]
		}),
		{
			destructive: true,
			modifyMessageOnRethrow: true,
			saveContextOnRethrow: false,
			patterns: patternArray
		}
	);
}

function createPlugin(pluginFn) {
	var pluginArgs = [];
	if (Array.isArray(pluginFn)) {
		pluginArgs = pluginFn.slice(1);
		pluginFn = pluginFn[0];
	}
	return pluginFn.apply(null, pluginArgs);
}

// Validates and modifies a pattern so it always starts with `t`.
function fixPattern(pattern) {
	var parsed = callSignature.parse(pattern);
	if (!parsed) {
		throw new Error('Invalid Pattern: ' + JSON.stringify(pattern));
	}
	// We always use `t` as the variable name (i.e. `t.is(...)`).
	// Which variable names people use is actually important for power-assert.
	// Maybe someday we let people configure their variable name?
	parsed.object = 't';
	return callSignature.generate(parsed);
}

function mergePlugin(plugin, target, patternArray) {
	(plugin.patterns || [])
		.map(fixPattern)
		.forEach(function (pattern) {
			var member = callSignature.parse(pattern).member;
			if (!target[member]) {
				patternArray.push(pattern);
				target[member] = plugin.object[member].bind(plugin.object);
			}
		});

	(plugin.methods || [])
		.forEach(function (method) {
			if (!target[method]) {
				target[method] = plugin.object[method].bind(plugin.object);
			}
		});
}
