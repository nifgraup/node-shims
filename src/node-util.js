// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
    'use strict';

    var util = {};

    /**
     * Inherit the prototype methods from one constructor into another
     *
     * @param {function} ctor Constructor function which needs to inherit the prototype.
     * @param {function} superCtor Constructor function to inherit prototype from.
     */
    util.inherits = function(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
    };

    // NOTE: These type checking functions intentionally don't use `instanceof`
    // because it is fragile and can be easily faked with `Object.create()`.

    function isArray(ar) {
        return Array.isArray(ar);
    }
    util.isArray = isArray;

    function isBoolean(arg) {
        return typeof arg === 'boolean';
    }
    util.isBoolean = isBoolean;

    function isNull(arg) {
        return arg === null;
    }
    util.isNull = isNull;

    function isNullOrUndefined(arg) {
        return arg == null;
    }
    util.isNullOrUndefined = isNullOrUndefined;

    function isNumber(arg) {
        return typeof arg === 'number';
    }
    util.isNumber = isNumber;

    function isString(arg) {
        return typeof arg === 'string';
    }
    util.isString = isString;

    function isUndefined(arg) {
        return typeof arg === 'undefined';
    }
    util.isUndefined = isUndefined;

    function isPrimitive(arg) {
        return arg === null ||
            typeof arg === 'boolean' ||
            typeof arg === 'number' ||
            typeof arg === 'string' ||
            typeof arg === 'undefined';
    }
    util.isPrimitive = isPrimitive;


    return util;
});