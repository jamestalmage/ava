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

test('parse - handles spaces', function (t) {
	var expected = {
		object: 't',
		member: 'equal',
		args: [
			{
				name: 'actual',
				optional: false
			},
			{
				name: 'expected',
				optional: false
			},
			{
				name: 'message',
				optional: true
			}
		]
	};
	t.same(support.parse('t.equal(actual,expected,[message])'), expected, 'no spaces');
	t.same(support.parse('t.equal(actual, expected, [message])'), expected, 'standard spacing');
	t.same(support.parse('  t  .  equal  (  actual  ,  expected  ,  [  message  ]  )  '), expected, 'lots of spaces');
	t.end();
});

test('parse - handles no args', function (t) {
	var expected = {
		object: 'a',
		member: 'fail',
		args: []
	};
	t.same(support.parse('a.fail()'), expected, 'no spaces');
	t.same(support.parse('  a  .  fail  (  )  '), expected, 'lots of spaces');
	t.end();
});

test('parse - handles only optional args', function (t) {
	var expected1 = {
		object: 'assert',
		member: 'baz',
		args: [
			{
				name: 'foo',
				optional: true
			}
		]
	};

	var expected2 = {
		object: 'assert',
		member: 'baz',
		args: [
			{
				name: 'foo',
				optional: true
			},
			{
				name: 'bar',
				optional: true
			}
		]
	};

	t.same(support.parse('assert.baz([foo])'), expected1, '1 arg - no spaces');
	t.same(support.parse(' assert . baz ( [ foo ] ) '), expected1, '1 arg - lots of spaces');
	t.same(support.parse('assert.baz([foo],[bar])'), expected2, '2 args - no spaces');
	t.same(support.parse(' assert . baz ( [ foo ] , [ bar ] ) '), expected2, '2 args - lots of spaces');
	t.end();
});
