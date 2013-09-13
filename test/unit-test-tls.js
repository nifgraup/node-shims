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
            expect(shims.tls.Socket).to.be.ok;
        });

        if (typeof window === 'undefined') {
            return;
        }

        it('should connect the socket', function(done) {
            var connection = shims.tls.connect(443, 'google.com', {}, function() {});
            connection.on('connect', done);
        });

        describe("tls live connection", function() {
            var connection;

            beforeEach(function(done) {
                connection = shims.tls.connect(443, 'google.com', {}, function() {});
                connection.on('connect', done);
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