/* 
import { serve } from "https://deno.land/std@0.90.0/http/server.ts";
const server = serve({ port: 8000 });
console.log("http://localhost:8000/");

for await (const req of server) {
  req.respond({ body: "Hello World!\n" });
} 
*/

console.log("Server on https://www.localhost.com:443")
const server = Deno.listenTls({
  port: 443,
  hostname:"www.localhost.com",
  // transport:"tcp",
  certFile: "./server.crt",
  keyFile: "./server.key",
  alpnProtocols: ["h2", "http/1.1"],
});

// console.log("Server on http://localhost:8080")
// const server = Deno.listen({ port: 8080 });

async function handle(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);

  for await (const requestEvent of httpConn) {
    const url = new URL(requestEvent.request.url);
    console.log(`path: ${url.pathname}`);
    await requestEvent.respondWith(new Response("hello world", {
      status: 200,
    }));
  }
}

for await (const conn of server) {
  handle(conn).catch(err => {console.log("⚡", err.message)});
}

console.log("Done!")