if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    'use strict';

    var expect = require('chai').expect,
        shims = require('../src/node-shims');

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
});