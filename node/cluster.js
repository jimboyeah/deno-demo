
const cluster = require('cluster');
const http = require('http');
const cores = require('os').cpus();

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  cores.map(cpu => {
    let worker = cluster.fork(); // fork self
  });
  cluster.on('exit', (worker, code, signal) => {
    let pid = worker.process.pid;
    console.log({worker: worker.id, pid, exitCode: code});
    void function killAll(){
      for(let id in cluster.workers) {
        cluster.workers[id].disconnect();
        // cluster.workers[id].kill('SIGTERM');
      }
    }();
  });
} else {
  // Workers can share any TCP connection with Master bye IPC server.
  let port = 8000; // cluster.worker.id;
  const svr = http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`hello world Worker ${process.pid}\n`);
    svr.close((err)=>{
      if(err) console.error(err);
      process.exit();
    });
  }).listen(port, "localhost");
  console.log(`Worker ${process.pid} started`, port);
}