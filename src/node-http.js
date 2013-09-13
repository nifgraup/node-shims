// taken from: https://raw.github.com/substack/http-browserify

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    'use strict';

    var http = {}, Request = require('./node-http-request');

    http.request = function(params, cb) {
        if (!params) {
            params = {};
        }
        if (!params.host) {
            params.host = window.location.host.split(':')[0];
        }
        if (!params.port) {
            params.port = window.location.port;
        }
        if (!params.scheme) {
            params.scheme = 'http';
        }

        var req = new Request(new XMLHttpRequest(), params);
        if (cb) {
            req.on('response', cb);
        }
        return req;
    };

    http.get = function(params, cb) {
        params.method = 'GET';
        var req = http.request(params, cb);
        req.end();
        return req;
    };

    http.Agent = function() {};
    http.Agent.defaultMaxSockets = 4;

    // // i won't even bother with IE for now...
    // var Xhr = (function() {
    //     if (typeof window === 'undefined') {
    //         throw new Error('no window object present');
    //     } else if (window.XMLHttpRequest) {
    //         return window.XMLHttpRequest;
    //     } else if (window.ActiveXObject) {
    //         var axs = [
    //             'Msxml2.XMLHTTP.6.0',
    //             'Msxml2.XMLHTTP.3.0',
    //             'Microsoft.XMLHTTP'
    //         ];
    //         for (var i = 0; i < axs.length; i++) {
    //             try {
    //                 var ax = new(window.ActiveXObject)(axs[i]);
    //                 return function() {
    //                     if (ax) {
    //                         var ax_ = ax;
    //                         ax = null;
    //                         return ax_;
    //                     } else {
    //                         return new(window.ActiveXObject)(axs[i]);
    //                     }
    //                 };
    //             } catch (e) {}
    //         }
    //         throw new Error('ajax not supported in this browser');
    //     } else {
    //         throw new Error('ajax not supported in this browser');
    //     }
    // })();

    return http;
});