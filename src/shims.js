if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(function(require) {
    'use strict';

    var shims = {};

    // internal to this repo
    shims.util = require('./node-util');
    shims.events = require('./node-events');
    shims.Stream = require('./node-stream');
    shims.net = require('./node-net');
    shims.tls = require('./node-tls');
    shims.Buffer = require('./node-buffer');

    // external deps
    shims.crypto = require('crypto-browserify');

    return shims;
});
