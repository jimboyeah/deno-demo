import { createRequire } from "https://deno.land/std/node/module.ts";

const require = createRequire(import.meta.url);
const esprima = require("esprima");
var inquirer = require('inquirer/lib/inquirer.js');

const program = 'const answer = 42';
console.log(import.meta, Deno.mainModule)