var eventEmitter = require("events").EventEmitter;
var domain = require("domain");
var emitter1 = new eventEmitter();

var domain1 = domain.create();
domain1.on("error", function(err){
  console.log("domain1："+err.message);
})

// 显式绑定
domain1.add(emitter1);
emitter1.on("error", function(err){
  console.log("emitter1："+err.message);
})
emitter1.emit("error", new Error("由 emitter1 处理的错误"));
emitter1.removeAllListeners("error");
emitter1.emit("error", new Error("由 domain1 处理的错误"));

var domain2 = domain.create();
domain2.on("error", function(err){
  console.log("domain2："+err.message);
})

//隐式绑定
domain2.run(function(){
  var emitter2 = new eventEmitter();
  emitter2.emit("error", new Error("由 domain2 处理的错误"));
})
domain1.remove(emitter1);
emitter1.emit("error", new Error("系统将崩溃"));