// License: MIT/X11
// original author: Romain Beauxis (https://github.com/toots)
// see: https://github.com/toots/buffer-browserify/

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    'use strict';

    var assert = require('chai').assert,
        shims = require('../src/node-shims');

    describe('buffer', function() {
        var B = shims.Buffer.Buffer;

        it('utf8 buffer to base64', function() {
            assert.equal(new B('Ձאab', 'utf8').toString('base64'), '1YHXkGFi');
        });

        it('utf8 buffer to hex', function() {
            assert.equal(new B('Ձאab', 'utf8').toString('hex'), 'd581d7906162');
        });

        it('utf8 to utf8', function() {
            assert.equal(new B('öäüõÖÄÜÕ', 'utf8').toString('utf8'), 'öäüõÖÄÜÕ');
        });

        it('ascii buffer to base64', function() {
            assert.equal(new B('123456!@#$%^', 'ascii').toString('base64'), 'MTIzNDU2IUAjJCVe');
        });

        it('ascii buffer to hex', function() {
            assert.equal(new B('123456!@#$%^', 'ascii').toString('hex'), '31323334353621402324255e');
        });

        it('base64 buffer to utf8', function() {
            assert.equal(new B('1YHXkGFi', 'base64').toString('utf8'), 'Ձאab');
        });

        it('hex buffer to utf8', function() {
            assert.equal(new B('d581d7906162', 'hex').toString('utf8'), 'Ձאab');
        });

        it('base64 buffer to ascii', function() {
            assert.equal(new B('MTIzNDU2IUAjJCVe', 'base64').toString('ascii'), '123456!@#$%^');
        });

        it('hex buffer to ascii', function() {
            assert.equal(new B('31323334353621402324255e', 'hex').toString('ascii'), '123456!@#$%^');
        });

        // it('utf8 to ascii', function() {
        //     assert.equal(new B('öäüõÖÄÜÕ', 'utf8').toString('ascii'), 'C6C$C<C5C\u0016C\u0004C\u001cC\u0015');
        // });

        it('base64 buffer to binary', function() {
            assert.equal(new B('MTIzNDU2IUAjJCVe', 'base64').toString('binary'), '123456!@#$%^');
        });

        it('hex buffer to binary', function() {
            assert.equal(new B('31323334353621402324255e', 'hex').toString('binary'), '123456!@#$%^');
        });

        it('utf8 to binary', function() {
            assert.equal(new B('asdž', 'utf8').toString('binary'), 'asdÅ¾');
        });

        it('hex of write{Uint,Int}{8,16,32}{LE,BE}', function() {
            var hex = [
                '03', '0300', '0003', '03000000', '00000003',
                'fd', 'fdff', 'fffd', 'fdffffff', 'fffffffd'
            ];
            var reads = [3, 3, 3, 3, 3, -3, -3, -3, -3, -3];
            ['UInt', 'Int'].forEach(function(x) {
                [8, 16, 32].forEach(function(y) {
                    var endianesses = (y === 8) ? [''] : ['LE', 'BE'];
                    endianesses.forEach(function(z) {
                        var v1 = new B(y / 8);
                        var writefn = 'write' + x + y + z;
                        var val = (x === 'Int') ? -3 : 3;
                        v1[writefn](val, 0);
                        assert.equal(
                            v1.toString('hex'),
                            hex.shift()
                        );
                        var readfn = 'read' + x + y + z;
                        assert.equal(
                            v1[readfn](0),
                            reads.shift()
                        );
                    });
                });
            });
        });

        it('hex of write{Uint,Int}{8,16,32}{LE,BE} with overflow', function() {
            var hex = [
                '', '03', '00', '030000', '000000',
                '', 'fd', 'ff', 'fdffff', 'ffffff'
            ];
            var reads = [
                undefined, 3, 0, 3, 0,
                undefined, 253, -256, 16777213, -256
            ];
            ['UInt', 'Int'].forEach(function(x) {
                [8, 16, 32].forEach(function(y) {
                    var endianesses = (y === 8) ? [''] : ['LE', 'BE'];
                    endianesses.forEach(function(z) {
                        var v1 = new B(y / 8 - 1);
                        var next = new B(4);
                        next.writeUInt32BE(0, 0);
                        var writefn = 'write' + x + y + z;
                        var val = (x === 'Int') ? -3 : 3;
                        v1[writefn](val, 0, true);
                        assert.equal(
                            v1.toString('hex'),
                            hex.shift()
                        );
                        // check that nothing leaked to next buffer.
                        assert.equal(next.readUInt32BE(0), 0);
                        // check that no bytes are read from next buffer.
                        next.writeInt32BE(~0, 0);
                        var readfn = 'read' + x + y + z;
                        assert.equal(
                            v1[readfn](0, true),
                            reads.shift()
                        );
                    });
                });
            });
        });

        it('concat() a varying number of buffers', function() {
            var zero = [];
            var one = [new B('asdf')];
            var long = [];
            for (var i = 0; i < 10; i++) {
                long.push(new B('asdf'));
            }

            var flatZero = B.concat(zero);
            var flatOne = B.concat(one);
            var flatLong = B.concat(long);
            var flatLongLen = B.concat(long, 40);

            assert.equal(flatZero.length, 0);
            assert.equal(flatOne.toString(), 'asdf');
            assert.equal(flatOne, one[0]);
            assert.equal(flatLong.toString(), (new Array(10 + 1).join('asdf')));
            assert.equal(flatLongLen.toString(), (new Array(10 + 1).join('asdf')));
        });

        it('buffer from buffer', function() {
            var b1 = new B('asdf');
            var b2 = new B(b1);
            assert.equal(b1.toString('hex'), b2.toString('hex'));
        });

        it('fill', function() {
            var b = new B(10);
            b.fill(2);
            assert.equal(b.toString('hex'), '02020202020202020202');
        });

        it('copy() empty buffer with sourceEnd=0', function() {
            var source = new B([42]);
            var destination = new B([43]);
            source.copy(destination, 0, 0, 0);
            assert.equal(destination.readUInt8(0), 43);
        });

        it('base64 ignore whitespace', function() {
            var text = '\n   YW9ldQ==  ';
            var buf = new B(text, 'base64');
            assert.equal(buf.toString(), 'aoeu');
        });

        it('buffer.slice sets indexes', function() {
            assert.equal((new B('hallo')).slice(0, 5).toString(), 'hallo');
        });

        it('buffer.slice out of range', function() {
            assert.equal((new B('hallo')).slice(0, 10).toString(), 'hallo');
            assert.equal((new B('hallo')).slice(10, 2).toString(), '');
        });

        it('base64 strings without padding', function() {
            assert.equal((new B('YW9ldQ', 'base64').toString()), 'aoeu');
        });

        it('indexes from a string', function() {
            var buf = new B('abc');
            assert.equal(buf[0], 97);
            assert.equal(buf[1], 98);
            assert.equal(buf[2], 99);
        });

        it('indexes from an array', function() {
            var buf = new B([97, 98, 99]);
            assert.equal(buf[0], 97);
            assert.equal(buf[1], 98);
            assert.equal(buf[2], 99);
        });

        it('set then modify indexes from an array', function() {
            var buf = new B([97, 98, 99]);
            assert.equal(buf[2], 99);
            assert.equal(buf.toString(), 'abc');

            buf[2] += 10;
            assert.equal(buf[2], 109);
            assert.equal(buf.toString(), 'abm');
        });

        it('Buffer.isEncoding', function() {
            assert.equal(B.isEncoding('HEX'), true);
            assert.equal(B.isEncoding('hex'), true);
            assert.equal(B.isEncoding('bad'), false);
        });

    });
});