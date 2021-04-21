var http = require('http');
var fs = require('fs');
var zlib = require("zlib");

http.createServer(function(req, res){
  let ae = req.headers['accept-encoding'];
  let isZip = ae && ae.indexOf('gzip')>=0;
  var stream = fs.createReadStream(__filename);
  if(isZip || true){
    res.writeHead(200, {
			'Content-Length': '406',
			'Content-Encoding': 'gzip',
      'Content-Type': 'text/html', // application/x-gzip
		});
    var gzip = zlib.createGzip();
    stream.pipe(gzip).pipe(res, true);
    // res.end(zlib.gzipSync(fs.readFileSync(__filename)));
    // var gz = fs.createWriteStream(__filename+'.gz');
    // stream.pipe(gzip).pipe(gz, true);
  }else{
    stream.pipe(res, true);
  }
})
.on('error', err => console.log)
.listen(3000);

