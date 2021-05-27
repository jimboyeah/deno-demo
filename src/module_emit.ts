// deno run --watch --unstable - A demo\module_emit.ts
const { diagnostics, files } = await Deno.emit(
  "./demo/colors.ts",
  {
    bundle: "esm",
  },
);
let bundle = files["deno:///bundle.js"];
console.log(diagnostics, files, bundle);
// if (diagnostics) {
// }
