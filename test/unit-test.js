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
    });

    // this is only to check if the external deps are present. they have their own repos and should not be tested here.
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

});