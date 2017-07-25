SystemJS.config({
	baseURL: '../../',

	map: {
		app: '_dist/src/app',
		tslib: 'node_modules/tslib/tslib.js'
	},

	packages: {
		app: {
			defaultExtension: 'js'
		}
	}
});
