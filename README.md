**Note**: This tutorial is a **work in progress** and probably isn't complete yet.

# Intern tutorial

In this tutorial, we will walk through how to set up, write tests, and run tests using Intern. This repository contains a very basic Hello World demo “application” that we’ll be using as an example to build on. In order to complete this tutorial, you will need the following:

* A Bourne-compatible shell, like bash or zsh (or knowledge to execute equivalent commands in your environment)
* [Git](http://gitscm.com/)
* [Node 0.8+](http://nodejs.org/)
* A [free Sauce Labs account](https://saucelabs.com/signup)

Once you have all the necessary prerequisites, download the demo application by cloning this repository:

```bash
git clone https://github.com/theintern/intern-tutorial.git
```

The application itself is in the package directory named `app`.

## What can Intern test?

Intern supports two types of tests: unit tests and functional tests. **Unit tests** work by executing code directly and inspecting the result, such as calling a function and then checking that it returns an expected value. **Functional tests** mimic user interaction and work by issuing commands to browsers via a WebDriver browser extension. As such, they require an external server that sends these commands to the browser and processes the result. This is a powerful notion: Intern allows us to test *code* with regular unit tests, but also allows us to test *functionality* by mimicking user interaction within real browsers.

## Step 1: Download Intern

The recommended filesystem structure when working with Intern is to install it as a sibling to whatever package is being tested. Our demo app is in the `intern-tutorial/app` directory, so we will install Intern to `intern-tutorial/intern`.

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

That’s it! Installation is complete.

## Step 2: Configuring Intern

Intern needs to be configured so it can find our tests and know how we want to run them. This is done by creating an Intern configuration file, which is a regular AMD module that defines a configuration object. Before creating this file, we first need to create a place for it to live. By convention, the configuration file and tests for a given package are put within a `tests` subdirectory for that package, so create one for our application at `app/tests`:

```bash
mkdir app/tests
```

Next, copy the example configuration file from Intern to `app/tests/intern.js`:

```bash
cp intern/tests/example.intern.js app/tests/intern.js
```

This example configuration provides us with some default settings that work well for most projects. The remaining configuration that needs to be done in order for Intern to work with our project is to tell the loader that our `app` package exists. Within the example configuration, this means changing `packages: [ 'myPackage' ]` to `packages: [ 'app' ]`:

```js
	// ...
	loader: {
		// Packages that should be registered with the loader in each testing environment
		packages: [ 'app' ]
	},
	// ...
```

*Note: The `loader` object in the configuration file accepts any configuration options that are understood by the Dojo AMD loader. If you need to include additional packages, map modules, etc., this is the place to do it.*

We’ll be doing a little more configuration shortly when we start adding tests, but for now, we have a complete configuration. You can verify that everything is working by running the Node.js client:

```bash
node intern/client.js config=app/tests/intern
```

It should output:

```
Defaulting to "console" reporter
0/0 tests passed
```

Now that we’ve configured Intern, we need to create a test module which will contain the actual tests for our application.

## Step 3: Write a unit test

There are several different popular syntaxes for writing unit tests, and Intern comes with built-in support for the three most common: [BDD](https://github.com/theintern/intern/wiki/Writing-Tests#bdd), [TDD](https://github.com/theintern/intern/wiki/Writing-Tests#tdd), and [object](https://github.com/theintern/intern/wiki/Writing-Tests#object). In this tutorial, we will use the **object** syntax, but this is an individual preference. All of these interfaces support the same functionality, so pick whichever one you think is the clearest when you start writing your own tests!

Before getting any further into writing tests, we need to take a moment to review the terminology that is used by Intern:

* An **assertion** is a function call that verifies that a variable contains (or a function returns) an expected, correct, value (e.g. `assert.isTrue(someVariable, 'someVariable should be true')`)
* A **test interface** is a programming interface for registering tests with Intern
* A **test case** (or, just **test**) is a function that makes calls to application code and makes assertions about what it should have done
* A **test suite** is a collection of tests (and, optionally, sub–test-suites) that are related to each other
* A **test module** is a JavaScript module in AMD format that contains test suites

These pieces can be visualized in a hierarchy, like this:

* test module
	* test suite
		* test suite
			* ...
		* test case
			* assertion
			* ...
		* ...
	* test suite
	* ...
* test module
* ...

Test modules are typically split up so that there’s one test module for each corresponding code module being tested. We have one code module in our demo app (`app/hello`), so we’ll create a new test module at `app/tests/hello.js` and put the following boilerplate into it:

```js
define([
	'intern!object',
	'intern/chai!assert',
	'../hello'
], function (registerSuite, assert, hello) {

});
```

*Note: Future versions of Intern will contain extra Grunt tasks to assist with generating new test modules.*

This bit of code loads the object test interface as `registerSuite`, the assertion interface as `assert`, and the code we want to test as `hello`.

Now that the basics of our `hello` test module are in place, the next step is to use `registerSuite` to register a test suite with some tests for our app. We’ll start by testing the `hello.greet` method.

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

*Note: This example test uses `assert.strictEqual`, which is just one of many available assertions. For a complete list of available methods, see the [ChaiJS documentation](http://chaijs.com/api/).*

In this test module, we’ve registered a new suite for our `hello` module and named it “hello”, written a new test case for the `greet` method and named it “greet”, and added two assertions: one where we call `greet` and pass an argument, and one where we call `greet` without any argument. If either of these assertions fails, they will throw an error and the test case will be considered failed at that point.

Each of our assertions also contains a message that describes what logic the assertion is actually checking. Similar to good code comments that describe *why* a piece of code exists, these messages are used to describe the business expectation behind an assertion rather than simply describing the assertion. For instance, “Calling hello.greet('Murray') should return "Hello, Murray!"” would be a bad assertion message because it just describes what the assertion is doing, rather than describing the desired outcome. With the message we’ve used in the code above, if the `hello.greet` method were changed in the future to return `"Hi, <name>!"` instead, it would be clear that the test itself needed to be updated because the code still fulfils the original business logic. Similarly, if the method were changed to return `"You suck, <name>!"` instead, it would then be clear that the application code was updated incorrectly.

The final step when writing a new test module is to add the [module’s identifier](https://github.com/amdjs/amdjs-api/wiki/AMD#id-) to our configuration file so that it is loaded when we run Intern. To do this, in the `suites` array, add the string `'app/tests/hello'`:

```js
	// ...
	// Unit test modules to run in each browser
	suites: [ 'app/tests/hello' ],
	// ...
```

Now if we go back and run the same client.js command from the end of Step 2, we will actually see our tests running and passing:

```
Defaulting to "console" reporter
PASS: main - hello - greet (2ms)
1/1 tests passed
1/1 tests passed
```

*Note: The “tests passed” line appears twice because it is displayed once at the end of each test suite, then again at the end of the entire test run with the total count. Since we only have one test suite, the two values are identical.*

These same tests can be run directly within a Web browser by navigating to `http://path/to/intern-tutorial/intern/client.html?config=app/tests/intern` and looking in the Web console for the results. (In fact, you don’t need Node.js to be installed at all to use `client.html`.)

## Step 4: Write a functional test

Functional tests are different from unit tests in that they *mimic user interaction* by sending commands to browsers using an external server instead of running directly in the environment being tested. This enables us to generate real DOM events and test UI interactions just like a real user, with no JavaScript security sandbox limitations. For this tutorial, we’ll be testing some code that generates an `alert` box, which would not be testable by a unit test running in the browser.

Intern’s functional testing (and its continuous integration) is based on the [standard WebDriver protocol](http://www.w3.org/TR/webdriver/), so you can either use a [Sauce Labs](http://saucelabs.com) account or [set up your own WebDriver server](http://docs.seleniumhq.org/docs/03_webdriver.jsp#running-standalone-selenium-server-for-use-with-remotedrivers). Because Sauce Labs is much easier to use, this tutorial assumes you are using Sauce.

To get started, create a new directory to hold the functional tests (in order to differentiate them from our normal unit tests) at `app/tests/functional`:

```bash
mkdir app/tests/functional
```

TODO: Pre-create an index.html for the app instead of this.

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>app/hello test scaffold</title>
	</head>
	<body>
		<button id="helloWorld">Greet</button>
		<button id="helloFriend">Greet Murray</button>

		<script src="//ajax.googleapis.com/ajax/libs/dojo/1.9.0/dojo/dojo.js"></script>
		<script>
			var ready;

			require({ packages: [ { name: 'app', location: location.pathname.replace(/[^\/]*$/, 'app') } ] });
			require([ 'intern/dojo/on', 'app/hello' ], function (on, hello) {
				on('helloWorld', 'click', function () {
					hello.alert();
				});
				on('helloFriend', 'click', function () {
					hello.alert('Murray');
				});

				ready = true;
			});
		</script>
	</body>
</html>
```

In this

On the HTML page above, we require our application's `hello` module as "hello" and hook up two click handlers that each call `hello.alert` - one with a name argument, one without a name argument . We also set a global `ready` variable to `true` once our module is loaded; that way, our functional test can wait for that global variable to become truthy before continuing.


Next, create a test module at `app/tests/functional/hello.js` with the following boilerplate:

```js
define([
	'intern!object',
	'intern/chai!assert',
	'require'
], function (registerSuite, assert, require) {

});
```

Just like our unit test before, we’re going to use the object test interface and assert-style assertions. However, instead of loading any application code, we’ve loaded the special `require` module instead, which we will use to generate a URL to load into the browser.


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
