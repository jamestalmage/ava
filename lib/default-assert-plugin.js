'use strict';

module.exports = function () {
	var patterns = [
		't.ok(value, [message])',
		't.notOk(value, [message])',
		't.true(value, [message])',
		't.false(value, [message])',
		't.is(value, expected, [message])',
		't.not(value, expected, [message])',
		't.same(value, expected, [message])',
		't.notSame(value, expected, [message])',
		't.regexTest(regex, contents, [message])'
	];

	var methods = [
		'fail',
		'pass',
		'throws',
		'doesNotThrow',
		'ifError'
	];

	var object = require('./default-assert');

	return {
		patterns: patterns,
		methods: methods,
		object: object,
		AssertionError: object.AssertionError
	};
};
