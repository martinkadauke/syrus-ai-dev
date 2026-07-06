# Azure migration plan

**Status:** planned, not started. Site stays on the local VM (`192.168.1.42`) until
we execute this. This doc is the agreed target architecture — treat it as the
source of truth when we pick the migration back up.

## Why

Currently `syrus-ai.dev` is hosted on a VM on the home network, reached via
DynDNS + router port-forwarding (80/443) to an Nginx Proxy Manager instance.
That's fragile for a public-facing product site (home internet uptime, dynamic
IP, no real scaling headroom) and ties the site's availability to home
infrastructure. Moving to Azure removes that dependency and gives real
scalability for hoped-for growth, while staying effectively free at current
traffic levels.

## Target architecture

| Concern | Service | Why |
|---|---|---|
| Running the site | **Azure Container Apps** | Serverless containers, pulls the same Docker image we already build. Scales to zero when idle (no cost), scales up under load. Free custom-domain binding + free managed TLS certificate, including for the apex domain. |
| Large file downloads (2+ files, ~400MB each) | **Azure Blob Storage** | Files served directly from Azure's storage network, not proxied through the app. Native HTTP Range support (resumable/parallel downloads). Far cheaper and faster than streaming big binaries through an app server. |
| Container registry | **GHCR (existing)**, package set to public | Free, zero migration needed, Container Apps pulls from it directly. Azure Container Registry would add ~$5/mo minimum for no benefit here. |
| CI/CD | **GitHub Actions, GitHub-hosted runners only** | Build job unchanged. Deploy step becomes `azure/login` (OIDC, no stored secret) + `az containerapp update`, same `/api/version`-matches-SHA verify pattern we use today. **The self-hosted runner is retired entirely** — nothing to babysit on home infra for this project. |
| Domain | **Stays registered at Strato**; DNS records point at Azure | Container Apps supports the apex domain (`syrus-ai.dev`, not just `www`) via a plain A record — no CNAME-flattening trick or extra DNS provider (e.g. Cloudflare) required. |

## Cost expectation

Verified against current Azure pricing pages (not assumed from training data):

- **Compute:** Container Apps' free grant is 180,000 vCPU-seconds + 360,000
  GiB-seconds + 2,000,000 requests **every month, ongoing** — not a 30-day
  trial. ([Azure Container Apps pricing](https://azure.microsoft.com/en-us/pricing/details/container-apps/))
  A low/moderate-traffic marketing site with scale-to-zero should stay inside
  this indefinitely.
- **Downloads/egress:** first **100 GB/month of internet egress is free** for
  every Azure subscription. ([Azure bandwidth pricing](https://azure.microsoft.com/en-us/pricing/details/bandwidth/))
  At 400MB/file that's ~250 free downloads/month; beyond that, ~$0.087/GB
  (≈3.5¢ per 400MB download). Note: there's a separate, smaller 5–15GB
  "always free" allowance quoted on some Azure free-account pages — that one
  is for data transfer *between Azure regions*, a different meter that does
  **not** apply to visitors downloading files from the public internet.
- **Storage:** pennies/month for a couple GB of binaries in Blob storage.
- **Custom domain + TLS on Container Apps:** free, including the apex domain.
  ([Microsoft Learn: custom domains & managed certs](https://learn.microsoft.com/en-us/azure/container-apps/custom-domains-managed-certificates))
- **Net expectation:** effectively **$0/month** at current traffic; still low
  single-digit dollars even if downloads take off, since the free egress tier
  alone covers hundreds of downloads a month.

## Phased execution plan

### Phase 0 — Azure account (user action, blocking)
Create a free Azure account (azure.microsoft.com/free) if one doesn't exist
yet. Requires a card on file per Azure's standard signup, but nothing is
charged unless usage exceeds the free amounts above. Everything past this
point can be driven together once the account exists.

### Phase 1 — Provision Azure resources
- Resource group (logical container, free on its own)
- Container Apps Environment + the Container App itself, pointed at the GHCR
  image, with `SMTP_*` / `DEMO_NOTIFY` etc. set as secrets (same env vars as
  the current compose setup)
- Storage Account + Blob container for the large files, configured for public
  read + Range support
- Bind `syrus-ai.dev` as a custom domain on the Container App and request the
  free managed certificate

### Phase 2 — Rework the CI/CD pipeline
- `cicd.yml`: keep the build job as-is (GitHub-hosted, builds + pushes to
  GHCR). Replace the self-hosted `deploy` job with `azure/login` (OIDC, no
  long-lived secret) + `az containerapp update`. Keep the existing
  `/api/version`-equals-deployed-SHA verification step — same pattern, new
  target.
- `sync-desktop.yml`: instead of SCP-ing the synced `.dmg` to a VM volume,
  upload it straight to Blob Storage from a normal GitHub-hosted runner. No
  self-hosted runner needed for this job either.
- The app's download route (currently `/download/mac`, streaming from a local
  volume) becomes a thin redirect to the current blob URL — "always serve the
  latest version" logic stays in one place, just repointed.

### Phase 3 — Cut over DNS (no-downtime cutover)
Add the new Azure A record (+ verification TXT) at Strato **while the current
home-hosted site stays live**. Verify the Azure copy of the site end-to-end on
the real domain before flipping anything off.

### Phase 4 — Decommission home hosting
Only after Phase 3 is confirmed working end-to-end:
- Remove the `syrus-ai.dev` proxy host from Nginx Proxy Manager
- Unregister the self-hosted GitHub Actions runner (`syrus-vm`) for this repo
- Disable the DynDNS updater entry / router port-forward rule **for this
  domain specifically** — check first whether that port-forward or DynDNS
  entry is shared with any other public-facing home services before touching
  it, so nothing else goes down by accident

## Open items to resolve when we execute
- Confirm whether the home port-forward (80/443) or DynDNS entry is
  dedicated to syrus-ai.dev or shared with other services before Phase 4.
- Decide GitHub OIDC federated credential vs. a simple service-principal
  secret for Azure login in Actions (plan defaults to OIDC — more setup once,
  no long-lived secret to leak).
- `SYRUS_RELEASE_TOKEN` (classic PAT for pulling private-repo releases) is
  still needed post-migration, just consumed by the Blob-upload job instead of
  the VM sync job.
