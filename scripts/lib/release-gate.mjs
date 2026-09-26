import assert from "node:assert/strict";

export function assertReleaseGate({ event, ref, repository, sha, expectedSha, expectedHash, run }) {
  assert.equal(event, "workflow_dispatch", "Release requires manual dispatch.");
  assert.equal(ref, "refs/heads/main", "Release requires main.");
  assert.equal(repository, "juanmicrosoft/image-gen-mcp");
  assert.match(expectedSha, /^[a-f0-9]{40}$/);
  assert.equal(sha, expectedSha, "Dispatch must match the reviewed source.");
  assert.match(expectedHash, /^[a-f0-9]{64}$/);
  assert.equal(run.status, "completed");
  assert.equal(run.conclusion, "success");
  assert.equal(run.event, "push");
  assert.equal(run.head_branch, "main");
  assert.equal(run.head_sha, expectedSha);
  assert.equal(run.path, ".github/workflows/verify.yml");
  assert.equal(run.head_repository?.full_name, repository);
  assert.equal(run.repository?.full_name, repository);
}
