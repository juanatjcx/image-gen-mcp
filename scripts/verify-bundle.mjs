import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { bundleName, release, sha256 } from "./lib/bundle-contract.mjs";

const { values } = parseArgs({ options: { directory: { type: "string" } } });
assert.ok(values.directory);
const name = bundleName(process.platform, process.arch);
const archive = resolve(values.directory, `${name}.tar.gz`);
const checksum = (await readFile(`${archive}.sha256`, "utf8")).trim();
assert.equal(checksum, `${sha256(await readFile(archive))}  ${name}.tar.gz`);
const work = await realpath(await mkdtemp(join(tmpdir(), "image-gen-cold bundle-")));
try {
  const paths = execFileSync("tar", ["-tzf", archive], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }).trim().split("\n");
  assert.ok(paths.every(path => path.startsWith(`${name}/`) && !path.split("/").includes("..")));
  execFileSync("tar", ["-xzf", archive, "-C", work]);
  const bundle = join(work, name);
  const node = join(bundle, "runtime", "node");
  const provenance = JSON.parse(await readFile(join(bundle, "provenance.json"), "utf8"));
  for (const [key, value] of Object.entries(release)) assert.equal(provenance[key], value);
  assert.equal(provenance.platform, process.platform);
  assert.equal(provenance.arch, process.arch);
  assert.equal(provenance.runtimeHash, sha256(await readFile(node)));
  assert.equal(sha256(await readFile(join(bundle, "app/package-lock.json"))), release.lockHash);
  const manifest = JSON.parse(await readFile(join(bundle, "app/package.json"), "utf8"));
  assert.equal(manifest.name, release.name);
  assert.equal(manifest.version, release.version);
  const guard = join(work, "deny-network.cjs");
  await writeFile(guard, `const deny = () => { throw Error("Network forbidden in bundle verification"); };
const net = require("node:net");
net.Socket.prototype.connect = deny;
require("node:tls").connect = deny;
require("node:dgram").createSocket = deny;
globalThis.fetch = deny;
`);
  // No inherited credentials, npm cache, system Node/npm or network access.
  const env = { HOME: work, PATH: "/nonexistent", TMPDIR: work,
    NODE_OPTIONS: `--require ${JSON.stringify(guard)}` };
  assert.throws(() => execFileSync(node, ["-e", "require('node:net').connect(443, 'registry.npmjs.org')"], {
    env, stdio: "pipe", timeout: 5000,
  }), error => String(error.stderr ?? "").includes("Network forbidden in bundle verification"));
  const native = execFileSync(node, ["--input-type=module", "-e", `
    import { createRequire } from "node:module";
    const sharp = createRequire(${JSON.stringify(pathToFileURL(join(bundle, "app/package.json")).href)})("sharp");
    const png = await sharp({create:{width:1536,height:864,channels:4,background:"#336699"}}).png().toBuffer();
    const meta = await sharp(png).metadata();
    if(meta.width !== 1536 || meta.height !== 864) throw Error("Native PNG processing failed");
    console.log(JSON.stringify({version:process.version,execPath:process.execPath,native:"passed"}));
  `], { env, encoding: "utf8", timeout: 15000 });
  const probe = JSON.parse(native);
  assert.equal(probe.version, release.node);
  assert.equal(probe.execPath, node);
  const config = join(work, "private", "copilot.json");
  execFileSync(join(bundle, "configure-client"), ["--output", config], { env: {
    ...env, IMAGE_GEN_AUTH: "azure-cli", IMAGE_GEN_PREVIEW: "false",
    AZURE_OPENAI_ENDPOINT: "https://example.openai.azure.com/",
    AZURE_OPENAI_IMAGE_DEPLOYMENT: "sunburst", IMAGE_GEN_OUTPUT_DIR: join(work, "images"),
  }, stdio: "pipe", timeout: 10000 });
  const configured = JSON.parse(await readFile(config, "utf8")).mcpServers["image-gen"];
  assert.equal(configured.command, node);
  assert.equal(configured.args[0], join(bundle, "app", "dist", "cli.js"));
  const client = new Client({ name: "cold-bundle-verification", version: "1" });
  const transport = new StdioClientTransport({ command: join(bundle, "image-gen-mcp"), env, stderr: "pipe" });
  let stderr = "";
  transport.stderr?.on("data", chunk => { stderr += chunk; });
  try {
    await client.connect(transport);
    assert.equal(client.getServerVersion().version, release.version);
    assert.deepEqual((await client.listTools()).tools.map(tool => tool.name).sort(),
      ["edit_image", "generate_image", "get_capabilities", "get_operation"]);
    const result = await client.callTool({ name: "get_capabilities", arguments: {} });
    assert.equal(result.structuredContent.checks.inference.status, "unverified");
  } finally { await client.close(); }
  assert.equal(stderr, "");
  const evidence = { archive: `${name}.tar.gz`, sha256: checksum.split(" ")[0],
    platform: process.platform, arch: process.arch, bundledNode: probe.version,
    systemNodeNpm: "not on PATH", cache: "fresh HOME", networkGuard: "enforced in child Node processes",
    native: "passed", configHelper: "passed", discovery: "passed", inference: "not requested" };
  await writeFile(resolve(values.directory, `${name}.verification.json`), JSON.stringify(evidence, null, 2) + "\n", { flag: "wx" });
  console.log(JSON.stringify(evidence));
} finally { await rm(work, { recursive: true, force: true }); }
