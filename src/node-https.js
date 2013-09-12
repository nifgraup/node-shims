if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    'use strict';

    var http = require('./node-http'),
        https = {};

    for (var key in http) {
        if (http.hasOwnProperty(key)) {
            https[key] = http[key];
        }
    }

    https.request = function(params, cb) {
        if (!params) {
            params = {};
        }

        params.scheme = 'https';
        return http.request.call(this, params, cb);
    };

    return https;
});