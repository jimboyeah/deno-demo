// denon run --allow-env --allow-read --allow-write --allow-net demo\cache.ts
import { cache, File } from "https://deno.land/x/cache/mod.ts";

const file: Readonly<File> = await cache("https://deno.land/x/cache/file.ts");

const text = await Deno.readTextFile(file.path);
console.log({text}, file, file.path);