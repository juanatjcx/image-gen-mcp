import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { assertBundleInputs, assertBundleManifest, assertBundlePaths, bundleName, release } from "../scripts/lib/bundle-contract.mjs";

test("bundles support only qualified platform targets and immutable inputs", () => {
  assert.equal(bundleName("darwin", "arm64"), "image-gen-mcp-0.1.0-darwin-arm64");
  assert.equal(bundleName("linux", "x64"), "image-gen-mcp-0.1.0-linux-x64");
  for (const [platform, arch] of [["win32", "x64"], ["linux", "arm64"], ["darwin", "x64"]]) {
    assert.throws(() => bundleName(platform, arch));
  }
  assert.throws(() => assertBundleInputs(Buffer.from("wrong"), Buffer.from("{}"), {}, []), /archive/);
  for (const path of ["../escape", "/absolute", ".npmrc", "dist/../../escape", "node_modules/test"]) {
    assert.throws(() => assertBundlePaths([`package/${path}`]));
  }
  assert.throws(() => assertBundlePaths(["other/package.json"]));
  assertBundlePaths(["package/package.json", "package/dist/cli.js", "package/LICENSE"]);
});

test("bundle manifest rejects wrong versions, identity and dependency lock", () => {
  const manifest = { name: release.name, version: release.version, dependencies: { sharp: "0.35.4" } };
  const lock = { name: release.name, version: release.version, packages: { "": { dependencies: manifest.dependencies } } };
  assertBundleManifest(manifest, lock);
  for (const key of ["name", "version"]) {
    assert.throws(() => assertBundleManifest({ ...manifest, [key]: "wrong" }, lock));
    assert.throws(() => assertBundleManifest(manifest, { ...lock, [key]: "wrong" }));
  }
  assert.throws(() => assertBundleManifest({ ...manifest, dependencies: {} }, lock));
});

test("bundle builder rejects changed source bytes before extraction or install", async t => {
  const root = await mkdtemp(join(tmpdir(), "bundle-reject-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, "bad.tgz"), "not an archive");
  await writeFile(join(root, "lock.json"), "{}");
  const result = spawnSync(process.execPath, [resolve("scripts/build-bundle.mjs"),
    "--package", join(root, "bad.tgz"), "--lock", join(root, "lock.json"), "--output", join(root, "out")],
  { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /AssertionError/);
});

test("bundle CI uses the immutable source and has no publishing permission", async () => {
  const workflow = await readFile(new URL("../.github/workflows/bundles.yml", import.meta.url), "utf8");
  assert.match(workflow, /permissions:\n  contents: read/);
  assert.doesNotMatch(workflow, /secrets\.|: write|npm publish|gh release upload/);
  assert.match(workflow, /node scripts\/verify-bundle.mjs/);
  assert.ok(workflow.includes(`/${release.source}/package-lock.json`));
});
