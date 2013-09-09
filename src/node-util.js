if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
    'use strict';

    var util = {};

    /**
     * Inherit the prototype methods from one constructor into another. See https://github.com/joyent/node/blob/master/lib/util.js.
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

    return util;
});