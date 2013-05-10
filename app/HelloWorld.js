/*
 * A very simple AMD module with no dependencies
 */

define(function () {
	return {
		hello: function () {
			return 'world';
		},

		alertHello: function () {
			alert('world');
		}
	};
});