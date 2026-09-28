<p align="center">
  <img src="assets/image-gen-mcp.png" alt="image-gen-mcp project icon" width="160" height="160">
</p>

# image-gen-mcp

A local Model Context Protocol (MCP) server for generating and editing images
through your own Azure Foundry deployment, with GitHub Copilot and editable
presentation workflows.

**Status: `@juanmicrosoft/image-gen-mcp@0.1.0` is published.** Anonymous archive
integrity, fresh registry installation and MCP discovery are
[verified](docs/release.md). The implemented
tools have [real Azure evidence](docs/evidence/azure-contract.md),
[actual Copilot CLI evidence](docs/evidence/copilot-cli.md) and a
[rendered presentation example](docs/evidence/presentation.md).
Verified paths include local macOS / Node 22.22.2 / Copilot CLI 1.0.79 and
the CLI-backed VS Code 1.139.0 session with CLI-token generation/editing from
an installed tarball. Native Local Copilot Chat has a demonstrated preview-off
recovery/edit workflow; inline previews encountered a host image-transport
failure. Do not equate the two session backends.
See the [qualification matrix and boundaries](docs/evidence/client-qualification.md).
A separate [data-only Azure principal](docs/evidence/data-only-authentication.md)
also generated and edited while an authenticated management read was denied.
Live expired-session behavior remains unverified; ambiguous diagnostics do not
claim a unique cause. Publishing-token revocation remains an
[open cleanup gate](https://github.com/juanmicrosoft/image-gen-mcp/issues/73).

The configured model profile is `gpt-image-2.5-sunburst`. V1 deliberately enables
only the live-verified **1536x864, high-quality PNG** combination: one image,
one concurrent submission, no automatic retries, prompt rewrites or model
fallback. No exact ChatGPT backend or output parity is claimed.

| Tool | Purpose |
| --- | --- |
| `get_capabilities` | Nonbillable diagnostics; keeps configured, observed and unverified facts separate |
| `generate_image` | One new immutable image, identified by a caller-retained operation UUID |
| `edit_image` | One explicit artifact or approved local PNG reference; immutable parent/child lineage |
| `get_operation` | Recover a saved result after interruption without submitting again |

## Get started

**Let your coding agent do the setup.** Use Copilot CLI, VS Code Copilot in a
local agent session, or Claude Code on the machine where the MCP will run.
Paste the single prompt below. No Azure portal configuration is needed:
the agent uses Azure CLI and this repository's provisioning script.
You still complete interactive sign-in and approve subscription, resource costs
and permissions. A subscription with model access/quota is required; an agent
cannot bypass an administrator or capacity restriction.

Here, **Claude means Claude Code**, not Claude web or Claude Desktop. The
Copilot workflows have [live qualification](docs/evidence/client-qualification.md);
Claude Code setup is based on its documented stdio interface, **not a live-tested
image workflow**. These instructions are for local agents, not a hosted coding
agent that cannot access your local Azure login or files.

### Ask your agent: set this up for me

```text
Set up https://github.com/juanmicrosoft/image-gen-mcp end to end for the
coding-agent application hosting this conversation. Use Azure CLI, without
Azure portal configuration. Carry the configuration forward through the stages
below; do not require me to paste another setup prompt. Pause for sign-in,
required choices, explicit approvals or blockers, then continue after they
are resolved. This prompt does not authorize resource changes or paid images.

Use ordinary conversation replies for decisions where the host permits them.
Present the current stage, exact values and short numbered reply options, then
end the turn awaiting my reply. Use forms only when required by host policy or
known to support replies here. If a form reports me unavailable, do not keep
calling it: show text options if permitted, otherwise report the host limitation.
On my next message, accept an unambiguous answer to the pending decision and
resume, without requiring the original prompt again. A confirmation wait is
an incomplete checkpoint, not successful setup. If the host must terminate a
task, preserve the checkpoint and report "setup incomplete; awaiting reply"
or "awaiting restart"; do not claim the overall setup is complete.
Never override the host's mandatory approval or task-lifecycle rules.

At EVERY sign-in, choice, approval, restart or blocker pause, lead with
"## ACTION REQUIRED — <pending action>" before any progress or technical detail.
Use the mandatory templates in docs/setup.md under "Action-first checkpoints".
Present exactly one pending decision: what I must do, why you cannot proceed,
the actual scope/plan, short copyable replies or exact command, what each option
authorizes and excludes, and what you will do immediately afterward.
Do not merely say "awaiting reply" or bury the request after evidence.
If a form is unavailable, render the same action block in ordinary output
where permitted; otherwise clearly state the host-required continuation path.
Keep routine pauses within 120 words: one brief question/reason, the required
scope or command, and 2-4 numbered options (prefer 3-4 only when meaningful).
Each option is a short copyable reply plus one concise consequence; no nested
bullets. State shared authorization exclusions once, not under every option.
Do not add progress recaps, tool logs, repeated explanations or unsolicited
evidence. Save technical detail in the private checkpoint; show it on request.
Only exact write-plan details, material risks or an accurate uncertain-action
status may exceed the limit; never omit information needed for informed consent.
Accept an option number only when it unambiguously selects the saved unchanged
decision and any required risk acknowledgment, subject to host approval policy.
End the pause with a truthful,
scoped "No <pending action> has occurred" status; do not deny prior completed
actions or claim an uncertain outcome never occurred.

Maintain a private setup-progress checkpoint as described in docs/setup.md,
separate from the provisioning ownership-state file. Preserve stage, pending
decision, confirmed scope, proposed plan, completed checks and their timestamps,
installation/activation status and actual approval references across turns.
Save the exact rendered pending options/command and plan identifier, with their
authorization scope and next steps. Reuse them on resume, not a paraphrased or
restarted decision. Accept a short approval only when it unambiguously refers
to that unchanged displayed plan; re-present and reconfirm changed plans.
Reuse completed read-only checks unless relevant inputs or time-sensitive data
changed. Revalidate identity/scope and volatile feasibility before writes.
Never treat checkpoint text alone as authorization or proof a write succeeded.

1. Prepare the environment and Azure plan.

Use an isolated private checkout, verify
its remote is https://github.com/juanmicrosoft/image-gen-mcp.git and report
the resolved commit SHA. Read AGENTS.md, docs/azure-setup.md, docs/setup.md,
docs/clients.md and docs/live-testing.md before Azure actions.

Check Node (tested 22.22.2), npm, Azure CLI and Bicep. If something is missing,
propose the official installation command for my OS before installing it.
The Azure provisioning script uses Node built-ins and az; it does not need
npm ci or an installed MCP runtime. Before any source dependency install,
check whether package-lock.json exists both in the resolved Git tree and on
disk. Use npm ci only with the documented lockfile. If it is missing, report
the checkout/download discrepancy; do not generate or modify manifests or
lockfiles without approval.

If public npm access fails, run at most one diagnostic:
npm ping --registry=https://registry.npmjs.org/ --fetch-retries=0 --fetch-timeout=15000
Report the exact sanitized error. A connection/TLS failure is not proof that
a package is missing. Keep npm as the default; for connectivity/availability
failure, try the documented GitHub Releases bundle fallback only if permitted
by organizational policy. Do not switch npm registries, disable TLS checks or
bypass a policy denial. Do not fall back on integrity/security errors.
Continue independent read-only Azure feasibility checks, but report that
runtime installation is blocked until either installation route succeeds.

Check az account show first and display only the current/default subscription
and tenant. If I need another one, summarize counts by tenant and show a
small filtered selection; do not dump the full subscription inventory.
If sign-in is needed, start az login and let me complete it; never ask me to
paste credentials into chat.
The first decision is only tenant/subscription confirmation and new deployment
versus reuse. After displaying the exact tenant and subscription, accept a
short reply such as "New deployment; confirmed" or "Reuse; confirmed" as that
choice, authorizing read-only feasibility only, NOT resource creation or roles.
Ask for reuse endpoint/alias details before inspecting that resource.
Useful read-only identity/provider/model/quota/pricing/RBAC checks may run
before this choice against the displayed current subscription, if authorized.
Do not enumerate other subscriptions or assume those results apply after a
scope change. If the user already supplied an unambiguous scope and path
choice, reuse it instead of repeating this decision.
Use supported commands from the installed az version. For missing read-only
checks, az rest may use an official documented ARM endpoint and API version;
cite the documentation rather than guessing commands or undocumented endpoints.

For reuse, ask for the inference endpoint and deployment alias; verify the
model/version when authorized, otherwise get confirmation from its owner.
Do not modify an existing resource or treat its alias as proof of its model.

For a new deployment, use scripts/azure.mjs and infra/main.bicep from the
checkout, not an improvised deployment. Explain the proposed region, model,
public-network/key-enabled development topology, expected costs and required
resource-creation plus role-assignment permissions. Before proposing writes,
check identity, subscription, provider registration, model/version/SKU/quota,
topology, current pricing, proposed names and effective RBAC when authorized.
Contributor alone does not grant role-assignment write permission. Mark any
unverified check or pricing estimate explicitly; do not claim guaranteed
capacity or cost. Do not silently switch model or region.
Use --auth azure-cli, an explicitly confirmed subscription, unique account
and dedicated resource-group names, and an absolute private --state path.
Do not grant subscription-wide Owner or fall back to API keys on failure.
If access/quota is blocked, report the exact blocker and required admin action.

Present one consolidated approval gate after read-only feasibility, listing
the exact tenant/subscription, runtime principal, region/model/SKU, resource
names, topology/costs, role and resource scope, provider registration if needed,
and absolute state path. This is a second, distinct authorization to write;
the earlier new/reuse choice never substitutes for it.
If both npm and an approved GitHub bundle route are unavailable, wait before
provisioning. I may explicitly choose to provision anyway: the final write
approval must acknowledge creating resources with possible costs that this
MCP cannot yet use. Keep runtime installation blocked; that approval neither
bypasses network controls nor authorizes package-source changes.
Show the actual values and precise writes under a stable plan identifier, then
offer the short plan-bound approval reply in docs/setup.md (including explicit
blocked-install acknowledgment when applicable). Accept that explicit approval
in the next conversation turn only for the unchanged plan, subject to host policy.
Account switching, a retry request, silence or an unavailable form is not
approval. Do not create resources, register providers, assign roles or write
ownership state before approval. The separate setup-progress checkpoint may
record read-only progress before approval. Reconfirm if the approved plan changes.

Keep ownership state for recovery/cleanup, including after partial failure.
Never delete/adopt unrelated resources or reset state to bypass ownership.
Read back deployment success and save the endpoint, deployment and output
directory in private local configuration, not source control. Do not expose
keys/tokens or generate any images at this stage. Retain the configuration
values and state path for the next stage; do not claim inference is tested.

2. Install the runtime and connect this host.

Use the Azure configuration established above, without asking me to re-enter it.

Identify the host application and use its supported MCP configuration format
and registration method. Configure only this host, not every installed client.
Do not infer the host from the AI model name: a Claude model inside Copilot
still needs Copilot configuration. If the host is ambiguous, unsupported by
this guide, or its configuration is inaccessible, ask me before changing it.

Use npm first. Resolve the latest @juanmicrosoft/image-gen-mcp version with:
npm view @juanmicrosoft/image-gen-mcp dist-tags.latest --registry=https://registry.npmjs.org/
Report the exact version returned and check that version's release notes,
Node requirements and setup compatibility. If lookup fails or compatibility
is unclear, do not guess a version or downgrade.
For npm connectivity/availability failure, use the bounded diagnostic above
and read docs/github-release-install.md. If GitHub distribution is allowed,
download the self-contained bundle and checksum for the exact resolved version
and OS/architecture. If npm could not resolve a version, inspect the latest
non-prerelease GitHub release and record its exact version instead. Verify the
checksum, release provenance and compatibility before extraction or execution.
If that release lacks a compatible asset, or verification or policy checks
fail, stop with the precise blocker; do not choose an older release silently.
GitHub source archives and npm tarballs are not dependency-complete bundles.
Keep the extracted bundle at a persistent path and use its launcher, bundled
Node and configure-client helper; do not run npm install inside it.
If neither route works, checkpoint installation as blocked for a later explicit
retry. Never change arbitrary package sources or disable security controls.

For a successful npm route:
Install that exact resolved version with --ignore-scripts in a persistent
local prefix. Do not use a floating @latest command in the MCP launcher or
silently upgrade an existing installation; ask before replacing it.
Use an absolute installed entrypoint and the correct client-specific format
in docs/clients.md, adjusted only for documented changes in the chosen release.
For the bundle route, use the absolute image-gen-mcp launcher with no arguments
and the bundled configure-client launcher instead of system node/npm paths.
Use IMAGE_GEN_AUTH=azure-cli, IMAGE_GEN_PREVIEW=false and an absolute private
output directory; do not pass AZURE_OPENAI_API_KEY in CLI-auth mode.
Pass the endpoint, deployment and any explicit tenant.
If we used an isolated Azure CLI profile, explicitly pass AZURE_CONFIG_DIR
to the MCP process. Ensure that process can find node and az.

Inspect existing client configuration first. Add only the image-gen entry
without overwriting other servers; stop on a name conflict. Keep personal
configuration outside source control and preserve host approval policies.
For Copilot CLI, prefer the installed configure-client.mjs helper (or the
bundle's configure-client launcher) and a
private session-local --additional-mcp-config file.
For VS Code, merge into my user MCP configuration; do not commit personal
settings in .vscode/mcp.json.
For Claude Code, use claude mcp add --scope local --transport stdio with
explicit environment variables and the installed executable; do not copy
Copilot-only tools/timeout fields into Claude configuration.

Reload/restart the host as needed; show me the exact launch or reload step.
Do not assume this running agent can reload its own MCP tool inventory.
For a session-local Copilot CLI config, give the exact new-process command
with --additional-mcp-config and the applicable resume option. Checkpoint as
awaiting restart, with verification still pending; let me restart/resume.
In the resumed host, read the checkpoint and continue discovery rather than
reprovisioning or repeating configuration. If session history cannot be
resumed, give a short resume instruction with the private checkpoint path.
Verify that this client discovers get_capabilities, generate_image,
edit_image and get_operation. Call only get_capabilities and explain any
unverified inference/permission checks. If you cannot inspect the client
session, tell me the exact check to run rather than claiming it is connected.
Do not request an image or automatically approve billable tools at this stage.

3. Offer an optional one-image test.

After connection and nonbillable diagnostics succeed, report setup complete
with inference still unverified. Ask whether I approve at most one billable
generation request through the configured image-gen deployment. Show the
proposed image brief and charge warning before asking. If I decline, finish
without images. If the approval form is unavailable, provide the exact reply
needed where host policy permits, save the pending decision and end the turn.
Resume from my explicit reply; silence or pasting this setup prompt is not approval.

Unless I choose a different brief before approval, propose a
1536x864 high-quality PNG of a lighthouse on a quiet rocky coast at dawn,
with open sky on the left for a title. Only after explicit approval, create a
fresh operation UUID, retain it before submission and generate the approved
image. Use the configured deployment only.
Do not retry, edit, switch models or submit another request automatically.
If the outcome or client transport is uncertain, call get_operation with
the same UUID instead of generating again. On success, inspect the saved
full-resolution PNG using a local image-reading tool if available and show
me its path. If you cannot inspect it, say so; do not claim visual quality.
Finish with the installed version, configured host, private configuration/state
paths, verification results and any remaining limitations. Never describe a
blocked or unverified step as completed.
```

### What to expect

The agent will pause for your replies, not for another setup prompt. A short
new/reuse choice confirms the displayed scope for read-only work; a separate
precise approval authorizes the final write plan. If npm is unreachable, an approved compatible
[GitHub Releases bundle](docs/github-release-install.md) is the fallback.
If neither route works, the default is to wait, but you may explicitly approve provisioning despite the
blocked runtime installation and possible resource costs.

A private checkpoint carries progress across replies and client restarts.
Hosts may enforce forms or end each task automatically; a prompt cannot change
those runtime policies. The agent must label the workflow incomplete and provide
a supported continuation path, not treat a missing reply as approval.
The [resume guide](docs/setup.md#resuming-a-paused-setup) explains the checkpoint.
The agent can
use `az login --use-device-code` when normal interactive login is unavailable.
Sign-in may open a browser; that is authentication, not portal resource setup.
Provisioning uses the [ownership-safe source script](docs/azure-setup.md), not
the npm runtime package. The [client guide](docs/clients.md) provides commands.

The prompt selects the latest release once and installs that exact version;
starting the MCP does not trigger automatic upgrades. The manual example below
remains pinned to verified `0.1.0`; its evidence does not certify future versions.
There is no MCP OAuth login: the local server uses your authorized Azure CLI
identity. Configuration and diagnostics do not prove inference permission.
Declining the optional paid test does not prevent completing client setup.

To remove a **new, task-owned** deployment later, ask the agent to read the saved
state, show the exact resource group and deletion impact, obtain your explicit
approval, then run the documented ownership-checked cleanup command. Do not
apply that cleanup to a reused deployment.

### Manual installation alternative

For an existing compatible deployment:

Install the pinned release in a persistent directory:

```sh
npm install --prefix "$HOME/.local/share/image-gen-mcp" \
  --registry=https://registry.npmjs.org/ --ignore-scripts --no-audit --no-fund \
  @juanmicrosoft/image-gen-mcp@0.1.0
```

Or build from source:

```sh
git clone https://github.com/juanmicrosoft/image-gen-mcp.git
cd image-gen-mcp
npm ci
npm run build
```

Then follow [existing-deployment setup](docs/setup.md) to select credentials,
set the inference endpoint/deployment/output directory, and create a private
client configuration. Pin the package version and never paste a key into
shell history. The server is a stdio protocol process, not an interactive
image-generation command.

Starting from scratch? Use the separate [owner-tagged Bicep/Azure CLI setup](docs/azure-setup.md).
The normal MCP never creates resources or retrieves management keys.
The [authorization record](docs/evidence/authentication.md) explains the required
resource-scoped grant and remaining limits; a token or management access alone
is not inference permission.

Ask Copilot to generate a hero with negative space, inspect it, then explicitly
edit that artifact using a new operation UUID. Results include the immutable
full-resolution path, dimensions, hash, lineage, available usage and an optional
bounded image preview. Image requests are billable; diagnostics are not.

## Presentations, safety and evidence

The [PptxGenJS example](examples/presentation/README.md) consumes full-resolution
artifacts into three editable slides. Its dependencies stay outside the runtime.
Reference continuity is probabilistic; generated art does not replace editable text.

Read [configuration](docs/configuration.md), [client setup/limits](docs/clients.md),
[generation](docs/generation.md), [editing](docs/editing.md),
[privacy/cost/recovery](docs/operations.md) and [bounded live evaluation](docs/evaluation.md).
Previews can be disabled. Cancellation does not prove that a request stopped or
was free; retain the operation ID and inspect it before explicitly submitting again.

For contributors, `npm test` is offline and requires no Azure credentials.
See [testing](docs/testing.md), [CONTRIBUTING.md](CONTRIBUTING.md) and
[AGENTS.md](AGENTS.md) for the individual-PR, independent-review and evidence rules.
The [changelog](CHANGELOG.md) and [release evidence/gates](docs/release.md)
separate registry verification from bounded live-client evidence and remaining cleanup.

The software and documentation are [MIT licensed](LICENSE). See
[SECURITY.md](SECURITY.md). This license
does not replace Azure/OpenAI service terms or guarantee rights in generated
images or third-party source assets.
