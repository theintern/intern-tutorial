const { suite, test, before } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

suite('index', () => {
	before(async ({ remote }) => {
		await remote.get('_dist/src/index.html');
		await remote.setFindTimeout(5000);
		await remote.findDisplayedByCssSelector('body.loaded');
	});

	test('greeting form', async ({ remote }) => {
		const name = await remote.findById('nameField');
		await name.click();
		await name.type('Elaine');

		const button = await remote.findByCssSelector('#loginForm input[type=submit]');
		await button.click();

		const greeting = await remote.findById('greeting');
		const text = await greeting.getVisibleText();

		assert.strictEqual(text, 'Hello, Elaine!', 'Greeting should be displayed when the form is submitted');
	});
});
