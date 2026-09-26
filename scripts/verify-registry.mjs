import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const name = "@juanmicrosoft/image-gen-mcp";
const version = "0.1.0";
const registry = "https://registry.npmjs.org";
const expected = process.env.RELEASE_HASH;
assert.match(expected ?? "", /^[a-f0-9]{64}$/);
const root = await mkdtemp(join(tmpdir(), "image-gen-registry-"));
const response = await fetch(`${registry}/@juanmicrosoft%2fimage-gen-mcp/${version}`, {
  signal: AbortSignal.timeout(15000), redirect: "error",
});
assert.equal(response.status, 200, "Published version metadata must be readable anonymously.");
const metadata = await response.json();
assert.equal(metadata.name, name);
assert.equal(metadata.version, version);
const url = new URL(metadata.dist.tarball);
assert.equal(url.origin, registry);
const archive = await fetch(url, { signal: AbortSignal.timeout(30000), redirect: "error" });
assert.equal(archive.status, 200);
const bytes = Buffer.from(await archive.arrayBuffer());
const hash = createHash("sha256").update(bytes).digest("hex");
assert.equal(hash, expected, "Public tarball differs from reviewed release.");
assert.equal(metadata.dist.integrity, `sha512-${createHash("sha512").update(bytes).digest("base64")}`);
await writeFile(join(root, "published.tgz"), bytes, { flag: "wx" });
execFileSync("npm", ["install", "--prefix", root, "--registry", registry, "--ignore-scripts",
  "--no-audit", "--no-fund", "--fetch-retries=0", `${name}@${version}`],
{ stdio: ["ignore", "pipe", "pipe"], timeout: 120000 });
const installed = join(root, "node_modules", "@juanmicrosoft", "image-gen-mcp");
assert.equal(JSON.parse(await readFile(join(installed, "package.json"))).version, version);
const client = new Client({ name: "published-registry-verification", version: "1" });
try {
  await client.connect(new StdioClientTransport({
    command: join(root, "node_modules", ".bin", "image-gen-mcp"),
    env: { PATH: process.env.PATH, HOME: root }, stderr: "pipe",
  }));
  assert.equal(client.getServerVersion().version, version);
  assert.deepEqual((await client.listTools()).tools.map(tool => tool.name).sort(),
    ["edit_image", "generate_image", "get_capabilities", "get_operation"]);
  const result = await client.callTool({ name: "get_capabilities", arguments: {} });
  assert.equal(result.structuredContent.checks.inference.status, "unverified");
} finally { await client.close(); }
console.log(JSON.stringify({ name, version, sha256: hash, integrity: metadata.dist.integrity,
  registry, freshRegistryInstall: "passed", discovery: "passed", inference: "not requested" }));
