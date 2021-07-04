import { ServerRequest, Response } from "https://deno.land/std@0.97.0/http/server.ts";
import { Cookie, getCookies, setCookie, deleteCookie } from "https://deno.land/std@0.97.0/http/cookie.ts";

let request = new ServerRequest();
request.headers = new Headers();
request.headers.set("Cookie", "full=of; tasty=chocolate");

const cookies = getCookies(request);
console.log("cookies:", cookies);
// cookies: { full: "of", tasty: "chocolate" }

let response: Response = {};
const cookie: Cookie = { name: "Space", value: "Cat" };
setCookie(response, cookie);

let cookieHeader = response.headers!.get("set-cookie");
console.log("Set-Cookie:", cookieHeader);
// Set-Cookie: Space=Cat

deleteCookie(response, "deno");
cookieHeader = response.headers!.get("set-cookie");
console.log("Set-Cookie:", cookieHeader);
// Set-Cookie: deno=; Expires=Thus, 01 Jan 1970 00:00:00 GMT