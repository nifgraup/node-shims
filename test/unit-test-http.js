if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    'use strict';

    var expect = require('chai').expect,
        shims = require('../src/node-shims'),
        port = 8082;

    describe('http', function() {
        // this api is for now available exclusively in chrome...
        it('should expose http api', function() {
            expect(shims.http).to.be.ok;
            expect(shims.http.get).to.be.ok;
            expect(shims.http.request).to.be.ok;
        });

        if (typeof window === 'undefined') {
            return;
        }

        it('should GET', function(done) {
            shims.http.get({
                port: port,
                host: 'localhost',
                path: '/beep',
                headers: {
                    'ping': 'ping'
                }
            }, function(res) {
                var text = '';

                res.on('data', function(buf) {
                    text += buf.toString();
                });

                res.on('end', function() {
                    var ping = res.getHeader('ping');
                    expect(ping).to.equal('ping-pong');
                    expect(text).to.equal('RATATAZONG');
                    done();
                });
            });
        });

        it('should POST', function(done) {
            var n = 100;
            var opts = {
                port: port,
                host: 'localhost',
                path: '/plusone',
                method: 'POST'
            };

            var req = shims.http.request(opts, function(res) {
                var text = '';

                res.on('data', function(buf) {
                    text += buf.toString();
                });

                res.on('end', function() {
                    expect(parseInt(text, 10)).to.equal(n + 1);
                    done();
                });
            });

            req.write(n);
            req.end();
        });

        it('should stream', function(done) {
            shims.http.get({
                port: port,
                host: 'localhost',
                path: '/doom'
            }, function(res) {
                var text = '';
                res.on('data', function(buf) {
                    text += buf.toString();
                });

                res.on('end', function() {
                    expect(text).to.not.be.empty;
                    done();
                });
            });
        });
    });

});