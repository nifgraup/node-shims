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

    var net = {},
        util = require('./node-util'),
        Stream = require('./node-stream'),
        Buffer = require('./node-buffer').Buffer;

    /*
     * net.Socket
     */
    net.connect = net.createConnection = function() {
        var args = arguments,
            socket, listener, port, host;

        if (typeof args[0] === 'object') {
            // net.connect(options, [connectionListener])
            if (args[0].allowHalfOpen || args[0].fd || args[0].type) {
                throw {
                    name: 'UnsupportedApiException',
                    message: 'This API is not supported in the chromify shim! Please refer to the documentation...'
                };
            }
            port = args[0].port;
            host = args[0].host || '127.0.0.1';
        } else if (typeof args[0] === 'number') {
            // net.connect(port, [host], [connectListener])
            port = args[0];
            if (typeof args[1] === 'string') {
                host = args[1];
            }
        } else if (typeof args[0] === 'string') {
            // net.connect(path, [connectListener])
            throw {
                name: 'UnsupportedApiException',
                message: 'Unix named pipes are not supported in the chromify shim!'
            };
        }
        listener = (typeof args[args.length - 1] === 'function') ? args[args.length - 1] : function() {};

        // create the socket
        socket = new net.Socket();

        // as soon as the socket is done creating, it will connect
        socket.connect(port, host, listener);

        return socket;
    };

    /**
     * This object is an abstraction of a TCP socket.
     * @param options [Object] This parameter is unsupported in this shim! Using it will result in an exception to be thrown
     * @return [net.Socket] instance of net.Socket
     */
    net.Socket = function(options) {
        var self = this;

        Stream.call(self);
        if (options) {
            throw {
                name: 'UnsupportedApiException',
                message: 'This API is not supported in the chromify shim! Please refer to the documentation...'
            };
        }

        /**
         * Internal use only. Maps to chrome socket identifier.
         * @type [Number]
         */
        self._socketId = 0;
        self._timeoutId = 0;
        self._timeout = 0;

        chrome.socket.create('tcp', {}, function(createInfo) {
            self._socketId = createInfo.socketId;

            /*
             * Chrome creates sockets asynchronously, hence we have to work around this to
             * notice when the socket was created in net.connect
             */
            self.emit('_created');
        });
    };

    util.inherits(net.Socket, Stream);

    /**
     * Opens the connection for a given socket. If port and host are given, then the socket will be opened as a TCP socket, if host is omitted, localhost will be assumed.
     * This function is asynchronous. When the 'connect' event is emitted the socket is established. If there is a problem connecting, the 'connect' event will not be emitted, the 'error' event will be emitted with the exception.
     * Unix named pipes are unsupported in this shim, an exception will be thrown!
     */
    net.Socket.prototype.connect = function() {
        var self = this,
            args = arguments,
            port, host, listener, connect;

        if (typeof args[0] === 'string') {
            throw {
                name: 'UnsupportedApiException',
                message: 'Unix named pipes are not supported in the chromify shim!'
            };
        }

        port = args[0];
        host = (typeof args[1] === 'string') ? args[1] : '127.0.0.1';
        listener = (typeof args[args.length - 1] === 'function') ? args[args.length - 1] : function() {};

        self.on('connect', listener);
        self.once('connect', read.bind(self));

        connect = function() {
            chrome.socket.connect(self._socketId, host, port, function(result) {
                if (result === 0) {
                    self.emit('connect');
                } else {
                    self.emit('error', new Error('Unable to connect'));
                }
            });
        };

        if (!self._socketId) {
            self.once('_created', connect);
            return;
        }

        connect();
    };

    /**
     * Disposes the socket. It is possible the server will still send some data. Half-closed state is not supported.
     * If called when the socket is already closed or not yet open, it will emit 'error' containing the description of the error.
     * Alias: Socket.destroy
     *
     * @param data [Buffer or String] data The data to be sent
     * @param encoding [String] encoding This parameter is unsupported in this shim, an exception will be thrown!
     */
    net.Socket.prototype.end = net.Socket.prototype.destroy = function(data, encoding) {
        var self = this,
            closeSocket;

        if (self._socketId === 0) {
            return;
        }

        closeSocket = function() {
            chrome.socket.disconnect(self._socketId);
            chrome.socket.destroy(self._socketId);
            self._socketId = 0;

            self.emit('end');
            self.emit('close');
        };

        if (data || encoding) {
            self.write(data, encoding, closeSocket);
            return;
        }

        closeSocket.bind(self)();
    };

    /**
     * Sends data on the socket
     * @param data [Buffer or String] data The data to be sent, either an instance of String or Buffer
     * @param encoding [String] encoding This parameter is unsupported in this shim, an exception will be thrown!
     * @param callback [Function] callback Callback when the write was successful;
     * @return [Boolean] true Cannot comply with Node API here because Chrome is has a completely async write.
     */
    net.Socket.prototype.write = function(data, encoding, callback) {
        var self = this,
            args = arguments,
            buffer;

        if (typeof args[1] === 'string' && args[1] !== 'binary' && args[1] !== 'utf8') {
            throw {
                name: 'UnsupportedApiException',
                message: 'Unix named pipes are not supported in the chromify shim!'
            };
        }

        callback = (typeof args[args.length - 1] === 'function') ? args[args.length - 1] : function() {};

        if (typeof data === 'string') {
            buffer = stringToArrayBuffer(data);
        } else if (data instanceof Buffer) {
            buffer = bufferToArrayBuffer(data);
        }

        armSocketTimeout.bind(self)();

        chrome.socket.write(self._socketId, buffer, function(writeInfo) {
            disarmSocketTimeout.bind(self)();

            if (writeInfo.bytesWritten < 0) {
                // the socket is broken, log the error
                console.error('Could not write to socket ' + self._socketId + '. Chrome error code: ' + writeInfo.bytesWritten);
                return;
            }

            callback();
        });
    };

    var armSocketTimeout = function() {
        var self = this;

        disarmSocketTimeout.bind(self)(); //disarm pending timeouts before registering new timeouts
        if (self._timeout) {
            self._timeoutId = setTimeout(function() {
                self.emit('timeout');
                self._timeoutCallback();
            }, self._timeout);
        }
    };

    var disarmSocketTimeout = function() {
        var self = this;

        if (self._timeoutId) {
            window.clearTimeout(self._timeoutId);
            self._timeoutId = 0;
        }
    };

    /**
     * Sets the socket to timeout after timeout milliseconds of inactivity after invoking a Socket.write() on the socket. By default net.Socket do not have a timeout.
     * When an idle timeout is triggered the socket will receive a 'timeout' event but the connection will not be severed. The user must manually end() or destroy() the socket.
     * If timeout is 0, then the existing idle timeout will be cleared
     * The optional callback parameter will be added as a one time listener for the 'timeout' event.
     * @param {Number} timeout timeout in milliseconds of inactivity after invoking a Socket.write()
     * @param {Function} callback Callback to be executed in case of a timeout
     */
    net.Socket.prototype.setTimeout = function(timeout, callback) {
        var self = this;

        if (!timeout) {
            clearSocketTimeout.bind(self)();
            return;
        }

        self._timeout = timeout;
        self._timeoutCallback = (typeof callback !== 'undefined') ? callback : function() {};
    };

    var clearSocketTimeout = function() {
        var self = this;

        disarmSocketTimeout.bind(self)();
        self._timeoutId = 0;
        self._timeout = 0;
    };

    var read = function() {
        var self = this,
            buffer;

        if (self._socketId === 0) {
            // the socket is closed. omit read and stop further reads reading
            return;
        }

        chrome.socket.read(self._socketId, 65536, function(readInfo) {
            if (readInfo.resultCode < 0) {
                // the socket is broken. omit read and stop further reads
                return;
            }

            buffer = new Buffer(new Uint8Array(readInfo.data));
            self.emit('data', buffer);
            read.bind(self)();
        });
    };

    net.Socket.prototype.setKeepAlive = function(enable, delay) {
        var self = this;

        enable = (typeof enable === 'undefined') ? false : enable;
        delay = (typeof delay === 'undefined') ? 0 : delay;
        chrome.socket.setKeepAlive(self._socketId, enable, delay, function() {});
    };

    /**
     * Disables the Nagle algorithm. By default TCP connections use the Nagle algorithm, they buffer data before sending it off.
     * Setting true for noDelay will immediately fire off data each time socket.write() is called. noDelay defaults to true.
     * @param {Boolean} disableDelay If true, disables Nagle's algorithm. If false, vice-versa.
     */
    net.Socket.prototype.setNoDelay = function(disableDelay) {
        var self = this;

        chrome.socket.setNoDelay(self._socketId, disableDelay, function() {});
    };

    /*
     * Helper Methods
     */
    var stringToArrayBuffer = function(str) {
        var buffer = new ArrayBuffer(str.length);
        var uint8Array = new Uint8Array(buffer);
        for (var i = 0; i < str.length; i++) {
            uint8Array[i] = str.charCodeAt(i);
        }
        return buffer;
    };

    var bufferToArrayBuffer = function(buffer) {
        var arrBuffer = new ArrayBuffer(buffer.length);
        var uint8Array = new Uint8Array(arrBuffer);
        for (var i = 0; i < buffer.length; i++) {
            uint8Array[i] = buffer.readUInt8(i);
        }
        return arrBuffer;
    };

    return net;
});