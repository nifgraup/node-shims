'use strict';

var net = require('net'),
    http = require('http'),
    echoServer,
    echoPort = 6789,
    writeOnlyServer,
    writeOnlyPort = 6790,
    httpServer,
    httpPort = 8082;

echoServer = net.createServer(function(socket) {
    socket.on('data', function() {
        console.log('recevied echo message!');
    });
    socket.pipe(socket);
});

writeOnlyServer = net.createServer(function(socket) {
    socket.on('data', function() {
        console.log('recevied write only message!');
    });
});

httpServer = http.createServer(function(req, res) {
    console.log('received ' + req.method + ' request: ' + req.url);
    if (req.method === 'GET') {
        if (req.url === '/beep') {
            res.setHeader('content-type', 'text/plain');
            res.setHeader('ping', req.headers.ping + '-pong');
            res.end('RATATAZONG');
        } else if (req.url === '/doom') {
            res.setHeader('content-type', 'multipart/octet-stream');

            res.write('d');
            var i = 0;
            var iv = setInterval(function() {
                res.write('o');
                if (i++ >= 10) {
                    clearInterval(iv);
                    res.end('m');
                }
            }, 50);
        }
    } else if (req.method === 'POST' && req.url === '/plusone') {
        res.setHeader('content-type', 'text/plain');
        var s = '';
        req.on('data', function(buf) {
            s += buf.toString();
        });
        req.on('end', function() {
            var n = parseInt(s, 10) + 1;
            res.end(n.toString());
        });
    }
});

echoServer.listen(echoPort);
console.log('echo tcp server listening to: ' + echoPort);
writeOnlyServer.listen(writeOnlyPort);
console.log('write-only tcp server listening to: ' + writeOnlyPort);
httpServer.listen(httpPort);
console.log('http server listening to: ' + httpPort);