# GitHub Releases fallback (npm remains the default)

Use npm first. If public npm is unreachable or unavailable in your environment,
the alternative is a **self-contained application bundle**, not npm's `.tgz`
and not GitHub's automatic source-code archive. A bundle contains Node 22.22.2,
the unchanged published `0.1.0` app, locked production dependencies (including
native Sharp), and launchers. Extraction/launch needs no npm, installed Node,
dependency download or warm cache.

This is an alternative approved distribution channel, **not a network-policy
bypass**. If npm is blocked by organization policy, use GitHub assets only if
that policy permits them. Otherwise ask the administrator for an approved
distribution/mirror. Do not disable TLS, Gatekeeper or endpoint protection.
These archives are not application-code-signed or notarized; checksum matching
detects corruption but is not an independent publisher signature. Organizations
requiring signed applications must approve/repackage through their own process.

## Version and platform selection

If npm already resolved a version, use its exact `vVERSION` GitHub release and
matching bundle; never silently downgrade to a tag that happens to have assets.
If npm resolution itself failed, inspect the latest non-draft, non-prerelease
[GitHub release](https://github.com/juanmicrosoft/image-gen-mcp/releases/latest),
record its exact version and review its notes/assets. Do not assume `latest`
always has compatible bundles. Missing assets or a failed checksum are blockers,
not reasons to run an unverified download or revert to source installation.

The first bundle targets are:

| Platform | Archive |
| --- | --- |
| macOS Apple Silicon (arm64) | `image-gen-mcp-0.1.0-darwin-arm64.tar.gz` |
| Ubuntu 24.04 x64 (glibc) | `image-gen-mcp-0.1.0-linux-x64.tar.gz` |

Other Linux distributions, Alpine/musl, Windows, Intel macOS and Linux arm64 are
not qualified bundle targets. Never select by OS alone: check architecture too.
Hosted cold-launch/native-library verification is not new live Azure/client
qualification. The existing [client evidence](evidence/client-qualification.md)
still defines those boundaries.

## Download, verify, then extract

The example below is for **macOS arm64, version 0.1.0**. Select the appropriate
verified version/platform before running it. GitHub CLI is one download method;
an approved browser or HTTPS client can download the same named assets without
installing `gh`. Use a new private download directory and do not overwrite an
existing installation.

```sh
mkdir -p "$HOME/.local/share/image-gen-mcp-releases"
download="$(mktemp -d)"
asset="image-gen-mcp-0.1.0-darwin-arm64.tar.gz"
gh release download v0.1.0 --repo juanmicrosoft/image-gen-mcp \
  --pattern "$asset" --pattern "$asset.sha256" --dir "$download"
cd "$download"
shasum -a 256 -c "$asset.sha256"
```

**Stop on any failure.** Ensure the checksum file contains exactly one entry
for the selected archive, and compare with the asset digest/evidence in the
release record when available. Only after verification, inspect the archive
listing (`tar -tzf "$asset"`): it must contain a single matching
`image-gen-mcp-0.1.0-darwin-arm64/` root, with no absolute or `..` paths.
Then extract to a fresh directory in your persistent installation location:

```sh
test ! -e "$HOME/.local/share/image-gen-mcp-releases/image-gen-mcp-0.1.0-darwin-arm64" &&
  tar -xzf "$asset" -C "$HOME/.local/share/image-gen-mcp-releases"
```

Keep the complete directory intact. Its `image-gen-mcp` launcher invokes the
included Node by absolute path; no npm is executed at launch. Do not invoke
`npm install`, `npx`, or a system `node` against this bundle.
Remove the specific temporary downloads when finished.

## Configure the current host

Use the absolute **launcher path** as the MCP command, with no arguments:

```text
/YOUR/HOME/.local/share/image-gen-mcp-releases/image-gen-mcp-0.1.0-darwin-arm64/image-gen-mcp
```

For VS Code, retain top-level `servers`; for Copilot CLI use `mcpServers`.
For Claude Code, retain the documented environment/transport/scope options and
replace `node /path/to/dist/cli.js` after `--` with this launcher alone.
Pass runtime environment as in [setup](setup.md), including an isolated
`AZURE_CONFIG_DIR` when used. Azure CLI must still be separately installed/on
PATH for CLI authentication, and Azure inference must remain reachable.

The bundle includes a Copilot configuration helper launcher:

```sh
"$HOME/.local/share/image-gen-mcp-releases/image-gen-mcp-0.1.0-darwin-arm64/configure-client" \
  --output "$HOME/.config/image-gen-mcp/copilot.mcp.json"
```

Set runtime environment first. The helper refuses to overwrite an existing file
and embeds the bundled Node/app paths; keep that installation in place.
Follow the [restart/resume handoff](clients.md#activate-in-a-new-process-and-resume).
Discover the four tools and call only `get_capabilities` before any separately
approved image test. A download is not proof of successful client activation.

## Contents, verification and maintenance

`provenance.json` records the original app source/hash, dependency lock hash,
Node binary hash, build commit and CI run. `runtime/LICENSE` contains Node and
its third-party notices; app/dependency license files remain in place.
`sbom.cdx.json` is the production lock graph, including optional dependencies
for other platforms, **not** an exact inventory of installed files.

The read-only `Application bundles` CI builds on native runners. Its verifier
extracts into a new path containing spaces, uses a fresh HOME and a PATH without
Node/npm, enforces a tested Node-level network-denial preload, checks real native
PNG processing, the bundled config helper, MCP version/discovery and nonbillable
capabilities. This is not an OS-wide network sandbox or live Azure test.
Build runners need registry access; bundle users do not.

Assets are attached only after independent review and successful exact-commit
CI. Do not replace existing assets in place, move the release tag, or claim that
a new build is byte-identical to an earlier archive. Bundled Node/dependencies
need maintained releases when updates are required; there is no automatic update.
The [release record](release.md) distinguishes original npm publication from
later application-bundle assets. npm stays the default distribution path.
