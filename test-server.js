'use strict';

var net = require('net'),
    echoServer,
    echoPort = 6789,
    writeOnlyServer,
    writeOnlyPort = 6790;

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

echoServer.listen(echoPort);
console.log('echo server listening to: ' + echoPort);
writeOnlyServer.listen(writeOnlyPort);
console.log('write-only server listening to: ' + writeOnlyPort);