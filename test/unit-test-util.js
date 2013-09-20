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

    var expect = require('chai').expect,
        shims = require('../src/node-shims');

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
});