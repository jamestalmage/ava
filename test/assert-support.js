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

test('fixPattern - changes the object name', function (t) {
	t.equal(
		support.fixPattern('assert.strictEqual(actual, expected, [message])'),
		't.strictEqual(actual, expected, [message])'
	);
	t.end();
});

test('fixPattern - throws on an invalid patter', function (t) {
	t.throws(function () {
		support.fixPattern('this is not a pattern!');
	});
	t.end();
});

function stub(name, log) {
	return function () {
		log.push([name, Array.prototype.slice.call(arguments)]);
	};
}

test('mergePlugin - adds methods described by patterns', function (t) {
	var target = {};
	var patterns = [];
	var log = [];

	support.mergePlugin({
		object: {ok: stub('ok', log)},
		patterns: ['assert.ok(actual, expected, [message])']
	}, target, patterns);

	t.equal('function', typeof target.ok);
	t.same(patterns, ['t.ok(actual, expected, [message])']);
	t.same(log, []);
	target.ok('a', 'b');
	t.same(log, [
		['ok', ['a', 'b']]
	]);
	t.end();
});

test('mergePlugin - adds methods declared in methods', function (t) {
	var target = {};
	var patterns = [];
	var log = [];

	support.mergePlugin({
		object: {ok: stub('ok', log)},
		methods: ['ok']
	}, target, patterns);

	t.equal('function', typeof target.ok);
	t.same(patterns, []);
	t.same(log, []);
	target.ok('a', 'b');
	t.same(log, [
		['ok', ['a', 'b']]
	]);
	t.end();
});

test('mergePlugin - the first plugin wins (method declared in plugin.patterns)', function (t) {
	var target = {};
	var patterns = [];
	var log = [];

	support.mergePlugin({
		object: {
			ok: stub('ok - a', log)
		},
		patterns: [
			'a.ok(actual, expected, [message])'
		]
	}, target, patterns);

	support.mergePlugin({
		object: {
			ok: stub('ok - b', log),
			notOk: stub('notOk - b', log)
		},
		patterns: [
			'b.ok(expected, actual)',
			'b.notOk(actual, expected, [message])'
		]
	}, target, patterns);

	t.equal('function', typeof target.ok);
	t.equal('function', typeof target.notOk);
	t.same(patterns, [
		't.ok(actual, expected, [message])',
		't.notOk(actual, expected, [message])'
	]);
	t.same(log, []);
	target.ok('a', 'b');
	target.notOk('a', 'b');
	t.same(log, [
		['ok - a', ['a', 'b']],
		['notOk - b', ['a', 'b']]
	]);
	t.end();
});

test('mergePlugin - the first plugin wins (method declared in plugin.methods)', function (t) {
	var target = {};
	var patterns = [];
	var log = [];

	support.mergePlugin({
		object: {
			ok: stub('ok - a', log)
		},
		methods: ['ok']
	}, target, patterns);

	support.mergePlugin({
		object: {
			ok: stub('ok - b', log),
			notOk: stub('notOk - b', log)
		},
		methods: ['ok', 'notOk']
	}, target, patterns);

	t.equal('function', typeof target.ok);
	t.equal('function', typeof target.notOk);
	t.same(patterns, []);
	t.same(log, []);
	target.ok('a', 'b');
	target.notOk('a', 'b');
	t.same(log, [
		['ok - a', ['a', 'b']],
		['notOk - b', ['a', 'b']]
	]);
	t.end();
});

