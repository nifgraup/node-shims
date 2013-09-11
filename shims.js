if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(function(require) {
    'use strict';

    var shims = {};

    shims.util = require('./src/node-util');
    shims.events = require('./src/node-events');
    shims.Stream = require('./src/node-stream');
    shims.net = require('./src/node-net');
    shims.tls = require('./src/node-tls');
    shims.Buffer = require('./src/node-buffer');
    shims.crypto = require('./src/node-crypto');

    return shims;
});
