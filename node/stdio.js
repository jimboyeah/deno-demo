var child_process = require('child_process');
var fs = require('fs');

var out = fs.openSync('./out.txt', 'a');
var err = fs.openSync('./err.txt', 'a');

var child = child_process.spawn('node', ['iconv.js'], {
    detached: true,
    stdio: ['ignore', out, err]
});

child.unref();