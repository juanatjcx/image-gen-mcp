import assert from "node:assert/strict";
import test from "node:test";
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
