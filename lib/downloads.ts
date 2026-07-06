import fs from "node:fs";
import path from "node:path";

// Desktop binaries live in public/downloads (a read-only volume on the VM).
// Read at request time — force-dynamic on anything that calls these.
export const DOWNLOADS_DIR = path.join(process.cwd(), "public", "downloads");

export type Platform = "mac" | "windows";

export type Artifact = {
  id: Platform;
  osLabel: string; // "macOS" | "Windows"
  archLabel: string; // "Apple Silicon & Intel" | "64-bit (x64)"
  filename: string;
  size: number;
  version: string | null;
  sha256: string | null;
};

const VERSION_RE = /(\d+\.\d+\.\d+)/;
const ORDER: Platform[] = ["mac", "windows"];

function sha256For(file: string): string | null {
  try {
    const raw = fs.readFileSync(path.join(DOWNLOADS_DIR, `${file}.sha256`), "utf8");
    return raw.trim().split(/\s+/)[0] || null;
  } catch {
    return null;
  }
}

export function listArtifacts(): Artifact[] {
  let entries: string[] = [];
  try {
    entries = fs.readdirSync(DOWNLOADS_DIR);
  } catch {
    return [];
  }

  // Newest first, so we keep the latest file per platform.
  const candidates = entries
    .filter((f) => /\.(dmg|exe)$/i.test(f))
    .map((f) => {
      try {
        return { f, m: fs.statSync(path.join(DOWNLOADS_DIR, f)).mtimeMs };
      } catch {
        return { f, m: 0 };
      }
    })
    .sort((a, b) => b.m - a.m)
    .map((x) => x.f);

  const seen = new Set<Platform>();
  const out: Artifact[] = [];
  for (const f of candidates) {
    const isMac = f.toLowerCase().endsWith(".dmg");
    const id: Platform = isMac ? "mac" : "windows";
    if (seen.has(id)) continue;
    seen.add(id);
    let size = 0;
    try {
      size = fs.statSync(path.join(DOWNLOADS_DIR, f)).size;
    } catch {
      continue;
    }
    out.push({
      id,
      osLabel: isMac ? "macOS" : "Windows",
      archLabel: isMac ? "Apple Silicon & Intel" : "64-bit (x64)",
      filename: f,
      size,
      version: f.match(VERSION_RE)?.[1] ?? null,
      sha256: sha256For(f),
    });
  }
  return out.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
}

export function artifactFor(id: string): Artifact | null {
  return listArtifacts().find((a) => a.id === id) ?? null;
}

export function humanSize(bytes: number): string {
  return bytes >= 1024 ** 3
    ? `${(bytes / 1024 ** 3).toFixed(1)} GB`
    : `${Math.round(bytes / 1024 ** 2)} MB`;
}
