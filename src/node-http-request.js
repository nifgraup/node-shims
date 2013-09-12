// taken from: https://raw.github.com/substack/http-browserify

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    'use strict';

    var Response = require('./node-http-response'),
        Stream = require('stream'),
        util = require('./node-util');

    var Request = function(xhr, params) {
        var self = this;

        Stream.call(self);
        self.writable = true;
        self.xhr = xhr;
        self.body = [];

        var uri = params.host + (params.port ? ':' + params.port : '') + (params.path || '/');
        xhr.open(
            params.method || 'GET', (params.scheme || 'http') + '://' + uri,
            true
        );

        if (params.headers) {
            var keys = objectKeys(params.headers);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (!self.isSafeRequestHeader(key)) {
                    continue;
                }
                var value = params.headers[key];
                if (isArray(value)) {
                    for (var j = 0; j < value.length; j++) {
                        xhr.setRequestHeader(key, value[j]);
                    }
                } else {
                    xhr.setRequestHeader(key, value);
                }
            }
        }

        if (params.auth) {
            //basic auth
            this.setHeader('Authorization', 'Basic ' + btoa(unescape(encodeURIComponent(params.auth))));
        }

        var res = new Response();
        res.on('close', function() {
            self.emit('close');
        });

        res.on('ready', function() {
            self.emit('response', res);
        });

        xhr.onreadystatechange = function() {
            res.handle(xhr);
        };
    };
    util.inherits(Response, Stream);

    Request.prototype.setHeader = function(key, value) {
        if (isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                this.xhr.setRequestHeader(key, value[i]);
            }
        } else {
            this.xhr.setRequestHeader(key, value);
        }
    };

    Request.prototype.write = function(s) {
        this.body.push(s);
    };

    Request.prototype.destroy = function() {
        this.xhr.abort();
        this.emit('close');
    };

    Request.prototype.end = function(s) {
        if (s !== undefined) {
            this.body.push(s);
        }

        var asd = '',
            i, l;
        for (i = 0, l = this.body.length; i < l; i++) {
            asd += this.body[i].toString();
        }
        this.xhr.send(asd);
    };

    // Taken from http://dxr.mozilla.org/mozilla/mozilla-central/content/base/src/nsXMLHttpRequest.cpp.html
    Request.unsafeHeaders = [
        "accept-charset",
        "accept-encoding",
        "access-control-request-headers",
        "access-control-request-method",
        "connection",
        "content-length",
        "cookie",
        "cookie2",
        "content-transfer-encoding",
        "date",
        "expect",
        "host",
        "keep-alive",
        "origin",
        "referer",
        "te",
        "trailer",
        "transfer-encoding",
        "upgrade",
        "user-agent",
        "via"
    ];

    Request.prototype.isSafeRequestHeader = function(headerName) {
        if (!headerName) {
            return false;
        }
        return indexOf(Request.unsafeHeaders, headerName.toLowerCase()) === -1;
    };

    var objectKeys = Object.keys || function(obj) {
            var keys = [];
            for (var key in obj) {
                keys.push(key);
            }
            return keys;
        };

    var isArray = Array.isArray || function(xs) {
            return Object.prototype.toString.call(xs) === '[object Array]';
        };

    var indexOf = function(xs, x) {
        if (xs.indexOf) {
            return xs.indexOf(x);
        }
        for (var i = 0; i < xs.length; i++) {
            if (xs[i] === x) {
                return i;
            }
        }
        return -1;
    };

    return Request;
});