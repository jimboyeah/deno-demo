process.on('message', (m) => {
  console.log('CHILD got message:', m);
});

// process.send(message[, sendHandle[, options]][, callback])
process.send({ foo: 'bar', baz: NaN });
