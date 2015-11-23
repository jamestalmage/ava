'use strict';
var test = require('tap').test;
var support = require('../lib/assert-support');

function okStub() {}

test('createPlugin - calls the function and returns the return value', function (t) {
	t.plan(2);
	var x = support.createPlugin(function () {
		t.equal(arguments.length, 0);
		return {
			patterns: ['t.ok(val, [message])'],
			obj: {
				ok: okStub
			}
		};
	});

	t.same(x, {
		patterns: ['t.ok(val, [message])'],
		obj: {
			ok: okStub
		}
	});
});

test('createPlugin - calls the function with options', function (t) {
	t.plan(3);
	var x = support.createPlugin([
		function () {
			t.equal(arguments.length, 1);
			t.equal(arguments[0], 'foo');
			return {
				patterns: ['t.ok(val, [message])'],
				obj: {
					ok: okStub
				}
			};
		},
		'foo'
	]);

	t.same(x, {
		patterns: ['t.ok(val, [message])'],
		obj: {
			ok: okStub
		}
	});
});
