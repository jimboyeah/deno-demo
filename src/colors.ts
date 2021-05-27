// <reference lib="https://raw.githubusercontent.com/microsoft/TypeScript/master/lib/lib.dom.d.ts" />
// <reference lib="https://raw.githubusercontent.com/denoland/deno/main/cli/dts/lib.dom.d.ts" />

// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
// https://deno.land/std@0.90.0/examples/colors.ts
// deno bundle --lib dom demo\colors.ts demo\colors.bundle.js

import { bgBlue, bold, italic, yellow } from "https://deno.land/std@0.90.0/fmt/colors.ts";

let document =  {body:{innerHTML:""}};

if (import.meta.main) {
  console.log(bgBlue(italic(yellow(bold("Hello world!")))));
} else {
  document.body.innerHTML += `
  <b style="color: red; background: cornflowerblue;"></b>
  `;
}