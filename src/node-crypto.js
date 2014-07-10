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

if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}

define(function(require) {
    'use strict';

    var Buffer = require('./node-buffer').Buffer,
        forge = require('node-forge')({
            disableNativeCode: true
        }),
        o = {};

    o.createHash = function(algorithm) {
        if (typeof algorithm === 'undefined') {
            throw new Error('must give hashtype string as argument');
        }

        var hash = {};

        switch (algorithm) {
        case 'sha1':
            hash._md = forge.md.sha1.create();
            break;
        case 'sha256':
            hash._md = forge.md.sha256.create();
            break;
        case 'md5':
            hash._md = forge.md.md5.create();
            break;
        }

        hash.update = function(data, encoding) {
            if (this._md === null) {
                throw new Error('hash update fails! you are not meant to use the hash after you have called digest.');
            } else if (!(typeof data === 'string' || data instanceof Buffer)) {
                throw new Error('hash update fails! data is not a string or a buffer.');
            }

            encoding = encoding || 'binary';

            var content = data instanceof Buffer ? data.toString(encoding) : data;
            this._md.update(content);

            return this;
        };

        hash.digest = function(encoding) {
            if (this._md === null) {
                throw new Error('not initialized! you are not meant to use the hash after you have called digest.');
            }

            var digest = this._md.digest();
            this._md = null;

            switch(encoding) {
            case 'hex':
                return digest.toHex();
            case 'binary':
                return digest.getBytes();
            case 'base64':
                return forge.util.encode64(digest.getBytes());
            }
        };

        return hash;
    };

    o.createHmac = function(algorithm, key) {
        if (typeof algorithm === 'undefined') {
            throw new Error('must give hashtype string as argument!');
        }

        if (typeof key !== 'string') {
            throw new Error('key must be a string!');
        }

        var hmac = {
            _hmac: forge.hmac.create()
        };

        hmac._hmac.start(algorithm, key);

        hmac.update = function(data) {
            if (this._hmac === null) {
                throw new Error('hash update fails! you are not meant to use the hash after you have called digest.');
            } else if (!(typeof data === 'string' || data instanceof Buffer)) {
                throw new Error('hash update fails! data is not a string or a buffer.');
            }

            var content = data instanceof Buffer ? data.toString('binary') : data.toString();
            this._hmac.update(content);
            return this;
        };

        hmac.digest = function(encoding) {
            if (this._hmac === null) {
                throw new Error('not initialized! you are not meant to use the hash after you have called digest.');
            }
            
            var digest = this._hmac.digest();
            this._hmac = null;

            switch(encoding) {
            case 'hex':
                return digest.toHex();
            case 'binary':
                return digest.getBytes();
            case 'base64':
                return forge.util.encode64(digest.getBytes());
            }
        };

        return hmac;
    };

    return o;
});