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
Paste the prompts below in order. No Azure portal configuration is needed:
the agent uses Azure CLI and this repository's provisioning script.
You still complete interactive sign-in and approve subscription, resource costs
and permissions. A subscription with model access/quota is required; an agent
cannot bypass an administrator or capacity restriction.

Here, **Claude means Claude Code**, not Claude web or Claude Desktop. The
Copilot workflows have [live qualification](docs/evidence/client-qualification.md);
Claude Code setup is based on its documented stdio interface, **not a live-tested
image workflow**. These instructions are for local agents, not a hosted coding
agent that cannot access your local Azure login or files.

### 1. Ask the agent to prepare Azure

```text
Set up https://github.com/juanmicrosoft/image-gen-mcp for me using Azure CLI,
without Azure portal configuration. Use an isolated private checkout, verify
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
a package is missing. Defer installation and allow a later explicit retry;
do not change registries, disable TLS checks or bypass network policies.
Continue independent read-only Azure feasibility checks, but report that
runtime installation is still blocked.

Check az account show first and display only the current/default subscription
and tenant. If I need another one, summarize counts by tenant and show a
small filtered selection; do not dump the full subscription inventory.
If sign-in is needed, start az login and let me complete it; never ask me to
paste credentials into chat.
Ask me to choose/confirm the tenant and subscription, and whether to reuse
an existing compatible image deployment or create a dedicated new one.
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
and absolute state path. If runtime installation is blocked, disclose that
before requesting approval to create resources that cannot yet be used.
Include a one-line approval statement with these actual values and precisely
the proposed writes. If a confirmation form cannot be delivered or reports me
unavailable, display that statement and stop; wait for my explicit reply.
Account switching, a retry request, silence or an unavailable form is not
approval. Do not create resources, register providers, assign roles or write
ownership state before approval. Reconfirm if the approved plan changes.

Keep ownership state for recovery/cleanup, including after partial failure.
Never delete/adopt unrelated resources or reset state to bypass ownership.
Read back deployment success and save the endpoint, deployment and output
directory in private local configuration, not source control. Do not expose
keys/tokens or generate any images. Finish with the configuration values
needed for the next prompt and the state path; do not claim inference is tested.
```

The agent can run `az login --use-device-code` when normal interactive login is
unavailable. Sign-in may open a browser; that is authentication, not manual Azure
resource configuration. New resources use the existing
[ownership-safe provision/cleanup flow](docs/azure-setup.md). Provisioning is in
the **source checkout**, not the npm runtime package.

### 2. Ask the agent to connect your client

Paste this into the same local agent conversation; no client-name substitution
is needed:

```text
Connect image-gen-mcp to the coding-agent application hosting this
conversation, using the Azure configuration from the previous step.

Identify the host application and use its supported MCP configuration format
and registration method. Configure only this host, not every installed client.
Do not infer the host from the AI model name: a Claude model inside Copilot
still needs Copilot configuration. If the host is ambiguous, unsupported by
this guide, or its configuration is inaccessible, ask me before changing it.

Use the latest release of @juanmicrosoft/image-gen-mcp available from the
public npm registry at setup time. Resolve its latest tag with:
npm view @juanmicrosoft/image-gen-mcp dist-tags.latest --registry=https://registry.npmjs.org/
Report the exact version returned and check that version's release notes,
Node requirements and setup compatibility. If lookup fails or compatibility
is unclear, stop and explain rather than guessing a version or downgrading.
For a network failure, use the bounded npm diagnostic in the first prompt;
leave installation/configuration incomplete and resume only on an explicit
retry, without changing package sources or disabling security controls.
Install that exact resolved version with --ignore-scripts in a persistent
local prefix. Do not use a floating @latest command in the MCP launcher or
silently upgrade an existing installation; ask before replacing it.
Use an absolute installed entrypoint and the correct client-specific format
in docs/clients.md, adjusted only for documented changes in the chosen release.
Use IMAGE_GEN_AUTH=azure-cli, IMAGE_GEN_PREVIEW=false and an absolute private
output directory; do not pass AZURE_OPENAI_API_KEY in CLI-auth mode.
Pass the endpoint, deployment and any explicit tenant.
If we used an isolated Azure CLI profile, explicitly pass AZURE_CONFIG_DIR
to the MCP process. Ensure that process can find node and az.

Inspect existing client configuration first. Add only the image-gen entry
without overwriting other servers; stop on a name conflict. Keep personal
configuration outside source control and preserve host approval policies.
For Copilot CLI, prefer the installed configure-client.mjs helper and a
private session-local --additional-mcp-config file.
For VS Code, merge into my user MCP configuration; do not commit personal
settings in .vscode/mcp.json.
For Claude Code, use claude mcp add --scope local --transport stdio with
explicit environment variables and the installed executable; do not copy
Copilot-only tools/timeout fields into Claude configuration.

Reload/restart the host as needed; show me the exact launch or reload step.
Verify that this client discovers get_capabilities, generate_image,
edit_image and get_operation. Call only get_capabilities and explain any
unverified inference/permission checks. If you cannot inspect the client
session, tell me the exact check to run rather than claiming it is connected.
Do not request an image or automatically approve billable tools.
```

The [client guide](docs/clients.md) includes concrete configuration commands.
This prompt selects the latest release once, then pins the resolved version for
installation; starting the MCP does not trigger automatic upgrades. The manual
example below remains pinned to the verified `0.1.0` release. Its qualification
evidence does not certify future package versions.
There is no MCP OAuth login here: the local server uses the Azure CLI identity
you authorized. Valid configuration or a working `az login` is **not** proof of
inference permission.

### 3. Try one image, deliberately

Only after you are ready for an Azure image charge, paste:

```text
I approve at most one billable image-generation request through image-gen.
Create a fresh operation UUID and retain it before submission. Generate a
1536x864 high-quality PNG of a lighthouse on a quiet rocky coast at dawn,
with open sky on the left for a title. Use the configured deployment only.
Do not retry, edit, switch models or submit another request automatically.
If the outcome or client transport is uncertain, call get_operation with
the same UUID instead of generating again. On success, inspect the saved
full-resolution PNG using a local image-reading tool if available and show
me its path. If you cannot inspect it, say so; do not claim visual quality.
```

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
