const { suite, test } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

import { greet } from '../../src/app/hello';

suite('hello', () => {
	test('greet', () => {
		assert.strictEqual(greet('Murray'), 'Hello, Murray!',
			'greet should return a greeting for the person named in the first argument');
		assert.strictEqual(greet(), 'Hello, world!', 'greet with no arguments should return a greeting to "world"');
	});
});
