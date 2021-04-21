var process = require('process');
var tty = require('tty');

if(!process.stdout.isTTY) {
  console.log("\033[5;46;37m HELLO_WORLD \033[0m\n");
  return console.log('No TTY available', process.stdout.isTTY);

}

var ws = new tty.WriteStream(process.stdout.fd);
var width = ws.columns;

var head = "|";
var foot = "%";
var progress = "";
var num = 0;

function update()
{
	foot = num + "%";
	var len = width - head.length - foot.length - 1;
	var p = Math.ceil( num / 100 * len );
  progress = "";
	for(var i=0; i<len; i++)
	{
    progress += ( i<=p )? "=":" ";
	}
	process.stdout.write(head+progress+foot+"\33[K\r");
	num+=5;
	if( num>100 )
	{
		process.stdout.write("\33[K\r");
		process.exit(0);
	}
}

setInterval(update,500);