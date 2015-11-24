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
	var methods = [];
	var target = {};

	plugins.forEach(function (plugin) {
		plugin = createPlugin(plugin);
		target.AssertionError = plugin.AssertionError;
		mergePlugin(plugin, target, patternArray, methods);
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

	return {
		object: target,
		patterns: patternArray,
		methods: methods
	};
}

var empower;
function createPlugin(pluginFn, formatter) {
	empower = empower || require('empower');

	var pluginArgs = [];
	if (Array.isArray(pluginFn)) {
		pluginArgs = pluginFn.slice(1);
		pluginFn = pluginFn[0];
	}

	var pluginDefinition = pluginFn.apply(null, pluginArgs);
	var patterns = pluginDefinition.patterns.map(fixPattern);

	var object = empower(pluginDefinition.object,
	  formatter,
		{
			destructive: false,
			modifyMessageOnRethrow: true,
			saveContextOnRethrow: false,
			patterns: patterns.slice()
		}
	);

	return {
		object: object,
		patterns: patterns.slice(),
		methods: pluginDefinition.methods.slice()
	};
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

function mergePlugin(plugin, target) {
	(plugin.patterns || [])
		.map(fixPattern)
		.forEach(function (pattern) {
			var member = callSignature.parse(pattern).member;
			if (!target[member]) {
				patternArray.push(pattern);
				target[member] = plugin.object[member];
				if (methods) {
					methods.push(member);
				}
			}
		});

	(plugin.methods || [])
		.forEach(function (method) {
			if (!target[method]) {
				target[method] = plugin.object[method];
				if (methods) {
					methods.push(method);
				}
			}
		});
}
