if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(function(require) {
    'use strict';

    var shims = {};

    // internal to this repo
    shims.util = require('./node-util');
    shims.events = require('./node-events');

    // external deps
    shims.Buffer = require('buffer-browserify');
    shims.net = require('net-chromeify');
    shims.tls = require('tls-chromeify');
    shims.crypto = require('crypto-browserify');

    return shims;
});
