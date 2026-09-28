import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chmod, copyFile, lstat, mkdir, mkdtemp, readFile, readdir, readlink, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { parseArgs } from "node:util";
import { assertBundleInputs, bundleName, release, sha256 } from "./lib/bundle-contract.mjs";

const { values } = parseArgs({ options: {
  package: { type: "string" }, lock: { type: "string" }, output: { type: "string" },
} });
for (const key of ["package", "lock", "output"]) assert.ok(values[key] && isAbsolute(values[key]), `Absolute --${key} required.`);
assert.equal(process.version, release.node);
assert.equal(execFileSync("npm", ["--version"], { encoding: "utf8" }).trim(), "10.9.7");
const name = bundleName(process.platform, process.arch);
const bytes = await readFile(values.package);
const lock = await readFile(values.lock);
// Reject changed bytes before asking tar to parse them.
assert.equal(sha256(bytes), release.packageHash);
assert.equal(sha256(lock), release.lockHash);
const paths = execFileSync("tar", ["-tzf", values.package], { encoding: "utf8" }).trim().split("\n");
const manifest = JSON.parse(execFileSync("tar", ["-xOf", values.package, "package/package.json"], { encoding: "utf8" }));
assertBundleInputs(bytes, lock, manifest, paths);
await mkdir(values.output, { recursive: true });
const work = await mkdtemp(join(tmpdir(), "image-gen-bundle-build-"));
try {
  const bundle = join(work, name);
  const app = join(bundle, "app");
  await mkdir(app, { recursive: true });
  await mkdir(join(bundle, "runtime"));
  execFileSync("tar", ["-xzf", values.package, "--strip-components=1", "-C", app]);
  await writeFile(join(app, "package-lock.json"), lock, { flag: "wx" });
  execFileSync("npm", ["ci", "--omit=dev", "--ignore-scripts", "--no-audit", "--no-fund", "--fetch-retries=0",
    "--registry=https://registry.npmjs.org/"], { cwd: app, stdio: "inherit", timeout: 180000 });
  assert.equal(sha256(await readFile(join(app, "package-lock.json"))), release.lockHash);
  await copyFile(process.execPath, join(bundle, "runtime", "node"));
  await chmod(join(bundle, "runtime", "node"), 0o755);
  const nodeLicense = await readFile(join(dirname(process.execPath), "..", "LICENSE"));
  assert.ok(nodeLicense.toString().includes("Node.js"), "Node distribution license must be present.");
  await writeFile(join(bundle, "runtime", "LICENSE"), nodeLicense, { flag: "wx" });
  const sbom = execFileSync("npm", ["sbom", "--sbom-format=cyclonedx", "--package-lock-only", "--omit=dev"], { cwd: app, encoding: "utf8" });
  assert.ok(JSON.parse(sbom).components.length > 0);
  await writeFile(join(bundle, "sbom.cdx.json"), sbom, { flag: "wx" });
  for (const [launcher, entry] of [["image-gen-mcp", "dist/cli.js"], ["configure-client", "scripts/configure-client.mjs"]]) {
    await writeFile(join(bundle, launcher), `#!/bin/sh
set -eu
case "$0" in
  */*) base=\${0%/*} ;;
  *) printf '%s\\n' 'Launch using an absolute path.' >&2; exit 1 ;;
esac
root=$(CDPATH= cd -- "$base" && pwd -P)
exec "$root/runtime/node" "$root/app/${entry}" "$@"
`, { flag: "wx", mode: 0o755 });
  }
  await writeFile(join(bundle, "BUNDLE.txt"), `image-gen-mcp ${release.version}
Launch ./image-gen-mcp as a local stdio MCP server. No npm install is needed.
Use ./configure-client --output /absolute/private/copilot.mcp.json after setting runtime environment.
Keep this directory intact at a persistent path; do not copy the launcher alone.
Azure CLI must be separately installed and on PATH for azure-cli authentication.
Azure/network access is still required for image requests.
Node license: runtime/LICENSE. App license: app/LICENSE.
Dependency license files remain in app/node_modules.
sbom.cdx.json describes the production lock graph, including other-platform optional dependencies.
This archive is not code-signed or notarized as an application distribution.
Follow organizational software policy; never disable host security to run it.
The packaged 0.1.0 docs predate release. Current setup: https://github.com/juanmicrosoft/image-gen-mcp
`, { flag: "wx" });
  const provenance = {
    ...release, platform: process.platform, arch: process.arch,
    buildCommit: process.env.GITHUB_SHA ?? execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    workflowRun: process.env.GITHUB_RUN_ID ?? null,
    runtimeHash: sha256(await readFile(process.execPath)),
    runtimeSource: "Node distribution selected by pinned actions/setup-node; binary hash recorded",
    dependencyLock: "app/package-lock.json", lifecycleScripts: false,
    sbomScope: "Production lock graph including other-platform optional dependencies, not exact installed inventory",
    signing: "No bundle code signing or notarization",
  };
  await writeFile(join(bundle, "provenance.json"), JSON.stringify(provenance, null, 2) + "\n", { flag: "wx" });
  async function inspect(directory) {
    for (const file of await readdir(directory)) {
      assert.ok(![".npmrc", ".env", ".local", ".git"].includes(file), `Forbidden bundle entry: ${file}`);
      const path = join(directory, file);
      const info = await lstat(path);
      if (info.isSymbolicLink()) {
        const target = await readlink(path);
        const rel = relative(bundle, resolve(dirname(path), target));
        assert.ok(!isAbsolute(target) && rel !== ".." && !rel.startsWith("../"), "Bundle link escapes root.");
      } else if (info.isDirectory()) await inspect(path);
      else assert.ok(info.isFile(), "Unexpected non-file in bundle.");
    }
  }
  await inspect(bundle);
  const archive = join(work, `${name}.tar.gz`);
  execFileSync("tar", ["-czf", archive, "-C", work, name], { env: { ...process.env, COPYFILE_DISABLE: "1" } });
  const archiveBytes = await readFile(archive);
  await writeFile(join(values.output, `${name}.tar.gz`), archiveBytes, { flag: "wx" });
  await writeFile(join(values.output, `${name}.tar.gz.sha256`),
    `${sha256(archiveBytes)}  ${name}.tar.gz\n`, { flag: "wx" });
  console.log(JSON.stringify({ name, sha256: sha256(archiveBytes), ...provenance }));
} finally { await rm(work, { recursive: true, force: true }); }
