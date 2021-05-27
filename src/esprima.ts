// deno run --unstable --allow-read=node_modules esprima.ts
import { createRequire } from "https://deno.land/std/node/module.ts";

const require = createRequire(import.meta.url);
const esprima = require("esprima");

const program = 'const answer = 42';
console.log(esprima.tokenize(program))
