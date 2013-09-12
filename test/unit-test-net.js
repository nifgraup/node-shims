'use strict';

var expect = require('chai').expect,
    shims = require('../');

describe('net', function() {
    // this api is for now available exclusively in chrome...
    it('should expose net api', function() {
        expect(shims.net).to.be.ok;
        expect(shims.net.connect).to.be.ok;
        expect(shims.net.createConnection).to.be.ok;
        expect(shims.net.Socket).to.be.ok;
    });

    // TODO: add real unit tests for net!
});