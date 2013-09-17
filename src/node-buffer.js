// License: MIT/X11
// original author: Romain Beauxis (https://github.com/toots)
// see: https://github.com/toots/buffer-browserify/

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    'use strict';

    var o = {};

    function Buffer(subject, encoding, offset) {
        var args = arguments,
            type, i;

        if (!(this instanceof Buffer)) {
            return new Buffer(arguments);
        }

        this.parent = this;
        this.offset = 0;

        // Work-around: node's base64 implementation allows for non-padded strings while base64-js does not..
        if (encoding == "base64" && typeof subject == "string") {
            subject = stringtrim(subject);
            while (subject.length % 4 !== 0) {
                subject = subject + "=";
            }
        }

        // Are we slicing?
        if (typeof offset === 'number') {
            this.length = coerce(encoding);
            // slicing works, with limitations (no parent tracking/update) check https://github.com/toots/buffer-browserify/issues/19
            for (i = 0; i < this.length; i++) {
                this[i] = subject.get(i + offset);
            }
        } else {
            // Find the length
            type = typeof subject;
            switch (type) {
                case 'number':
                    this.length = coerce(subject);
                    break;

                case 'string':
                    this.length = Buffer.byteLength(subject, encoding);
                    break;

                case 'object': // Assume object is an array
                    this.length = coerce(subject.length);
                    break;

                default:
                    throw new Error('First argument needs to be a number, array or string.');
            }

            // Treat array-ish objects as a byte array.
            if (isArrayIsh(subject)) {
                for (i = 0; i < this.length; i++) {
                    if (subject instanceof Buffer) {
                        this[i] = subject.readUInt8(i);
                    } else {
                        this[i] = subject[i];
                    }
                }
            } else if (type == 'string') {
                // We are a string
                this.length = this.write(subject, 0, encoding);
            } else if (type === 'number') {
                for (i = 0; i < this.length; i++) {
                    this[i] = 0;
                }
            }
        }
    }

    o.Buffer = Buffer;
    o.SlowBuffer = Buffer;
    o.INSPECT_MAX_BYTES = 50;

    Buffer.poolSize = 8192;

    Buffer.prototype.get = function get(i) {
        if (i < 0 || i >= this.length) {
            throw new Error('oob');
        }
        return this[i];
    };

    Buffer.prototype.set = function set(i, v) {
        if (i < 0 || i >= this.length) {
            throw new Error('oob');
        }
        this[i] = v;
        return this[i];
    };

    Buffer.byteLength = function(str, encoding) {
        switch (encoding || "utf8") {
            case 'hex':
                return str.length / 2;

            case 'utf8':
            case 'utf-8':
                return utf8ToBytes(str).length;

            case 'ascii':
            case 'binary':
                return str.length;

            case 'base64':
                return base64ToBytes(str).length;

            default:
                throw new Error('Unknown encoding');
        }
    };

    Buffer.prototype.utf8Write = function(string, offset, length) {
        return blitBuffer(utf8ToBytes(string), this, offset, length);
    };

    Buffer.prototype.binaryWrite = Buffer.prototype.asciiWrite = function(string, offset, length) {
        return blitBuffer(asciiToBytes(string), this, offset, length);
    };

    Buffer.prototype.base64Write = function(string, offset, length) {
        return blitBuffer(base64ToBytes(string), this, offset, length);
    };

    Buffer.prototype.base64Slice = function(start, end) {
        var bytes = Array.prototype.slice.apply(this, arguments);
        return uint8ToBase64(bytes);
    };

    Buffer.prototype.utf8Slice = function() {
        var bytes = Array.prototype.slice.apply(this, arguments);
        var res = "";
        var tmp = "";
        var i = 0;
        while (i < bytes.length) {
            if (bytes[i] <= 0x7F) {
                res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
                tmp = "";
            } else
                tmp += "%" + bytes[i].toString(16);

            i++;
        }

        return res + decodeUtf8Char(tmp);
    };

    Buffer.prototype.binarySlice = Buffer.prototype.asciiSlice = function() {
        var bytes = Array.prototype.slice.apply(this, arguments);
        var ret = "";
        for (var i = 0; i < bytes.length; i++)
            ret += String.fromCharCode(bytes[i]);
        return ret;
    };

    Buffer.prototype.inspect = function() {
        var out = [],
            len = this.length;
        for (var i = 0; i < len; i++) {
            out[i] = toHex(this[i]);
            if (i == exports.INSPECT_MAX_BYTES) {
                out[i + 1] = '...';
                break;
            }
        }
        return '<Buffer ' + out.join(' ') + '>';
    };


    Buffer.prototype.hexSlice = function(start, end) {
        var len = this.length;

        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;

        var out = '';
        for (var i = start; i < end; i++) {
            out += toHex(this[i]);
        }
        return out;
    };


    Buffer.prototype.toString = function(encoding, start, end) {
        encoding = String(encoding || 'utf8').toLowerCase();
        start = +start || 0;
        if (typeof end == 'undefined') end = this.length;

        // Fastpath empty strings
        if (+end == start) {
            return '';
        }

        switch (encoding) {
            case 'hex':
                return this.hexSlice(start, end);

            case 'utf8':
            case 'utf-8':
                return this.utf8Slice(start, end);

            case 'ascii':
                return this.asciiSlice(start, end);

            case 'binary':
                return this.binarySlice(start, end);

            case 'base64':
                return this.base64Slice(start, end);

            case 'ucs2':
            case 'ucs-2':
                return this.ucs2Slice(start, end);

            default:
                throw new Error('Unknown encoding');
        }
    };


    Buffer.prototype.hexWrite = function(string, offset, length) {
        offset = +offset || 0;
        var remaining = this.length - offset;
        if (!length) {
            length = remaining;
        } else {
            length = +length;
            if (length > remaining) {
                length = remaining;
            }
        }

        // must be an even number of digits
        var strLen = string.length;
        if (strLen % 2) {
            throw new Error('Invalid hex string');
        }
        if (length > strLen / 2) {
            length = strLen / 2;
        }
        for (var i = 0; i < length; i++) {
            var byte = parseInt(string.substr(i * 2, 2), 16);
            if (isNaN(byte)) throw new Error('Invalid hex string');
            this[offset + i] = byte;
        }
        Buffer._charsWritten = i * 2;
        return i;
    };


    Buffer.prototype.write = function(string, offset, length, encoding) {
        // Support both (string, offset, length, encoding)
        // and the legacy (string, encoding, offset, length)
        if (isFinite(offset)) {
            if (!isFinite(length)) {
                encoding = length;
                length = undefined;
            }
        } else { // legacy
            var swap = encoding;
            encoding = offset;
            offset = length;
            length = swap;
        }

        offset = +offset || 0;
        var remaining = this.length - offset;
        if (!length) {
            length = remaining;
        } else {
            length = +length;
            if (length > remaining) {
                length = remaining;
            }
        }
        encoding = String(encoding || 'utf8').toLowerCase();

        switch (encoding) {
            case 'hex':
                return this.hexWrite(string, offset, length);

            case 'utf8':
            case 'utf-8':
                return this.utf8Write(string, offset, length);

            case 'ascii':
                return this.asciiWrite(string, offset, length);

            case 'binary':
                return this.binaryWrite(string, offset, length);

            case 'base64':
                return this.base64Write(string, offset, length);

            case 'ucs2':
            case 'ucs-2':
                return this.ucs2Write(string, offset, length);

            default:
                throw new Error('Unknown encoding');
        }
    };

    // slice(start, end)

    function clamp(index, len, defaultValue) {
        if (typeof index !== 'number') return defaultValue;
        index = ~~index; // Coerce to integer.
        if (index >= len) return len;
        if (index >= 0) return index;
        index += len;
        if (index >= 0) return index;
        return 0;
    }

    Buffer.prototype.slice = function(start, end) {
        var len = this.length;
        start = clamp(start, len, 0);
        end = clamp(end, len, len);
        return new Buffer(this, end - start, +start);
    };

    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function(target, target_start, start, end) {
        var source = this,
            i, j;

        start = start || 0;
        if (typeof end === 'undefined' || isNaN(end)) {
            end = this.length;
        }
        target_start = target_start || 0;

        if (end < start) throw new Error('sourceEnd < sourceStart');

        // Copy 0 bytes; we're done
        if (end === start) return 0;
        if (target.length === 0 || source.length === 0) return 0;

        if (target_start < 0 || target_start >= target.length) {
            throw new Error('targetStart out of bounds');
        }

        if (start < 0 || start >= source.length) {
            throw new Error('sourceStart out of bounds');
        }

        if (end < 0 || end > source.length) {
            throw new Error('sourceEnd out of bounds');
        }

        // Are we oob?
        if (end > this.length) {
            end = this.length;
        }

        if (target.length - target_start < end - start) {
            end = target.length - target_start + start;
        }

        var temp = [];
        for (i = start; i < end; i++) {
            assert(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
            temp.push(this[i]);
        }

        for (j = target_start; j < target_start + temp.length; j++) {
            target[j] = temp[j - target_start];
        }
    };

    // fill(value, start=0, end=buffer.length)
    Buffer.prototype.fill = function fill(value, start, end) {
        value = value || 0;
        start = start || 0;
        end = end || this.length;

        if (typeof value === 'string') {
            value = value.charCodeAt(0);
        }
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('value is not a number');
        }

        if (end < start) throw new Error('end < start');

        // Fill 0 bytes; we're done
        if (end === start) return 0;
        if (this.length === 0) return 0;

        if (start < 0 || start >= this.length) {
            throw new Error('start out of bounds');
        }

        if (end < 0 || end > this.length) {
            throw new Error('end out of bounds');
        }

        for (var i = start; i < end; i++) {
            this[i] = value;
        }
    };

    // Static methods
    Buffer.isBuffer = function isBuffer(b) {
        return b instanceof Buffer || b instanceof Buffer;
    };

    Buffer.concat = function(list, totalLength) {
        var i, j;

        if (!isArray(list)) {
            throw new Error("Usage: Buffer.concat(list, [totalLength]) list should be an Array.");
        }

        if (list.length === 0) {
            return new Buffer(0);
        } else if (list.length === 1) {
            return list[0];
        }

        if (typeof totalLength !== 'number') {
            totalLength = 0;
            for (i = 0; i < list.length; i++) {
                var buf = list[i];
                totalLength += buf.length;
            }
        }

        var buffer = new Buffer(totalLength);
        var pos = 0;
        for (j = 0; j < list.length; j++) {
            var buf = list[j];
            buf.copy(buffer, pos);
            pos += buf.length;
        }
        return buffer;
    };

    Buffer.isEncoding = function(encoding) {
        switch ((encoding + '').toLowerCase()) {
            case 'hex':
            case 'utf8':
            case 'utf-8':
            case 'ascii':
            case 'binary':
            case 'base64':
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
            case 'raw':
                return true;

            default:
                return false;
        }
    };

    // helpers

    function coerce(length) {
        // Coerce length to a number (possibly NaN), round up
        // in case it's fractional (e.g. 123.456) then do a
        // double negate to coerce a NaN to 0. Easy, right?
        length = ~~Math.ceil(+length);
        return length < 0 ? 0 : length;
    }

    function isArray(subject) {
        return (Array.isArray ||
            function(subject) {
                return {}.toString.apply(subject) == '[object Array]';
            })
        (subject);
    }

    function isArrayIsh(subject) {
        return isArray(subject) || Buffer.isBuffer(subject) ||
            subject && typeof subject === 'object' &&
            typeof subject.length === 'number';
    }

    function toHex(n) {
        if (n < 16) return '0' + n.toString(16);
        return n.toString(16);
    }

    function utf8ToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; i++)
            if (str.charCodeAt(i) <= 0x7F)
                byteArray.push(str.charCodeAt(i));
            else {
                var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
                for (var j = 0; j < h.length; j++)
                    byteArray.push(parseInt(h[j], 16));
            }

        return byteArray;
    }

    function asciiToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; i++)
        // Node's code seems to be doing this and not & 0x7F..
            byteArray.push(str.charCodeAt(i) & 0xFF);

        return byteArray;
    }

    function base64ToBytes(str) {
        return b64ToByteArray(str);
    }

    function blitBuffer(src, dst, offset, length) {
        var pos, i = 0;
        while (i < length) {
            if ((i + offset >= dst.length) || (i >= src.length))
                break;

            dst[i + offset] = src[i];
            i++;
        }
        return i;
    }

    function decodeUtf8Char(str) {
        try {
            return decodeURIComponent(str);
        } catch (err) {
            return String.fromCharCode(0xFFFD); // UTF 8 invalid char
        }
    }

    // read/write bit-twiddling

    Buffer.prototype.readUInt8 = function(offset, noAssert) {
        var buffer = this;

        if (!noAssert) {
            assert(offset !== undefined && offset !== null, 'missing offset');
            assert(offset < buffer.length, 'Trying to read beyond buffer length');
        }

        if (offset >= buffer.length) return;

        return buffer[offset];
    };

    function readUInt16(buffer, offset, isBigEndian, noAssert) {
        var val = 0;

        if (!noAssert) {
            assert(typeof(isBigEndian) === 'boolean', 'missing or invalid endian');
            assert(offset !== undefined && offset !== null, 'missing offset');
            assert(offset + 1 < buffer.length, 'Trying to read beyond buffer length');
        }

        if (offset >= buffer.length) return 0;

        if (isBigEndian) {
            val = buffer[offset] << 8;
            if (offset + 1 < buffer.length) {
                val |= buffer[offset + 1];
            }
        } else {
            val = buffer[offset];
            if (offset + 1 < buffer.length) {
                val |= buffer[offset + 1] << 8;
            }
        }

        return val;
    }

    Buffer.prototype.readUInt16LE = function(offset, noAssert) {
        return readUInt16(this, offset, false, noAssert);
    };

    Buffer.prototype.readUInt16BE = function(offset, noAssert) {
        return readUInt16(this, offset, true, noAssert);
    };

    function readUInt32(buffer, offset, isBigEndian, noAssert) {
        var val = 0;

        if (!noAssert) {
            assert(typeof(isBigEndian) === 'boolean', 'missing or invalid endian');
            assert(offset !== undefined && offset !== null, 'missing offset');
            assert(offset + 3 < buffer.length, 'Trying to read beyond buffer length');
        }

        if (offset >= buffer.length) return 0;

        if (isBigEndian) {
            if (offset + 1 < buffer.length)
                val = buffer[offset + 1] << 16;
            if (offset + 2 < buffer.length)
                val |= buffer[offset + 2] << 8;
            if (offset + 3 < buffer.length)
                val |= buffer[offset + 3];
            val = val + (buffer[offset] << 24 >>> 0);
        } else {
            if (offset + 2 < buffer.length)
                val = buffer[offset + 2] << 16;
            if (offset + 1 < buffer.length)
                val |= buffer[offset + 1] << 8;
            val |= buffer[offset];
            if (offset + 3 < buffer.length)
                val = val + (buffer[offset + 3] << 24 >>> 0);
        }

        return val;
    }

    Buffer.prototype.readUInt32LE = function(offset, noAssert) {
        return readUInt32(this, offset, false, noAssert);
    };

    Buffer.prototype.readUInt32BE = function(offset, noAssert) {
        return readUInt32(this, offset, true, noAssert);
    };


    /*
     * Signed integer types, yay team! A reminder on how two's complement actually
     * works. The first bit is the signed bit, i.e. tells us whether or not the
     * number should be positive or negative. If the two's complement value is
     * positive, then we're done, as it's equivalent to the unsigned representation.
     *
     * Now if the number is positive, you're pretty much done, you can just leverage
     * the unsigned translations and return those. Unfortunately, negative numbers
     * aren't quite that straightforward.
     *
     * At first glance, one might be inclined to use the traditional formula to
     * translate binary numbers between the positive and negative values in two's
     * complement. (Though it doesn't quite work for the most negative value)
     * Mainly:
     *  - invert all the bits
     *  - add one to the result
     *
     * Of course, this doesn't quite work in Javascript. Take for example the value
     * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
     * course, Javascript will do the following:
     *
     * > ~0xff80
     * -65409
     *
     * Whoh there, Javascript, that's not quite right. But wait, according to
     * Javascript that's perfectly correct. When Javascript ends up seeing the
     * constant 0xff80, it has no notion that it is actually a signed number. It
     * assumes that we've input the unsigned value 0xff80. Thus, when it does the
     * binary negation, it casts it into a signed value, (positive 0xff80). Then
     * when you perform binary negation on that, it turns it into a negative number.
     *
     * Instead, we're going to have to use the following general formula, that works
     * in a rather Javascript friendly way. I'm glad we don't support this kind of
     * weird numbering scheme in the kernel.
     *
     * (BIT-MAX - (unsigned)val + 1) * -1
     *
     * The astute observer, may think that this doesn't make sense for 8-bit numbers
     * (really it isn't necessary for them). However, when you get 16-bit numbers,
     * you do. Let's go back to our prior example and see how this will look:
     *
     * (0xffff - 0xff80 + 1) * -1
     * (0x007f + 1) * -1
     * (0x0080) * -1
     */
    Buffer.prototype.readInt8 = function(offset, noAssert) {
        var buffer = this;
        var neg;

        if (!noAssert) {
            assert(offset !== undefined && offset !== null, 'missing offset');
            assert(offset < buffer.length, 'Trying to read beyond buffer length');
        }

        if (offset >= buffer.length) return;

        neg = buffer[offset] & 0x80;
        if (!neg) {
            return (buffer[offset]);
        }

        return ((0xff - buffer[offset] + 1) * -1);
    };

    function readInt16(buffer, offset, isBigEndian, noAssert) {
        var neg, val;

        if (!noAssert) {
            assert(typeof(isBigEndian) === 'boolean', 'missing or invalid endian');
            assert(offset !== undefined && offset !== null, 'missing offset');
            assert(offset + 1 < buffer.length, 'Trying to read beyond buffer length');
        }

        val = readUInt16(buffer, offset, isBigEndian, noAssert);
        neg = val & 0x8000;
        if (!neg) {
            return val;
        }

        return (0xffff - val + 1) * -1;
    }

    Buffer.prototype.readInt16LE = function(offset, noAssert) {
        return readInt16(this, offset, false, noAssert);
    };

    Buffer.prototype.readInt16BE = function(offset, noAssert) {
        return readInt16(this, offset, true, noAssert);
    };

    function readInt32(buffer, offset, isBigEndian, noAssert) {
        var neg, val;

        if (!noAssert) {
            assert(typeof(isBigEndian) === 'boolean', 'missing or invalid endian');
            assert(offset !== undefined && offset !== null, 'missing offset');
            assert(offset + 3 < buffer.length, 'Trying to read beyond buffer length');
        }

        val = readUInt32(buffer, offset, isBigEndian, noAssert);
        neg = val & 0x80000000;
        if (!neg) {
            return (val);
        }

        return (0xffffffff - val + 1) * -1;
    }

    Buffer.prototype.readInt32LE = function(offset, noAssert) {
        return readInt32(this, offset, false, noAssert);
    };

    Buffer.prototype.readInt32BE = function(offset, noAssert) {
        return readInt32(this, offset, true, noAssert);
    };

    function readFloat(buffer, offset, isBigEndian, noAssert) {
        if (!noAssert) {
            assert(typeof(isBigEndian) === 'boolean', 'missing or invalid endian');
            assert(offset + 3 < buffer.length, 'Trying to read beyond buffer length');
        }

        return readIEEE754(buffer, offset, isBigEndian, 23, 4);
    }

    Buffer.prototype.readFloatLE = function(offset, noAssert) {
        return readFloat(this, offset, false, noAssert);
    };

    Buffer.prototype.readFloatBE = function(offset, noAssert) {
        return readFloat(this, offset, true, noAssert);
    };

    function readDouble(buffer, offset, isBigEndian, noAssert) {
        if (!noAssert) {
            assert(typeof(isBigEndian) === 'boolean', 'missing or invalid endian');
            assert(offset + 7 < buffer.length, 'Trying to read beyond buffer length');
        }

        return readIEEE754(buffer, offset, isBigEndian, 52, 8);
    }

    Buffer.prototype.readDoubleLE = function(offset, noAssert) {
        return readDouble(this, offset, false, noAssert);
    };

    Buffer.prototype.readDoubleBE = function(offset, noAssert) {
        return readDouble(this, offset, true, noAssert);
    };


    /*
     * We have to make sure that the value is a valid integer. This means that it is
     * non-negative. It has no fractional component and that it does not exceed the
     * maximum allowed value.
     *
     *      value           The number to check for validity
     *
     *      max             The maximum value
     */

    function verifuint(value, max) {
        assert(typeof(value) == 'number', 'cannot write a non-number as a number');
        assert(value >= 0, 'specified a negative value for writing an unsigned value');
        assert(value <= max, 'value is larger than maximum value for type');
        assert(Math.floor(value) === value, 'value has a fractional component');
    }

    Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
        var buffer = this;

        if (!noAssert) {
            assert(value !== undefined && value !== null, 'missing value');
            assert(offset !== undefined && offset !== null, 'missing offset');
            assert(offset < buffer.length, 'trying to write beyond buffer length');
            verifuint(value, 0xff);
        }

        if (offset < buffer.length) {
            buffer[offset] = value;
        }
    };

    function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
        if (!noAssert) {
            assert(value !== undefined && value !== null, 'missing value');
            assert(typeof(isBigEndian) === 'boolean', 'missing or invalid endian');
            assert(offset !== undefined && offset !== null, 'missing offset');
            assert(offset + 1 < buffer.length, 'trying to write beyond buffer length');

            verifuint(value, 0xffff);
        }

        for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
            buffer[offset + i] =
                (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
                (isBigEndian ? 1 - i : i) * 8;
        }

    }

    Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
        writeUInt16(this, value, offset, false, noAssert);
    };

    Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
        writeUInt16(this, value, offset, true, noAssert);
    };

    function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
        if (!noAssert) {
            assert(value !== undefined && value !== null, 'missing value');
            assert(typeof(isBigEndian) === 'boolean', 'missing or invalid endian');
            assert(offset !== undefined && offset !== null, 'missing offset');
            assert(offset + 3 < buffer.length, 'trying to write beyond buffer length');

            verifuint(value, 0xffffffff);
        }

        for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
            buffer[offset + i] =
                (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
        }
    }

    Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
        writeUInt32(this, value, offset, false, noAssert);
    };

    Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
        writeUInt32(this, value, offset, true, noAssert);
    };


    /*
     * We now move onto our friends in the signed number category. Unlike unsigned
     * numbers, we're going to have to worry a bit more about how we put values into
     * arrays. Since we are only worrying about signed 32-bit values, we're in
     * slightly better shape. Unfortunately, we really can't do our favorite binary
     * & in this system. It really seems to do the wrong thing. For example:
     *
     * > -32 & 0xff
     * 224
     *
     * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
     * this aren't treated as a signed number. Ultimately a bad thing.
     *
     * What we're going to want to do is basically create the unsigned equivalent of
     * our representation and pass that off to the wuint* functions. To do that
     * we're going to do the following:
     *
     *  - if the value is positive
     *      we can pass it directly off to the equivalent wuint
     *  - if the value is negative
     *      we do the following computation:
     *         mb + val + 1, where
     *         mb   is the maximum unsigned value in that byte size
     *         val  is the Javascript negative integer
     *
     *
     * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
     * you do out the computations:
     *
     * 0xffff - 128 + 1
     * 0xffff - 127
     * 0xff80
     *
     * You can then encode this value as the signed version. This is really rather
     * hacky, but it should work and get the job done which is our goal here.
     */

    /*
     * A series of checks to make sure we actually have a signed 32-bit number
     */

    function verifsint(value, max, min) {
        assert(typeof(value) == 'number', 'cannot write a non-number as a number');
        assert(value <= max, 'value larger than maximum allowed value');
        assert(value >= min, 'value smaller than minimum allowed value');
        assert(Math.floor(value) === value, 'value has a fractional component');
    }

    function verifIEEE754(value, max, min) {
        assert(typeof(value) == 'number', 'cannot write a non-number as a number');
        assert(value <= max, 'value larger than maximum allowed value');
        assert(value >= min, 'value smaller than minimum allowed value');
    }

    Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
        var buffer = this;

        if (!noAssert) {
            assert(value !== undefined && value !== null, 'missing value');
            assert(offset !== undefined && offset !== null, 'missing offset');
            assert(offset < buffer.length, 'Trying to write beyond buffer length');

            verifsint(value, 0x7f, -0x80);
        }

        if (value >= 0) {
            buffer.writeUInt8(value, offset, noAssert);
        } else {
            buffer.writeUInt8(0xff + value + 1, offset, noAssert);
        }
    };

    function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
        if (!noAssert) {
            assert(value !== undefined && value !== null, 'missing value');
            assert(typeof(isBigEndian) === 'boolean', 'missing or invalid endian');
            assert(offset !== undefined && offset !== null, 'missing offset');
            assert(offset + 1 < buffer.length, 'Trying to write beyond buffer length');

            verifsint(value, 0x7fff, -0x8000);
        }

        if (value >= 0) {
            writeUInt16(buffer, value, offset, isBigEndian, noAssert);
        } else {
            writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
        }
    }

    Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
        writeInt16(this, value, offset, false, noAssert);
    };

    Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
        writeInt16(this, value, offset, true, noAssert);
    };

    function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
        if (!noAssert) {
            assert(value !== undefined && value !== null, 'missing value');
            assert(typeof(isBigEndian) === 'boolean', 'missing or invalid endian');
            assert(offset !== undefined && offset !== null, 'missing offset');
            assert(offset + 3 < buffer.length, 'Trying to write beyond buffer length');

            verifsint(value, 0x7fffffff, -0x80000000);
        }

        if (value >= 0) {
            writeUInt32(buffer, value, offset, isBigEndian, noAssert);
        } else {
            writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
        }
    }

    Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
        writeInt32(this, value, offset, false, noAssert);
    };

    Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
        writeInt32(this, value, offset, true, noAssert);
    };

    function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
        if (!noAssert) {
            assert(value !== undefined && value !== null, 'missing value');
            assert(typeof(isBigEndian) === 'boolean', 'missing or invalid endian');
            assert(offset !== undefined && offset !== null, 'missing offset');
            assert(offset + 3 < buffer.length, 'Trying to write beyond buffer length');

            verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
        }

        writeIEEE754(buffer, value, offset, isBigEndian, 23, 4);
    }

    Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
        writeFloat(this, value, offset, false, noAssert);
    };

    Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
        writeFloat(this, value, offset, true, noAssert);
    };

    function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
        if (!noAssert) {
            assert(value !== undefined && value !== null, 'missing value');
            assert(typeof(isBigEndian) === 'boolean', 'missing or invalid endian');
            assert(offset !== undefined && offset !== null, 'missing offset');
            assert(offset + 7 < buffer.length, 'Trying to write beyond buffer length');

            verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
        }

        writeIEEE754(buffer, value, offset, isBigEndian, 52, 8);
    }

    Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
        writeDouble(this, value, offset, false, noAssert);
    };

    Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
        writeDouble(this, value, offset, true, noAssert);
    };

    /*
     *
     *
     *
     *
     *
     * Helper methods
     *
     *
     *
     *
     *
     */

    var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    function b64ToByteArray(b64) {
        var i, j, l, tmp, placeHolders, arr;

        if (b64.length % 4 > 0) {
            throw 'Invalid string. Length must be a multiple of 4';
        }

        // the number of equal signs (place holders)
        // if there are two placeholders, than the two characters before it
        // represent one byte
        // if there is only one, then the three characters before it represent 2 bytes
        // this is just a cheap hack to not do indexOf twice
        placeHolders = b64.indexOf('=');
        placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

        // base64 is 4/3 + up to two characters of the original data
        arr = []; //new Uint8Array(b64.length * 3 / 4 - placeHolders);

        // if there are placeholders, only get up to the last complete 4 chars
        l = placeHolders > 0 ? b64.length - 4 : b64.length;

        for (i = 0, j = 0; i < l; i += 4, j += 3) {
            tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
            arr.push((tmp & 0xFF0000) >> 16);
            arr.push((tmp & 0xFF00) >> 8);
            arr.push(tmp & 0xFF);
        }

        if (placeHolders === 2) {
            tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
            arr.push(tmp & 0xFF);
        } else if (placeHolders === 1) {
            tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
            arr.push((tmp >> 8) & 0xFF);
            arr.push(tmp & 0xFF);
        }

        return arr;
    }

    function uint8ToBase64(uint8) {
        var i,
            extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
            output = "",
            temp, length;

        function tripletToBase64(num) {
            return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
        }

        // go through the array every three bytes, we'll deal with trailing stuff later
        for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
            temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
            output += tripletToBase64(temp);
        }

        // pad the end with zeros, but make sure to not forget the extra bytes
        switch (extraBytes) {
            case 1:
                temp = uint8[uint8.length - 1];
                output += lookup[temp >> 2];
                output += lookup[(temp << 4) & 0x3F];
                output += '==';
                break;
            case 2:
                temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
                output += lookup[temp >> 10];
                output += lookup[(temp >> 4) & 0x3F];
                output += lookup[(temp << 2) & 0x3F];
                output += '=';
                break;
        }

        return output;
    }

    function stringtrim(str) {
        if (str.trim) return str.trim();
        return str.replace(/^\s+|\s+$/g, '');
    }

    // 
    // 'tis magic
    // https://github.com/toots/buffer-browserify/blob/master/buffer_ieee754.js
    // 

    function readIEEE754(buffer, offset, isBE, mLen, nBytes) {
        var e, m,
            eLen = nBytes * 8 - mLen - 1,
            eMax = (1 << eLen) - 1,
            eBias = eMax >> 1,
            nBits = -7,
            i = isBE ? 0 : (nBytes - 1),
            d = isBE ? 1 : -1,
            s = buffer[offset + i];

        i += d;

        e = s & ((1 << (-nBits)) - 1);
        s >>= (-nBits);
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

        m = e & ((1 << (-nBits)) - 1);
        e >>= (-nBits);
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

        if (e === 0) {
            e = 1 - eBias;
        } else if (e === eMax) {
            return m ? NaN : ((s ? -1 : 1) * Infinity);
        } else {
            m = m + Math.pow(2, mLen);
            e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    }

    // 
    // 'tis magic
    // https://github.com/toots/buffer-browserify/blob/master/buffer_ieee754.js
    // 

    function writeIEEE754(buffer, value, offset, isBE, mLen, nBytes) {
        var e, m, c,
            eLen = nBytes * 8 - mLen - 1,
            eMax = (1 << eLen) - 1,
            eBias = eMax >> 1,
            rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
            i = isBE ? (nBytes - 1) : 0,
            d = isBE ? -1 : 1,
            s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

        value = Math.abs(value);

        if (isNaN(value) || value === Infinity) {
            m = isNaN(value) ? 1 : 0;
            e = eMax;
        } else {
            e = Math.floor(Math.log(value) / Math.LN2);
            if (value * (c = Math.pow(2, -e)) < 1) {
                e--;
                c *= 2;
            }
            if (e + eBias >= 1) {
                value += rt / c;
            } else {
                value += rt * Math.pow(2, 1 - eBias);
            }
            if (value * c >= 2) {
                e++;
                c /= 2;
            }

            if (e + eBias >= eMax) {
                m = 0;
                e = eMax;
            } else if (e + eBias >= 1) {
                m = (value * c - 1) * Math.pow(2, mLen);
                e = e + eBias;
            } else {
                m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                e = 0;
            }
        }

        for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

        e = (e << mLen) | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

        buffer[offset + i - d] |= s * 128;
    }

    function assert(condition, message) {
        if (!condition) {
            throw message || "Assertion failed";
        }
    }

    return o;
});