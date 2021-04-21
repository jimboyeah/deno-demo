var dgram = require('dgram');
var client = dgram.createSocket('udp4');

var {port, address} = {
  port: 3000,
  address: '127.0.0.255',
  address: '255.255.255.255',
};
var message = Buffer.from('Biu! Biu! are your ok?');

client.bind(function(){
  client.setBroadcast(true);
  client.send(message, port, address, function(err){
      if(err) throw err;
      console.log('UDP message sent to %s:%s', address, port);
      client.close();
  });
});
console.log(process.env)