node-shims
==========

This repository contains a basic set shims for commonly used node API for use in the browser. This repository contains a basic set shims for commonly used node API for use in the browser. Unlike [node-browser-builtins](https://github.com/alexgorbatchev/node-browser-builtins), which is used by browserify, we do not require an additional build step, since we use [amdefine](https://github.com/jrburke/amdefine) to build AMD modules that can be used in the browser [via requirejs](http://www.requirejs.org) and node environments alike.
