import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, readFile, readdir } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { assertReleaseGate } from "./lib/release-gate.mjs";
import { assertPackageInventory } from "./lib/package-inventory.mjs";

const env = process.env;
assert.match(env.VERIFICATION_RUN ?? "", /^[1-9]\d{0,19}$/);
const run = JSON.parse(execFileSync("gh", ["api",
  `repos/juanmicrosoft/image-gen-mcp/actions/runs/${env.VERIFICATION_RUN}`], { encoding: "utf8" }));
assertReleaseGate({
  event: env.GITHUB_EVENT_NAME, ref: env.GITHUB_REF, repository: env.GITHUB_REPOSITORY,
  sha: env.GITHUB_SHA, expectedSha: env.RELEASE_SHA, expectedHash: env.RELEASE_HASH, run,
});
const root = resolve(env.RELEASE_DIRECTORY);
const directories = await readdir(root, { withFileTypes: true });
assert.equal(directories.length, 1, "Expected one verified package directory.");
assert.ok(directories[0].isDirectory());
const directory = join(root, directories[0].name);
const evidence = JSON.parse(await readFile(join(directory, "evidence.json"), "utf8"));
assert.equal(evidence.name, "@juanmicrosoft/image-gen-mcp");
assert.equal(evidence.version, "0.1.0");
assert.equal(evidence.discovery, "passed");
assert.equal(evidence.npmOffline, false);
assertPackageInventory(evidence.files);
const tarball = join(directory, basename(evidence.tarball));
const bytes = await readFile(tarball);
const hash = createHash("sha256").update(bytes).digest("hex");
assert.equal(hash, env.RELEASE_HASH, "Artifact differs from independently reviewed tarball.");
assert.equal(hash, evidence.sha256);
const paths = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" }).trim().split("\n");
assert.ok(paths.every(path => path.startsWith("package/")));
assertPackageInventory(paths.map(path => path.slice("package/".length)));
const manifest = JSON.parse(execFileSync("tar", ["-xOf", tarball, "package/package.json"], { encoding: "utf8" }));
assert.equal(manifest.name, evidence.name);
assert.equal(manifest.version, evidence.version);
assert.notEqual(manifest.private, true);
await copyFile(tarball, join(root, "release.tgz"));
console.log(JSON.stringify({ source: env.RELEASE_SHA, verificationRun: env.VERIFICATION_RUN,
  name: manifest.name, version: manifest.version, sha256: hash, files: paths.length }));
