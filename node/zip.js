const zlib = require('zlib');

const payload = Buffer.from('This is some data');

// WARNING: DO NOT DO THIS!
for (let i = 0; i < 30000; ++i) {
  zlib.deflate(payload, (err, buffer) => {});
}