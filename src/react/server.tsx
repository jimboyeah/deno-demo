/*
Deno 1.7.0
deno bundle --unstable demo\server.tsx demo\server.bundle.js
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="react-dom/server" />
// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/4a50660/react/v16.13.1/react.d.ts"
*/
import React from "https://dev.jspm.io/react@16.13.1";
import ReactDOMServer from "https://dev.jspm.io/react-dom@16.13.1/server";
import { opine } from "https://deno.land/x/opine@0.25.0/mod.ts";
import App from "./App.tsx";

import { posix } from "https://deno.land/std@0.90.0/path/mod.ts";
let appDirUrl = posix.dirname(Deno.mainModule);
let appDir = posix.fromFileUrl(appDirUrl);
console.log({
  appDir, appDirUrl, 
  mainModule:Deno.mainModule, 
  cwd : Deno.cwd(), 
  relative: posix.relative(appDir, Deno.cwd())
});

/**
 * Create our client bundle - you could split this out into
 * a preprocessing step.
 * Deno.bundle and Deno.compile is outdate, use Deno.emit instead.
 */
const {diagnostics, files} = await Deno.emit(
  // `${appDir}/client.tsx`,
  "C:\\coding\\md-code\\deno\\demo\\react\\client.tsx",
  { 
    // bundle: "esm",
  },
);

if (diagnostics) {
  console.log(diagnostics);
}
let bundle = files["deno:///bundle.js"];

const react_ssr = (ReactDOMServer as any).renderToString(<App />)

/**
 * Create our Opine server.
 */
const app = opine();
const browserBundlePath = "/client.bundle.js";

const html =
`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ES Module</title>
    <script type="module" src=".${browserBundlePath}"></script>
    <style>* { font-family: Helvetica; }</style>
  </head>
  <body>
  <div id="root">${
    react_ssr
  }</div>
  </body>
</html>`;

Deno.writeFile(`${appDir}/client.bundle.js`, new TextEncoder().encode(bundle));
Deno.writeFile(`${appDir}/client.html`, new TextEncoder().encode(html));


app.use(browserBundlePath, (req, res, next) => {
  res.type("application/javascript").send(bundle);
});

app.use("/", (req, res, next) => {
  res.type("text/html").send(html);
});

app.listen({ port: 3000 });

console.log("React SSR on http://localhost:3000");
