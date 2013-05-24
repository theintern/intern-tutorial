**Note**: This tutorial is a **work in progress** and probably isn't complete yet.

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

That’s it! We now have a complete installation of Intern ready to go. Next, we need to configure Intern and start writing tests for our demo application.

## Step 2: Configuring Intern

Intern needs to be configured so it can find our tests and know how we want to run them. This is done by creating an Intern configuration file, which is just a regular AMD module with no dependencies. Before writing a configuration file or any tests, we first need to create a place for them to live. Normally, the configuration file and tests for a given package are put within a `tests` subdirectory for that package, so create one at `app/tests`:

```bash
mkdir app/tests
```

Next, let's make our new configuration file at `app/tests/intern.js` and paste the following skeleton into it:

```js
define({
	// The port on which the instrumenting proxy will listen
	proxyPort: 9000,

	// A fully qualified URL to the Intern proxy
	proxyUrl: 'http://localhost:9000/',

	// Default desired capabilities for all environments.
	capabilities: {
		'selenium-version': '2.30.0'
	},

	// Connection information for the remote WebDriver service. If using Sauce Labs, keep your username and password
	// in the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables unless you are sure you will NEVER be
	// publishing this configuration file somewhere
	webdriver: {
		host: 'localhost',
		port: 4444
	},

	// Whether or not to start Sauce Connect to interface with Sauce Labs before running tests
	useSauceConnect: true
});
```

In the code above, we've initially added default settings necessary run tests using a Selenium instance, and in this tutorial, we'll be using a hosted Selenium service called [Sauce Labs](http://saucelabs.com). These default settings should work fine for most people, but if you are running a local Selenium instance, be sure to check out the [full documentation on configuration options](https://github.com/theintern/intern/wiki/Configuring-Intern).

The Dojo AMD loader used by Intern needs to be able to find our application code. We can add any AMD configuration options supported by the Dojo loader inside a `loader` option in the configuration file, so let's add one for our `app` package. Let's also add an `environments` array containing objects that specify what browsers to target for integration testing. These browser objects correspond to versions supported by [Selenium](http://docs.seleniumhq.org/):

```js
// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
define({
	// The port on which the instrumenting proxy will listen
	proxyPort: 9000,

	// A fully qualified URL to the Intern proxy
	proxyUrl: 'http://localhost:9000/',

	// Default desired capabilities for all environments.
	capabilities: {
		'selenium-version': '2.30.0'
	},

	// Connection information for the remote WebDriver service. If using Sauce Labs, keep your username and password
	// in the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables unless you are sure you will NEVER be
	// publishing this configuration file somewhere
	webdriver: {
		host: 'localhost',
		port: 4444
	},

	// Whether or not to start Sauce Connect to interface with Sauce Labs before running tests
	useSauceConnect: true,

	// Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
	// OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
	// capabilities options specified for an environment will be copied as-is
	environments: [
		{ browserName: 'internet explorer', version: '10', platform: 'Windows 2012' },
		{ browserName: 'firefox', version: '19', platform: [ 'Linux', 'Mac 10.6', 'Windows 2012' ] },
		{ browserName: 'chrome', platform: [ 'Linux', 'Mac 10.8', 'Windows 2008' ] },
		{ browserName: 'safari', version: '6', platform: 'Mac 10.8' }
	],

	// Configuration options for the module loader; any AMD configuration options supported by the Dojo loader can be
	// used here
	loader: {
		// Packages that should be registered with the loader in each testing environment
		packages: [ 'app' ]
	}
});
```

We've now configured Intern! The next step is to write tests and to tell Intern to run them.

## Step 3: Write a unit test

There are several different popular syntaxes for writing unit tests, and Intern comes with built-in support for the three most common: [BDD](https://github.com/theintern/intern/wiki/Writing-Tests#bdd), [TDD](https://github.com/theintern/intern/wiki/Writing-Tests#tdd), and [object](https://github.com/theintern/intern/wiki/Writing-Tests#object). In this tutorial, we will use the **object** syntax, but this is an individual preference. All of these interfaces support the same functionality, so pick whichever one you think is the clearest when you start writing your own tests!

We first need to create a test module which will contain the actual tests for our application. Intern’s test modules are written using the AMD format and are typically split up so that there’s one test module for each corresponding code module being tested. We have one code module in our demo app (`app/hello`), so create a new test module at `app/tests/hello.js` and paste the following boilerplate into it:

```js
define([
	'intern!object',
	'intern/chai!assert',
	'../hello'
], function (registerSuite, assert, hello) {

});
```

*Note: Future versions of Intern will contain extra Grunt tasks to assist with generating new test modules.*

This bit of boilerplate loads the object syntax interface as `registerSuite`, the demo application’s code module as `hello`, and the assertion interface as `assert`. The object interface is what lets us register tests within Intern, and the assertion interface is what lets us *assert* that a variable (or function) returns the expected, correct, value.

Intern test modules can register one or more **test suites**, which can each contain any number of **test cases**. Now that the basics of our `hello.js` test module are in place, the next step is to use `registerSuite` to do just that - register a suite with test cases that test our demo app. Since we are writing a unit test, let’s test the `hello.greet` method.

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
			assert.strictEqual(hello.greet('Murray'), 'Hello, Murray!', 'hello.greet should return a greeting for the person named in the first argument');
			assert.strictEqual(hello.greet(), 'Hello, world!', 'hello.greet with no arguments should return a greeting to "world"');
		}
	});
});
```
*Note: Intern offers hooks that can be utilized within our a to run arbitrary code at various points during a test run - more information can be found on the [Writing Tests wiki page](https://github.com/theintern/intern/wiki/Writing-Tests).*

In the code above, we’ve registered a new suite for our `hello` module named “hello”, a new test case for the `greet` method named “greet”, and wrote two assertions: one where we call `greet` with no arguments, and one where we call `greet` with one argument. 

**Assertions** are statements that can be used to verify some logic about the target being tested. Here, we're using `assert.strictEqual` to prove strict equality of the return value of `hello.greet` and an expected value, yet other assertion methods exist. Such additional methods can be accessed by requiring Intern's different assertion interfaces at `intern/chai!assert`, `intern/chai!should`, and `intern/chai!expect`. For a complete list of available methods, see the [ChaiJS documentation](http://chaijs.com/api/).

The final step for writing our unit test is to add information to the Intern configuration file we previously created so that Intern can find our new test module. Let's add the a `suites` array containing the AMD [module identifier](https://github.com/amdjs/amdjs-api/wiki/AMD#id-) of our test to the config file at `app/tests/intern.js`:

```js
// ... 

