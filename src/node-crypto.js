// credits go to https://github.com/dominictarr/crypto-browserify

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    'use strict';

    var sha = require('./node-crypto-sha'),
        sha256 = require('./node-crypto-sha256'),
        md5 = require('./node-crypto-md5'),
        o = {};

    var algorithms = {
        sha1: {
            hex: sha.hex_sha1,
            base64: sha.b64_sha1,
            binary: sha.str_sha1
        },
        sha256: {
            hex: sha256.hex_sha256,
            base64: sha256.b64_sha256,
            binary: sha256.str_sha256
        },
        md5: {
            hex: md5.hex_md5,
            base64: md5.b64_md5,
            binary: md5.bin_md5
        }
    };

    var algorithmsHmac = {
        sha1: {
            hex: sha.hex_hmac_sha1,
            base64: sha.b64_hmac_sha1,
            binary: sha.str_hmac_sha1
        },
        sha256: {
            hex: sha256.hex_hmac_sha256,
            base64: sha256.b64_hmac_sha256,
            binary: sha256.str_hmac_sha256
        },
        md5: {
            hex: md5.hex_hmac_md5,
            base64: md5.b64_hmac_md5,
            binary: md5.bin_hmac_md5
        }
    };


    o.createHash = function(alg) {
        alg = alg || 'sha1';
        if (!algorithms[alg])
            error('algorithm:', alg, 'is not yet supported');
        var s = '';
        var _alg = algorithms[alg];
        return {
            update: function(data) {
                s += data;
                return this;
            },
            digest: function(enc) {
                enc = enc || 'binary';
                var fn;
                if (!(fn = _alg[enc])) {
                    error('encoding:', enc, 'is not yet supported for algorithm', alg);
                }
                var r = fn(s);
                s = null; //not meant to use the hash after you've called digest.
                return r;
            }
        };
    };

    o.createHmac = function(alg, key) {
        if (!algorithmsHmac[alg]) {
            error('algorithm:', alg, 'is not yet supported');
        }
        if (typeof key != 'string') {
            key = key.toString('binary');
        }
        var s = '';
        var _alg = algorithmsHmac[alg];
        return {
            update: function(data) {
                s += data;
                return this;
            },
            digest: function(enc) {
                enc = enc || 'binary';
                var fn;
                if (!(fn = _alg[enc])) {
                    error('encoding:', enc, 'is not yet support for algorithm', alg);
                }
                var r = fn(key, s);
                s = null;
                return r;
            }
        };
    };

    each(['randomBytes', 'createCredentials', 'createCipher', 'createCipheriv', 'createDecipher', 'createDecipheriv', 'createSign', 'createVerify', 'createDiffieHellman', 'pbkdf2'], function(name) {
        o[name] = function() {
            error('sorry,', name, 'is not implemented yet');
        };
    });

    function error() {
        var m = [].slice.call(arguments).join(' ');
        throw new Error([m, ' ... we accept pull requests. http://github.com/dominictarr/crypto-browserify'].join('\n'));
    }

    function each(a, f) {
        for (var i in a) {
            f(a[i], i);
        }
    }

    return o;

});