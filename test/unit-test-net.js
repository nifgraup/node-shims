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
        shims = require('../src/node-shims'),
        echoPort = 6789,
        writeOnlyPort = 6790;

    describe('net', function() {
        // this api is for now available exclusively in chrome...
        it('should expose net api', function() {
            expect(shims.net).to.be.ok;
            expect(shims.net.connect).to.be.ok;
            expect(shims.net.createConnection).to.be.ok;
            expect(shims.net.Socket).to.be.ok;
        });

        if (typeof window === 'undefined') {
            // no need to test the native implementation here...
            return;
        }

        describe('net.connect', function() {
            it('should connect with options', function(done) {
                var socket = shims.net.connect({
                    port: echoPort
                }, function() {
                    expect(socket).to.be.ok;
                    done();
                });
            });

            it('should connect with echoPort', function(done) {
                var socket = shims.net.connect(echoPort, function() {
                    expect(socket).to.be.ok;
                    done();
                });
            });

            it('should not connect with unix sockets', function() {
                if (typeof window === 'undefined') {
                    // node api supports this, but the shims don't
                    return;
                }

                var errorThrown = false;
                try {
                    shims.net.connect('/foobar');
                } catch (e) {
                    errorThrown = true;
                } finally {
                    expect(errorThrown).to.be.true;
                }
            });
        });

        describe('net.Socket', function() {

            describe('new net.Socket', function() {
                it('should create socket', function() {
                    var socket = new shims.net.Socket();
                    expect(socket).to.be.ok;
                });

                it('should not create socket with options', function() {
                    if (typeof window === 'undefined') {
                        // node api supports this, but the shims don't
                        return;
                    }

                    var errorThrown = false,
                        socket;
                    try {
                        socket = new shims.net.Socket({});
                    } catch (e) {
                        errorThrown = true;
                    } finally {
                        expect(errorThrown).to.be.true;
                        expect(socket).to.not.be.ok;
                    }
                });
            });

            describe('net.Socket.connect', function() {
                var socket;

                beforeEach(function() {
                    socket = new shims.net.Socket();
                });

                it('should connect', function(done) {
                    socket.connect(echoPort, function() {
                        expect(socket).to.be.ok;
                        done();
                    });
                });
                it('should not connect with unix sockets', function() {
                    if (typeof window === 'undefined') {
                        // node api supports this, but the shims don't
                        return;
                    }

                    var errorThrown = false;
                    try {
                        socket.connect('/foobar');
                    } catch (e) {
                        errorThrown = true;
                    } finally {
                        expect(errorThrown).to.be.true;
                    }
                });
            });

            describe('net.Socket.end and net.Socket.destroy', function() {
                var socket;

                beforeEach(function(done) {
                    socket = new shims.net.Socket();
                    socket.connect(writeOnlyPort, done);
                });

                it('should emit end', function(done) {
                    socket.on('end', done);
                    socket.end();
                });
                it('should emit close', function(done) {
                    socket.on('end', done);
                    socket.end();
                });
                it('should ignore multiple end calls', function(done) {
                    socket.on('close', function() {
                        socket.end();
                        socket.end();
                        socket.end();
                        done();
                    });
                    socket.end();
                });
                it('should write the data to echo server and then close', function(done) {
                    socket.on('end', done);
                    socket.end('ai;vbev;iaebv');
                });
            });

            describe('net.Socket.write and net.Socket.read to echo server', function() {
                var socket;

                beforeEach(function(done) {
                    socket = new shims.net.Socket();
                    socket.connect(echoPort, done);
                });

                afterEach(function() {
                    socket.end();
                });

                it('should write string to echo server and read string from socket', function(done) {
                    var expectedString = 'aflhqebgqiebvql';

                    socket.on('data', function(buffer) {
                        expect(buffer.toString()).to.equal(expectedString);
                        done();
                    });
                    socket.write(expectedString);
                });

                it('should write buffer to echo server and read buffer from socket', function(done) {
                    var expectedBuf = new shims.Buffer.Buffer('R0lGODlhEAAQAPe4AAAAADLw/z7//zT5/y/i/y3b/yvO/zX//ye7/zj//yKk/6quvSW0/wV5/wN4/y/k/y/f/yvV/yOwwSOk/yrI/yrK/wdy/yvQ/y7a/ySwwx2+/26AmizR/yHH/zHs/zLu/w1BS7O1wC3b+S9++BSy/y/j5La3wqaquia4/xK9/xig/x2h/w2F/ynG/BCM/xl4eCnF/xeN/yGa/y3Z3y7X/ySwuYaYsyKi/yrIyCW2tCnG/zb//xG1/yW2/xGC/6OlsSSs/xaB/5ifsRaV/zP8/ySp/7S2wj6Y6hal/wx35C/h/xJUUyzY6oCauye/zK2vvDSt/y/j8S3T/zx52go0Nld/rkJ82RmP/0x8yDN1zZWcqiWx/yvS/yW204OSqy/j/22AmzPz/yi+/zDh/yrHyi7e/zT//zn//8PF0Df//wx4/xat/wht/yLF/yCl/xGu/w9JRyi//zDp/02V1BWg/yvP/y/a2rCxvZ+jsQyB/wt39C3U/xeG/ya1/zqQ6CGv/wdm+g6h/x+S/yfJ/yZ3+niRvghp1jHx/yC//yzN/yW1/yG0/wckJQEEAiSu3zP1/8PEzy/g/7q8xizX/wJx/y3T0xhxcTLx/5WdrQuG/1qCs6mrtxZ+/xJaZDL0/5KXqry9yHydvkmX2SCcxyzV/zLz/3OOv62tuLe5xi3S0BGm/zz//ynA/ye9/wyI/wRz/wpu/ijE6UL//6+yvye3/ye2/0x0oRnD/+Hk8wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAALgALAAAAAAQABAAAAj+AHEJFIjKhqYqXowMXIjrzhFVaxb9oeMqyymGQt5oMADhgRIOCFS8+jTwCY9BYw4wkZBBxAcYbihtEgilQyRPVBqlggOgEwExQwjhWpBCyqMZAAAIKJG0yyQgDk6EuoUhQAIclWRZAsAoQIQ+LEyJalMggJkzAuwAeHGgFJdaV6bMQUTDw4Adq5bkEDCAQB0GMaw0IZGIQIABCcikISKngI4ieQrNChSH1JcwUWo4uVTGAAoZDRbg8oOE1YVDIJLG2oNggo8RAk1kWkGLQotRjioousHHQoiBP5K4ULClVQ8FgtSwwcMQlC1DeoJwggUIiySGAyFp2QAGExqGAQEAOw==', 'base64');

                    socket.on('data', function(buffer) {
                        expect(buffer.toString()).to.equal(expectedBuf.toString());
                        done();
                    });
                    socket.write(expectedBuf);
                });

                it('should call back after writing', function(done) {
                    socket.write('aflhqebgqiebvql', done);
                });

                it('should throw an error on encoding', function() {
                    var errorThrown = false;
                    try {
                        socket.write('leeeeeeroy', 'jenkins');
                    } catch (e) {
                        errorThrown = true;
                    } finally {
                        expect(errorThrown).to.be.true;
                    }
                });
            });
        });
    });
});