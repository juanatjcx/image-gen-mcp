import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { assertReleaseGate } from "../scripts/lib/release-gate.mjs";

const sha = "a".repeat(40);
const repository = "juanmicrosoft/image-gen-mcp";
const valid = () => ({
  event: "workflow_dispatch", ref: "refs/heads/main", repository, sha, expectedSha: sha,
  expectedHash: "b".repeat(64),
  run: { status: "completed", conclusion: "success", event: "push", head_branch: "main",
    head_sha: sha, path: ".github/workflows/verify.yml",
    head_repository: { full_name: repository }, repository: { full_name: repository } },
});

test("preparation rejects archive and evidence mutations before copying, and preserves exact valid bytes",
  { skip: process.platform === "win32" }, async (t) => {
    const root = await mkdtemp(join(tmpdir(), "release-preparation-"));
    t.after(() => rm(root, { recursive: true, force: true }));
    const cases = [
      "valid", "expected-hash", "evidence-hash", "manifest-name", "manifest-version",
      "evidence-name", "evidence-version", "archive-inventory", "evidence-inventory", "ci-provenance",
    ];
    for (const scenario of cases) {
      const work = join(root, scenario);
      const output = join(work, "download");
      const archiveRoot = join(work, "archive");
      const packageRoot = join(archiveRoot, "package");
      const bin = join(work, "bin");
      const directory = join(output, "package-fixture");
      for (const path of [packageRoot, bin, directory]) await mkdir(path, { recursive: true });
      const manifest = { name: "@juanmicrosoft/image-gen-mcp", version: "0.1.0" };
      if (scenario === "manifest-name") manifest.name = "@other/package";
      if (scenario === "manifest-version") manifest.version = "9.9.9";
      await writeFile(join(packageRoot, "package.json"), JSON.stringify(manifest));
      if (scenario === "archive-inventory") await writeFile(join(packageRoot, ".npmrc"), "fixture");
      const tarball = join(directory, "fixture.tgz");
      execFileSync("tar", ["-czf", tarball, "-C", archiveRoot,
        "package/package.json", ...(scenario === "archive-inventory" ? ["package/.npmrc"] : [])]);
      const bytes = await readFile(tarball);
      const hash = createHash("sha256").update(bytes).digest("hex");
      const evidence = { name: "@juanmicrosoft/image-gen-mcp", version: "0.1.0",
        discovery: "passed", npmOffline: false, files: ["package.json"], tarball, sha256: hash };
      if (scenario === "evidence-name") evidence.name = "@other/package";
      if (scenario === "evidence-version") evidence.version = "9.9.9";
      if (scenario === "evidence-hash") evidence.sha256 = "c".repeat(64);
      if (scenario === "evidence-inventory") evidence.files.push(".npmrc");
      await writeFile(join(directory, "evidence.json"), JSON.stringify(evidence));
      const run = valid().run;
      if (scenario === "ci-provenance") run.head_sha = "d".repeat(40);
      await writeFile(join(bin, "gh"), `#!/bin/sh\nprintf '%s\\n' '${JSON.stringify(run)}'\n`, { mode: 0o700 });
      const result = spawnSync(process.execPath, [resolve("scripts/prepare-release.mjs")], {
        encoding: "utf8", env: {
          PATH: `${bin}:${process.env.PATH}`, GITHUB_EVENT_NAME: "workflow_dispatch",
          GITHUB_REF: "refs/heads/main", GITHUB_REPOSITORY: repository, GITHUB_SHA: sha,
          RELEASE_SHA: sha, RELEASE_HASH: scenario === "expected-hash" ? "e".repeat(64) : hash,
          VERIFICATION_RUN: "123", RELEASE_DIRECTORY: output,
        },
      });
      if (scenario === "valid") {
        assert.equal(result.status, 0, result.stderr);
        assert.deepEqual(await readFile(join(output, "release.tgz")), bytes);
      } else {
        assert.notEqual(result.status, 0, scenario);
        await assert.rejects(access(join(output, "release.tgz")), { code: "ENOENT" }, scenario);
      }
    }
  });

test("release gate requires exact manually dispatched main source and successful same-repository CI", () => {
  assert.doesNotThrow(() => assertReleaseGate(valid()));
  for (const field of ["event", "ref", "repository", "sha", "expectedSha", "expectedHash"]) {
    assert.throws(() => assertReleaseGate({ ...valid(), [field]: "untrusted" }), field);
  }
  for (const field of ["status", "conclusion", "event", "head_branch", "head_sha", "path", "head_repository", "repository"]) {
    const value = valid();
    value.run[field] = "untrusted";
    assert.throws(() => assertReleaseGate(value), field);
  }
});
