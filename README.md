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

The application itself consists of a basic HTML page and a single “app” package.

## What can Intern test?

Intern supports two types of tests: unit tests and functional tests. **Unit tests** work by executing code directly and inspecting the result, such as calling a function and then checking that it returns an expected value. **Functional tests** mimic user interaction and work by issuing commands to browsers via a WebDriver browser extension. As such, they require an external server that sends these commands to the browser and processes the result. This is a powerful notion: Intern allows us to test *code* with regular unit tests, but also allows us to test *functionality* by mimicking user interaction within real browsers.

## Step 1: Download Intern

Intern is distributed as an [npm package](https://npmjs.org/package/intern) so it can be easily added as a dependency to any project. Because this is a tutorial on using Intern, we’ll forego setting up a complete [package.json](https://npmjs.org/doc/json.html) for our demo application and will instead simply add Intern using a one-off installation:

```bash
cd intern-tutorial
npm install intern
```

That’s it! Installation is complete.

*Note: In a production application, you will typically add `"devDependencies": { "intern": "1.1.0" }` to your package.json so Intern can be installed along with all your other development dependencies.*

## Step 2: Configuring Intern

Intern needs to be configured so it can find our tests and know how we want to run them. This is done by creating an Intern configuration file, but first we need to create a place for it to live. There are [a few valid conventions](https://github.com/theintern/intern/wiki/Directory-Structure-Examples) that can be used; for this tutorial, we’ll place the configuration file and tests within a `tests` subdirectory of the project, so create one at `intern-tutorial/tests`:

```bash
mkdir tests
```

Next, copy the example configuration file from Intern to `intern-tutorial/tests/intern.js`:

```bash
cp node_modules/intern/tests/example.intern.js tests/intern.js
```

This example configuration provides us with some default settings that work well for most projects. The remaining configuration that needs to be done in order for Intern to work with our project is to tell the loader that our `app` package exists. Within the example configuration, this means changing `packages: [ { name: 'myPackage', location: '.' } ]` to `packages: [ { name: 'app', location: 'app' } ]`:

```js
	// ...
	loader: {
		// Packages that should be registered with the loader in each testing environment
		packages: [ { name: 'app', location: 'app' } ]
	},
	// ...
```

*Note: The `loader` object in the configuration file accepts any configuration options that are understood by the AMD loader. If you need to include additional packages, map modules, etc., this is the place to do it.*

We’ll be doing a little more configuration shortly when we start adding tests, but for now, we have a complete configuration. You can verify that everything is working by running the Node.js client:

```bash
node node_modules/intern/client.js config=tests/intern
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
			* test case
				* ...
			* ...
		* test case
			* assertion
			* assertion
			* ...
		* ...
	* test suite
	* ...
* test module
* ...

Test modules are typically split up so that there’s one test module for each corresponding code module being tested. We have one code module in our demo app (`app/hello`), so we’ll create a new test module at `intern-tutorial/tests/hello.js` and put the following boilerplate into it:

```js
define([
	'intern!object',
	'intern/chai!assert',
	'app/hello'
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
	'app/hello'
], function (registerSuite, assert, hello) {
	registerSuite({
		name: 'hello',

		greet: function () {
			assert.strictEqual(hello.greet('Murray'), 'Hello, Murray!', 'hello.greet should return a greeting for the person named in the first argument');
			assert.strictEqual(hello.greet(), 'Hello, world!', 'hello.greet with no arguments should return a greeting to "world"');
		}
	});
});
```

*Note: This example test uses `assert.strictEqual`, which is just one of many available assertions. For a complete list of available methods, see the [ChaiJS documentation](http://chaijs.com/api/).*

In this test module, we’ve registered a new suite for our `hello` module and named it “hello”, written a new test case for the `greet` method and named it “greet”, and added two assertions: one where we call `greet` and pass an argument, and one where we call `greet` without any argument. If either of these assertions fails, they will throw an error and the test case will be considered failed at that point.

Each of our assertions also contains a message that describes what logic the assertion is actually checking. Similar to good code comments that describe *why* a piece of code exists, these messages are used to describe the intent of the code being checked rather than simply describing the assertion. For instance, “Calling hello.greet('Murray') should return "Hello, Murray!"” would be a bad assertion message because it just describes what the assertion is doing, rather than describing the desired outcome. With the message we’ve used in the code above, if the `hello.greet` method were changed in the future to return `"Hi, <name>!"` instead, it would be clear that the test itself needed to be updated because the code still fulfils the described business logic. Similarly, if the method were changed to return `"You suck, <name>!"` instead, it would then be clear that the application code was updated incorrectly.

The final step when writing a new test module is to add the [module’s identifier](https://github.com/amdjs/amdjs-api/wiki/AMD#id-) to our configuration file so that it is loaded when we run Intern. To do this, in the `suites` array, add the string `'tests/hello'`:

```js
	// ...
	// Unit test modules to run in each browser
	suites: [ 'tests/hello' ],
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

These same tests can be run directly within a Web browser by navigating to `http://path/to/intern-tutorial/node_modules/intern/client.html?config=tests/intern` and looking in the Web console for the results. (In fact, you don’t need Node.js to be installed at all to use `client.html`.)

## Step 4: Write a functional test

Functional tests are different from unit tests in that they *mimic user interaction* by sending commands to browsers using an external server instead of running directly in the environment being tested. This enables us to generate real DOM events and test UI interactions just like a real user, with no JavaScript security sandbox limitations. As well as enabling testing of sandbox-restricted actions like [file uploads](http://sauceio.com/index.php/2012/03/selenium-tips-uploading-files-in-remote-webdriver/), functional testing also allows us to test interactions that span multiple pages and interactions with third party sites (like OAuth authorization flows). Our demo app contains an HTML file with a basic form that should display a greeting using `hello.greet`. For this tutorial, we’ll simulate a user filling out a form and clicking a button to submit it in order to verify this page works as expected.

Intern’s functional testing is based on the [standard WebDriver protocol](http://www.w3.org/TR/webdriver/), so you can either use a [Sauce Labs](http://saucelabs.com) account or [set up your own WebDriver server](http://docs.seleniumhq.org/docs/03_webdriver.jsp#running-standalone-selenium-server-for-use-with-remotedrivers). Because Sauce Labs is much easier to set up and use, this tutorial assumes you are using Sauce.

To get started, create a new directory to hold the functional tests (in order to differentiate them from our normal unit tests) at `intern-tutorial/tests/functional`:

```bash
mkdir tests/functional
```

Next, create a test module at `intern-tutorial/tests/functional/index.js` with the following boilerplate:

```js
define([
	'intern!object',
	'intern/chai!assert',
	'require'
], function (registerSuite, assert, require) {
	registerSuite({
		name: 'index',

		'greeting form': function () {

		}
	})
});
```

Just like our unit test before, we’re using the object test interface and assert-style assertions. However, instead of loading any application code directly, we’ve loaded the special `require` module which we’ll use to generate a URL to load in the browser.

To facilitate functional testing, an object is exposed to tests at `this.remote` which provides an interface for interacting with the remote browser environment. Using these methods, we can load a Web page, interact with it, and retrieve data from it to assert that our actions caused the expected result. Since all calls to the remote browser are asynchronous, this interface allows us to chain commands (like jQuery) and retrieve results using standard promises-style `then` calls. When we make a call, it is enqueued and executed once all the previous commands have completed. If this description is a little confusing, don’t worry—it should be clearer once we look at some code.

Looking at the HTML page at `index.html`, we can see that it consists of a simple form with a single input. Once this page and all required scripts are loaded, a CSS class name of "loaded" is added to the body element. We want to make sure this form works properly by testing interaction like a real user: focusing the input, typing a string, and clicking submit. We can then verify that the greeting was properly updated. Once finished, this test will look something like this:

```js
define([
	'intern!object',
	'intern/chai!assert',
	'require'
], function (registerSuite, assert, require) {
	registerSuite({
		name: 'index',

		'greeting form': function () {
			return this.remote
				.get(require.toUrl('index.html'))
				.waitForElementByCssSelector('body.loaded', 5000)
				.elementById('nameField')
					.clickElement()
					.type('Elaine')
					.end()
				.elementByCssSelector('#loginForm input[type=submit]')
					.clickElement()
					.end()
				.elementById('greeting')
				.text()
				.then(function (text) {
					assert.strictEqual(text, 'Hello, Elaine!', 'Greeting should be displayed when the form is submitted');
				});
		}
	});
});
```

*Note: To learn which methods are available on the `remote` object, for now, check the [WD.js list of available methods](https://github.com/admc/wd#supported-methods). Better documentation will be available soon. The interface in Intern includes two extra methods not normally available: a `wait` method, which allows you to wait for a fixed period of time before continuing to the next command, and an `end` method, which removes the last element retrieved from the DOM from the current chain’s context (similar to jQuery’s `end` method).*

In the code above, calling `remote.get` loads the HTML page we want to test into the browser, using the `require.toUrl` function to convert the path `index.html` to a fully qualified URL. Then, we wait for the “loaded” CSS class to appear on the body, for a maximum of five seconds. Once this element exists, we go through the process of finding, clicking, and typing into elements. Finally, we retrieve the text from the greeting element and check it to confirm that it matches what was expected.

*Note: Making more calls to `remote` from inside a `then` callback will cause tests to break. This is a [known issue](https://github.com/theintern/intern/issues/14).*

Now that this test module is complete, the final step is to add it to our Intern configuration in the special `functionalSuites` array:

```js
	// ...
	// Functional test suite(s) to run in each browser once non-functional tests are completed
	functionalSuites: [ 'tests/functional/index' ],
	// ...
```

Because functional tests require a server to drive the browser, we can’t use `client.html` or `client.js` to run these tests. Instead, we need to use the test runner, `runner.js`.

## Step 5: Everything all together

At this point, all our tests are written and Intern is fully configured. The only thing that’s left to do is to run all our tests on all the platforms we want to support. To do this efficiently, instead of using the client, we’ll use the test runner.

Unlike the client, which simply runs tests in whichever environment it is loaded, the test runner is responsible for setting up and executing tests against all the environments specified in our configuration, as well as acting as the server for driving functional tests. It also adds instrumentation to code so that we can analyze how much of our code is actually being executed by our tests. Using the runner works basically the same as running `client.js`, except that since we are using Sauce Labs we also need to provide our Sauce credentials:

```bash
SAUCE_USERNAME=<your username> SAUCE_ACCESS_KEY=<your access key> node node_modules/intern/runner.js config=tests/intern
```

*Note: You may instead specify your Sauce Labs username and access key on the `webdriver` object in your Intern configuration, using the `username` and `accessKey` keys, if you want. However, keep in mind that putting this information in the configuration exposes your username and access key to others.*

If everything was done correctly, you should see the results of the test run being output to your terminal:

```
Defaulting to "runner" reporter
Listening on 0.0.0.0:9000
Missing Sauce Connect local proxy, downloading dependency
...
Sauce Connect installed correctly
Opening local tunnel using Sauce Connect
Creating tunnel with Sauce Labs
Testing tunnel ready
Initialised firefox 19.0 on LINUX
Initialised internet explorer 9 on WINDOWS
Initialised internet explorer 10 on WINDOWS
...

=============================== Coverage summary ===============================
Statements   : 100% ( 4/4 )
Branches     : 100% ( 2/2 )
Functions    : 100% ( 2/2 )
Lines        : 100% ( 4/4 )
================================================================================
firefox 19.0 on LINUX: 0/3 tests failed
8 environments left to test
...
=============================== Coverage summary ===============================
Statements   : 100% ( 4/4 )
Branches     : 100% ( 2/2 )
Functions    : 100% ( 2/2 )
Lines        : 100% ( 4/4 )
================================================================================
TOTAL: tested 9 platforms, 0/27 tests failed
Shutting down
```

In addition to test results, the runner also provides information on how much of your application’s code was actually tested. In the case of our demo app, we’re executing 100% of our available application code, which is an outstanding level of coverage. A future tutorial will describe how you can get more detailed information about which parts of your code remain untested by using the `lcov` reporter. For now, you can learn a bit more from the [Using Reporters](https://github.com/theintern/intern/wiki/Using-Reporters) documentation.

Whenever you need to run a full test against all platforms, use the test runner. When you are in the process of writing your tests and want to check them for correctness more quickly, you can either use just the client (for unit tests only) or create an alternate configuration file that only tests against a single local platform, like [PhantomJS](https://github.com/theintern/intern/wiki/Using-Intern-with-PhantomJS) (for all tests, including functional tests).

If you are in the process of writing tests, don’t want to create an entirely new configuration file, but just want to load a certain test module, you can [specify it on the command-line](https://github.com/theintern/intern/wiki/Running-Tests):

```bash
node node_modules/intern/client.js config=tests/intern suites=tests/hello
```

In this case, instead of loading suites from our configuration file’s `suites` array, only the `tests/hello` module would be loaded and executed.

When you start testing your actual application, it’s a good idea to use the test runner in conjunction with a continuous integration service like Travis CI or Jenkins so you know that the code in your repository is passing its tests at all times, and so you can monitor your code coverage figures. [Instructions on using Intern with Travis CI](https://github.com/theintern/intern/wiki/Travis-CI-integration) are available; instructions for Jenkins will be available shortly, but it is as simple as adding the `runner.js` command as a task.

If you’d like a complete working copy of this project with Intern already configured and the tests already written, [download the completed-tutorial branch](https://github.com/theintern/intern-tutorial/archive/completed-tutorial.zip). If you have any questions, please [let us know](https://github.com/theintern/intern/wiki/Support). [Pull requests to enhance this tutorial](https://github.com/theintern/intern-tutorial/compare/) are also accepted.

Happy testing!
