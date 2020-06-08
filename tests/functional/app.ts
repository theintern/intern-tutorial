import { services } from '@theintern/a11y';

const { axe } = services;
const { suite, test } = intern.getPlugin('interface.tdd');
const { assert } = intern.getPlugin('chai');

suite('app', () => {
	test('add numbers', async ({ remote }) => {
		await remote.get('http://localhost:3000');
		await remote.findByCssSelector('.Buttons-one').click();
		await remote.findByCssSelector('.Buttons-plus').click();
		await remote.findByCssSelector('.Buttons-two').click();
		await remote.findByCssSelector('.Buttons-equals').click();
		const display = await remote.findByCssSelector('.Display');
		const text = await display.getVisibleText();
		assert.equal(text, '3');
	});


	test('a11y check', async ({ remote }) => {
		await axe.check({
			remote,
			source: 'http://localhost:3000'
		});
	});
});
