# Release candidate and evidence index

## Status — 2026-09-27 UTC

`@juanmicrosoft/image-gen-mcp@0.1.0` was published by
[run 36318817232](https://github.com/juanmicrosoft/image-gen-mcp/actions/runs/36318817232).
Anonymous version metadata and archive retrieval passed, including the reviewed
SHA-256 `fdafc22dc994edb23af7011cfad77e41a10f04bbd6d5c87a872fd7dd25a5e010`
and registry SHA-512 integrity. The subsequent fresh registry install returned
404 for package-level metadata. Propagation delay is a hypothesis, not a proven
cause. Verification-only runs at 12:26 and 12:27 UTC also returned 404.
At 12:32 UTC, [run 36319308717](https://github.com/juanmicrosoft/image-gen-mcp/actions/runs/36319308717)
passed anonymous metadata/archive/hash/integrity, fresh pinned registry install,
installed package/server version agreement, all four tools and nonbillable
diagnostics with inference unverified. No image request or republish occurred.
Installability was therefore verified after the initial availability failures.
[npm documents publish-time scanning delays](https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/);
the package's exact internal scan state was not observed.

The publishing GitHub secret was deleted after submission. npm token revocation
has not yet been verified; deleting the GitHub secret does not revoke the token.
Earlier attempts failed with local connectivity errors and npm `EOTP`; the
replacement credential allowed the successful submission recorded above.

The repository is public and the code/documentation are MIT licensed. Service
terms and rights in generated/reference images remain separate. Do not replace
source setup with an unpinned `npx` version.

### Immutable release identity

- Published source: `023a1d638baa28bb23200c60998ad3ce34695a1b`.
- Exact-source offline CI: [36276966743](https://github.com/juanmicrosoft/image-gen-mcp/actions/runs/36276966743);
  its Ubuntu artifact contains 72 files and matches the SHA-256 above.
- Publication: [36318817232](https://github.com/juanmicrosoft/image-gen-mcp/actions/runs/36318817232).
- Verification-only source: `f5598c78fc4552f1314d61df1658f05848e61e79`;
  this later commit adds recovery tooling/documentation, not new published bytes.
- Registry package: <https://www.npmjs.com/package/@juanmicrosoft/image-gen-mcp/v/0.1.0>.

The version tag must point to the published source, not a later documentation
commit. The immutable archive includes the pre-publication documentation;
this repository record and the version's release notes supersede that historical
status text. Do not rebuild later source and claim it is the same archive.

## Verification pipeline

The `Offline verification` workflow runs locked dependency installation,
production-dependency audit, typecheck, offline tests, the isolated presentation
example test and real tarball installation/discovery on Ubuntu/macOS with Node
22.22.2. It checks MCP/package version agreement and retains per-run tarballs
and SHA-256/inventory evidence as workflow artifacts for 14 days.

[Run 36053657929](https://github.com/juanmicrosoft/image-gen-mcp/actions/runs/36053657929)
passed every step on both hosted platforms for candidate
`651d75ae58aa62244bd44e47dbaaddad89b5a6bc`, including normal-mode registry
dependency installation. This is distinct from the local warm-cache check.
Consult the PR/current commit checks for subsequent candidates; an earlier green
run is not proof for a different commit. Jobs have read-only repository permission, no Azure credentials,
`IMAGE_GEN_LIVE=false`, no publishing step and no image-generation requests.
There is deliberately no automatic live or publishing workflow. The separate
manual release workflow below is the only publishing route. npm access for
dependencies/audit is expected; "offline" refers to image-provider tests, not a
general network sandbox.

Action references are immutable commits resolved from official `actions/*`
v6 tags on 2026-09-24. Locked dependencies plus the production audit provide
repeatable installation and advisory checking, not a security guarantee.
Dependency changes still need a tracked issue, dedicated PR and review.

## Evidence and support boundaries

| Surface | Dated evidence / limitation |
| --- | --- |
| Model/API/deployment | [Contract](evidence/azure-contract.md), [deployment](evidence/azure-deployment.md); no ChatGPT backend parity |
| Authentication | [Isolated data-only proof](evidence/data-only-authentication.md); key/user-CLI evidence retained; live expiry unverified and explicitly outside revised v1 gate |
| Actual client | [Installed-client qualification](evidence/client-qualification.md); macOS/Node 22.22.2/CLI 1.0.79 and VS Code 1.139.0; native Local recovery/editing qualified with previews off and recorded host-model boundaries |
| Artifact quality | [Fixed three-case evaluation](evidence/visual-evaluation.md); not universal visual-quality assurance |
| Reliability | [Offline fault/protocol evidence](evidence/reliability.md), [recovery](recovery.md); unknown is not free or retriable |
| Presentation | [Rendered editable deck](evidence/presentation.md); viewer/font portability not guaranteed |
| Installation | [Onboarding](evidence/onboarding.md), [installed-client success](evidence/client-qualification.md), [data-only setup](evidence/data-only-authentication.md); initial packed edit remains unknown; local installs use warm cache |
| Platform support | [Distribution boundaries](distribution.md); CI is not live-client/Entra/platform certification |

**Qualification update, 2026-09-25 UTC:** the linked initial
records retain historical failures. [Later installed-client evidence](evidence/client-qualification.md)
proves CLI-token generation/editing and image access in local macOS
Copilot CLI and CLI-backed VS Code. Native Local generation succeeded; after
a host image-transport failure, preview-off recovery, editing and local-file
inspection succeeded. Host model/version boundaries are recorded separately.
The former packed edit remains unknown. Separate data-only generation/editing,
authenticated ARM denial and temporary authorization cleanup are now recorded.
Live expired-session testing was explicitly removed from the v1 completion gate,
not declared passed; conservative diagnostics and their limits remain documented.
The published version has fresh hosted-Ubuntu registry-install verification.
This is not an all-platform certification.

## Authorized publication checklist

Publishing is a separate, explicit operation, not a side effect of
building or merging. An authorized maintainer must:

1. Resolve remaining release gates or explicitly scope a separately tracked
   preview; retain the existing unknown operation/budget rather than retrying.
2. Verify npm identity, scope/package ownership and publishing permission using
   the intended registry. Configure a supported trusted publisher or protected
   credentials without committing secrets.
3. Select the reviewed commit and verify its exact workflow run passed. Download
   or build its tarball, compare the recorded checksum/inventory, and review
   package contents and release notes. Do not use an older candidate checksum.
4. Publish the reviewed tarball explicitly with public access only after
   authorization; do not overwrite/reuse an already published version.
5. Read registry metadata, install that exact version into a fresh prefix and
   repeat discovery and the approved client acceptance. Link the registry
   version, run, checksum and limitations before tagging/announcing a release.

Those publication and registry-install steps now have the evidence above.
Client commands must pin `@juanmicrosoft/image-gen-mcp@0.1.0` rather than an
unbounded `latest`. Credential cleanup remains distinct and unfinished.

## Guarded first-publication workflow

`Manual verified npm release` is available only through an explicit
`workflow_dispatch` on `main`. It is restricted to `0.1.0` of
`@juanmicrosoft/image-gen-mcp`; it is not general automatic release tooling.
Supply the reviewed source SHA, its successful main `Offline verification`
run ID and the independently inspected Ubuntu tarball's SHA-256.

The workflow verifies the run's repository, event, workflow path, branch, SHA
and conclusion, then checks the downloaded archive's hash, package identity
and allowed inventory. It publishes that archive without repacking or running
lifecycle scripts. A version lookup must return exactly 404; network errors
or an already published version fail closed. The npm CLI is checked as 10.9.7
under pinned Node 22.22.2.

The user supplies `NPM_TOKEN` directly as an encrypted repository Actions
secret. It is exposed only to the explicit publishing step, after dependency
installation and artifact verification. The first-release token needs scoped
publishing permission and per-token 2FA bypass; this does not change account
2FA. The user reported a seven-day expiry. Revoke the token in npm and delete
the GitHub secret immediately after use rather than waiting for expiration.
Never echo a token, put it in workflow inputs or commit it in configuration.

The publish step checks the authenticated npm username and submits once with
fetch retries disabled. A transport failure can still mean publication occurred:
inspect registry metadata before another dispatch. After successful submission,
a token-free step anonymously fetches the version and tarball, compares SHA-256
and registry integrity, installs the exact registry version into a fresh prefix
with scripts disabled, and checks MCP version/discovery. It makes no Azure
image request and does not claim a new live client/model certification.

Staged publishing was considered, but
[npm 12.1.0 documentation](https://github.com/npm/cli/blob/c039090578a5b21a1aa3aba9c96e199feaf1823a/docs/lib/content/commands/npm-stage.md)
requires the package to exist first. No dummy package/version is created to
bypass that prerequisite. Future OIDC or staged publishing is separate work.
The manual workflow's existence alone is not evidence of a published version.

## Read-only verification recovery

After a successful publish followed by a failed verification, never rerun the
publishing workflow. `Manual published registry verification`
(`verify-registry.yml`) is a separate, manual, main-only workflow with read-only
repository permissions and no publishing credentials. It runs the existing
anonymous metadata/archive/integrity and fresh installation/MCP discovery checks
against the fixed reviewed `0.1.0` archive hash above. It neither republishes nor
requests images, and a failed check remains a failure without automatic retries.
Record its actual run before claiming registry installation is verified.

## Application bundle assets

The separate `Application bundles` workflow packages the immutable published
`0.1.0` archive and its original source lockfile with Node 22.22.2 and production
dependencies. The workflow has read-only permissions and never publishes npm or
uploads release assets. A maintainer attaches the exact successful main-run
artifacts to `v0.1.0` after independent review, without replacing existing assets
or moving the tag. Bundle build code is newer than the original app/tag;
`provenance.json` records both identities, hashes and the build run.

Before using the [fallback](github-release-install.md), require the named
platform asset and checksum to exist on the release. An automatic GitHub source
archive is not an application bundle. Cold bundle verification, native image
processing and discovery evidence accompany each archive as
`image-gen-mcp-0.1.0-PLATFORM-ARCH.verification.json`.
This is not new live Azure/client qualification or application code signing.
The release notes record the actual asset-publication run; documentation alone
does not establish that an asset is available.
