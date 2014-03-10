// Copyright © 2013 Whiteout Networks GmbH.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

(function() {
    'use strict';

    if (typeof define !== 'undefined' && define.amd) {
        // AMD
        define(function(require) {
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
            shims.http = require('./node-http');

            return shims;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        // node.js

        var shims = module.exports;

        shims.util = require('util');
        shims.events = require('events');
        shims.Stream = require('stream');
        shims.net = require('net');
        shims.tls = require('tls');
        shims.Buffer = require('buffer');
        shims.crypto = require('crypto');
        shims.querystring = require('querystring');
        shims.url = require('url');
        shims.http = require('http');

        return shims;
    }

})();