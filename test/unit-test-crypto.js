if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    'use strict';

    var assert = require('chai').assert,
        shims = require('../src/node-shims');

    describe('crypto', function() {
        var B = shims.Buffer.Buffer,
            expectedValue = {};

        expectedValue['sha1-hash-binary'] = new B('qvTGHdzF6KLavt4PO0gs2a6pQ00=', 'base64').toString('binary');
        expectedValue['sha1-hash-hex'] = 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d';
        expectedValue['sha1-hash-base64'] = 'qvTGHdzF6KLavt4PO0gs2a6pQ00=';
        expectedValue['sha1-with-binary'] = '4fa10dda29053b237b5d9703151c852c61e6d8d7';
        expectedValue['sha1-empty-string'] = 'da39a3ee5e6b4b0d3255bfef95601890afd80709';
        expectedValue['sha256-hash-binary'] = new B('LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=', 'base64').toString('binary');
        expectedValue['sha256-hash-hex'] = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';
        expectedValue['sha256-hash-base64'] = 'LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=';
        expectedValue['sha256-with-binary'] = '424ff84246aabc1560a2881b9664108dfe26784c762d930c4ff396c085f4183b';
        expectedValue['sha256-empty-string'] = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        expectedValue['md5-hash-binary'] = new B('XUFAKrxLKna5cZ2REBfFkg==', 'base64').toString('binary');
        expectedValue['md5-hash-hex'] = '5d41402abc4b2a76b9719d911017c592';
        expectedValue['md5-hash-base64'] = 'XUFAKrxLKna5cZ2REBfFkg==';
        expectedValue['md5-with-binary'] = '27549c8ff29ca52f7957f89c328dbb6d';
        expectedValue['md5-empty-string'] = 'd41d8cd98f00b204e9800998ecf8427e';
        expectedValue['sha1-hmac-binary'] = new B('URIFXAX5RPhXVe/FzYlw4ZTp9Fs=', 'base64').toString('binary');
        expectedValue['sha1-hmac-hex'] = '5112055c05f944f85755efc5cd8970e194e9f45b';
        expectedValue['sha1-hmac-base64'] = 'URIFXAX5RPhXVe/FzYlw4ZTp9Fs=';
        expectedValue['sha256-hmac-binary'] = new B('iKqz7ejTrflNJquQ07r9SiCDBww7zOnAFO4EpEOEfAs=', 'base64').toString('binary');
        expectedValue['sha256-hmac-hex'] = '88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b';
        expectedValue['sha256-hmac-base64'] = 'iKqz7ejTrflNJquQ07r9SiCDBww7zOnAFO4EpEOEfAs=';
        expectedValue['md5-hmac-binary'] = new B('ut5jhjxh7QsxZYBuzWrO/A==', 'base64').toString('binary');
        expectedValue['md5-hmac-hex'] = 'bade63863c61ed0b3165806ecd6acefc';
        expectedValue['md5-hmac-base64'] = 'ut5jhjxh7QsxZYBuzWrO/A==';

        it('sha1 hash using binary', function() {
            var actual = shims.crypto.createHash('sha1').update('hello', 'utf-8').digest('binary');
            var exp = expectedValue['sha1-hash-binary'];
            assert.equal(actual, exp);
        });

        it('sha1 hash using binary with buffer', function() {
            var actual = shims.crypto.createHash('sha1').update(new B('hello', 'utf-8')).digest('binary');
            var exp = expectedValue['sha1-hash-binary'];
            assert.equal(actual, exp);
        });

        it('sha1 hmac using binary', function() {
            var actual = shims.crypto.createHmac('sha1', 'secret').update('hello', 'utf-8').digest('binary');
            var exp = expectedValue['sha1-hmac-binary'];
            assert.equal(actual, exp);
        });

        it('sha1 hmac using binary with buffer', function() {
            var actual = shims.crypto.createHmac('sha1', 'secret').update(new B('hello', 'utf-8')).digest('binary');
            var exp = expectedValue['sha1-hmac-binary'];
            assert.equal(actual, exp);
        });

        it('sha1 hash using hex', function() {
            var actual = shims.crypto.createHash('sha1').update('hello', 'utf-8').digest('hex');
            var exp = expectedValue['sha1-hash-hex'];
            assert.equal(actual, exp);
        });

        it('sha1 hmac using hex', function() {
            var actual = shims.crypto.createHmac('sha1', 'secret').update('hello', 'utf-8').digest('hex');
            var exp = expectedValue['sha1-hmac-hex'];
            assert.equal(actual, exp);
        });

        it('sha1 hash using base64', function() {
            var actual = shims.crypto.createHash('sha1').update('hello', 'utf-8').digest('base64');
            var exp = expectedValue['sha1-hash-base64'];
            assert.equal(actual, exp);
        });

        it('sha1 hmac using base64', function() {
            var actual = shims.crypto.createHmac('sha1', 'secret').update('hello', 'utf-8').digest('base64');
            var exp = expectedValue['sha1-hmac-base64'];
            assert.equal(actual, exp);
        });
        it('sha1 with empty string', function() {
            var actual = shims.crypto.createHash('sha1').update('', 'utf-8').digest('hex');
            var exp = expectedValue['sha1-empty-string'];
            assert.equal(actual, exp);
        });

        it('sha1 with raw binary', function() {
            var seed = 'hello';
            for (var i = 0; i < 1000; i++) {
                seed = shims.crypto.createHash('sha1').update(seed).digest('binary');
            }
            var actual = shims.crypto.createHash('sha1').update(seed).digest('hex');
            var exp = expectedValue['sha1-with-binary'];
            assert.equal(actual, exp);
        });

        it('sha256 hash using binary', function() {
            var actual = shims.crypto.createHash('sha256').update('hello', 'utf-8').digest('binary');
            var exp = expectedValue['sha256-hash-binary'];
            assert.equal(actual, exp);
        });

        it('sha256 hmac using binary', function() {
            var actual = shims.crypto.createHmac('sha256', 'secret').update('hello', 'utf-8').digest('binary');
            var exp = expectedValue['sha256-hmac-binary'];
            assert.equal(actual, exp);
        });

        it('sha256 hash using hex', function() {
            var actual = shims.crypto.createHash('sha256').update('hello', 'utf-8').digest('hex');
            var exp = expectedValue['sha256-hash-hex'];
            assert.equal(actual, exp);
        });

        it('sha256 hmac using hex', function() {
            var actual = shims.crypto.createHmac('sha256', 'secret').update('hello', 'utf-8').digest('hex');
            var exp = expectedValue['sha256-hmac-hex'];
            assert.equal(actual, exp);
        });

        it('sha256 hash using base64', function() {
            var actual = shims.crypto.createHash('sha256').update('hello', 'utf-8').digest('base64');
            var exp = expectedValue['sha256-hash-base64'];
            assert.equal(actual, exp);
        });

        it('sha256 hmac using base64', function() {
            var actual = shims.crypto.createHmac('sha256', 'secret').update('hello', 'utf-8').digest('base64');
            var exp = expectedValue['sha256-hmac-base64'];
            assert.equal(actual, exp);
        });

        it('sha256 with empty string', function() {
            var actual = shims.crypto.createHash('sha256').update('', 'utf-8').digest('hex');
            var exp = expectedValue['sha256-empty-string'];
            assert.equal(actual, exp);
        });

        it('sha256 with raw binary', function() {
            var seed = 'hello';
            for (var i = 0; i < 1000; i++) {
                seed = shims.crypto.createHash('sha256').update(seed).digest('binary');
            }
            var actual = shims.crypto.createHash('sha256').update(seed).digest('hex');
            var exp = expectedValue['sha256-with-binary'];
            assert.equal(actual, exp);
        });

        it('md5 hash using binary', function() {
            var actual = shims.crypto.createHash('md5').update('hello', 'utf-8').digest('binary');
            var exp = expectedValue['md5-hash-binary'];
            assert.equal(actual, exp);
        });

        it('md5 hmac using binary', function() {
            var actual = shims.crypto.createHmac('md5', 'secret').update('hello', 'utf-8').digest('binary');
            var exp = expectedValue['md5-hmac-binary'];
            assert.equal(actual, exp);
        });

        it('md5 hash using hex', function() {
            var actual = shims.crypto.createHash('md5').update('hello', 'utf-8').digest('hex');
            var exp = expectedValue['md5-hash-hex'];
            assert.equal(actual, exp);
        });

        it('md5 hmac using hex', function() {
            var actual = shims.crypto.createHmac('md5', 'secret').update('hello', 'utf-8').digest('hex');
            var exp = expectedValue['md5-hmac-hex'];
            assert.equal(actual, exp);
        });

        it('md5 hash using base64', function() {
            var actual = shims.crypto.createHash('md5').update('hello', 'utf-8').digest('base64');
            var exp = expectedValue['md5-hash-base64'];
            assert.equal(actual, exp);
        });

        it('md5 hmac using base64', function() {
            var actual = shims.crypto.createHmac('md5', 'secret').update('hello', 'utf-8').digest('base64');
            var exp = expectedValue['md5-hmac-base64'];
            assert.equal(actual, exp);
        });

        it('md5 with empty string', function() {
            var actual = shims.crypto.createHash('md5').update('', 'utf-8').digest('hex');
            var exp = expectedValue['md5-empty-string'];
            assert.equal(actual, exp);
        });

        it('md5 with raw binary', function() {
            var seed = 'hello';
            for (var i = 0; i < 1000; i++) {
                seed = shims.crypto.createHash('md5').update(seed).digest('binary');
            }
            var actual = shims.crypto.createHash('md5').update(seed).digest('hex');
            var exp = expectedValue['md5-with-binary'];
            assert.equal(actual, exp);
        });
    });

});