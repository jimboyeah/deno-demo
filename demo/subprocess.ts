/**
 * subprocess_simple.ts
 * https://deno.land/manual@v1.8.1/examples/subprocess
 * 
 * Run it:
 * $ deno run --allow-run ./subprocess_simple.ts
 * hello
 */

// create subprocess
const p = Deno.run({
  cmd: ["echo", "hello"],
  stdout: "piped",
});

// await its completion
// await p.status();
const rawOutput:Uint8Array = await p.output();
// let msg = String.fromCharCode.apply(null, rawOutput as any);
let msg = new TextDecoder("utf-8").decode(rawOutput);
console.log(msg, "done!");
