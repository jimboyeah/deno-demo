// https://doc.deno.land/builtin/stable#Deno.OpenOptions
const opts = { 
  read: true, write: true, create: true,
  // append: true,
  truncate: true, 
};
const file = await Deno.open('out.txt', opts);
const text = new TextEncoder().encode("Hello world!");
await Deno.write(file.rid, text);

// advance cursor 6 bytes
const cursorA = await Deno.seek(file.rid, 6, Deno.SeekMode.Start)
await file.write(text);

const cursorB = await Deno.seek(file.rid, 0, Deno.SeekMode.Start)
const buf = new Uint8Array(100);
await file.read(buf);
console.log(new TextDecoder().decode(buf));