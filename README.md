# Intern Tutorial

In order to demonstrate exactly how to get started using Intern, we've assembled a very simple demo application (just a single module) that doesn't have Intern or testing of any kind set up at all. Using this app, we will walk through the process of downloading, configuring, and running Intern start-to-finish, and go from "nothing" to a full test suite with both a unit test and a functional test.

Before we get started, be sure to grab the demo application by cloning this repository:

```bash
git clone https://github.com/theintern/intern-examples/intern-tutorial.git
```

## What can Intern test?

Let's take a step back and understand exactly what Intern can do as far as testing a JavaScript codebase. Intern supports two types of tests: unit tests and functional tests. **Unit tests** work by loading code and executing assertions against that code, such as verifying that a method on a module returns an expected value. **Functional tests** mimic user interaction and work by issuing commands via a WebDriver extension. As such, they require an external server that is listening for these commands, ready to automate the actual testing on various browser VMs. This is a powerful notion: Intern allows us to test *code* with regular unit tests and also allows us to test *functionality* by mimicking user interaction, and we can do so on all major browsers. 

**Don't worry!** Setting up and writing both unit and functional tests is a simple process, and explicit instructions on how to do so can be found in the sections below.

## Step 1: Downloading Intern

The demo application contains an `app` folder that holds the code we will be testing. As such, we will install Intern as a sibling to this folder.

1. Clone this repository as a sibling directory of the package (or packages) that you want to test.

        ```bash
        cd intern-tutorial
        git clone --recursive https://github.com/theintern/intern.git
        ```

2. Use npm to install dependencies.

        ```bash
        cd intern
        npm install --production && cd ..
        ```

## Step 2: Writing a Unit Test

Again, unit tests work by loading code into the current environment and running through a series of assertions that verify aspects of this code. When writing JavaScript tests, several different JavaScript syntaxes have gained popularity. Intern currently supports [bdd](https://github.com/theintern/intern/wiki/Writing-Tests#bdd), [tdd](https://github.com/theintern/intern/wiki/Writing-Tests#tdd), and [object](https://github.com/theintern/intern/wiki/Writing-Tests#object) tests. In this tutorial we will use the **object** interface but this is purely preference - all interfaces support the same functionality. Now, let's write a simple unit test!

1. Create a new folder to hold our tests at `app/tests`.

        ```bash
        cd app
        mkdir tests
        ```

2. Next, we'll create an actual test for the `HelloWorld` module included in the demo application. Below is the start of our test - it is a basic AMD module that requires three other modules: the object interface we are using, the assertion module, and the `HelloWorld` module we are actually testing. Create a new file with the contents below at `app/tests/HelloWorld.js`.

        ```js
        define([
                'intern!object',
                'intern/chai!assert',
                '../HelloWorld'
        ], function (registerSuite, assert, HelloWorld) {

        });
        ```

3. Now that we have our test module set up, the next step is to register a **suite** and populate this suite with **test cases**. The `HelloWorld` module is very simple, so let's test its `hello` method, which should return the string "world". We register a suite with one test case that calls this method and asserts the return value.

        ```js
        define([
                'intern!object',
                'intern/chai!assert',
                '../HelloWorld'
        ], function (registerSuite, assert, HelloWorld) {

                registerSuite({
                        name: 'HelloWorld',

                        '#hello': function () {
                                // first, let's execute the method
                                var returnValue = HelloWorld.hello();
                                // now let's assert that the value is what we expect
                                assert.strictEqual(returnValue, 'world', 'HelloWorld#hello should return "world"');
                        }
                });

        });
        ```

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
                                console.log("Before this suite runs");
                        },

                        beforeEach: function () {
                                console.log("Before each test or nested suite");
                        },

                        afterEach: function () {
                                console.log("After each test or nested suite");
                        },

                        // Note: this method is called `after` when using tdd or bdd interfaces
                        teardown: function () {
                                console.log("After this suite runs");
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

2. Create a new file with the contents below at `app/tests/functional/HelloWorld.js`. Similarly to our unit test, it is a basic AMD module that requires three other modules: the object interface we are using, the assertion module, and the `HelloWorld` module we are actually testing.

        ```js
        define([
                'intern!object',
                'intern/chai!assert',
                '../../HelloWorld'
        ], function (registerSuite, assert, HelloWorld) {

        });
        ```

3. Functional tests mimic user interaction, so they need an html page to load into the remote browser environment. Because the actual test JavaScript code isn't exposed to this remote browser environment at all, this html page <u>should include script tags for all necessary JavaScript</u>. Let's create a very basic HTML page that we'll test; place it alongside our functional test at `app/tests/function/HelloWorld.html`. It will load our HelloWorld module and hook up a button's `onclick` to `HelloWorld.alertHello()`, the method on our module that we'll be testing. Our html page will also set a global to `true` once our module is loaded; that way, our functional test can wait for that global variable to become truthy before continuing.

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

                                require(['./HelloWorld'], function (HelloWorld) {
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
                '../../HelloWorld'
        ], function (registerSuite, assert, HelloWorld) {
                registerSuite({
                        name: 'HelloWorld',

                        '#alertHello': function () {
                                // load an html page into the remote browser environment
                                this.remote
                                        .require.toUrl('./HelloWorld.html')
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
                '../../HelloWorld'
        ], function (registerSuite, assert, HelloWorld) {
                registerSuite({
                        name: 'HelloWorld',

                        '#alertHello': function () {
                                // load an html page into the remote browser environment
                                this.remote
                                        .require.toUrl('./HelloWorld.html')
                                        .waitForCondition('myModule', 5000)
                                        .elementById('ready')
                                                .click()
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

Before any tests can be run, Intern needs to be configured so it can find our tests and can know how to run them. This is done by creating an Intern configuration file. Full documentation on available configuration options can be found [here](https://github.com/theintern/intern/wiki/Configuring-Intern).


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
                        { browserName: 'internet explorer', version: '9', platform: 'Windows 2008' },
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
                        { browserName: 'internet explorer', version: '9', platform: 'Windows 2008' },
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
                functionalSuites: [ 'myPackage/tests/functional/HelloWorld' ]
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

Going Forward

We've now shown how to download and configure Intern, write tests, and run them in different environments. For a complete working copy of this project with Intern already configured and the tests already written, you can download a .zip archive [here](). Be sure to check out the full Intern [documentation](http://github.com/theintern/intern/wiki) and if you have any trouble, check out how to get Intern [support](https://github.com/theintern/intern/wiki/Support).