suites: ['app/tests/hello']

```

#### Checkpoint 
At this point in the tutorial, Intern is downloaded and configured and we have a basic unit test module written. To run the tests in a local browser, visit the following url and inspect the console (making sure to adjust the path to `app` appropriately):

```
http://localhost/intern-tutorial/intern/client.html?config=app/tests/intern
```

To run the tests using NodeJS, kick off `client` from the `app` directory:

```bash
cd app
node intern/client.js config=app/tests/intern
```

## Step 4: Write a Functional Test

Functional tests work differently than unit tests in that they mimic *user interaction* and work by issuing commands to browsers via a WebDriver browser extension; an external server loads different browser virtual machines, mimics user action based on these commands, and processes the result. In this tutorial, we'll use a cloud service that provides an instance of such a server known as [Sauce Labs](http://saucelabs.com). If instead you desire to set up your own server instance locally, [these instructions](http://docs.seleniumhq.org/docs/03_webdriver.jsp#running-standalone-selenium-server-for-use-with-remotedrivers) should get you started. 

Let's begin by making a new folder inside our package's `tests` directory to hold our functional test at `app/tests/functional`:

```bash
cd app/tests
mkdir functional
```

We first need to create a test module which will contain the actual tests for our application. Similarly to unit tests, functional tests use any of the supported test syntaxes: [BDD](https://github.com/theintern/intern/wiki/Writing-Tests#bdd), [TDD](https://github.com/theintern/intern/wiki/Writing-Tests#tdd), and [object](https://github.com/theintern/intern/wiki/Writing-Tests#object). Create a new test module at `app/tests/functional/hello.js` and paste the following boilerplate into it:

```js
define([
	'intern!object',
	'intern/chai!assert',
	'require'
], function (registerSuite, assert, require) {

});
```

*Note: Future versions of Intern will contain extra Grunt tasks to assist with generating new test modules.*

The boilerplate above loads the object syntax intrface as `registerSuite`, the assertion interface as `assert`, and a module we'll use to require the HTML page we wish test as `require`.

Because functional tests mimic user interaction, so they need an html page to load into a remote browser environment. The actual test JavaScript code isn't exposed to this remote browser environment, so this html page **should include script tags for all necessary JavaScript**. Let's create a basic HTML page at `app/tests/functional/hello.html` and add the following code to it:

```html
<!DOCTYPE html>
<html>
	<head>
		<!--
		We pull in dojo here only for its AMD loader, since hello.js is an AMD module.
		Note: Intern doesn't require that your application uses Dojo at all.
		-->
		<script src="//ajax.googleapis.com/ajax/libs/dojo/1.9.0/dojo/dojo.js"></script>
		<script>
			var ready;

			require(['../../hello.js'], function (hello) {
				document.getElementById('helloWorld').addEventListener('click', function () {
					hello.alert();
				}, false);
				document.getElementById('helloFriend').addEventListener('click', function () {
					hello.alert('friend');
				}, false);

				// when everything is done, set a global ready flag
				ready = true;
			});
		</script>
	</head>
	<body>
		<button id="helloWorld">hello world</button>
		<button id="helloFriend">hello friend</button>
	</body>
