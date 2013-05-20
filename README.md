TODO: Please note that `HelloWorld` is NOT A CONSTRUCTOR and should not have been named with an uppercase first letter.
TODO: Please note that the `greet` (formerly `hello`) method needs to not be so lame. It should accept an argument and `return 'Hello, ' + (name || 'world')!';`.
TODO: The `alert` (formerly `alertHello`) method should be using the `greet` method, not duplicating the functionality of the `greet` method.
TODO: '#' means 'prototype'! Don’t use it if you are not testing a prototype method!
TODO: Because the message in the original assertion described the test code exactly, either the message should not have existed or there is something wrong with the test.

# Intern tutorial

In this tutorial, we will walk through how to set up, write tests, and run tests using Intern. This repository contains a very basic Hello World demo “application” that we’ll be building on until we’ve made it fully tested.

To get started, download the demo application by cloning this repository:

```bash
git clone https://github.com/theintern/intern-tutorial.git
```

The application itself is in the package directory named `app`.

## What can Intern test?

Intern supports two types of tests: unit tests and functional tests. **Unit tests** work by executing code directly and inspecting the result, such as calling a function and then checking that it returns an expected value. **Functional tests** mimic user interaction and work by issuing commands to browsers via a WebDriver browser extension. As such, they require an external server that sends these commands to the browser and processes the result. This is a powerful notion: Intern allows us to test *code* with regular unit tests, but also allows us to test *functionality* by mimicking user interaction within real browsers.

## Step 1: Download Intern

The recommended filesystem structure for Intern is to install it as a sibling to whatever package is being tested. Our demo app is in the `intern-tutorial/app` directory, so we will install Intern to `intern-tutorial/intern`.

First, clone the Intern repository as a sibling of the `app` directory, making sure to also retrieve its submodules using git’s `--recursive` flag:

```bash
cd intern-tutorial
git clone --recursive https://github.com/theintern/intern.git
```

Then, switching into the `intern` directory momentarily, use `npm` to install its additional server-side dependencies:

```bash
cd intern
npm install --production
cd ..
```

*Note: Improved installation using `npm` is coming in version 1.1.*

That’s it! We now have a complete installation of Intern ready to go. Next, we need to start writing tests for our demo application.

TODO: Put configuration instructions here so we can have a working client.html and let the reader run the tests as we go. Blindly writing tests and not being able to actually see if they work until the end of the tutorial is bad news. People need to be engaged with working stuff throughout the tutorial.

## Step 2: Write a unit test

