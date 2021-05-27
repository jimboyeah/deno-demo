import { parse } from "https://deno.land/std@0.94.0/flags/mod.ts";
import { posix } from "https://deno.land/std@0.95.0/path/mod.ts";

console.log(parse(Deno.args));

// if((Deno as any) !== "object"){
// throw Error(`usage: deno run --unstable ${Deno.mainModule}`);
// }
Deno.permissions.request({ name: "read" }).then(perm => {
  console.log(Deno.noColor);
  if (perm.state !== "granted") return;
  // let appDir = posix.dirname(Deno.mainModule);
  let appDir = posix.dirname(import.meta.url);
  Deno.writeFile("app.txt", new TextEncoder().encode(appDir));
  console.log({ appDir })
})

const desc = { name: "env" } as const;
let perm = await Deno.permissions.request(desc);
if (perm.state == "granted") {
  console.log(Deno.env.get("OS"));
  console.log(Deno.hostname());
  console.log(Deno.osRelease())
  console.log(Deno.loadavg())
  console.log(Deno.systemMemoryInfo());
  console.log(Deno.systemCpuInfo());
}

// $ deno run https://deno.land/std/examples/flags.ts a -b --c -d100 -e=ellipse --f1 
// { _: [ "a" ], b: true, c: true, d: "dick" }

// $ deno run https://deno.land/std/examples/flags.ts -x 3 -y 4 -n5 -abc --beep=boop foo bar baz
// { _: [ 'foo', 'bar', 'baz' ],
// x: 3,
// y: 4,
// n: 5,
// a: true,
// b: true,
// c: true,
// beep: 'boop' }