var opt = {
  port: 3000,
  address: '0.0.0.0',
}

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var {address, port} = server.address();
    console.log('UDP Server listening on %s:%s ', address, port);
});

server.on('message', function (message, remote) {
    console.log("%s:%s - %s", remote.address, remote.port, message.toString());
});

server.bind(opt);
