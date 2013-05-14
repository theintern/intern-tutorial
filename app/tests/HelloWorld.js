define([
	'intern!object',
	'intern/chai!assert',
	'../HelloWorld'
], function (registerSuite, assert, HelloWorld) {
	registerSuite({
		name: 'HelloWorld',

		// Note: this method is called `before` when using tdd or bdd interfaces
		setup: function () {
			console.log('Before this suite runs');
		},

		beforeEach: function () {
			console.log('Before each test or nested suite');
		},

		afterEach: function () {
			console.log('After each test or nested suite');
		},

		// Note: this method is called `after` when using tdd or bdd interfaces
		teardown: function () {
			console.log('After this suite runs');
		},

		'#hello': function () {
			// first, let's execute the method
			var returnValue = HelloWorld.hello();
			// now let's assert that the value is what we expect
			assert.strictEqual(returnValue, 'world', 'HelloWorld#hello should return "world"');
		}
	});
});