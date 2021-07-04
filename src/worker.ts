
const canRead = await Deno.permissions.query({ 
  name: "read",
  path: "./worker.ts" 
});

if(self.constructor.name == "Window"){
  let window = (globalThis as any).window;
  let handler = (e: Event): void => {
    console.log(`handler: ${e.type}`);
  }
  window.addEventListener("unload", handler);
  window.onload = (e: Event): void => {
    console.log(`onload ${e.type}`);
  };
  window.onunload = (e: Event): void => {
    console.log(`onunload ${e.type}`);
  };
  window.addEventListener("load", handler);
}

// if(import.meta.main && Deno.args[0]=="main"){
if(canRead.state==="granted"){
  let opt:WorkerOptions = { 
    type: "module",
    deno: {
      namespace: true,
      permissions: "none",
    }
  };
  let worker = new Worker(new URL("./worker.ts", import.meta.url).href, opt);
  worker.onmessage = ( ev ) => console.log(ev.data );
  worker.postMessage({ message: "Welcome to Deno!" });
}else{
  (self as any).onmessage = async (e:MessageEvent) => {
    const { message } = e.data;
    console.log("Roger that:", message);
    (self as any).postMessage("Hi there~");
    self.close();
  };
}
