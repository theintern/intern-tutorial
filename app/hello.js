/*
 * A very simple AMD module with no dependencies
 */

define([], function () {
	return {
		greet: function (name) {
			name = name || 'world';

			return 'Hello, ' + name + '!';
		}
	};
});