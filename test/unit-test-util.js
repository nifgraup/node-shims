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
    });
});