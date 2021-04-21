const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream(__dirname + '/../example.zip');
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

// @see: https://nodejs.org/api/stream.html#stream_event_end
output.on('end', function() {
  console.log('Data has been drained');
});

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    // log warning
  } else {
    // throw error
    throw err;
  }
});

// good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});

// pipe archive data to the file
archive.pipe(output);

// append a file from stream
const file1 = __dirname + '/demo.js';
archive.append(fs.createReadStream(file1), { name: 'demo.md' });

archive.append('append a file from string!', { name: 'string.txt' });

const buffer3 = Buffer.from('append a file from buffer!');
archive.append(buffer3, { name: 'buffer.txt' });

archive.file(__filename, { name: "src/archive.js" });

// append files from a sub-directory and naming it `subdir` within the archive
archive.directory('node/', 'subdir');

// append files from a sub-directory, putting its contents at the root of archive
archive.directory("src/", false);

// append files from a glob pattern
archive.glob('*.js', {cwd: __dirname});

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling 
// this method so register to them beforehand
archive.finalize();