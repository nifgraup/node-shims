// 
// 
// For now, this API is available exclusively in Chrome packaged apps...
// 
// 

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    'use strict';

    var tls = {},
        util = require('./node-util'),
        Stream = require('./node-stream'),
        net = require('./node-net'),
        forge = require('node-forge');


    tls.connect = function(port, host, options, listener) {
        var socket;

        if (!port || !host || !options || !listener) {
            throw {
                name: 'UnsupportedApiException',
                message: 'Connect only supports impl with all 4 args!'
            };
        }

        socket = new tls.Socket();
        socket.connect(port, host, options, listener);

        return socket;
    };

    /**
     * This object is an abstraction of an TCP socket with tls encryption.
     * @param options [Object] This parameter is unsupported in this shim! Using it will result in an exception to be thrown
     * @return [tls.Socket] instance of tls.Socket
     */
    tls.Socket = function(options) {
        var self = this;

        if (options) {
            throw {
                name: 'UnsupportedApiException',
                message: 'This API is not supported in the chromify shim! Please refer to the documentation...'
            };
        }

        // create raw tcp socket without tls
        self._socket = new net.Socket();
    };
    util.inherits(tls.Socket, Stream);

    /**
     * Opens the connection for a given socket.
     * @param port [Number] the port of the server
     * @param host [String] the hostname of the server
     * @param options [Object] Conncetion options
     * @param listener [Function] the hostname of the server
     */
    tls.Socket.prototype.connect = function(port, host, options, listener) {
        var self = this,
            data, buffer;

        if (!port || !host || !options || !listener) {
            throw {
                name: 'UnsupportedApiException',
                message: 'Connect only supports impl with all 4 args!'
            };
        }

        // check if forge was included globally since browserify linking doesn't work
        if (!forge && typeof window !== 'undefined' && window.forge) {
            forge = window.forge;
        }

        self._tlsClient = forge.tls.createConnection({
            server: false,
            verify: function(connection, verified, depth, certs) {
                // TODO: verify certificate through pinning
                if (typeof connection !== 'undefined' && typeof verified !== 'undefined' && typeof depth !== 'undefined' && typeof certs !== 'undefined') {
                    return true;
                } else {
                    return false;
                }
            },
            connected: function(connection) {
                if (connection) {
                    self.emit('connect');
                } else {
                    self.emit('error');
                }
            },
            tlsDataReady: function(connection) {
                // encrypted data is ready to be sent to the server
                data = connection.tlsData.getBytes();
                self._socket.write(data, 'binary'); // encoding should be 'binary'
            },
            dataReady: function(connection) {
                // plaintext data from the server is ready
                data = connection.data.getBytes();
                buffer = new Buffer(data, 'binary');
                self.emit('data', buffer);
            },
            closed: function() {
                self.emit('end');
                self.emit('close');
            },
            error: function(connection, error) {
                self.emit('error', error);
            }
        });

        self._socket.on('connect', function() {
            self._tlsClient.handshake();
        });
        self._socket.on('data', function(data) {
            self._tlsClient.process(data.toString('binary')); // encoding should be 'binary'
        });

        self._socket.connect(port, host, listener);
    };

    /**
     * Sends data on the socket
     * @param data [Buffer or String] The data to be sent, either an instance of String or Buffer
     * @param encoding [String] This parameter is unsupported in this shim, an exception will be thrown!
     * @param callback [Function] Callback when the write was successful;
     */
    tls.Socket.prototype.write = function(data, encoding, callback) {
        var self = this;

        // convert Buffer to string
        if (data instanceof Buffer) {
            data = data.toString();
        }

        if (typeof data !== 'string' || encoding || callback) {
            throw {
                name: 'UnsupportedApiException',
                message: 'Write only support single arg invokations with String or Buffer input!'
            };
        }

        self._tlsClient.prepare(data);
    };

    /**
     * Disposes the socket. It is possible the server will still send some data. Half-closed state is not supported.
     * If called when the socket is already closed or not yet open, it will emit 'error' containing the description of the error.
     * Alias: Socket.destroy
     *
     * @param data [Buffer or String] data The data to be sent
     * @param encoding [String] encoding This parameter is unsupported in this shim, an exception will be thrown!
     */
    tls.Socket.prototype.end = tls.Socket.prototype.destroy = function(data, encoding) {
        var self = this;

        self._socket.on('end', function() {
            self.emit('end');
            self.emit('close');
        });

        self._socket.end(data, encoding);
    };

    tls.Socket.prototype.setKeepAlive = function(enable, delay) {
        var self = this;

        self._socket.setKeepAlive(enable, delay);
    };

    tls.Socket.prototype.setTimeout = function(timeout, callback) {
        var self = this;

        self._socket.setTimeout(timeout, callback);
    };

    return tls;
});