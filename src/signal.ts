// SIGINT not implemented on Windows!
console.log("Press Ctrl-C to cancel with a SIGINT");
for await (const _ of Deno.signals.alarm()) {
  console.log("interrupted!");
}
console.log("Press Ctrl-C again to exit");
for await (const _ of Deno.signal(Deno.Signal.SIGINT)) {
  console.log("interrupted!");
  Deno.exit();
}
