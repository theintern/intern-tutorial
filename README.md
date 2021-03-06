# Intern tutorial

[![Intern](https://theintern.io/images/intern-v4.svg)](https://github.com/theintern/intern/)

In this tutorial we will walk through how to set up Intern and how to write
tests and run tests. This repository contains a basic Hello World demo
“application” that we’ll be using as an example to build on. In order to
complete this tutorial, you will need the following:

- A Bourne-compatible shell, like bash or zsh (or knowledge of how to execute
  equivalent commands in your environment)
- [Git](https://git-scm.com/)
- [Node 6.0.0+](https://nodejs.org/) and
  [npm 5.3.0+](https://www.npmjs.com/package/npm)
- [Java 1.8+](https://java.com/) (for running a local Selenium server)
- A
  [free BrowserStack Automate trial account](https://www.browserstack.com/users/sign_up)

Once you have all the necessary prerequisites, download the demo application by
cloning this repository and installing the dependencies:

```bash
git clone https://github.com/theintern/intern-tutorial.git
cd intern-tutorial
npm install
```

The application itself consists of a basic HTML page and a single “app” package
written in TypeScript. Several `npm` scripts have been provided to simplify the
building and testing processes:

- `npm run compile` - runs the TypeScript compiler once
- `npm run compile:watch` - runs the TypeScript compiler in watch mode (runs the
  compiler, waits for changes, and re-compiles when changes are detected)
- `npm run copy` - copies any assets from `src` to `_dist/src`
- `npm run copy:watch` - watches for changes to assets in `src` and copies files
  to `_src/dist` when changes are detected
- `npm run build` - runs `npm run compile` and `npm run copy` in parallel
- `npm run build:watch` - runs `npm run compile:watch` and `npm run copy:watch`
  in parallel
- `npm test` - builds the application and runs Intern

_In order for the demo application to work properly during the tutorial, make
sure that you access it using a real web server. Like most applications, it will
not work from a `file:` URL due to cross-protocol browser security
restrictions._

## What can Intern test?

Intern can test all sorts of things:

- Plain JavaScript code, in any module format (or no module format!)
- Web pages generated by server-side languages like Java, PHP, or Ruby
- Native or hybrid iOS, Android, and Firefox OS applications

Intern is minimally prescriptive and enforces only a basic set of best practices
designed to ensure your tests stay maintainable over time. Its extensible
architecture allows you to write custom test interfaces, executors, and
reporters to influence how your tests run and easily integrate with your
existing coding environment.

Unlike most other testing systems, Intern also supports two different types of
testing: unit testing and functional testing. **Unit testing** works by
executing code directly and inspecting the result, such as calling a function
and then checking that it returns an expected value. **Functional testing**
works by mimicking user interaction with a browser by issuing commands through a
WebDriver server (an executable that lets testing tools interact with a
browser).

This is a powerful notion: Intern allows us to test _code_ with regular unit
tests, but also allows us to test _functionality_ by mimicking user interaction
with the browser.

## Step 1: Download Intern

Intern is distributed as an [npm package](https://npmjs.org/package/intern) so
it can be easily added as a dependency to any JavaScript project. We’ll install
Intern using `npm install --save-dev` so that npm adds it automatically as a
development dependency to application’s
[package.json](https://npmjs.org/doc/json.html):

```bash
npm install --save-dev intern
```

We also need to tell TypeScript to load Intern’s and SystemJS’s type definitions
by default. This ensures that typings for global variables provided by Intern
and SystemJS will be available in tests. Add the following to the
`"compilerOptions"` object in `tsconfig.json`:

```json
    "types": [
        "intern",
        "systemjs"
    ]
```

That’s it! Installation is complete.

## Step 2: Configure Intern

Intern needs to be configured so it can find and run our tests. This is done by
creating an Intern configuration file named `intern.json` at the root of our
project:

```json
{
  "browser": {
    "loader": {
      "script": "systemjs"
    },
    "plugins": {
      "script": "_dist/src/system.config.js",
      "useLoader": true
    }
  },
  "environments": ["node", { "browserName": "chrome" }]
}
```

This configuration tells Intern that, in the browser, we want to use SystemJS to
load modules, and that we want to load a plugin to configure SystemJS. The
plugin needs to have access to the SystemJS loader, so we set the "useLoader"
flag to true. Without the "useLoader" flag the plugin would be loaded _before_
the external loader, meaning it wouldn’t have access to SystemJS.

The configuration also tells Intern that, in addition to running our unit tests
in Node.js, we want to run our tests in Chrome. You can find more information
about possible configuration options in
[the Configuration section of the Intern documentation](https://theintern.io/docs.html#Intern/4/docs/docs%2Fconfiguration.md/properties).

We’ll be doing a little more configuration shortly when we start adding tests,
but for now, we already have a complete configuration. You can verify that
everything is working by running Intern:

```bash
npm test
```

It should output:

```
No unit test coverage for node
node: 0 passed, 0 failed
```

Now that we’ve configured Intern, we need to create a test module which will
contain the actual tests for our application.

## Step 3: Write a unit test

There are a variety of syntaxes used to write unit tests, and Intern comes with
built-in support for several of them, including
[TDD](https://github.com/theintern/intern/blob/master/docs/writing_tests.md#tdd),
[BDD](https://github.com/theintern/intern/blob/master/docs/writing_tests.md#bdd),
and
[object](https://github.com/theintern/intern/blob/master/docs/writing_tests.md#object).
In this tutorial, we will use the **TDD** syntax, but this is an individual
preference. All of these interfaces support the same basic functionality, so
pick whichever one you think is the clearest when you start writing your own
tests!

Before getting any further into writing tests, we need to take a moment to
review the terminology that is used by Intern:

- An **assertion** is a function call that verifies that a variable contains (or
  a function returns) an expected value (e.g. `assert.isTrue(someVariable)`)
- A **test interface** is a programming interface for registering tests with
  Intern
- A **test case** (or, just **test**) is a function that makes calls to
  application code and makes assertions about what it should have done
- A **test suite** is a collection of tests (and, optionally, sub-suites) that
  are related to each other
- A **test module** is a JavaScript module that contains test suites

These pieces can be visualized in a hierarchy, like this:

- test module
  - test suite
    - test suite
      - test case
        - ...
      - ...
    - test case
      - assertion
      - assertion
      - ...
    - ...
  - test suite
  - ...
- test module
- ...

Test modules are typically split up so that there’s one test module for each
corresponding code module being tested. First, create a new subdirectory for
storing all of the unit tests:

```bash
mkdir -p tests/unit
```

We have one code module in our demo app (`app/hello`), so we’ll create a new
unit test module at `intern-tutorial/tests/unit/hello.ts` and put the following
boilerplate into it:

```ts
const { suite, test } = intern.getPlugin('interface.tdd');
const { assert } = intern.getPlugin('chai');

import { greet } from '../../src/app/hello';
```

This bit of code loads the `suite` and `test` functions from the TDD test
interface, the `assert` function of [Chai](http://chaijs.com/api/assert/), and
the `greet` function we want to test.

Now that the basics of our `hello` test module are in place, the next step is to
use `suite` to register a test suite and `test` to register a test case for our
app. We’ll start by testing the `greet` function.

Looking at the source code for `app/hello`, we can see that when `greet` is
called it will return the string `"Hello, world!"` if no name is passed, or
`"Hello, <name>!"` if a name is passed. We need to make sure we test both of
these code branches. If we’ve done it right, our test code will end up looking
something like this:

```ts
const { suite, test } = intern.getPlugin('interface.tdd');
const { assert } = intern.getPlugin('chai');

import { greet } from '../../src/app/hello';

suite('hello', () => {
  test('greet', () => {
    assert.strictEqual(
      greet('Murray'),
      'Hello, Murray!',
      'greet should return a greeting for the person named in the first argument'
    );
    assert.strictEqual(
      greet(),
      'Hello, world!',
      'greet with no arguments should return a greeting to "world"'
    );
  });
});
```

_Note: This example test uses `assert.strictEqual`, which is just one of many
available assertions. For a complete list of available methods, see the
[Chai documentation](http://chaijs.com/api/)._

In this test module, we’ve registered a new suite for our `hello` module and
named it “hello”, written a new test case for the `greet` method and named it
“greet”, and added two assertions: one where we call `greet` and pass an
argument, and one where we call `greet` without any argument. If either of these
assertions fails, they will throw an error and the test case will be considered
failed at that point.

Each of our assertions also contains a message that describes what logic the
assertion is actually checking. Similar to good code comments that describe
_why_ a piece of code exists, these messages are used to describe the intent of
the code being checked rather than simply describing the assertion. For
instance, “Calling greet('Murray') should return "Hello, Murray!"” would be a
bad assertion message because it just describes what the assertion is doing,
rather than describing the desired outcome. With the message we’ve used in the
code above, if the `greet` function were changed in the future to return
`"Hi, <name>!"` instead, it would be clear that the test itself needed to be
updated because the code still fulfills the described business logic. Similarly,
if the method were changed to return `"You suck, <name>!"` instead, it would
then be clear that the application code was updated incorrectly.

Now that we’ve created our first test module, we need to update the TypeScript
config to actually compile the test. Add a glob for the tests directory to the
“include“ property in `tsconfig.json`:

```json
"include": [
  "src/**/*.ts",
  "tests/**/*.ts"
]
```

Note how the suite file accesses `getPlugin` on a global `intern` variable. This
variable will be created when Intern is loaded, but the typings won't know about
it without an additional config update. Add a `types` property to the
`compilerOptions` section of the `tsconfig.json`:

```json
"compilerOptions": {
  "types": ["intern"]
}
```

This property tells the Typescript compiler to load Intern's types implicitly
when compiling the tests, which ensures that Typescript knows about the global
`intern` variable.

The final step when writing a new test module is to add the **compiled**
module‘s path to our configuration file so that it is loaded when we run Intern.
To do this, add a `suites` property to the top-level object of `intern.json`
with the string `"_dist/tests/unit/hello.js"`:

```json
"suites": "_dist/tests/unit/hello.js",
```

Now if we go back and run the same `npm test` command from the end of Step 2, we
should see our tests running (and passing) in both Node.js and Chrome:

```
Listening on localhost:9000 (ws 9001)
Tunnel started
✓ node - hello - greet (0.001s)
No unit test coverage for node
node: 1 passed, 0 failed

‣ Created remote session chrome 59.0.3071.115 on MAC (714dfe2b-ebc0-4249-b235-a3756d004fc8)
✓ chrome 59.0.3071.115 on MAC - hello - greet (0.001s)
No unit test coverage for chrome 59.0.3071.115 on MAC
chrome 59.0.3071.115 on MAC: 1 passed, 0 failed
TOTAL: tested 2 platforms, 2 passed, 0 failed
```

These same tests can be run directly within a Web browser by running
`npm test serveOnly` and navigating to
`http://localhost:9000/__intern/index.html`.

## Step 4: Write a functional test

Functional tests are different from unit tests in that they _mimic user
interaction_ by sending commands to browsers using an external server instead of
running directly in the environment being tested. This enables us to generate
real DOM events and test UI interactions just like a real user, with no
JavaScript security sandbox limitations. As well as enabling testing of
sandbox-restricted actions like file uploads, functional testing also allows us
to test interactions that span multiple pages and interactions with third party
sites (like OAuth authorization flows). Our demo app contains an HTML file with
a basic form that should display a greeting using `app/hello.greet`. For this
tutorial, we’ll simulate a user filling out a form and clicking a button to
submit it in order to verify this page works as expected.

Intern’s functional testing is based on the
[standard WebDriver protocol](http://www.w3.org/TR/webdriver/) and comes with
built-in support for remote testing services as well as
[self-hosted WebDriver servers](http://docs.seleniumhq.org/docs/03_webdriver.jsp#running-standalone-selenium-server-for-use-with-remotedrivers).
The rest of this tutorial assumes you are using BrowserStack.

To get started, create a new directory to hold the functional tests (in order to
differentiate them from our normal unit tests) at
`intern-tutorial/tests/functional`:

```bash
mkdir -p tests/functional
```

Next, create a test module at `intern-tutorial/tests/functional/index.ts` with
the following boilerplate:

```ts
const { suite, test, before } = intern.getPlugin('interface.tdd');
const { assert } = intern.getPlugin('chai');

suite('index', () => {
  before(() => {});

  test('greeting form', () => {});
});
```

Just like the unit test we created before, we’re using the object test interface
and assert-style assertions. However, instead of loading any application code
directly, we’ll be using WebDriver to load our page in the browser.

To facilitate functional testing, an object is passed to every lifecycle and
test function which has a `remote` property. The `remote` property exposes an
object that provides an interface for interacting with the remote browser
environment. Using the methods on `remote`, we can load a Web page, interact
with it, and retrieve data from it to assert that our actions caused the
expected result. Since all calls to the remote browser are asynchronous, all
methods of the `remote` object return promises. This allows us to either chain
commands (like jQuery) and retrieve results using standard promises-style `then`
calls or use async/await to write synchronous-looking tests. When we make a
call, it is enqueued and executed once all the previous commands have completed.
If this description is a little confusing, don’t worry — it should be clearer
once we look at some code.

Looking at the HTML page at `index.html`, we can see that it consists of a
simple form with a single input. It loads `app/main` which sets up our event
listeners and adds a CSS class of “loaded” to the body element. We want to make
sure this form works properly by testing interaction like a real user: focusing
the input, typing a string, and clicking submit. We can then verify that the
greeting was properly updated. Once finished, this test will look something like
this:

```ts
const { suite, test, before } = intern.getPlugin('interface.tdd');
const { assert } = intern.getPlugin('chai');

suite('index', () => {
  before(({ remote }) => {
    return remote
      .get('_dist/src/index.html')
      .setFindTimeout(5000)
      .findDisplayedByCssSelector('body.loaded');
  });

  test('greeting form', ({ remote }) => {
    return remote
      .findById('nameField')
      .click()
      .type('Elaine')
      .end()

      .findByCssSelector('#loginForm input[type=submit]')
      .click()
      .end()

      .findById('greeting')
      .getVisibleText()
      .then(text => {
        assert.strictEqual(
          text,
          'Hello, Elaine!',
          'Greeting should be displayed when the form is submitted'
        );
      });
  });
});
```

It could also be written using async/await:

```ts
const { suite, test, before } = intern.getPlugin('interface.tdd');
const { assert } = intern.getPlugin('chai');

suite('index', () => {
  before(async ({ remote }) => {
    await remote.get('_dist/src/index.html');
    await remote.setFindTimeout(5000);
    await remote.findDisplayedByCssSelector('body.loaded');
  });

  test('greeting form', async ({ remote }) => {
    const name = await remote.findById('nameField');
    await name.click();
    await name.type('Elaine');

    const button = await remote.findByCssSelector(
      '#loginForm input[type=submit]'
    );
    await button.click();

    const greeting = await remote.findById('greeting');
    const text = await greeting.getVisibleText();

    assert.strictEqual(
      text,
      'Hello, Elaine!',
      'Greeting should be displayed when the form is submitted'
    );
  });
});
```

_Note: To learn which methods are available on the `remote` object, check
Leadfoot’s
[Command object documentation](https://theintern.io/leadfoot/module-leadfoot_Command.html)._

In the code above, calling `remote.get` loads the HTML page we want to test into
the browser. Then, we wait for the “loaded” CSS class to appear on the body, for
a maximum of five seconds. Once this element exists, we go through the process
of finding, clicking, and typing into elements. Finally, we retrieve the text
from the greeting element and check it to confirm that it matches what was
expected.

Now that this test module is complete, the final step is to add it to our Intern
configuration in the special `functionalSuites` top-level property:

```json
"functionalSuites": "_dist/tests/functional/index.js",
```

Now if we go back and run the same `npm test` command from the end of Steps 2
and 3, we will see our unit tests running in both Node.js and Chrome, our
functional tests running in Chrome, and all of them passing:

```
Listening on localhost:9000 (ws 9001)
Tunnel started
✓ node - hello - greet (0.001s)
No unit test coverage for node
node: 1 passed, 0 failed

‣ Created remote session chrome 59.0.3071.115 on MAC (f1bffddb-f4ae-46ba-8633-2357f925939d)
✓ chrome 59.0.3071.115 on MAC - hello - greet (0.001s)
✓ chrome 59.0.3071.115 on MAC - index - greeting form (0.236s)
No unit test coverage for chrome 59.0.3071.115 on MAC
chrome 59.0.3071.115 on MAC: 2 passed, 0 failed
TOTAL: tested 2 platforms, 3 passed, 0 failed
```

## Step 5: Code coverage

At this point, all of our unit and functional tests are passing. The next step
is enabling code coverage. Intern is unique in that it not only runs unit and
functional tests in one command, but it can also gather coverage information for
both types of tests as well! To enable code coverage, set the `"coverage"`
property of the top-level object in `intern.json` to a glob pattern (or an array
of glob patterns) of compiled files to cover:

```json
"coverage": [
    "_dist/src/**/*.js",
    "!_dist/src/system.config.js"
]
```

This will tell Intern to get coverage information for all JavaScript files in
`_dist/src` except for `_dist/src/system.config.js`. Now when we run `npm test`,
the output will tell us the coverage we have:

```
Listening on localhost:9000 (ws 9001)
Tunnel started
✓ node - hello - greet (0.001s)

----------|----------|----------|----------|----------|----------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------|----------|----------|----------|----------|----------------|
All files |      100 |      100 |      100 |      100 |                |
 hello.ts |      100 |      100 |      100 |      100 |                |
----------|----------|----------|----------|----------|----------------|
node: 1 passed, 0 failed

‣ Created remote session chrome 59.0.3071.115 on MAC (dbc5f5cc-2f89-43e1-b062-7df608334314)
✓ chrome 59.0.3071.115 on MAC - hello - greet (0.001s)
✓ chrome 59.0.3071.115 on MAC - index - greeting form (0.231s)

----------|----------|----------|----------|----------|----------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------|----------|----------|----------|----------|----------------|
All files |      100 |      100 |      100 |      100 |                |
 hello.ts |      100 |      100 |      100 |      100 |                |
----------|----------|----------|----------|----------|----------------|
chrome 59.0.3071.115 on MAC: 2 passed, 0 failed

Total coverage
----------|----------|----------|----------|----------|----------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------|----------|----------|----------|----------|----------------|
All files |      100 |      100 |      100 |      100 |                |
 hello.ts |      100 |      100 |      100 |      100 |                |
 main.ts  |      100 |      100 |      100 |      100 |                |
----------|----------|----------|----------|----------|----------------|
TOTAL: tested 2 platforms, 3 passed, 0 failed
```

One thing to note: Intern (via Istanbul) automatically remaps the coverage
information back to our source files using source maps. We can see that the unit
tests only report coverage for `hello.ts`, but our functional test - since it
exercises the entire application - reports coverage for `main.ts` as well.

Intern also allows us to output an HTML coverage report to see graphically which
lines have been exercised by our tests. To enable this feature, add the
`htmlcoverage` reporter in the top-level object of `intern.json`:

```json
"reporters+": "htmlcoverage"
```

As you can see, instead of using `"reporters"`, we have used `"reporters+"`.
This will add `"htmlcoverage"` to the default array of reporters instead of
overriding it. When we run `npm test` we’ll still see the same output as before
in the console, and we will also have an HTML report in
`intern-tutorial/coverage/`.

## Step 6: Remote testing

At this point, all our tests are written and running in Node.js and Chrome. The
only thing that’s left to do is to run all our tests on all the platforms we
want to support. We’ll do this by setting up a `browserstack` configuration
within `intern.json` to run our tests with BrowserStack:

```json
"reporters+": "htmlcoverage",
"configs": {
    "browserstack": {
        "tunnel": "browserstack",
        "maxConcurrency": 2,
        "capabilities": {
            "idle-timeout": 60,
            "fixSessionCapabilities": "no-detect"
        },
        "environments": [
            { "browser": "internet explorer", "version": [ "10", "11" ] },
            { "browser": "firefox", "version": [ "latest" ], "platform": [ "WINDOWS", "MAC" ] },
            { "browser": "chrome", "version": [ "latest" ], "platform": [ "WINDOWS", "MAC" ] },
            { "browser": "safari", "version": [ "9", "10" ] }
        ]
    }
}
```

This sets up a child configuration named `browserstack` with our environments
and tunnel. Intern will use this information to communicate with our remote
testing service (in this case, BrowserStack) to run our unit and functional
tests in all of the browsers we specified in our `environments` array, reporting
back test results and coverage for each browser. Since we are using
BrowserStack, we will need to provide our credentials and our child
configuration name:

```bash
BROWSERSTACK_USERNAME=<your username> BROWSERSTACK_ACCESS_KEY=<your access key> npm test config=@browserstack
```

You can also specify your username and access key on the `tunnelOptions` object
in your Intern configuration, using the `username` and `apiKey` keys, if you
don’t want to put them on the command line:

```json
"tunnel": "browserstack",
"tunnelOptions": {
  "username": "<your username>",
  "apiKey": "<your access key>"
},
"maxConcurrency": 2,
```

However, keep in mind that keeping this information in a configuration file can
expose your username and access key to others if the file is checked into a
public repository.

If everything was done correctly, you should see the results of the test run
being output to your terminal:

```
Listening on localhost:9000 (ws 9001)
Tunnel started
✓ node - hello - greet (0.001s)

----------|----------|----------|----------|----------|----------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------|----------|----------|----------|----------|----------------|
All files |      100 |      100 |      100 |      100 |                |
 hello.ts |      100 |      100 |      100 |      100 |                |
----------|----------|----------|----------|----------|----------------|
node: 1 passed, 0 failed

‣ Created remote session internet explorer 10 on WINDOWS (2ebde91d356d8dd326514caddc3e600a0aeb58f6)
✓ internet explorer 10 on WINDOWS - hello - greet (0s)
✓ internet explorer 10 on WINDOWS - index - greeting form (1.832s)

----------|----------|----------|----------|----------|----------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------|----------|----------|----------|----------|----------------|
All files |      100 |      100 |      100 |      100 |                |
 hello.ts |      100 |      100 |      100 |      100 |                |
----------|----------|----------|----------|----------|----------------|
internet explorer 10 on WINDOWS: 2 passed, 0 failed

‣ Created remote session internet explorer 11 on WINDOWS (f8ab8d0a315172af0337b9fcd91ae3457098a906)

‣ Created remote session firefox on windows_nt 6.3 (1cb854da49290a1818d8147244c069504c51775b)
✓ internet explorer 11 on WINDOWS - hello - greet (0s)
✓ firefox on windows_nt 6.3 - hello - greet (0.001s)
✓ internet explorer 11 on WINDOWS - index - greeting form (3.618s)

----------|----------|----------|----------|----------|----------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------|----------|----------|----------|----------|----------------|
All files |      100 |      100 |      100 |      100 |                |
 hello.ts |      100 |      100 |      100 |      100 |                |
----------|----------|----------|----------|----------|----------------|

...

Total coverage
----------|----------|----------|----------|----------|----------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------|----------|----------|----------|----------|----------------|
All files |      100 |      100 |      100 |      100 |                |
 hello.ts |      100 |      100 |      100 |      100 |                |
 main.ts  |      100 |      100 |      100 |      100 |                |
----------|----------|----------|----------|----------|----------------|
TOTAL: tested 9 platforms, 17 passed, 0 failed
```

When you start testing your actual application, it’s a good idea to use Intern
in conjunction with a continuous integration service like
[Travis CI](https://travis-ci.org) or [Jenkins](https://jenkins.io) so you know
that the code in your repository is passing its tests at all times, and so you
can monitor your code coverage figures. Instructions are available in the
[continuous integration section](https://github.com/theintern/intern/blob/master/docs/ci.md)
of the documentation for running Intern with Jenkins, Travis CI, and TeamCity.

If you’d like a complete working copy of this project with Intern already
configured and the tests already written,
[download the completed-tutorial branch](https://github.com/theintern/intern-tutorial/archive/completed.zip).
If you have any questions, please
[let us know](https://github.com/theintern/intern/blob/master/docs/help.md).
Pull requests to enhance this tutorial are also accepted and appreciated!

Once you’re ready to dive in and start writing tests for your own application,
take a look at
[Intern’s project documentation](https://github.com/theintern/intern#more-information).
It contains references and documentation for all of the features of Intern.

Happy testing!
