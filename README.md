node-shims
==========

This repository contains a basic set shims for commonly used node API for use in the browser. Unlike [node-browser-builtins](https://github.com/alexgorbatchev/node-browser-builtins), which is used by browserify, we do not require an additional build step, since we use [amdefine](https://github.com/jrburke/amdefine) to build AMD modules that can be used in the browser [via requirejs](http://www.requirejs.org) and node environments alike.

## Usage

This repo can be used as a drop-in replacement for the node builtins:

    var shims = require('node-shims'),
        util = shims.util;

To run the tests, do the following

    > npm install && npm test

To run the tests in the browser as a chrome packaged app, do the following

    > node test-server.js

    open chrome
    go to chrome://extensions/ 
    activate developer mode
    load node-shims as unpacked extension
    watch the tests pass