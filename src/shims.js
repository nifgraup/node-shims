if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(function(require) {
    'use strict';

    var shims = {};

    // internal to this repo
    shims.util = require('./node-util');

    // external deps
    shims.Buffer = require('buffer-browserify');
    shims.net = require('net-chromeify');
    shims.tls = require('tls-chromeify');

    return shims;
});
