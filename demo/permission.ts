const desc1 = { name: "read", path: "/foo" } as const;
const status1 = await Deno.permissions.request(desc1);
// ⚠️ Deno requests read access to "/foo". Grant? [g/d (g = grant, d = deny)] g
console.log(status1);
// PermissionStatus { state: "granted" }

const desc2 = { name: "read", path: "/bar" } as const;
const status2 = await Deno.permissions.request(desc2);
// ⚠️ Deno requests read access to "/bar". Grant? [g/d (g = grant, d = deny)] d
console.log(status2);
// PermissionStatus { state: "denied" }