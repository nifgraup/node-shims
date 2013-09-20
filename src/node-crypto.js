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
    var define = require('amdefine')(module);
}

define(function(require) {
    'use strict';

    var Buffer = require('./node-buffer').Buffer,
        sha1 = require('./node-crypto-sha'),
        sha256 = require('./node-crypto-sha256'),
        md5 = require('./node-crypto-md5'),
        o = {};

    o.createHash = function(algorithm) {
        if (typeof algorithm === 'undefined') {
            throw new Error('must give hashtype string as argument');
        }

        var hash = {
            _algorithm: algorithm,
            _hashContent: ''
        };

        hash.update = function(data, encoding) {
            if (this._hashContent === null) {
                throw new Error('hash update fails! you are not meant to use the hash after you have called digest.');
            } else if (!(typeof data === 'string' || data instanceof Buffer)) {
                throw new Error('hash update fails! data is not a string or a buffer.');
            }

            encoding = encoding || 'binary';

            this._hashContent += data instanceof Buffer ? data.toString(encoding) : data.toString();
            return this;
        };

        hash.digest = function(encoding) {
            if (this._hashContent === null) {
                throw new Error('not initialized! you are not meant to use the hash after you have called digest.');
            }
            
            var value;

            encoding = encoding || 'binary';
            value = selectAlgorithm({
                type: 'hash',
                algorithm: this._algorithm,
                encoding: encoding
            })(this._hashContent);
            this._hashContent = null;
            return value;
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
            _algorithm: algorithm,
            _key: key,
            _hashContent: ''
        };

        hmac.update = function(data) {
            if (this._hashContent === null) {
                throw new Error('hash update fails! you are not meant to use the hash after you have called digest.');
            } else if (!(typeof data === 'string' || data instanceof Buffer)) {
                throw new Error('hash update fails! data is not a string or a buffer.');
            }

            this._hashContent += data instanceof Buffer ? data.toString('binary') : data.toString();
            return this;
        };

        hmac.digest = function(encoding) {
            if (this._hashContent === null) {
                throw new Error('not initialized! you are not meant to use the hash after you have called digest.');
            }
            
            var value;

            encoding = encoding || 'binary';
            value = selectAlgorithm({
                type: 'hmac',
                algorithm: this._algorithm,
                encoding: encoding
            })(this._key, this._hashContent);
            this._hashContent = null;
            return value;
        };

        return hmac;
    };

    function selectAlgorithm(options) {
        var alg;

        if (options.type !== 'hash' && options.type !== 'hmac') {
            throw new Error('type not supported');
        } else if (options.encoding !== 'hex' && options.encoding !== 'binary' && options.encoding !== 'base64') {
            throw new Error('type not supported');
        }


        switch (options.algorithm) {
        case 'sha1':
            alg = sha1;
            break;
        case 'sha256':
            alg = sha256;
            break;
        case 'md5':
            alg = md5;
            break;
        default:
            throw new Error('algorithm not supported');

        }

        return alg[options.encoding + '_' + options.type];
    }

    return o;
});