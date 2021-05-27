/// <reference path="./douyin.lib.d.ts" />
// @deno-types="./douyin.lib.d.ts"

import DouYinSdk, {Ability} from "./douyin.lib.ts";
// import DouYinSdk, {Ability} from "./douyin.lib";

import {
  assertEquals,
} from "https://deno.land/std@0.90.0/testing/asserts.ts";

Deno.test("test instance of DouYinSdk", () => {
  console.log("Test...", DouYinSdk, Ability.VideoCreate);
  let sdk:DouYinSdk = new DouYinSdk("your app client key", "and client secret");
  assertEquals(sdk instanceof DouYinSdk, true);
});
