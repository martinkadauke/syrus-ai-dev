# Deploying syrus-ai.dev

This is the one-time setup runbook for the Unraid VM that hosts the Syrus
marketing site. After it's done, every push to `main` builds an image on GitHub,
pushes it to GHCR, and the self-hosted runner on this VM pulls + restarts the
container. TLS and the public hostname are handled by your existing **Nginx
Proxy Manager (NPM)**.

```
push to main
   └─ GitHub-hosted runner: docker build → push ghcr.io/martinkadauke/syrus-ai-dev:{latest,<sha>}
        └─ self-hosted runner (this VM): docker compose pull + up -d --wait
             └─ verify http://127.0.0.1:8770/api/version == <sha> (else auto-rollback)
   NPM (LAN): https://syrus-ai.dev → http://192.168.1.42:8770
```

---

## 1. The VM

The Docker host is the Unraid VM at **`192.168.1.42`** (SSH user `syrus`; change
the initial password). If you ever rebuild it: Ubuntu Server 24.04 LTS, 2 vCPU /
2 GB RAM / 20 GB disk, bridged networking (`br0`), with a **static lease** so the
IP stays `192.168.1.42`.

## 2. Install Docker + Compose plugin

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"     # log out/in afterwards so the group applies
docker compose version              # must print v2.x — the plugin ships with the above
```

## 3. Register the GitHub Actions self-hosted runner

In the repo: **Settings → Actions → Runners → New self-hosted runner → Linux**.
Follow the shown `./config.sh` command **but add the `syrus` label** when it asks
(or append `--labels syrus`). The deploy job targets `runs-on: [self-hosted, syrus]`.

Install it as a service so it survives reboots:

```bash
cd ~/actions-runner
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

The runner user must be in the `docker` group (step 2). Verify with `docker ps`
as that user — no `sudo`.

## 4. Turn the deploy on

The workflow builds on every push but only deploys when a repo variable says so.
In **Settings → Secrets and variables → Actions → Variables**, add:

| Variable | Value | Notes |
| --- | --- | --- |
| `DEPLOY_ENABLED` | `true` | Enables the `deploy` job. |
| `PUBLIC_PORT` | `8770` | Optional — only if you want a different host port. |

No secrets are required: pulling from GHCR uses the run's built-in `GITHUB_TOKEN`.

## 5. Point Nginx Proxy Manager at it

In NPM → **Hosts → Proxy Hosts → Add Proxy Host**:

- **Domain Names:** `syrus-ai.dev`, `www.syrus-ai.dev`
- **Scheme:** `http`
- **Forward Hostname / IP:** `192.168.1.42`
- **Forward Port:** `8770`
- **Websockets Support:** on (harmless; future-proof)
- **SSL tab:** request a new **Let's Encrypt** certificate, **Force SSL**, HTTP/2 on.

> Let's Encrypt validation needs port 80 reachable from the internet and DNS
> already resolving to your IP — so finish step 6 first if the cert request fails.

## 6. DNS + dynamic IP (Strato)

Your home IP is dynamic, so:

1. **Router:** forward TCP **80** and **443** to the machine running NPM.
2. **Dynamic DNS:** run a DynDNS updater (ddclient, or your router's built-in
   client) pointing `syrus-ai.dev` at your current IP. Strato supports DynDNS —
   set the update URL / credentials from the Strato domain panel.
3. **Records:** `syrus-ai.dev` and `www` → your (dynamically updated) IP. If you
   only update the apex via DynDNS, make `www` a `CNAME` to the apex.
4. Confirm from off-network: `dig syrus-ai.dev +short` shows your IP.

## 7. First deploy + verify

Trigger a run (push to `main`, or **Actions → CI/CD → Run workflow**). Then:

```bash
# on the VM
docker compose -f deploy/compose.yml ps
curl -s http://127.0.0.1:8770/api/version   # {"sha":"<commit>","ref":"main",...}
curl -s http://127.0.0.1:8770/api/health    # ok
```

Public check: open `https://syrus-ai.dev`. The footer shows the running commit —
it must match the deployed SHA. The workflow's **Verify** step polls
`/api/version`; if the new container never reports the deployed SHA (e.g. it
crash-loops on boot), the deploy is marked failed **and automatically rolls back
to the previous image** so the site stays up (the VDS "green CI ≠ deployed" trap,
handled).

---

## Operating notes

- **Automatic rollback:** a failed verify redeploys the previously-running image.
  The run still goes red so you notice, but the site is restored.
- **Manual redeploy / rollback:** on the VM, pin any image and restart:
  ```bash
  IMAGE=ghcr.io/martinkadauke/syrus-ai-dev:<old-sha> \
    docker compose -f deploy/compose.yml up -d --wait --wait-timeout 120
  ```
- **Logs:** `docker compose -f deploy/compose.yml logs -f web`
- **Where config lives:** all runtime knobs are baked into the image at build.
  Public site config (`NEXT_PUBLIC_*`) is inlined at build time — change it in the
  repo and push to rebuild. See `.env.example`.
- **The port (`8770`)** is only exposed on the LAN; the internet only ever reaches
  NPM on 443. Nothing on the VM needs to face the internet directly.