There are several different popular syntaxes for writing unit tests, and Intern comes with built-in support for the three most common: [BDD](https://github.com/theintern/intern/wiki/Writing-Tests#bdd), [TDD](https://github.com/theintern/intern/wiki/Writing-Tests#tdd), and [object](https://github.com/theintern/intern/wiki/Writing-Tests#object). In this tutorial, we will use the **object** syntax, but this is an individual preference. All of these interfaces support the same functionality, so pick whichever one you think is the clearest when you start writing your own tests!

Before writing any tests, we first need to create a place for them to live. Normally, all tests for a given package are put within a `tests` subdirectory for that package, so create one at `app/tests`:

```bash
mkdir app/tests
```

Next, we need to create a test module which will contain the actual tests for our application. Intern’s test modules are written using the AMD format and are typically split up so that there’s one test module for each corresponding code module being tested. We have one code module in our demo app (`app/hello`), so create a new test module at `app/tests/hello.js` and paste the following boilerplate into it:

```js
define([
	'intern!object',
	'intern/chai!assert',
	'../hello'
], function (registerSuite, assert, hello) {

});
```

*Note: Future versions of Intern will contain extra Grunt tasks to assist with generating new test modules.*

This bit of boilerplate loads the object syntax interface as `registerSuite`, the demo application’s Hello World code module as `hello`, and the assertion interface as `assert`. The object interface is what lets us register tests within Intern, and the assertion interface is what lets us *assert* that a variable (or function) returns the expected, correct, value.

Now that the basics of our test module are in place, the next step is to use `registerSuite` to register a **test suite** and populate this suite with **test cases**. TODO: Explain the hierarchy of test module -> test suites -> test cases -> assertions. Since we are writing a unit test, let’s test the `hello.greet` method.

Looking at the source code for `app/hello`, we can see that when `greet` is called it will return the string `"Hello, world!"` if no name is passed, or `"Hello, <name>!"` if a name is passed. We need to make sure we test both of these code branches. If we’ve done it right, our test code will end up looking something like this:

```js
define([
	'intern!object',
	'intern/chai!assert',
	'../hello'
], function (registerSuite, assert, hello) {
	registerSuite({
		name: 'hello',

		'greet': function () {
			assert.strictEqual(hello.greet('Murray')), 'Hello, Murray!', 'hello.greet should return a greeting for the person named in the first argument');
			assert.strictEqual(hello.greet(), 'Hello, world!', 'hello.greet with no arguments should return a greeting to "world"');
		}
	});
});
```

In the above, we’ve registered a new suite for our `hello` module named “hello”, a new test case for the `greet` method named “greet”, and wrote two assertions: one where we call `greet` with no arguments, and one where we call `greet` with one argument.

TODO: Explain how assertions work here.



TODO: Advanced material should not be in a basics tutorial! Mention this stuff and just pass it off.

4. If necessary, we can utilize hooks within our suite to run arbitrary code at various points during a test run. Below we add log statements at each stage of the test run to demonstrate these hooks, but this is not necessary for the tutorial to run successfully.

	```js
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
	```

## Step 3: Writing a Functional Test

Functional tests work differently than unit tests in that they issue a series of commands via a WebDriver extension that a remote server is listening for; this remote server loads different browser virtual machines and mimics user action based on these commands. In this tutorial, we'll use a cloud service that provides an instance of such a server known as [Sauce Labs](http://saucelabs.com). If instead you desire to set up your own server instance locally, [these instructions](http://docs.seleniumhq.org/docs/03_webdriver.jsp#running-standalone-selenium-server-for-use-with-remotedrivers) should get you started. Syntactically, functional tests still use either the bdd, tdd, or object interface syntax. Let's get started.

1. Create a new folder to hold our functional tests at `app/tests/functional`.

	```bash
	cd app/tests
	mkdir functional
	```

2. Create a new file with the contents below at `app/tests/functional/HelloWorld.js`. Similarly to our unit test, it is a basic AMD module that requires three other modules: the object interface we are using, the assertion module, and a special module we'll use to require an HTML page.

	```js
	define([
		'intern!object',
		'intern/chai!assert',
		'require'
	], function (registerSuite, assert, require) {

	});
	```

3. Functional tests mimic user interaction, so they need an html page to load into the remote browser environment. Because the actual test JavaScript code isn't exposed to this remote browser environment at all, this html page <u>should include script tags for all necessary JavaScript</u>. Let's create a very basic HTML page that we'll test; place it alongside our functional test at `app/tests/functional/HelloWorld.html`. It will load our HelloWorld module and hook up a button's `onclick` to `HelloWorld.alertHello()`, another method on our module that we'll be testing. Our html page will also set a global to `true` once our module is loaded; that way, our functional test can wait for that global variable to become truthy before continuing.

	```html
	<!DOCTYPE html>
	<html>
		<head>
			<!--
			We pull in dojo here only for its AMD loader, since HelloWorld.js is an AMD module.
			Intern doesn't require that your application uses Dojo at all.
			-->
			<script src="//ajax.googleapis.com/ajax/libs/dojo/1.9.0/dojo/dojo.js"></script>
			<script>
				var ready;

				require(['../../HelloWorld.js'], function (HelloWorld) {
					// attach myButton's onclick to HelloWorld.alertHello
					document.getElementById('myButton').addEventListener('click', function (event) {
						HelloWorld.alertHello();
					}, false);
					// when everything is done, set a global ready flag
					ready = true;
				});
			</script>
		</head>
		<body>
			<button id="myButton">hello world</button>
		</body>
	</html>
	```

4. In a functional test, a `remote` object is exposed that has methods for interacting with the remote browser environment. In our functional test we jut created, we register a suite with one test case that is meant to test the `HelloWorld.helloAlert` method. In this test case, we first load the html page we just created into the remote browser environment. We will also wait five seconds for the global `ready` variable to become truthy before continuing so we know our module is loaded.

	```js
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
					.waitForCondition('ready', 5000);
			}
		});
	});
	```

5. Next, let's simulate a user clicking on the button on our html page. This should call the `HelloWorld.alertHello` method, which should trigger an alert box to show with the text "world". We can use the WebDriver methods available on the `remote` object to simulate the user action, and then we can use the regular `assert` module to verify the alert box text.

	```js
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
	```

## Step 4: Configuring Intern

Before any tests can be run, Intern needs to be configured so it can find our tests and can know how to run them. This is done by creating an Intern configuration file. Full documentation on available configuration options, check out the [Configuring Intern wiki page](https://github.com/theintern/intern/wiki/Configuring-Intern).


1. Create a new configuration file at `app/tests/intern.js`. This file is just a simple AMD module with no dependencies or supporting code. We will add configuration options in the steps to follow.

	```js
	// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
	define({

	});
	```

2. In this tutorial, we'll configure Intern to be able to run tests against multiple browsers using [Sauce Labs](http://saucelabs.com). Let's add an `environments` array specifying what browsers to target and set a `useSauceConnect` flag to *true* indicating that we want to use the Sauce Labs service.


	```js
	// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
	define({
		// Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
		// OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
		// capabilities options specified for an environment will be copied as-is
		environments: [
			{ browserName: 'internet explorer', version: '10', platform: 'Windows 2012' },
			{ browserName: 'firefox', version: '19', platform: [ 'Linux', 'Mac 10.6', 'Windows 2012' ] },
			{ browserName: 'chrome', platform: [ 'Linux', 'Mac 10.8', 'Windows 2008' ] },
			{ browserName: 'safari', version: '6', platform: 'Mac 10.8' }
		],

		// Whether or not to start Sauce Connect to interface with Sauce Labs before running tests
		useSauceConnect: true
	});
	```

3. We can add any AMD loader configuration options inside a `loader` object. Let's register our `app` package so Intern can find our tests and module. We will also add `suites` and `functionalSuites` array options containing the module identifier of our tests so Intern knows which specific tests to run.

	```js
	// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
	define({
		// Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
		// OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
		// capabilities options specified for an environment will be copied as-is
		environments: [
			{ browserName: 'internet explorer', version: '10', platform: 'Windows 2012' },
			{ browserName: 'firefox', version: '19', platform: [ 'Linux', 'Mac 10.6', 'Windows 2012' ] },
			{ browserName: 'chrome', platform: [ 'Linux', 'Mac 10.8', 'Windows 2008' ] },
			{ browserName: 'safari', version: '6', platform: 'Mac 10.8' }
		],

		// Whether or not to start Sauce Connect to interface with Sauce Labs before running tests
		useSauceConnect: true,

		// Configuration options for the module loader; any AMD configuration options supported by the Dojo loader can be
		// used here
		loader: {
			// Packages that should be registered with the loader in each testing environment
			packages: [ 'app' ]
		},

		// Non-functional test suite(s) to run in each browser
		suites: [ 'app/tests/HelloWorld' ],

		// Functional test suite(s) to run in each browser once non-functional tests are completed
		functionalSuites: [ 'app/tests/functional/HelloWorld' ]
	});
	```

4. Lastly, since we are using Intern's auto test runner, we need to provide a few more default configuration options. The options provided below should work fine for most set ups; if more customization is required, be sure to check out the full [configuration documentation](https://github.com/theintern/intern/wiki/Configuring-Intern) for info.

	```js
	// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
	define({
		// Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
		// OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
		// capabilities options specified for an environment will be copied as-is
		environments: [
			{ browserName: 'internet explorer', version: '10', platform: 'Windows 2012' },
			{ browserName: 'firefox', version: '19', platform: [ 'Linux', 'Mac 10.6', 'Windows 2012' ] },
			{ browserName: 'chrome', platform: [ 'Linux', 'Mac 10.8', 'Windows 2008' ] },
			{ browserName: 'safari', version: '6', platform: 'Mac 10.8' }
		],

		// Whether or not to start Sauce Connect to interface with Sauce Labs before running tests
		useSauceConnect: true,

		// Configuration options for the module loader; any AMD configuration options supported by the Dojo loader can be
		// used here
		loader: {
			// Packages that should be registered with the loader in each testing environment
			packages: [ 'app' ]
		},

		// Non-functional test suite(s) to run in each browser
		suites: [ 'app/tests/HelloWorld' ],

		// Functional test suite(s) to run in each browser once non-functional tests are completed
		functionalSuites: [ 'app/tests/functional/HelloWorld' ],

		// The port on which the instrumenting proxy will listen
		proxyPort: 9000,

		// A fully qualified URL to the Intern proxy
		proxyUrl: 'http://localhost:9000/',

		// Default desired capabilities for all environments. Individual capabilities can be overridden by any of the
		// specified browser environments in the `environments` array below as well. See
		// https://code.google.com/p/selenium/wiki/DesiredCapabilities for standard Selenium capabilities and
		// https://saucelabs.com/docs/additional-config#desired-capabilities for Sauce Labs capabilities.
		// Note that the `build` capability will be filled in with the current commit ID from the Travis CI environment
		// automatically
		capabilities: {
			'selenium-version': '2.30.0'
		},

		// Connection information for the remote WebDriver service. If using Sauce Labs, keep your username and password
		// in the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables unless you are sure you will NEVER be
		// publishing this configuration file somewhere
		webdriver: {
			host: 'localhost',
			port: 4444
		}
	});
	```


## Step 5: Running the tests

At this point, we have tests written and Intern configured. We are now ready to actually run our tests! Intern can run tests using several different included mechanisms, and we'll walk through each one in the steps below. For full documentation on arguments that can be passed when running tests, check out the [wiki page](https://github.com/theintern/intern/wiki/Running-Tests).

1. To run tests using the included browser client, a web browser should be pointed to Intern's `client.html` and a `config` url parameter should be added that specifies the module identifier of our Intern configuration file. For this tutorial, navigate to the following url, making sure to adjust the path accordingly, and open the console to view the results:

	```text
	http://localhost/intern-tutorial/intern/client.html?config=app/tests/intern
	```

2. To run tests using the included node client, execute the included node script at `intern/client.js`, again passing a config argument that specifies the module identifier of our Intern configuration file. Run the following command from within the `intern` directory.

	```bash
	node client.js config=app/tests/intern
	```

3. Lastly, we want to run our tests (including the functional test!) on all browsers specified in our Intern configuration file by using Sauce Labs. This is made possible by Intern's auto test runner at `intern/runner.js`. First, we need to expose our Sauce Lab credentials to the environment. Then we can run our tests using the included runner.

	```bash
	export SAUCE_USERNAME=<your sauce labs username>
	export SAUCE_ACCESS_KEY=<your sauce labs access key>
	node runner.js config=app/tests/intern
	```

## Step 6: Party

Hopefully, we've now shown how to download and configure Intern, write tests, and run them in different environments. For a complete working copy of this project with Intern already configured and the tests already written, you can download a .zip archive [here](https://github.com/bitpshr/intern-tutorial/tags). Be sure to check out the full Intern [documentation](http://github.com/theintern/intern/wiki) and if you have any trouble, check out how to get Intern [support](https://github.com/theintern/intern/wiki/Support).
