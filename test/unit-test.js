'use strict';

var expect = require('chai').expect,
    shims = require('../');

describe('node shims', function() {

    describe('util', function() {
        it('should inherit', function() {
            var A = function() {};
            var B = function() {
                A.call(this);
            };
            shims.util.inherits(B, A);

            var b = new B();
            expect(b).to.be.instanceof(A);
            expect(b).to.be.instanceof(B);
        });

        it('should be an array', function() {
            expect(shims.util.isArray([])).to.be.true;
            expect(shims.util.isArray(1)).to.be.false;
        });

        it('should be a boolean', function() {
            expect(shims.util.isBoolean(true)).to.be.true;
            expect(shims.util.isBoolean(1)).to.be.false;
        });

        it('should be null', function() {
            expect(shims.util.isNull(null)).to.be.true;
            expect(shims.util.isNull(1)).to.be.false;
        });

        it('should be null or undefined', function() {
            expect(shims.util.isNullOrUndefined(null)).to.be.true;
            expect(shims.util.isNullOrUndefined(undefined)).to.be.true;
            expect(shims.util.isNullOrUndefined(1)).to.be.false;
        });

        it('should be a number', function() {
            expect(shims.util.isNumber(1)).to.be.true;
            expect(shims.util.isNumber('s')).to.be.false;
        });

        it('should be a string', function() {
            expect(shims.util.isString('asd')).to.be.true;
            expect(shims.util.isString(1)).to.be.false;
        });

        it('should be undefined', function() {
            expect(shims.util.isUndefined(undefined)).to.be.true;
            expect(shims.util.isUndefined(1)).to.be.false;
        });

        it('should be an object', function() {
            expect(shims.util.isObject({})).to.be.true;
            expect(shims.util.isObject(1)).to.be.false;
        });

        it('should be a function', function() {
            expect(shims.util.isFunction(function() {})).to.be.true;
            expect(shims.util.isFunction(1)).to.be.false;
        });

        it('should be a primitive', function() {
            expect(shims.util.isPrimitive(1)).to.be.true;
            expect(shims.util.isPrimitive({})).to.be.false;
        });
    });

    describe('stream', function() {
        it('should expose stream api', function() {
            expect(shims.Stream).to.be.ok;
            expect(shims.Stream.Duplex).to.be.ok;
            expect(shims.Stream.Readable).to.be.ok;
            expect(shims.Stream.Writable).to.be.ok;
            expect(shims.Stream.Transform).to.be.ok;
            expect(shims.Stream.PassThrough).to.be.ok;
        });

        // TODO: add real unit tests for stream!
    });

    /*
     * this is only to check if the external deps are present. 
     * they have their own repos and should not be tested here.
     */
    describe('buffer', function() {
        it('should exist', function() {
            expect(shims.Buffer).to.exist;
            expect(shims.Buffer.Buffer).to.exist;
            expect(shims.Buffer.SlowBuffer).to.exist;
        });
    });

    describe('net', function() {
        it('should exist', function() {
            expect(shims.net).to.exist;
            expect(shims.net.Socket).to.exist;
        });
    });

    describe('tls', function() {
        it('should exist', function() {
            expect(shims.tls).to.exist;
            expect(shims.tls.Socket).to.exist;
        });
    });

    describe('crypte', function() {
        it('should exist', function() {
            expect(shims.crypto).to.exist;
            expect(shims.crypto.createHmac).to.exist;
            expect(shims.crypto.createHash).to.exist;
        });
    });

});