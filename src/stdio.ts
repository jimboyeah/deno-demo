
if(import.meta.main && Deno.args[0] == "main"){
  // let cmd = ["echo", "hello"];
  let cmd = ["deno", "run", "-A", "--unstable", Deno.mainModule];
  const p = Deno.run({ cmd, stderr: 'piped', stdout: 'piped' });
  const [status, stdout, stderr] = await Promise.all([
  p.status(),
  p.output(),
  p.stderrOutput()
  ]);
  p.close();

  let msg = new TextDecoder("utf-8").decode(stdout);
  let err = new TextDecoder("utf-8").decode(stderr);
  console.log({status, main: import.meta.main, msg, err});
}else{
  console.log("Hello", import.meta.main);
  console.error("Ooh!");
  Deno.write(Deno.stdout.rid, new TextEncoder().encode("stdout..."));
  Deno.write(Deno.stderr.rid, new TextEncoder().encode("stderr..."));
}
