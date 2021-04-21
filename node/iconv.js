const { spawn, exec, execFile } = require('child_process');
const {decode, encode} = require('iconv-lite')


let isWin32 = process.platform==='win32';
const ls = isWin32? execFile('cmd', ['/c dir .'], {encoding: "binary"})
// const ls = isWin32? exec('cmd /c dir .', {encoding: "binary"})
// const ls = isWin32? spawn('cmd', ['/c', 'dir .'])
  : spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  const buffer = Buffer.from(data, "binary");
  const utf8 = decode(buffer, "gbk");
  console.log(`stdout: ${utf8}`);
});

ls.on('close', (code) => {
  console.log(`child process close all stdio with code ${code}`);
});

ls.on('exit', (code) => {
  console.log(`child process exited with code ${code}`);
});