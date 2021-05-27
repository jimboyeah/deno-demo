
// deno run --allow-net fetch.ts
// deno.exe run--unstable --allow-write=fetch.txt --allow-env --allow-net fetch.ts https://api.github.com/users/github
let req = new Request({url: Deno.args[0]});
Deno.args.length && fetch(req)
.then( res => res.arrayBuffer() )
.then(ab => {
  Deno.writeFile("out.txt", new Uint8Array(ab));
  return new TextDecoder("utf-8").decode(ab);
})
.then( txt => console.log("write out.txt"))
.catch(console.log);