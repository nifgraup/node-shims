if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(function(require) {
    'use strict';

    var shims = {};

    shims.util = require('./node-util');
    shims.events = require('./node-events');
    shims.Stream = require('./node-stream');
    shims.net = require('./node-net');
    shims.tls = require('./node-tls');
    shims.Buffer = require('./node-buffer');
    shims.crypto = require('./node-crypto');
    shims.querystring = require('./node-querystring');
    shims.url = require('./node-url');

    return shims;
});
