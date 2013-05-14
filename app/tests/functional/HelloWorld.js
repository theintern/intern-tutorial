define([
	'intern!object',
	'intern/chai!assert',
	'require'
], function (registerSuite, assert, require) {
	registerSuite({
		name: 'HelloWorld',

		'#alertHello': function () {
			// load an html page into the remote browser environment
			return this.remote
				.get(require.toUrl('./HelloWorld.html'))
				.waitForCondition('ready', 5000)
				.elementById('myButton')
					.clickElement()
				.end()
				.alertText().then(function (text) {
					assert.strictEqual(text, 'world', 'An alert box was shown with the text "world"');
				})
				.dismissAlert();
		}
	});
});