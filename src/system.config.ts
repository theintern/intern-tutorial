SystemJS.config({
	baseURL: './',

	map: {
		tslib: '../../node_modules/tslib/tslib.js',
		app: 'app'
	},

	packages: {
		'app': {
			defaultExtension: 'js'
		}
	}
});
