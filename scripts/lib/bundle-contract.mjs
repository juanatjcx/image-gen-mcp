import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { assertPackageInventory } from "./package-inventory.mjs";

export const release = Object.freeze({
  name: "@juanmicrosoft/image-gen-mcp",
  version: "0.1.0",
  source: "023a1d638baa28bb23200c60998ad3ce34695a1b",
  packageHash: "fdafc22dc994edb23af7011cfad77e41a10f04bbd6d5c87a872fd7dd25a5e010",
  lockHash: "536caa730b0ab724bd36134c641f139836f52ca7c2a42e32783868713c28f50d",
  node: "v22.22.2",
});

export const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");

export function bundleName(platform, arch) {
  assert.ok(["darwin-arm64", "linux-x64"].includes(`${platform}-${arch}`), "Unsupported bundle platform.");
  return `image-gen-mcp-${release.version}-${platform}-${arch}`;
}

export function assertBundleInputs(tarball, lockBytes, manifest, paths) {
  assert.equal(sha256(tarball), release.packageHash, "Not the reviewed published archive.");
  assert.equal(sha256(lockBytes), release.lockHash, "Not the reviewed source lockfile.");
  assertBundleManifest(manifest, JSON.parse(lockBytes));
  assertBundlePaths(paths);
}

export function assertBundleManifest(manifest, lock) {
  assert.equal(manifest.name, release.name);
  assert.equal(manifest.version, release.version);
  assert.equal(lock.name, release.name);
  assert.equal(lock.version, release.version);
  assert.deepEqual(lock.packages[""].dependencies, manifest.dependencies);
}

export function assertBundlePaths(paths) {
  assert.ok(paths.length > 0 && paths.every(path => path.startsWith("package/")));
  assertPackageInventory(paths.map(path => path.slice("package/".length)));
}
