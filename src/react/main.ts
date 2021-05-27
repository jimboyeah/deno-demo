// deno run--unstable - A--location http://www.demo.com/ demo/global.ts
// deno compile --lite --allow-net --unstable --location http://www.baidu.com/ demo/global.ts

console.log(Deno.args);
console.log({ location }, location.toString(), location.href)
fetch("xyz").then(res => {
  console.log(res.url);
}).catch(console.log)

// console.log({ document }) // an awkward property in Deno
// console.log({ console })
// console.log({ crypto })
// console.log(navigator = new Navigator())
// error: TS18004[ERROR]: No value exists in scope for the shorthand property 'navigator'.Either declare one or provide an initializer.
// console.log({ onload })
// console.log({ onunload })
// console.log({ performance })
// console.log({ self })
// console.log({ window })
// alert("queueMicrotask? ", queueMicrotask.toString())
// confirm("this is confirm:")
// prompt("this is prompt:", "123")
