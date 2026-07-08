import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { artifactFor, DOWNLOADS_DIR } from "../../../lib/downloads";

export const dynamic = "force-dynamic";

// Streams the current binary for a platform (mac -> .dmg, windows -> .exe) with
// Range support so 100-200 MB downloads are resumable. We stream rather than
// redirect to Next's static /downloads serving because the standalone server
// snapshots public/ once at boot — files synced afterwards would 404 there.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  const art = artifactFor(platform);
  if (!art) {
    return new Response(
      "This build isn't available yet — please check back shortly.",
      {
        status: 503,
        headers: { "content-type": "text/plain", "cache-control": "no-store" },
      },
    );
  }

  const full = path.join(DOWNLOADS_DIR, art.filename);
  let size: number;
  try {
    size = fs.statSync(full).size;
  } catch {
    return new Response("Not found.", { status: 404 });
  }

  // The file on disk is versioned (so the page can show v0.1.3), but we hand it
  // to the browser under the stable product name — the same version-less names
  // the release publishes: Syrus.dmg for macOS, Syrus-Setup.exe for Windows.
  const isDmg = art.filename.toLowerCase().endsWith(".dmg");
  const type = isDmg
    ? "application/x-apple-diskimage"
    : "application/octet-stream";
  const downloadName = isDmg ? "Syrus.dmg" : "Syrus-Setup.exe";
  const common: Record<string, string> = {
    "content-type": type,
    "accept-ranges": "bytes",
    "content-disposition": `attachment; filename="${downloadName}"`,
    "cache-control": "no-store",
  };

  const range = req.headers.get("range");
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    let start: number;
    let end: number;
    if (m && m[1] === "" && m[2] !== "") {
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
