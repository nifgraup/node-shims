if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
    'use strict';

    var Stream = require('./node-stream-default');
    Stream.Readable = require('./node-stream-readable');
    Stream.Writable = require('./node-stream-writable');
    Stream.Duplex = require('./node-stream-duplex');
    Stream.Transform = require('./node-stream-transform');
    Stream.PassThrough = require('./node-stream-passthrough');
    
    return Stream;
});