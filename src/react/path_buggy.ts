/**
 * file: demo/react/path_buggy.ts
 * deno 1.7.0
 * deno run -A --unstable demo\react\path_buggy.ts
 * 
 * Use posix in Windows, make buggy output:
 * Check file:///C:/coding/md-code/deno/demo/react/path_buggy.ts
 * {
 *   appDir: "/C:/coding/md-code/deno/demo/react",
 *   appDirUrl: "file:///C:/coding/md-code/deno/demo/react",
 *   mainModule: "file:///C:/coding/md-code/deno/demo/react/path_buggy.ts",
 *   cwd: "C:\\coding\\md-code\\deno",
 *   relative: "../../../../../..C:\\coding\\md-code\\deno/C:\\coding\\md-code\\deno"
 * }
 */

import { osType, isWindows } from "https://deno.land/std@0.95.0/_util/os.ts";
import { dirname, fromFileUrl, posix, win32 } from "https://deno.land/std@0.90.0/path/mod.ts";

let appDirUrl = win32.dirname(Deno.mainModule);
let appDir = win32.fromFileUrl(appDirUrl);
console.log({
  osType, isWindows,
  appDir, appDirUrl, 
  mainModule:Deno.mainModule, 
  cwd : Deno.cwd(), 
  relative: win32.relative(appDir, Deno.cwd())
});
