import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import ts from "typescript";
import * as validation from "../lib/graphql-validation.ts";

const require = createRequire(import.meta.url);
const { NextRequest, NextResponse } = require("next/server");
const source = await readFile(new URL("../app/api/cart/route.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loadedRoute = { exports: {} };
function forbidden() { throw new Error("Prelaunch request must not read cookies or mutate Shopify"); }
new Function("require", "module", "exports", compiled)((name) => {
  if (name === "next/server") return { NextResponse };
  if (name === "next/headers") return { cookies: forbidden };
  if (name === "@/lib/graphql-validation") return validation;
  if (name === "@/lib/shopify") return {
    isCheckoutEnabled: false,
    ShopifyError: class extends Error {},
    changeCart: forbidden,
    getCart: forbidden,
  };
  throw new Error(`Unexpected import: ${name}`);
}, loadedRoute, loadedRoute.exports);

test("actual cart route reaches the launch gate for a loopback same-origin request", async () => {
  const request = new NextRequest("http://127.0.0.1:3000/api/cart", {
    method: "POST",
    headers: { origin: "http://127.0.0.1:3000", host: "127.0.0.1:3000" },
  });
  assert.equal(new URL(request.url).hostname, "localhost");
  const response = await loadedRoute.exports.POST(request);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).configured, false);
  assert.match(response.headers.get("cache-control"), /private/);
});

test("actual cart route rejects cross-site, forged Host and forwarded-origin tricks", async () => {
  const own = "http://127.0.0.1:3000";
  for (const headers of [
    { origin: "https://evil.invalid", host: "127.0.0.1:3000" },
    { origin: "https://evil.invalid", host: "evil.invalid", "x-forwarded-host": "evil.invalid", "x-forwarded-proto": "https" },
    { origin: own, host: "evil.invalid", "x-forwarded-host": "127.0.0.1:3000" },
    { origin: own, host: "127.0.0.1:3000", "sec-fetch-site": "cross-site" },
    { host: "127.0.0.1:3000", "x-forwarded-origin": own },
  ]) {
    const request = new NextRequest(`${own}/api/cart`, { method: "POST", headers });
    const response = await loadedRoute.exports.POST(request);
    assert.equal(response.status, 403);
  }
});
