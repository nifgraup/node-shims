'use strict';

var expect = require('chai').expect,
    shims = require('../');

describe('http', function() {
    // this api is for now available exclusively in chrome...
    it('should expose http api', function() {
        expect(shims.http).to.be.ok;
    });

    // TODO: add real unit tests for http!
});

describe('https', function() {
    // this api is for now available exclusively in chrome...
    it('should expose https api', function() {
        expect(shims.https).to.be.ok;
    });

    // TODO: add real unit tests for https!
});