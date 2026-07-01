# syrus-ai.dev

Marketing site for **[Syrus](https://github.com/tkadauke/syrus)** — the
self-hosted, multi-user harness that turns GitHub issues into pull requests.

Built with **Next.js 15 (App Router)**, **Tailwind CSS v4**, and **Motion**.
Deployed as a standalone Docker container behind Nginx Proxy Manager on an
Unraid VM.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

Copy `.env.example` to `.env.local` and fill in the values you want to override
(all optional — the site runs with sensible defaults out of the box).

## Configure

Everything tweakable lives in [`lib/site.ts`](lib/site.ts) or in `NEXT_PUBLIC_*`
env vars (see [`.env.example`](.env.example)):

- **Demo form** — get a free key at [web3forms.com](https://web3forms.com) and set
  `NEXT_PUBLIC_WEB3FORMS_KEY`. Without it, the form falls back to a mailto.
- **Mac download** — `NEXT_PUBLIC_MAC_DOWNLOAD_URL` (defaults to Syrus releases).
- **Big screenshot** — drop your image at `public/product-screenshot.png`; it
  replaces the hero placeholder on the next build/redeploy (the check runs at
  build time).

## Deploy

Push to `main` → GitHub Actions builds + pushes to GHCR → the self-hosted runner
on the Unraid VM pulls and restarts the container, then verifies the running
`/api/version` matches the commit. Full one-time setup in
**[deploy/README.md](deploy/README.md)**.

## Structure

```
app/                 App Router pages, layout, API routes (/api/health, /api/version)
components/          Section + UI components (hero, pipeline, features, demo form…)
lib/site.ts          Central config: links, copy constants, feature data
public/              Static assets (icon, screenshot)
deploy/              compose.yml + the VM setup runbook
.github/workflows/   cicd.yml (build → GHCR → self-hosted deploy → verify)
Dockerfile           Multi-stage → Next.js standalone runtime image
```
