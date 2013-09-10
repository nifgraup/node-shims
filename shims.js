if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(function(require) {
    'use strict';

    var shims = {};

    // internal to this repo
    shims.util = require('./src/node-util');
    shims.events = require('./src/node-events');
    shims.Stream = require('./src/node-stream');
    shims.net = require('./src/node-net');
    shims.tls = require('./src/node-tls');
    shims.Buffer = require('./src/node-buffer');

    // external deps
    shims.crypto = require('crypto-browserify');

    return shims;
});
