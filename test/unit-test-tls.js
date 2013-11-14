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

    describe('tls', function() {
        // this api is for now available exclusively in chrome...
        it('should expose tls api', function() {
            expect(shims.tls).to.be.ok;
            expect(shims.tls.connect).to.be.ok;
        });

        if (typeof window === 'undefined') {
            // no need to test the native implementation here...
            return;
        }

        it('should connect the socket', function(done) {
            var connection = shims.tls.connect(443, 'google.com', {}, function() {});
            connection.on('connect', done);
        });

        describe("tls live connection with certificate pinning", function() {
            var connection;

            beforeEach(function(done) {
                // get server certificate PEM for pinning
                var xhr = new XMLHttpRequest();
                xhr.open('GET', '/test/res/Google_Internet_Authority_G2.pem');
                xhr.onload = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        initConnection(xhr.responseText);
                    }
                };
                xhr.send();

                function initConnection(pem) {
                    var options = {
                        ca: [pem]
                    };

                    connection = shims.tls.connect(443, 'google.com', options, function() {});
                    connection.on('connect', done);
                }
            });

            it('should setKeepAlive', function() {
                connection.setKeepAlive(true);
            });

            it('should setTimeout', function() {
                connection.setTimeout(10000, function() {});
            });

            it('should write and read from connection', function(done) {
                var html = '',
                    str;

                connection.on('data', function(chunk) {
                    html += chunk.toString('utf8');
                    str = html.toLowerCase();
                    if (str.indexOf('</html>') !== -1) {
                        expect(html).to.be.ok;
                        done();
                    }
                });

                connection.write('GET / HTTP/1.0\r\n\r\n');
            });

            it('should end tls socket', function() {
                connection.end();
            });

        });
    });
});