</html>
```

On the HTML page above, we require our application's `hello` module as "hello" and hook up two click handlers that each call `hello.alert` - one with a name argument, one without a name argument . We also set a global `ready` variable to `true` once our module is loaded; that way, our functional test can wait for that global variable to become truthy before continuing.

Now, let's switch back to the functional test file at `app/tests/functional/hello`. The first step in writing any Intern test is to register a suite using the test interface - in this case, the *object* interface that was required as `registerSuite`. Because we want to test DOM interaction, let's add a single test case for our application's `hello.greet` method, which should trigger an alert.

```js
define([
	'intern!object',
	'intern/chai!assert',
	'require'
], function (registerSuite, assert, require) {
	registerSuite({
		name: 'hello functional',

		'greet': function () {

		}
	});
});
```

In a functional test, a `remote` object is exposed that has methods for interacting with the remote browser environment. This `remote` object corresponds to the standard [WebDriver API](http://www.w3.org/TR/webdriver/) with a fluid, promises-wrapped [WD.js](https://github.com/admc/wd). Using these methods, we can load an HTML page, interact with it, and make assertions just like unit testing. Looking again at the source code for `app/hello`, we can see that when `alert` is called it will alert `"Hello, world!"` if no name is passed, or `"Hello, <name>!"` if a name is passed. We need to make sure to test both of these logic paths, and can do so by mimicking a "click" on each of buttons we created on our HTML page. We can then assert that the alerted message is what we expect. If we’ve done it right, our functional test code will end up looking something like this:

```js
define([
	'intern!object',
	'intern/chai!assert',
	'require'
], function (registerSuite, assert, require) {
	registerSuite({
		name: 'hello functional',

		'greet': function () {
			// load an html page into the remote browser environment
			return this.remote
				.get(require.toUrl('./hello.html'))
				.waitForCondition('ready', 5000)
				.elementById('helloWorld')
					.clickElement()
				.end()
				.alertText().then(function (text) {
					assert.strictEqual(text, 'Hello, world!', 'An alert box should show with the correct message');
				})
				.dismissAlert()
				.elementById('helloFriend')
					.clickElement()
				.end()
				.alertText().then(function (text) {
					assert.strictEqual(text, 'Hello, friend!', 'An alert box should show with the correct message');
				})
				.dismissAlert();
		}
	});
});
```

*Note: See [this link](https://github.com/admc/wd#supported-methods) for all methods available for functional testing.*

In the code above, we first use `remote.get` to load our HTML page using the `require` module. We then use `remote.waitForCondition` to wait at most five seconds for the global `ready` variable to become truthy on the page - a simple manual mechanism for knowing when the remote HTML page is fully loaded. Next, we use a series of [WD.js](https://github.com/admc/wd) commands to interact with the remote DOM - we find an element with an id of "helloWorld", click it, then wait for an alert window to show as expected. Each `remote` method returns a promise, which makes asserting aspects of our application very simple. Here, we add a callback to the `alertText` method, which receives the alerted message. We use the standard assertion interface to verify that the message is what we expect. We then repeat the entire process for the button with an id of "helloFriend."

The final step for writing our functional test is to add information to the Intern configuration file we previously created so that Intern can find our new test module. Let's add the a `functionalSuites` array containing the AMD [module identifier](https://github.com/amdjs/amdjs-api/wiki/AMD#id-) of our test to the config file at `app/tests/intern.js`:

```js
// ... 

functionalSuites: ['app/tests/functional/hello']

// ...
```

That's it! We are now ready to run our tests again, this time using a Selenium instance via Sauce Labs so we can run unit *and* functional tests, and do it on multiple browsers.

## Step 5: Running the tests

At this point, we have tests written and Intern configured. We are now ready to actually run our tests! Intern can run tests using several different included mechanisms. We've already gone over how to [use the browser client and node client](#checkpoint) - useful test run methods while developing test cases. For code coverage and multi-browser testing, however, we will use a hosted Selenium instance knows as [Sauce Labs](http://saucelabs.com). This is made possible by Intern's auto test runner at `intern/runner.js`. First, we need to expose our Sauce Lab credentials to the environment. This information can also be hardcoded into your Intern configuration file.

```bash
export SAUCE_USERNAME=<your sauce labs username>
export SAUCE_ACCESS_KEY=<your sauce labs access key>
```

Once credentials are available, the only other step is to run the tests via `intern/runner.js`. Let's switch to the `intern` directory and kick off the tests:

```bash
cd intern
node runner.js config=app/tests/intern
```

*Note: For full documentation on arguments that can be passed when running tests, check out the [wiki page](https://github.com/theintern/intern/wiki/Running-Tests).*

If all goes according to plan, you should see the output of the test run in the console.

## Step 6: Party

Hopefully, we've now shown how to download and configure Intern, write tests, and run them in different environments. For a complete working copy of this project with Intern already configured and the tests already written, you can download a .zip archive [here](https://github.com/bitpshr/intern-tutorial/tags). Be sure to check out the full Intern [documentation](http://github.com/theintern/intern/wiki) and if you have any trouble, check out how to get Intern [support](https://github.com/theintern/intern/wiki/Support).
