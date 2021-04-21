// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/4a50660/react/v16.13.1/react.d.ts"
import React from "https://dev.jspm.io/react@16.13.1";
import ReactDOMServer from "https://dev.jspm.io/react-dom@16.13.1/server";
import { opine } from "https://deno.land/x/opine@0.25.0/mod.ts";
import App from "./app.tsx";

/**
 * Create our client bundle - you could split this out into
 * a preprocessing step.
 * Deno.bundle and Deno.compile is outdate, use Deno.emit instead.
 */
const {diagnostics, files} = await Deno.emit(
  "./demo/client.tsx",
  { 
    bundle: "esm",
  },
);

if (diagnostics) {
  console.log(diagnostics);
}
let bundle = files["deno:///bundle.js"];

/**
 * Create our Opine server.
 */
const app = opine();
const browserBundlePath = "/browser.js";

const html =
`<html>
  <head><script type="module" src="${browserBundlePath}"></script>
  <style>* { font-family: Helvetica; }</style>
  </head>
  <body>
  <div id="root">${
    (ReactDOMServer as any).renderToString(<App />)
  }</div></body></html>`;

app.use(browserBundlePath, (req, res, next) => {
  res.type("application/javascript").send(bundle);
});

app.use("/", (req, res, next) => {
  res.type("text/html").send(html);
});

app.listen({ port: 3000 });

console.log("React SSR App listening on http://localhost:3000");