const dns = require('dns');

dns.lookup('example.org', (err, address, family) => {
  console.log('address: %s family: IPv%s', address, family);
});
// address: "93.184.216.34" family: IPv4

dns.resolve4('archive.org', (err, addresses) => {
  if (err) throw err;

  console.log(`addresses: ${JSON.stringify(addresses)}`);

  addresses.forEach((a) => {
    dns.reverse(a, (err, hostnames) => {
      if (err) {
        throw err;
      }
      console.log(`reverse for ${a}: ${JSON.stringify(hostnames)}`);
    });
  });
});