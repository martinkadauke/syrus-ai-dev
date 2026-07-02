import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

export const dynamic = "force-dynamic";

// The synced .dmg lives in public/downloads (a read-only volume on the VM,
// refreshed hourly by .github/workflows/sync-desktop.yml with NEW versioned
// filenames). We must stream it from this handler rather than redirect to
// Next's static /downloads/… serving: the standalone server snapshots public/
// once at boot, so files that appear after container start would 404 there.
const DIR = path.join(process.cwd(), "public", "downloads");

function latestDmg(): string | null {
  try {
    return (
      fs
        .readdirSync(DIR)
        .filter((f) => f.toLowerCase().endsWith(".dmg"))
        .map((f) => ({ f, m: fs.statSync(path.join(DIR, f)).mtimeMs }))
        .sort((a, b) => b.m - a.m)[0]?.f ?? null
    );
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const file = latestDmg();
  if (!file) {
    return new Response(
      "The macOS build isn't available yet — please check back shortly.",
      {
        status: 503,
        headers: { "content-type": "text/plain", "cache-control": "no-store" },
      },
    );
  }

  const full = path.join(DIR, file);
  const size = fs.statSync(full).size;
  const common: Record<string, string> = {
    "content-type": "application/x-apple-diskimage",
    "accept-ranges": "bytes",
    "content-disposition": `attachment; filename="${file}"`,
    "cache-control": "no-store",
  };

  // Range support so 100 MB+ downloads are resumable.
  const range = req.headers.get("range");
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    let start: number;
    let end: number;
    if (m && m[1] === "" && m[2] !== "") {
      // suffix range: last N bytes
      const n = Math.min(parseInt(m[2], 10), size);
      start = size - n;
      end = size - 1;
    } else if (m) {
      start = m[1] ? parseInt(m[1], 10) : 0;
      end = m[2] ? Math.min(parseInt(m[2], 10), size - 1) : size - 1;
    } else {
      start = 0;
      end = size - 1;
    }
    if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
      return new Response(null, {
        status: 416,
        headers: { "content-range": `bytes */${size}` },
      });
    }
    const stream = Readable.toWeb(
      fs.createReadStream(full, { start, end }),
    ) as ReadableStream;
    return new Response(stream, {
      status: 206,
      headers: {
        ...common,
        "content-range": `bytes ${start}-${end}/${size}`,
        "content-length": String(end - start + 1),
      },
    });
  }

  const stream = Readable.toWeb(fs.createReadStream(full)) as ReadableStream;
  return new Response(stream, {
    status: 200,
    headers: { ...common, "content-length": String(size) },
  });
}
