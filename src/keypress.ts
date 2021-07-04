#!/usr/bin/env -S deno run --unstable
// https://deno.land/x/cliffy@v0.19.0/examples/keycode/read_key.ts

import { KeyCode, parse } from "https://deno.land/x/cliffy@v0.19.0/keycode/key_code.ts";
import { osType, isWindows } from "https://deno.land/std@0.95.0/_util/os.ts";

async function* keypress(): AsyncGenerator<KeyCode, void> {
  while (true) {
    const data = new Uint8Array(8);
    if(osType==="windows"){
      Deno.setRaw(Deno.stdin.rid, true);
    }else{
      Deno.setRaw(Deno.stdin.rid, true, { cbreak: true });
    }
    const nread = await Deno.stdin.read(data);
    Deno.setRaw(Deno.stdin.rid, false);

    if (nread === null) {
      return;
    }
    
    console.log({buffer: data.slice(0, nread)});
    const keys: Array<KeyCode> = parse(data.subarray(0, nread));

    for (const key of keys) {
      yield key;
    }
  }
}

console.log("Hit ctrl + d to exit.");

for await (const key of keypress()) {
  if (key.ctrl && key.name === "d") {
    console.log("exit");
    break;
  }
  console.log(key);
}