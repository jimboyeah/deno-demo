import { Application, send } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello World!";
});

app.use(async (context) => {
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}\\demo`,
    index: "index.html",
  });
});

// const listener = Deno.listen({ hostname: "localhost", port: 8000 });
const listener = app.listen({ hostname: "localhost", port: 8000 });
console.log("Serve on http://localhost:8000");

// for await (const conn of listener) {
//   (async () => {
//     const requests = Deno.serveHttp(conn);
//     console.log("Serve on you");
//     for await (const { request, respondWith } of requests) {
//       const response = await app.handle(request, conn);
//       if (response) {
//         respondWith(response);
//       }
//     }
//   });
// }

