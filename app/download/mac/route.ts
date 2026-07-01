import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

// The synced .dmg lives in public/downloads (a read-only volume on the VM,
// refreshed by .github/workflows/sync-desktop.yml). We redirect to the current
// versioned file so the button URL stays stable while the target is
// cache-safe, and Next serves the actual binary statically (range-request
// friendly for a 100 MB+ download).
const DIR = path.join(process.cwd(), "public", "downloads");

export function GET() {
  let dmg: string | null = null;
  try {
    dmg =
      fs
        .readdirSync(DIR)
        .filter((f) => f.toLowerCase().endsWith(".dmg"))
        .map((f) => ({ f, m: fs.statSync(path.join(DIR, f)).mtimeMs }))
        .sort((a, b) => b.m - a.m)[0]?.f ?? null;
  } catch {
    dmg = null;
  }

  if (!dmg) {
    return new Response(
      "The macOS build isn't available yet — please check back shortly.",
      { status: 503, headers: { "content-type": "text/plain", "cache-control": "no-store" } },
    );
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: `/downloads/${encodeURIComponent(dmg)}`,
      "cache-control": "no-store",
    },
  });
}
