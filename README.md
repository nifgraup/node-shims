node-shims [![Build Status](https://travis-ci.org/whiteout-io/node-shims.png?branch=master)](https://travis-ci.org/whiteout-io/node-shims)
==========

This repository contains a basic set shims for commonly used node API for use in the browser. Unlike [node-browser-builtins](https://github.com/alexgorbatchev/node-browser-builtins), which is used by browserify, we do not require an additional build step, since we use [amdefine](https://github.com/jrburke/amdefine) to build AMD modules that can be used in the browser [via requirejs](http://www.requirejs.org) and node environments alike.

## Usage

This repo can be used as a drop-in replacement for the node builtins:

    var shims = require('node-shims'),
        util = shims.util;

To run the tests, do the following

    > npm install
    > npm test

To run the tests in the browser as a chrome packaged app, do the following

    > npm install
    > ./build-test.sh
    > node test-server.js

    open chrome
    go to chrome://extensions/ 
    activate developer mode
    load node-shims as unpacked extension
    watch the tests pass

## License

If not stated otherwise, the contents of this library are MIT licensed.

    Copyright © 2013 Whiteout Networks GmbH.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

* node-tls uses crypto primitives from Forge by [Digital Bazaar, Inc.](https://github.com/digitalbazaar) which is licensed under BSD and GPL.
* node-buffer was originally written by [Romain Beauxis](https://github.com/toots), [see here](https://github.com/toots/buffer-browserify/), licensed under MIT/X11 license.
* node-crypto was originally published by [Paul Johnston](http://pajhome.org.uk/), [see here](http://pajhome.org.uk/crypt/md5/), licensed under BSD license.
* node-http was originally written by [James Halliday](https://github.com/substack), [see here](https://github.com/substack/http-browserify), licensed under MIT/X11 license.
* node-events, node-stream, node-string-decoder and node-url was originally written by [Joyent, Inc.](https://github.com/joyent) and other Node contributors, [see here](https://github.com/joyent/node), licensed under MIT license.
