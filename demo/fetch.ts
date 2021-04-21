
// deno run --allow-net fetch.ts
// deno.exe run --allow-env --unstable --allow-net fetch.ts https://api.github.com/users/github
Deno.args.length && fetch(Deno.args[0]).then( res => res.text() ).then(console.log);
console.log(Deno.compile,
  Deno.bundle, 
  Deno.emit)