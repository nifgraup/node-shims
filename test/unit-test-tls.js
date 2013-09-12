if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    'use strict';

    var expect = require('chai').expect,
        shims = require('../src/node-shims');

    describe('tls', function() {
        // this api is for now available exclusively in chrome...
        it('should expose tls api', function() {
            expect(shims.tls).to.be.ok;
            expect(shims.tls.connect).to.be.ok;
            expect(shims.tls.Socket).to.be.ok;
        });

        // TODO: add real unit tests for tls!
    });
});